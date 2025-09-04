import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../common/services/audit-log.service';
import * as bcrypt from 'bcryptjs';
import { isValidRole, UserRole } from '../auth/utils/role.utils';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async list(q: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 10);
    const where: any = {};

    if (q.role) {
      where.role = q.role;
    }

    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: 'insensitive' } },
        { email: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.user.count({ where });
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            Media: true,
          },
        },
      },
    });

    return {
      users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async get(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            Media: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(dto: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }, createdById: string) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate role if provided
    if (dto.role && !isValidRole(dto.role)) {
      throw new BadRequestException('Invalid role. Valid roles are: SUPER_ADMIN, ADMIN, EDITOR');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role || 'EDITOR',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log the creation
    await this.auditLog.logCRUD({
      operation: 'CREATE',
      entity: 'USER',
      entityId: user.id,
      userId: createdById,
      entityName: user.name || user.email,
      changes: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    return user;
  }

  async update(id: string, dto: {
    email?: string;
    name?: string;
    role?: UserRole;
  }, updatedById: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it already exists
    if (dto.email && dto.email !== existing.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (emailExists) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Validate role if provided
    if (dto.role && !isValidRole(dto.role)) {
      throw new BadRequestException('Invalid role. Valid roles are: SUPER_ADMIN, ADMIN, EDITOR');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        name: dto.name,
        role: dto.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log the update with changes
    const changes: Record<string, any> = {};
    if (dto.email !== existing.email) {
      changes.email = { from: existing.email, to: dto.email };
    }
    if (dto.name !== existing.name) {
      changes.name = { from: existing.name, to: dto.name };
    }
    if (dto.role !== existing.role) {
      changes.role = { from: existing.role, to: dto.role };
    }

    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'USER',
      entityId: user.id,
      userId: updatedById,
      entityName: user.name || user.email,
      changes: Object.keys(changes).length > 0 ? changes : undefined,
    });

    return user;
  }

  async updatePassword(id: string, dto: {
    currentPassword: string;
    newPassword: string;
  }, updatedById: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, existing.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Log the password change
    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'USER',
      entityId: id,
      userId: updatedById,
      entityName: existing.name || existing.email,
      changes: {
        passwordChanged: true,
      },
    });

    return { message: 'Password updated successfully' };
  }

  async resetPassword(id: string, dto: {
    newPassword: string;
  }, resetById: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Log the password reset
    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'USER',
      entityId: id,
      userId: resetById,
      entityName: existing.name || existing.email,
      changes: {
        passwordReset: true,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async remove(id: string, deletedById: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    // Prevent self-deletion
    if (id === deletedById) {
      throw new BadRequestException('You cannot delete your own account');
    }

    // Check if user has any associated media
    const mediaCount = await this.prisma.media.count({
      where: { uploadedById: id },
    });

    if (mediaCount > 0) {
      throw new BadRequestException(
        `Cannot delete user. User has ${mediaCount} associated media files. Please reassign or delete them first.`
      );
    }

    await this.prisma.user.delete({ where: { id } });

    // Log the deletion
    await this.auditLog.logCRUD({
      operation: 'DELETE',
      entity: 'USER',
      entityId: id,
      userId: deletedById,
      entityName: existing.name || existing.email,
    });

    return { message: 'User deleted successfully' };
  }

  async getStats() {
    const totalUsers = await this.prisma.user.count();
    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    const recentUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      totalUsers,
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count.role,
      })),
      recentUsers,
    };
  }
}
