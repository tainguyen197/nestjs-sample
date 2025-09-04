import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../common/services/audit-log.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async list(q: { page?: number; limit?: number; search?: string }) {
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 10);
    const where: any = {};

    if (q.search) {
      where.OR = [
        { url: { contains: q.search, mode: 'insensitive' } },
        { fileName: { contains: q.search, mode: 'insensitive' } },
        { originalName: { contains: q.search, mode: 'insensitive' } },
        { fileType: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async createFromUrl(
    data: { url: string; fileName?: string; originalName?: string; fileType?: string; fileSize?: number },
    uploadedById?: string,
  ) {
    const media = await this.prisma.media.create({
      data: {
        url: data.url,
        fileName: data.fileName,
        originalName: data.originalName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        uploadedById,
      },
    });

    if (uploadedById) {
      await this.auditLog.logCRUD({
        operation: 'CREATE',
        entity: 'MEDIA',
        entityId: media.id,
        userId: uploadedById,
        entityName: media.fileName || media.originalName || media.url,
        changes: { url: media.url, fileType: media.fileType, fileSize: media.fileSize },
      });
    }

    return media;
  }

  async delete(id: string, deletedById: string) {
    const existing = await this.prisma.media.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Media not found');

    await this.prisma.media.delete({ where: { id } });

    await this.auditLog.logCRUD({
      operation: 'DELETE',
      entity: 'MEDIA',
      entityId: id,
      userId: deletedById,
      entityName: existing.fileName || existing.originalName || existing.url,
      changes: { url: existing.url },
    });

    return { message: 'Media deleted successfully' };
  }

  async getStats() {
    const total = await this.prisma.media.count();
    return { total };
  }

  async createFromFile(
    file: { filename: string; mimetype: string; size: number },
    uploadedById?: string,
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
        uploadedById,
      },
    });

    if (uploadedById) {
      await this.auditLog.logCRUD({
        operation: 'CREATE',
        entity: 'MEDIA',
        entityId: media.id,
        userId: uploadedById,
        entityName: media.fileName || media.originalName || media.url,
        changes: { url: media.url, fileType: media.fileType, fileSize: media.fileSize },
      });
    }

    return media;
  }
}


