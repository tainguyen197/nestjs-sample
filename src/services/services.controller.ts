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
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateServiceSchema,
  UpdateServiceSchema,
  UpdateStatusSchema,
  ServiceQuerySchema,
} from './schemas/services.schema';
import type {
  CreateServiceDto,
  UpdateServiceDto,
  UpdateStatusDto,
  ServiceQueryDto,
} from './schemas/services.schema';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  list(@Query(new ZodValidationPipe(ServiceQuerySchema)) q: ServiceQueryDto) {
    return this.servicesService.list(q);
  }

  @Get('homepage')
  getHomepage() {
    return this.servicesService.getHomepage();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  getStats() {
    return this.servicesService.getStats();
  }

  @Get('by-slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.servicesService.getBySlug(slug);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.servicesService.get(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR', 'ADMIN', 'SUPER_ADMIN')
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateServiceSchema)) dto: CreateServiceDto,
    @User() user: any
  ) {
    return this.servicesService.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR', 'ADMIN', 'SUPER_ADMIN')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateServiceSchema)) dto: UpdateServiceDto,
    @User() user: any
  ) {
    return this.servicesService.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR', 'ADMIN', 'SUPER_ADMIN')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateStatusSchema)) dto: UpdateStatusDto,
    @User() user: any
  ) {
    return this.servicesService.updateStatus(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.servicesService.remove(id, user.id);
  }
}
