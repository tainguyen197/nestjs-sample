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
import { EquipmentService } from './equipment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateEquipmentSchema,
  UpdateEquipmentSchema,
  UpdateStatusSchema,
  UpdateOrderSchema,
  ReorderSchema,
  EquipmentQuerySchema,
} from './schemas/equipment.schema';
import type {
  CreateEquipmentDto,
  UpdateEquipmentDto,
  UpdateStatusDto,
  UpdateOrderDto,
  ReorderDto,
  EquipmentQueryDto,
} from './schemas/equipment.schema';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  list(@Query(new ZodValidationPipe(EquipmentQuerySchema)) q: EquipmentQueryDto) {
    return this.equipmentService.list(q);
  }

  @Get('homepage')
  getHomepage() {
    return this.equipmentService.getHomepage();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  getStats() {
    return this.equipmentService.getStats();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.equipmentService.get(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR', 'ADMIN', 'SUPER_ADMIN')
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateEquipmentSchema)) dto: CreateEquipmentDto,
    @User() user: any
  ) {
    return this.equipmentService.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR', 'ADMIN', 'SUPER_ADMIN')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateEquipmentSchema)) dto: UpdateEquipmentDto,
    @User() user: any
  ) {
    return this.equipmentService.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR', 'ADMIN', 'SUPER_ADMIN')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateStatusSchema)) dto: UpdateStatusDto,
    @User() user: any
  ) {
    return this.equipmentService.updateStatus(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR', 'ADMIN', 'SUPER_ADMIN')
  @Patch(':id/order')
  updateOrder(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateOrderSchema)) dto: UpdateOrderDto,
    @User() user: any
  ) {
    return this.equipmentService.updateOrder(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR', 'ADMIN', 'SUPER_ADMIN')
  @Post('reorder')
  reorder(
    @Body(new ZodValidationPipe(ReorderSchema)) dto: ReorderDto,
    @User() user: any
  ) {
    return this.equipmentService.reorder(dto.ids, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.equipmentService.remove(id, user.id);
  }
}
