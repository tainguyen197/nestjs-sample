import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function createSlug(input: string) {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

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

    return news;
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('News article not found');
    await this.prisma.news.delete({ where: { id } });
    return { message: 'News article deleted successfully' };
  }
}
