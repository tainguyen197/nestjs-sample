import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../common/services/audit-log.service';

@Injectable()
export class EquipmentService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async list(q: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    showOnHomepage?: 'true' | 'false';
  }) {
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 10);
    const where: any = {};

    if (q.status) {
      where.status = q.status;
    }

    if (q.showOnHomepage) {
      where.showOnHomepage = q.showOnHomepage === 'true';
    }

    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: 'insensitive' } },
        { nameEn: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
        { descriptionEn: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.equipment.count({ where });
    const equipment = await this.prisma.equipment.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        image: true,
        imageEn: true,
      },
    });

    return {
      equipment,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async get(id: string) {
    const item = await this.prisma.equipment.findUnique({
      where: { id },
      include: {
        image: true,
        imageEn: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Equipment item not found');
    }

    return item;
  }

  async getHomepage() {
    const homepageEquipment = await this.prisma.equipment.findMany({
      where: {
        status: 'ACTIVE',
        showOnHomepage: true,
      },
      orderBy: { order: 'asc' },
      include: {
        image: true,
        imageEn: true,
      },
    });

    return {
      equipment: homepageEquipment,
      count: homepageEquipment.length,
    };
  }

  async create(dto: {
    name: string;
    nameEn?: string;
    description: string;
    descriptionEn?: string;
    status?: string;
    showOnHomepage?: boolean;
    order?: number;
    imageId?: string;
    imageEnId?: string;
  }, userId: string) {
    // Check if equipment with same name already exists
    const existingEquipment = await this.prisma.equipment.findUnique({
      where: { name: dto.name },
    });

    if (existingEquipment) {
      throw new ConflictException('Equipment with this name already exists');
    }

    // Check total items limit (30)
    const total = await this.prisma.equipment.count();
    if (total >= 30) {
      throw new BadRequestException(
        'Maximum limit of 30 equipment items reached.',
      );
    }

    const equipment = await this.prisma.equipment.create({
      data: {
        name: dto.name,
        nameEn: dto.nameEn,
        description: dto.description,
        descriptionEn: dto.descriptionEn,
        status: dto.status || 'ACTIVE',
        showOnHomepage: dto.showOnHomepage ?? true,
        order: dto.order ?? 0,
        imageId: dto.imageId,
        imageEnId: dto.imageEnId,
      },
      include: {
        image: true,
        imageEn: true,
      },
    });

    // Log the creation
    await this.auditLog.logCRUD({
      operation: 'CREATE',
      entity: 'EQUIPMENT',
      entityId: equipment.id,
      userId,
      entityName: equipment.name,
      changes: {
        name: equipment.name,
        nameEn: equipment.nameEn,
        status: equipment.status,
        showOnHomepage: equipment.showOnHomepage,
        order: equipment.order,
      },
    });

    return equipment;
  }

  async update(id: string, dto: {
    name?: string;
    nameEn?: string;
    description?: string;
    descriptionEn?: string;
    status?: string;
    showOnHomepage?: boolean;
    order?: number;
    imageId?: string;
    imageEnId?: string;
  }, userId: string) {
    const existing = await this.prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Equipment item not found');
    }

    // Check if name is being changed and if it conflicts with existing equipment
    if (dto.name && dto.name !== existing.name) {
      const nameExists = await this.prisma.equipment.findUnique({
        where: { name: dto.name },
      });
      if (nameExists) {
        throw new ConflictException('Equipment with this name already exists');
      }
    }

    const equipment = await this.prisma.equipment.update({
      where: { id },
      data: {
        name: dto.name,
        nameEn: dto.nameEn,
        description: dto.description,
        descriptionEn: dto.descriptionEn,
        status: dto.status,
        showOnHomepage: dto.showOnHomepage,
        order: dto.order,
        imageId: dto.imageId,
        imageEnId: dto.imageEnId,
      },
      include: {
        image: true,
        imageEn: true,
      },
    });

    // Log the update with changes
    const changes: Record<string, any> = {};
    if (dto.name !== existing.name) {
      changes.name = { from: existing.name, to: dto.name };
    }
    if (dto.nameEn !== existing.nameEn) {
      changes.nameEn = { from: existing.nameEn, to: dto.nameEn };
    }
    if (dto.description !== existing.description) {
      changes.description = { from: existing.description, to: dto.description };
    }
    if (dto.descriptionEn !== existing.descriptionEn) {
      changes.descriptionEn = { from: existing.descriptionEn, to: dto.descriptionEn };
    }
    if (dto.status !== existing.status) {
      changes.status = { from: existing.status, to: dto.status };
    }
    if (dto.showOnHomepage !== existing.showOnHomepage) {
      changes.showOnHomepage = { from: existing.showOnHomepage, to: dto.showOnHomepage };
    }
    if (dto.order !== existing.order) {
      changes.order = { from: existing.order, to: dto.order };
    }

    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'EQUIPMENT',
      entityId: equipment.id,
      userId,
      entityName: equipment.name,
      changes: Object.keys(changes).length > 0 ? changes : undefined,
    });

    return equipment;
  }

  async updateStatus(id: string, dto: { status: string }, userId: string) {
    const existing = await this.prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Equipment item not found');
    }

    const equipment = await this.prisma.equipment.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    // Log the status change
    await this.auditLog.logCRUD({
      operation: 'UPDATE_STATUS',
      entity: 'EQUIPMENT',
      entityId: id,
      userId,
      entityName: existing.name,
      changes: {
        previousStatus: existing.status,
        newStatus: dto.status,
      },
    });

    return {
      message: 'Status updated successfully',
      equipment,
    };
  }

  async updateOrder(id: string, dto: { order: number }, userId: string) {
    const existing = await this.prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Equipment item not found');
    }

    const equipment = await this.prisma.equipment.update({
      where: { id },
      data: { order: dto.order },
      select: {
        id: true,
        name: true,
        order: true,
      },
    });

    // Log the order change
    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'EQUIPMENT',
      entityId: id,
      userId,
      entityName: existing.name,
      changes: {
        order: { from: existing.order, to: dto.order },
      },
    });

    return {
      message: 'Order updated successfully',
      equipment,
    };
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Equipment item not found');
    }

    await this.prisma.equipment.delete({ where: { id } });

    // Log the deletion
    await this.auditLog.logCRUD({
      operation: 'DELETE',
      entity: 'EQUIPMENT',
      entityId: id,
      userId,
      entityName: existing.name,
    });

    return { message: 'Equipment item deleted successfully' };
  }

  async getStats() {
    const totalEquipment = await this.prisma.equipment.count();
    const equipmentByStatus = await this.prisma.equipment.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const homepageEquipmentCount = await this.prisma.equipment.count({
      where: { showOnHomepage: true },
    });

    const recentEquipment = await this.prisma.equipment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        nameEn: true,
        status: true,
        showOnHomepage: true,
        order: true,
        createdAt: true,
      },
    });

    return {
      totalEquipment,
      equipmentByStatus: equipmentByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      homepageEquipmentCount,
      recentEquipment,
    };
  }

  async reorder(ids: string[], userId: string) {
    const equipment = await this.prisma.equipment.findMany({
      where: { id: { in: ids } },
    });

    if (equipment.length !== ids.length) {
      throw new BadRequestException('Some equipment items not found');
    }

    // Update order for each equipment item
    const updates = ids.map((id, index) => 
      this.prisma.equipment.update({
        where: { id },
        data: { order: index },
      })
    );

    await Promise.all(updates);

    // Log the reordering
    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'EQUIPMENT',
      entityId: 'multiple',
      userId,
      entityName: 'Equipment Reordering',
      changes: {
        reorderedItems: ids,
        newOrder: ids.map((id, index) => ({ id, order: index })),
      },
    });

    return { message: 'Equipment order updated successfully' };
  }
}
