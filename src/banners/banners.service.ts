import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../common/services/audit-log.service';

@Injectable()
export class BannersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async list(q: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 10);
    const where: any = {};

    if (q.status) where.status = q.status;

    if (q.search) {
      where.OR = [
        { type: { contains: q.search, mode: 'insensitive' } },
        { link: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.banner.findMany({
        where,
        include: { image: true, imageEn: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.banner.count({ where }),
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

  async getPublic() {
    return this.prisma.banner.findMany({
      where: { status: 'ACTIVE' },
      include: { image: true, imageEn: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id }, include: { image: true, imageEn: true } });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async create(
    data: { type: string; link?: string; status?: 'ACTIVE' | 'INACTIVE'; imageId?: string; imageEnId?: string },
    createdById: string,
  ) {
    const existingType = await this.prisma.banner.findUnique({ where: { type: data.type } });
    if (existingType) throw new ConflictException('Banner type already exists');

    if (data.imageId) {
      const img = await this.prisma.media.findUnique({ where: { id: data.imageId } });
      if (!img) throw new BadRequestException('imageId not found');
    }
    if (data.imageEnId) {
      const imgEn = await this.prisma.media.findUnique({ where: { id: data.imageEnId } });
      if (!imgEn) throw new BadRequestException('imageEnId not found');
    }

    const banner = await this.prisma.banner.create({
      data: {
        type: data.type,
        link: data.link,
        status: data.status ?? 'ACTIVE',
        imageId: data.imageId,
        imageEnId: data.imageEnId,
      },
      include: { image: true, imageEn: true },
    });

    await this.auditLog.logCRUD({
      operation: 'CREATE',
      entity: 'BANNER',
      entityId: banner.id,
      userId: createdById,
      entityName: banner.type,
      changes: { type: banner.type, status: banner.status },
    });

    return banner;
  }

  async update(
    id: string,
    data: { type?: string; link?: string; status?: 'ACTIVE' | 'INACTIVE'; imageId?: string | null; imageEnId?: string | null },
    updatedById: string,
  ) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Banner not found');

    if (data.type && data.type !== existing.type) {
      const dup = await this.prisma.banner.findUnique({ where: { type: data.type } });
      if (dup) throw new ConflictException('Banner type already exists');
    }

    if (data.imageId) {
      const img = await this.prisma.media.findUnique({ where: { id: data.imageId } });
      if (!img) throw new BadRequestException('imageId not found');
    }
    if (data.imageEnId) {
      const imgEn = await this.prisma.media.findUnique({ where: { id: data.imageEnId } });
      if (!imgEn) throw new BadRequestException('imageEnId not found');
    }

    const banner = await this.prisma.banner.update({
      where: { id },
      data,
      include: { image: true, imageEn: true },
    });

    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'BANNER',
      entityId: banner.id,
      userId: updatedById,
      entityName: banner.type,
      changes: { type: banner.type, status: banner.status },
    });

    return banner;
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE', updatedById: string) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Banner not found');

    const banner = await this.prisma.banner.update({ where: { id }, data: { status }, include: { image: true, imageEn: true } });

    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'BANNER',
      entityId: banner.id,
      userId: updatedById,
      entityName: banner.type,
      changes: { status: banner.status },
    });

    return banner;
  }

  async delete(id: string, deletedById: string) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Banner not found');

    await this.prisma.banner.delete({ where: { id } });

    await this.auditLog.logCRUD({
      operation: 'DELETE',
      entity: 'BANNER',
      entityId: id,
      userId: deletedById,
      entityName: existing.type,
      changes: { type: existing.type },
    });

    return { message: 'Banner deleted successfully' };
  }

  async getStats() {
    const [total, active, inactive] = await Promise.all([
      this.prisma.banner.count(),
      this.prisma.banner.count({ where: { status: 'ACTIVE' } }),
      this.prisma.banner.count({ where: { status: 'INACTIVE' } }),
    ]);

    return { total, active, inactive };
  }
}


