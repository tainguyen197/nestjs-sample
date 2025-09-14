import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditLogService } from "../common/services/audit-log.service";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { resolve, extname } from "path";

@Injectable()
export class MediaService {
  private s3?: any;
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async list(q: { page?: number; limit?: number; search?: string }) {
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 10);
    const where: any = {};

    if (q.search) {
      where.OR = [
        { url: { contains: q.search, mode: "insensitive" } },
        { fileName: { contains: q.search, mode: "insensitive" } },
        { originalName: { contains: q.search, mode: "insensitive" } },
        { fileType: { contains: q.search, mode: "insensitive" } }
      ];
    }

    const [items, total, totalSizeResult] = await Promise.all([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.media.count({ where }),
      // Calculate total file size
      this.prisma.media.aggregate({
        where,
        _sum: {
          fileSize: true
        }
      })
    ]);

    const totalSizeBytes = totalSizeResult._sum.fileSize || 0;
    const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        totalSizeMB: totalSizeMB
      }
    };
  }

  async getById(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException("Media not found");
    return media;
  }

  async createFromUrl(
    data: {
      url: string;
      fileName?: string;
      originalName?: string;
      fileType?: string;
      fileSize?: number;
    },
    uploadedById?: string
  ) {
    const media = await this.prisma.media.create({
      data: {
        url: data.url,
        fileName: data.fileName,
        originalName: data.originalName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        uploadedById
      }
    });

    if (uploadedById) {
      await this.auditLog.logCRUD({
        operation: "CREATE",
        entity: "MEDIA",
        entityId: media.id,
        userId: uploadedById,
        entityName: media.fileName || media.originalName || media.url,
        changes: {
          url: media.url,
          fileType: media.fileType,
          fileSize: media.fileSize
        }
      });
    }

    return media;
  }

  async delete(id: string, deletedById: string) {
    const existing = await this.prisma.media.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Media not found");

    await this.prisma.media.delete({ where: { id } });

    await this.auditLog.logCRUD({
      operation: "DELETE",
      entity: "MEDIA",
      entityId: id,
      userId: deletedById,
      entityName: existing.fileName || existing.originalName || existing.url,
      changes: { url: existing.url }
    });

    return { message: "Media deleted successfully" };
  }

  async getStats() {
    const [total, totalSizeResult] = await Promise.all([
      this.prisma.media.count(),
      this.prisma.media.aggregate({
        _sum: {
          fileSize: true
        }
      })
    ]);

    const totalSizeBytes = totalSizeResult._sum.fileSize || 0;
    const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);

    return { 
      total,
      totalSizeMB 
    };
  }

  async createFromFile(
    file: { filename: string; mimetype: string; size: number },
    uploadedById?: string
  ) {
    // Files saved under public/uploads/<filename>
    const url = `/uploads/${file.filename}`;

    const media = await this.prisma.media.create({
      data: {
        url,
        fileName: file.filename,
        originalName: file.filename,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadedById
      }
    });

    if (uploadedById) {
      await this.auditLog.logCRUD({
        operation: "CREATE",
        entity: "MEDIA",
        entityId: media.id,
        userId: uploadedById,
        entityName: media.fileName || media.originalName || media.url,
        changes: {
          url: media.url,
          fileType: media.fileType,
          fileSize: media.fileSize
        }
      });
    }

    return media;
  }

  async createFromBuffer(
    file: { buffer: Buffer; originalName: string; mimetype: string },
    uploadedById?: string
  ) {
    const driver =
      process.env.STORAGE_DRIVER ||
      (process.env.CF_R2_ACCOUNT_ID ? "r2" : "local");

    // Configure Cloudflare R2 via S3-compatible client when CF_R2_* present or driver=r2
    if (driver === "r2" && !this.s3) {
      const r2AccountId = process.env.CF_R2_ACCOUNT_ID as string;
      const r2AccessKeyId = process.env.CF_R2_ACCESS_KEY_ID as string;
      const r2SecretAccessKey = process.env.CF_R2_SECRET_ACCESS_KEY as string;
      const r2Endpoint = `https://${r2AccountId}.r2.cloudflarestorage.com`;

      // Lazy-load S3 client from '@aws-sdk/client-s3' to avoid type resolution issues
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const AWS = require("@aws-sdk/client-s3");
      this.s3 = new AWS.S3Client({
        region: "auto",
        endpoint: r2Endpoint,
        forcePathStyle: true,
        credentials: {
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey
        }
      });
    }

    const extension = extname(file.originalName || "") || "";
    const objectKey = `${Date.now()}-${randomUUID()}${extension}`;

    let publicUrl: string;
    let fileNameForRecord = objectKey;
    let fileSize = file.buffer.length;

    if (driver === "r2") {
      const bucket = process.env.CF_R2_BUCKET as string;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PutObjectCommand } = require("@aws-sdk/client-s3");
      await this.s3!.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: objectKey,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: undefined
        })
      );

      // Prefer explicit public base if provided, otherwise use R2 endpoint with path-style
      const explicitPublicBase = process.env.CF_R2_PUBLIC_BASE_URL;
      if (explicitPublicBase) {
        publicUrl = `${explicitPublicBase.replace(/\/$/, "")}/${objectKey}`;
      } else {
        const r2AccountId = process.env.CF_R2_ACCOUNT_ID as string;
        const r2Endpoint = `https://${r2AccountId}.r2.cloudflarestorage.com`;
        publicUrl = `${r2Endpoint}/${bucket}/${objectKey}`;
      }
    } else {
      const uploadDir = resolve("public/uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const localFileName = objectKey;
      await fs.writeFile(resolve(uploadDir, localFileName), file.buffer);
      publicUrl = `/uploads/${localFileName}`;
      fileNameForRecord = localFileName;
    }

    const media = await this.prisma.media.create({
      data: {
        url: publicUrl,
        fileName: fileNameForRecord,
        originalName: file.originalName,
        fileType: file.mimetype,
        fileSize,
        uploadedById
      }
    });

    if (uploadedById) {
      await this.auditLog.logCRUD({
        operation: "CREATE",
        entity: "MEDIA",
        entityId: media.id,
        userId: uploadedById,
        entityName: media.fileName || media.originalName || media.url,
        changes: {
          url: media.url,
          fileType: media.fileType,
          fileSize: media.fileSize
        }
      });
    }

    return media;
  }
}
