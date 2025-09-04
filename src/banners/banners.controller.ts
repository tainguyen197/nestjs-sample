import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { BannerQuerySchema, CreateBannerSchema, UpdateBannerSchema, UpdateStatusSchema } from './schemas/banners.schema';
import type { BannerQueryDto, CreateBannerDto, UpdateBannerDto, UpdateStatusDto } from './schemas/banners.schema';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  // Public
  @Get('public')
  async getPublic() {
    return this.bannersService.getPublic();
  }

  // Protected
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Query(new ZodValidationPipe(BannerQuerySchema)) q: BannerQueryDto) {
    return this.bannersService.list(q);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.bannersService.getById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @Post()
  async create(@Body(new ZodValidationPipe(CreateBannerSchema)) data: CreateBannerDto, @User('id') userId: string) {
    return this.bannersService.create(data, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateBannerSchema)) data: UpdateBannerDto,
    @User('id') userId: string,
  ) {
    return this.bannersService.update(id, data, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateStatusSchema)) data: UpdateStatusDto,
    @User('id') userId: string,
  ) {
    return this.bannersService.updateStatus(id, data.status, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string, @User('id') userId: string) {
    return this.bannersService.delete(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/stats')
  async getStats() {
    return this.bannersService.getStats();
  }
}


