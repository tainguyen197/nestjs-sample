import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { createSlug } from './utils/services.utils';

@Injectable()
export class ServicesService {
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
        { title: { contains: q.search, mode: 'insensitive' } },
        { titleEn: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
        { descriptionEn: { contains: q.search, mode: 'insensitive' } },
        { shortDescription: { contains: q.search, mode: 'insensitive' } },
        { shortDescriptionEn: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.service.count({ where });
    const services = await this.prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        featureImage: true,
        featureImageEn: true,
      },
    });

    return {
      services,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async get(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        featureImage: true,
        featureImageEn: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async getBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { 
        slug,
        status: 'PUBLISHED' // Only return published services for public access
      },
      include: {
        featureImage: true,
        featureImageEn: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async getHomepage() {
    const homepageServices = await this.prisma.service.findMany({
      where: {
        status: 'PUBLISHED',
        showOnHomepage: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 4, // Limit to 4 services on homepage
      include: {
        featureImage: true,
        featureImageEn: true,
      },
    });

    return {
      services: homepageServices,
      count: homepageServices.length,
    };
  }

  async create(dto: {
    title: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    shortDescription?: string;
    shortDescriptionEn?: string;
    keywords?: string;
    enKeywords?: string;
    status?: string;
    showOnHomepage?: boolean;
    slug?: string;
    featureImageId?: string;
    featureImageEnId?: string;
    metaTitle?: string;
    metaTitleEn?: string;
    metaDescription?: string;
    metaDescriptionEn?: string;
    metaKeywords?: string;
    metaKeywordsEn?: string;
  }, userId: string) {
    // Check total items limit (30)
    const total = await this.prisma.service.count();
    if (total >= 30) {
      throw new BadRequestException(
        'Maximum limit of 30 services reached.',
      );
    }

    const slug = dto.slug || createSlug(dto.title);
    const exists = await this.prisma.service.findUnique({ where: { slug } });
    if (exists) {
      throw new ConflictException(
        'A service with this slug already exists',
      );
    }

    if (dto.showOnHomepage) {
      const cnt = await this.prisma.service.count({
        where: { showOnHomepage: true },
      });
      if (cnt >= 4) {
        throw new BadRequestException(
          'Maximum of 4 services can be shown on homepage.',
        );
      }
    }

    const service = await this.prisma.service.create({
      data: {
        title: dto.title,
        titleEn: dto.titleEn,
        description: dto.description,
        descriptionEn: dto.descriptionEn,
        shortDescription: dto.shortDescription,
        shortDescriptionEn: dto.shortDescriptionEn,
        keywords: dto.keywords,
        enKeywords: dto.enKeywords,
        status: dto.status || 'DRAFT',
        showOnHomepage: dto.showOnHomepage ?? false,
        slug,
        featureImageId: dto.featureImageId,
        featureImageEnId: dto.featureImageEnId,
        metaTitle: dto.metaTitle,
        metaTitleEn: dto.metaTitleEn,
        metaDescription: dto.metaDescription,
        metaDescriptionEn: dto.metaDescriptionEn,
        metaKeywords: dto.metaKeywords,
        metaKeywordsEn: dto.metaKeywordsEn,
      },
      include: {
        featureImage: true,
        featureImageEn: true,
      },
    });

    // Log the creation
    await this.auditLog.logCRUD({
      operation: 'CREATE',
      entity: 'SERVICE',
      entityId: service.id,
      userId,
      entityName: service.title,
      changes: {
        title: service.title,
        status: service.status,
        showOnHomepage: service.showOnHomepage,
        slug: service.slug,
      },
    });

    return service;
  }

  async update(id: string, dto: {
    title?: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    shortDescription?: string;
    shortDescriptionEn?: string;
    keywords?: string;
    enKeywords?: string;
    status?: string;
    showOnHomepage?: boolean;
    slug?: string;
    featureImageId?: string;
    featureImageEnId?: string;
    metaTitle?: string;
    metaTitleEn?: string;
    metaDescription?: string;
    metaDescriptionEn?: string;
    metaKeywords?: string;
    metaKeywordsEn?: string;
  }, userId: string) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    let slug = dto.slug || createSlug(dto.title ?? existing.title);
    if (slug !== existing.slug) {
      const slugExists = await this.prisma.service.findUnique({ where: { slug } });
      if (slugExists) {
        throw new ConflictException(
          'A service with this slug already exists',
        );
      }
    }

    if (dto.showOnHomepage && !existing.showOnHomepage) {
      const cnt = await this.prisma.service.count({
        where: { showOnHomepage: true },
      });
      if (cnt >= 4) {
        throw new BadRequestException(
          'Maximum of 4 services can be shown on homepage.',
        );
      }
    }

    const service = await this.prisma.service.update({
      where: { id },
      data: {
        title: dto.title,
        titleEn: dto.titleEn,
        description: dto.description,
        descriptionEn: dto.descriptionEn,
        shortDescription: dto.shortDescription,
        shortDescriptionEn: dto.shortDescriptionEn,
        keywords: dto.keywords,
        enKeywords: dto.enKeywords,
        status: dto.status,
        showOnHomepage: dto.showOnHomepage,
        slug,
        featureImageId: dto.featureImageId,
        featureImageEnId: dto.featureImageEnId,
        metaTitle: dto.metaTitle,
        metaTitleEn: dto.metaTitleEn,
        metaDescription: dto.metaDescription,
        metaDescriptionEn: dto.metaDescriptionEn,
        metaKeywords: dto.metaKeywords,
        metaKeywordsEn: dto.metaKeywordsEn,
      },
      include: {
        featureImage: true,
        featureImageEn: true,
      },
    });

    // Log the update with changes
    const changes: Record<string, any> = {};
    if (dto.title !== existing.title) {
      changes.title = { from: existing.title, to: dto.title };
    }
    if (dto.status !== existing.status) {
      changes.status = { from: existing.status, to: dto.status };
    }
    if (dto.showOnHomepage !== existing.showOnHomepage) {
      changes.showOnHomepage = { from: existing.showOnHomepage, to: dto.showOnHomepage };
    }

    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'SERVICE',
      entityId: service.id,
      userId,
      entityName: service.title,
      changes: Object.keys(changes).length > 0 ? changes : undefined,
    });

    return service;
  }

  async updateStatus(id: string, dto: { status: string }, userId: string) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    const service = await this.prisma.service.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    // Log the status change
    await this.auditLog.logCRUD({
      operation: 'UPDATE_STATUS',
      entity: 'SERVICE',
      entityId: id,
      userId,
      entityName: existing.title,
      changes: {
        previousStatus: existing.status,
        newStatus: dto.status,
      },
    });

    return {
      message: 'Status updated successfully',
      service,
    };
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    await this.prisma.service.delete({ where: { id } });

    // Log the deletion
    await this.auditLog.logCRUD({
      operation: 'DELETE',
      entity: 'SERVICE',
      entityId: id,
      userId,
      entityName: existing.title,
    });

    return { message: 'Service deleted successfully' };
  }

  async getStats() {
    const totalServices = await this.prisma.service.count();
    const servicesByStatus = await this.prisma.service.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const homepageServicesCount = await this.prisma.service.count({
      where: { showOnHomepage: true },
    });

    const recentServices = await this.prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        titleEn: true,
        status: true,
        showOnHomepage: true,
        slug: true,
        createdAt: true,
      },
    });

    return {
      totalServices,
      servicesByStatus: servicesByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      homepageServicesCount,
      recentServices,
    };
  }
}
