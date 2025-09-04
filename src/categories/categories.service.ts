import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { createSlug } from './utils/categories.utils';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async list(q: {
    page?: number;
    limit?: number;
    search?: string;
    language?: string;
  }) {
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 10);
    const where: any = {};

    if (q.language) {
      where.language = q.language;
    }

    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.category.count({ where });
    const categories = await this.prisma.category.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            news: true,
            newsEn: true,
          },
        },
      },
    });

    return {
      categories,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async get(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            news: true,
            newsEn: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async getBySlug(slug: string, language: string = 'vi') {
    const category = await this.prisma.category.findFirst({
      where: { 
        slug,
        language 
      },
      include: {
        _count: {
          select: {
            news: true,
            newsEn: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async getByLanguage(language: string) {
    const categories = await this.prisma.category.findMany({
      where: { language },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            news: true,
            newsEn: true,
          },
        },
      },
    });

    return {
      categories,
      count: categories.length,
    };
  }

  async create(dto: {
    name: string;
    slug?: string;
    description?: string;
    language?: string;
  }, userId: string) {
    const language = dto.language || 'vi';
    const slug = dto.slug || createSlug(dto.name);

    // Check if category with same slug and language already exists
    const existingCategory = await this.prisma.category.findFirst({
      where: { 
        slug,
        language 
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        `A category with slug "${slug}" already exists for language "${language}"`
      );
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        language,
      },
      include: {
        _count: {
          select: {
            news: true,
            newsEn: true,
          },
        },
      },
    });

    // Log the creation
    await this.auditLog.logCRUD({
      operation: 'CREATE',
      entity: 'CATEGORY',
      entityId: category.id,
      userId,
      entityName: category.name,
      changes: {
        name: category.name,
        slug: category.slug,
        language: category.language,
        description: category.description,
      },
    });

    return category;
  }

  async update(id: string, dto: {
    name?: string;
    slug?: string;
    description?: string;
  }, userId: string) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    let slug = dto.slug || createSlug(dto.name ?? existing.name);

    // Check if slug is being changed and if it conflicts with existing category
    if (slug !== existing.slug) {
      const slugExists = await this.prisma.category.findFirst({
        where: { 
          slug,
          language: existing.language,
          id: { not: id }
        },
      });
      if (slugExists) {
        throw new ConflictException(
          `A category with slug "${slug}" already exists for language "${existing.language}"`
        );
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug,
        description: dto.description,
      },
      include: {
        _count: {
          select: {
            news: true,
            newsEn: true,
          },
        },
      },
    });

    // Log the update with changes
    const changes: Record<string, any> = {};
    if (dto.name !== existing.name) {
      changes.name = { from: existing.name, to: dto.name };
    }
    if (slug !== existing.slug) {
      changes.slug = { from: existing.slug, to: slug };
    }
    if (dto.description !== existing.description) {
      changes.description = { from: existing.description, to: dto.description };
    }

    await this.auditLog.logCRUD({
      operation: 'UPDATE',
      entity: 'CATEGORY',
      entityId: category.id,
      userId,
      entityName: category.name,
      changes: Object.keys(changes).length > 0 ? changes : undefined,
    });

    return category;
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.category.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: {
            news: true,
            newsEn: true,
          },
        },
      },
    });
    
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has associated news
    const totalNews = existing._count.news + existing._count.newsEn;
    if (totalNews > 0) {
      throw new BadRequestException(
        `Cannot delete category. Category has ${totalNews} associated news articles. Please reassign or delete them first.`
      );
    }

    await this.prisma.category.delete({ where: { id } });

    // Log the deletion
    await this.auditLog.logCRUD({
      operation: 'DELETE',
      entity: 'CATEGORY',
      entityId: id,
      userId,
      entityName: existing.name,
    });

    return { message: 'Category deleted successfully' };
  }

  async getStats() {
    const totalCategories = await this.prisma.category.count();
    const categoriesByLanguage = await this.prisma.category.groupBy({
      by: ['language'],
      _count: {
        language: true,
      },
    });

    const recentCategories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        language: true,
        createdAt: true,
        _count: {
          select: {
            news: true,
            newsEn: true,
          },
        },
      },
    });

    return {
      totalCategories,
      categoriesByLanguage: categoriesByLanguage.map(item => ({
        language: item.language,
        count: item._count.language,
      })),
      recentCategories,
    };
  }

  async getWithNewsCount(language?: string) {
    const where = language ? { language } : {};
    
    const categories = await this.prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            news: true,
            newsEn: true,
          },
        },
      },
    });

    return {
      categories: categories.map(category => ({
        ...category,
        totalNews: category._count.news + category._count.newsEn,
      })),
      count: categories.length,
    };
  }
}
