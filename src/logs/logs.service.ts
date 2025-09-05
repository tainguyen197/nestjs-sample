import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  async getLogs({ skip, take }: { skip: number; take: number }) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      logs,
      meta: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  }
}
