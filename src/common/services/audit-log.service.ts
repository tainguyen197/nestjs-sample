import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async logCRUD(data: {
    operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPDATE_STATUS';
    entity: string;
    entityId: string;
    userId: string;
    entityName: string;
    changes?: Record<string, any>;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: data.operation,
          entity: data.entity,
          entityId: data.entityId,
          userId: data.userId,
          details: data.changes ? JSON.stringify(data.changes) : null,
        },
      });
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }
}
