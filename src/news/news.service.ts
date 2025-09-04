import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { createSlug } from './utils/news.utils';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async list(q: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    pin?: 'true' | 'false';
  }) {
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 10);
    const where: any = {};
    if (q.status) where.status = q.status;
    if (q.pin) where.pin = q.pin === 'true';
    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: 'insensitive' } },
        { titleEn: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
        { descriptionEn: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    const total = await this.prisma.news.count({ where });
    const news = await this.prisma.news.findMany({
      where,
      orderBy: [{ pin: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        featureImage: true,
        featureImageEn: true,
        category: true,
        categoryEn: true,
      },
    });
    return {
      news,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async get(id: string) {
    const item = await this.prisma.news.findUnique({
      where: { id },
      include: {
        featureImage: true,
        featureImageEn: true,
        category: true,
        categoryEn: true,
      },
    });
    if (!item) throw new NotFoundException('News article not found');
    return item;
  }

  async getBySlug(slug: string) {
    const item = await this.prisma.news.findFirst({
      where: { 
        slug,
        status: 'PUBLISHED' // Only return published news for public access
      },
      include: {
        featureImage: true,
        featureImageEn: true,
        category: true,
        categoryEn: true,
      },
    });
    if (!item) throw new NotFoundException('News article not found');
    return item;
  }

  async getFeatured() {
    const featuredNews = await this.prisma.news.findMany({
      where: {
        status: 'PUBLISHED',
        pin: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        featureImage: true,
        featureImageEn: true,
      },
    });

    return {
      posts: featuredNews,
      count: featuredNews.length,
    };
  }

  async getHomepage() {
    const homepageNews = await this.prisma.news.findMany({
      where: {
        status: 'PUBLISHED',
        showOnHomepage: true,
      },
      orderBy: [
        { pin: 'desc' }, // Show pinned items first
        { createdAt: 'desc' }
      ],
      take: 3,
      include: {
        featureImage: true,
        featureImageEn: true,
      },
    });

    return {
      news: homepageNews,
      count: homepageNews.length,
    };
  }

  async getRelated(q: {
    categoryId: string;
    currentNewsId?: string;
    limit?: number;
    locale?: string;
  }) {
    const limit = q.limit ?? 3;
    const locale = q.locale ?? 'vi';

    const where: any = {
      status: 'PUBLISHED',
    };

    // Exclude current news if provided
    if (q.currentNewsId) {
      where.id = { not: q.currentNewsId };
    }

    // Filter by appropriate category based on locale
    if (locale === 'en') {
      where.OR = [
        { categoryEnId: q.categoryId },
        { categoryId: q.categoryId } 
      ];
    } else {
      where.OR = [
        { categoryId: q.categoryId }
      ];
    }

    const relatedNews = await this.prisma.news.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        featureImage: true,
        featureImageEn: true,
        category: true,
        categoryEn: true,
      },
    });

    return {
      news: relatedNews,
      count: relatedNews.length,
    };
  }

  async create(dto: any, userId: string) {
    const total = await this.prisma.news.count();
    if (total >= 30)
      throw new BadRequestException(
        'Maximum limit of 30 news articles reached.',
      );

    const slug = dto.slug || createSlug(dto.title);
    const exists = await this.prisma.news.findUnique({ where: { slug } });
    if (exists)
      throw new BadRequestException(
        'A news article with this slug already exists',
      );

    if (dto.showOnHomepage) {
      const cnt = await this.prisma.news.count({
        where: { showOnHomepage: true },
      });
      if (cnt >= 3)
        throw new BadRequestException(
          'Maximum of 3 news articles can be shown on homepage.',
        );
    }

    if (dto.pin) {
      const pinCount = await this.prisma.news.count({ where: { pin: true } });
      if (pinCount >= 5)
        throw new BadRequestException(
          'Maximum of 5 pinned news articles allowed.',
        );
    }

    let featureImageId = dto.featureImageId ?? undefined;
    let featureImageEnId = dto.featureImageEnId ?? undefined;
    if (dto.featuredImage && !featureImageId) {
      const media = await this.prisma.media.findFirst({
        where: { url: dto.featuredImage },
      });
      if (media) featureImageId = media.id;
    }
    if (dto.featuredImageEn && !featureImageEnId) {
      const mediaEn = await this.prisma.media.findFirst({
        where: { url: dto.featuredImageEn },
      });
      if (mediaEn) featureImageEnId = mediaEn.id;
    }

    const news = await this.prisma.news.create({
      data: {
        title: dto.title,
        titleEn: dto.titleEn,
        description: dto.description,
        descriptionEn: dto.descriptionEn,
        shortDescription: dto.shortDescription,
        shortDescriptionEn: dto.shortDescriptionEn,
        status: dto.status,
        showOnHomepage: dto.showOnHomepage ?? false,
        pin: dto.pin ?? false,
        slug,
        categoryId: dto.categoryId,
        categoryEnId: dto.categoryEnId,
        metaTitle: dto.metaTitle,
        metaTitleEn: dto.metaTitleEn,
        metaDescription: dto.metaDescription,
        metaDescriptionEn: dto.metaDescriptionEn,
        metaKeywords: dto.metaKeywords,
        metaKeywordsEn: dto.metaKeywordsEn,
        featureImageId,
        featureImageEnId,
      },
      include: {
        featureImage: true,
        featureImageEn: true,
        category: true,
        categoryEn: true,
      },
    });

    // Log the creation
    await this.auditLog.logCRUD({
      operation: 'CREATE',
      entity: 'NEWS',
      entityId: news.id,
      userId,
      entityName: news.title,
      changes: {
        title: news.title,
        status: news.status,
        showOnHomepage: news.showOnHomepage,
        slug: news.slug,
        categoryId: news.categoryId,
        categoryEnId: news.categoryEnId,
      },
    });

    return news;
  }

  async update(id: string, dto: any, userId: string) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('News article not found');

    let slug = dto.slug || createSlug(dto.title ?? existing.title);
    if (slug !== existing.slug) {
      const slugExists = await this.prisma.news.findUnique({ where: { slug } });
      if (slugExists)
        throw new BadRequestException(
          'A news article with this slug already exists',
        );
    }

    if (dto.showOnHomepage && !existing.showOnHomepage) {
      const cnt = await this.prisma.news.count({
        where: { showOnHomepage: true },
      });
      if (cnt >= 3)
        throw new BadRequestException(
          'Maximum of 3 news articles can be shown on homepage.',
        );
    }

    if (dto.pin && !existing.pin) {
      const pinCount = await this.prisma.news.count({
        where: { pin: true, id: { not: id } },
      });
      if (pinCount >= 5)
        throw new BadRequestException(
          'Maximum of 5 pinned news articles allowed.',
        );
    }

    let featureImageId =
      dto.featureImageId ?? existing.featureImageId ?? undefined;
    let featureImageEnId =
      dto.featureImageEnId ?? existing.featureImageEnId ?? undefined;
    if (dto.featureImageId === '') featureImageId = null as any;
    if (dto.featureImageEnId === '') featureImageEnId = null as any;

    if (dto.featuredImage && !featureImageId) {
      const media = await this.prisma.media.findFirst({
        where: { url: dto.featuredImage },
      });
      if (media) featureImageId = media.id;
    }
    if (dto.featuredImageEn && !featureImageEnId) {
      const mediaEn = await this.prisma.media.findFirst({
        where: { url: dto.featuredImageEn },
      });
      if (mediaEn) featureImageEnId = mediaEn.id;
    }

    const news = await this.prisma.news.update({
      where: { id },
      data: {
        title: dto.title,
        titleEn: dto.titleEn,
        description: dto.description,
        descriptionEn: dto.descriptionEn,
        shortDescription: dto.shortDescription,
        shortDescriptionEn: dto.shortDescriptionEn,
        status: dto.status,
        showOnHomepage: dto.showOnHomepage,
        pin: dto.pin,
        categoryId: dto.categoryId,
        categoryEnId: dto.categoryEnId,
        slug,
        metaTitle: dto.metaTitle,
        metaTitleEn: dto.metaTitleEn,
        metaDescription: dto.metaDescription,
        metaDescriptionEn: dto.metaDescriptionEn,
        metaKeywords: dto.metaKeywords,
        metaKeywordsEn: dto.metaKeywordsEn,
        featureImageId,
        featureImageEnId,
      },
      include: {
        featureImage: true,
        featureImageEn: true,
        category: true,
        categoryEn: true,
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
    if (dto.pin !== existing.pin) {
      changes.pin = { from: existing.pin, to: dto.pin };
    }
    if (dto.categoryId !== existing.categoryId) {
      changes.categoryId = { from: existing.categoryId, to: dto.categoryId };
    }
    if (dto.categoryEnId !== existing.categoryEnId) {
      changes.categoryEnId = { from: existing.categoryEnId, to: dto.categoryEnId };
    }

    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'NEWS',
      entityId: news.id,
      userId,
      entityName: news.title,
      changes: Object.keys(changes).length > 0 ? changes : undefined,
    });

    return news;
  }

  async updateStatus(id: string, dto: { status: string }, userId: string) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('News article not found');

    const news = await this.prisma.news.update({
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
      entity: 'NEWS',
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
      news,
    };
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('News article not found');
    
    await this.prisma.news.delete({ where: { id } });

    // Log the deletion
    await this.auditLog.logCRUD({
      operation: 'DELETE',
      entity: 'NEWS',
      entityId: id,
      userId,
      entityName: existing.title,
    });

    return { message: 'News article deleted successfully' };
  }
}
