import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../common/services/audit-log.service';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async list(q: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 10);
    const where: any = {};

    if (q.status) {
      where.status = q.status;
    }

    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: 'insensitive' } },
        { nameEn: { contains: q.search, mode: 'insensitive' } },
        { title: { contains: q.search, mode: 'insensitive' } },
        { titleEn: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const [teamMembers, total] = await Promise.all([
      this.prisma.teamMember.findMany({
        where,
        include: {
          image: true,
        },
        orderBy: { order: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.teamMember.count({ where }),
    ]);

    return {
      data: teamMembers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id },
      include: {
        image: true,
      },
    });

    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }

    return teamMember;
  }

  async getHomepage() {
    return this.prisma.teamMember.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        image: true,
        imageEn: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async create(data: {
    name: string;
    nameEn?: string;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    order?: number;
    imageId?: string;
    imageEnId?: string;
  }, createdById: string) {
    // Check if image exists if provided
    if (data.imageId) {
      const image = await this.prisma.media.findUnique({
        where: { id: data.imageId },
      });
      if (!image) {
        throw new BadRequestException('Image not found');
      }
    }

    if (data.imageEnId) {
      const image = await this.prisma.media.findUnique({
        where: { id: data.imageEnId },
      });
      if (!image) {
        throw new BadRequestException('English image not found');
      }
    }

    const teamMember = await this.prisma.teamMember.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        title: data.title,
        titleEn: data.titleEn,
        description: data.description,
        descriptionEn: data.descriptionEn,
        status: data.status ?? 'ACTIVE',
        order: data.order ?? 0,
        imageId: data.imageId,
        imageEnId: data.imageEnId,
      },
      include: {
        image: true,
        imageEn: true,
      },
    });

    await this.auditLog.logCRUD({
      operation: 'CREATE',
      entity: 'TEAM_MEMBER',
      entityId: teamMember.id,
      userId: createdById,
      entityName: teamMember.name,
      changes: {
        name: teamMember.name,
        title: teamMember.title,
        status: teamMember.status,
      },
    });

    return teamMember;
  }

  async update(
    id: string,
    data: {
      name?: string;
      nameEn?: string;
      title?: string;
      titleEn?: string;
      description?: string;
      descriptionEn?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      order?: number;
      imageId?: string;
      imageEnId?: string;
    },
    updatedById: string,
  ) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Team member not found');
    }

    // Check if image exists if provided
    if (data.imageId) {
      const image = await this.prisma.media.findUnique({
        where: { id: data.imageId },
      });
      if (!image) {
        throw new BadRequestException('Image not found');
      }
    }

    if (data.imageEnId) {
      const image = await this.prisma.media.findUnique({
        where: { id: data.imageEnId },
      });
      if (!image) {
        throw new BadRequestException('English image not found');
      }
    }

    const teamMember = await this.prisma.teamMember.update({
      where: { id },
      data,
      include: {
        image: true,
        imageEn: true,
      },
    });

    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'TEAM_MEMBER',
      entityId: teamMember.id,
      userId: updatedById,
      entityName: teamMember.name,
      changes: {
        name: teamMember.name,
        title: teamMember.title,
        status: teamMember.status,
      },
    });

    return teamMember;
  }

  async updateStatus(
    id: string,
    status: 'ACTIVE' | 'INACTIVE',
    updatedById: string,
  ) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Team member not found');
    }

    const teamMember = await this.prisma.teamMember.update({
      where: { id },
      data: { status },
      include: {
        image: true,
        imageEn: true,
      },
    });

    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'TEAM_MEMBER',
      entityId: teamMember.id,
      userId: updatedById,
      entityName: teamMember.name,
      changes: {
        status: teamMember.status,
      },
    });

    return teamMember;
  }

  async updateOrder(id: string, order: number, updatedById: string) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Team member not found');
    }

    const teamMember = await this.prisma.teamMember.update({
      where: { id },
      data: { order },
      include: {
        image: true,
        imageEn: true,
      },
    });

    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'TEAM_MEMBER',
      entityId: teamMember.id,
      userId: updatedById,
      entityName: teamMember.name,
      changes: {
        order: teamMember.order,
      },
    });

    return teamMember;
  }

  async delete(id: string, deletedById: string) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Team member not found');
    }

    await this.prisma.teamMember.delete({
      where: { id },
    });

    await this.auditLog.logCRUD({
      operation: 'DELETE',
      entity: 'TEAM_MEMBER',
      entityId: id,
      userId: deletedById,
      entityName: existing.name,
      changes: {
        name: existing.name,
        title: existing.title,
      },
    });

    return { message: 'Team member deleted successfully' };
  }

  async getStats() {
    const [total, active, inactive] = await Promise.all([
      this.prisma.teamMember.count(),
      this.prisma.teamMember.count({ where: { status: 'ACTIVE' } }),
      this.prisma.teamMember.count({ where: { status: 'INACTIVE' } }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }
}
