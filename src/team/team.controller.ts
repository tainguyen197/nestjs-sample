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
import { TeamService } from './team.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateTeamMemberSchema,
  UpdateTeamMemberSchema,
  UpdateStatusSchema,
  UpdateOrderSchema,
  TeamMemberQuerySchema,
} from './schemas/team.schema';
import type {
  CreateTeamMemberDto,
  UpdateTeamMemberDto,
  UpdateStatusDto,
  UpdateOrderDto,
  TeamMemberQueryDto,
} from './schemas/team.schema';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  // Public endpoints
  @Get()
  async list(@Query(new ZodValidationPipe(TeamMemberQuerySchema)) query: TeamMemberQueryDto) {
    return this.teamService.list(query);
  }

  @Get('homepage')
  async getHomepage() {
    return this.teamService.getHomepage();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.teamService.getById(id);
  }

  // Protected endpoints - require authentication
  @UseGuards(JwtAuthGuard)
  @Get('admin/stats')
  async getStats() {
    return this.teamService.getStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateTeamMemberSchema)) data: CreateTeamMemberDto,
    @User('id') userId: string,
  ) {
    return this.teamService.create(data, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTeamMemberSchema)) data: UpdateTeamMemberDto,
    @User('id') userId: string,
  ) {
    return this.teamService.update(id, data, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateStatusSchema)) data: UpdateStatusDto,
    @User('id') userId: string,
  ) {
    return this.teamService.updateStatus(id, data.status, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @Patch(':id/order')
  async updateOrder(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateOrderSchema)) data: UpdateOrderDto,
    @User('id') userId: string,
  ) {
    return this.teamService.updateOrder(id, data.order, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string, @User('id') userId: string) {
    return this.teamService.delete(id, userId);
  }
}
