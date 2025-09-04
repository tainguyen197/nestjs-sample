import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news/news.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { User } from './auth/decorators/user.decorator';
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe';
import { 
  CreateNewsSchema, 
  UpdateNewsSchema, 
  NewsQuerySchema, 
  StatusUpdateSchema,
  RelatedNewsQuerySchema,
} from './news/schemas/news.schema';
import type {
  CreateNewsDto,
  UpdateNewsDto,
  NewsQueryDto,
  StatusUpdateDto,
  RelatedNewsQueryDto,
} from './news/schemas/news.schema';

@Controller('news')
export class NewsController {
  constructor(private readonly svc: NewsService) {}

  @Get()
  list(@Query(new ZodValidationPipe(NewsQuerySchema)) q: NewsQueryDto) {
    return this.svc.list(q);
  }

  @Get('featured')
  getFeatured() {
    return this.svc.getFeatured();
  }

  @Get('homepage')
  getHomepage() {
    return this.svc.getHomepage();
  }

  @Get('related')
  getRelated(@Query(new ZodValidationPipe(RelatedNewsQuerySchema)) q: RelatedNewsQueryDto) {
    return this.svc.getRelated(q);
  }

  @Get('by-slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.svc.getBySlug(slug);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR')
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateNewsSchema)) dto: CreateNewsDto, 
    @User() user: any
  ) {
    return this.svc.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR')
  @Put(':id')
  update(
    @Param('id') id: string, 
    @Body(new ZodValidationPipe(UpdateNewsSchema)) dto: UpdateNewsDto, 
    @User() user: any
  ) {
    return this.svc.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(StatusUpdateSchema)) dto: StatusUpdateDto,
    @User() user: any
  ) {
    return this.svc.updateStatus(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.svc.remove(id, user.id);
  }
}
