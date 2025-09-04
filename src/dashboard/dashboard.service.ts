import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      users,
      news,
      services,
      equipment,
      team,
      banners,
      media,
      categories,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.news.count(),
      this.prisma.service.count(),
      this.prisma.equipment.count(),
      this.prisma.teamMember.count(),
      this.prisma.banner.count(),
      this.prisma.media.count(),
      this.prisma.category.count(),
    ]);

    return {
      users,
      news,
      services,
      equipment,
      team,
      banners,
      media,
      categories,
    };
  }
}


