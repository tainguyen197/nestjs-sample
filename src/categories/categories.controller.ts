import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CategoryQuerySchema,
  GetBySlugSchema,
  GetByLanguageSchema,
} from './schemas/categories.schema';
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryDto,
  GetBySlugDto,
  GetByLanguageDto,
} from './schemas/categories.schema';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(@Query(new ZodValidationPipe(CategoryQuerySchema)) q: CategoryQueryDto) {
    return this.categoriesService.list(q);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  getStats() {
    return this.categoriesService.getStats();
  }

  @Get('by-language/:language')
  getByLanguage(@Param(new ZodValidationPipe(GetByLanguageSchema)) params: GetByLanguageDto) {
    return this.categoriesService.getByLanguage(params.language);
  }

  @Get('with-news-count')
  getWithNewsCount(@Query('language') language?: string) {
    return this.categoriesService.getWithNewsCount(language);
  }

  @Get('by-slug/:slug')
  getBySlug(
    @Param('slug') slug: string,
    @Query('language') language: string = 'vi'
  ) {
    return this.categoriesService.getBySlug(slug, language);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.categoriesService.get(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR', 'ADMIN', 'SUPER_ADMIN')
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateCategorySchema)) dto: CreateCategoryDto,
    @User() user: any
  ) {
    return this.categoriesService.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR', 'ADMIN', 'SUPER_ADMIN')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCategorySchema)) dto: UpdateCategoryDto,
    @User() user: any
  ) {
    return this.categoriesService.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.categoriesService.remove(id, user.id);
  }
}
