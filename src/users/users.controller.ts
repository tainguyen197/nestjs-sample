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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UpdatePasswordSchema,
  ResetPasswordSchema,
  UserQuerySchema,
} from './schemas/users.schema';
import type {
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  ResetPasswordDto,
  UserQueryDto,
} from './schemas/users.schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  list(@Query(new ZodValidationPipe(UserQuerySchema)) q: UserQueryDto) {
    return this.usersService.list(q);
  }

  @Get('stats')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  get(@Param('id') id: string) {
    return this.usersService.get(id);
  }

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(
    @Body(new ZodValidationPipe(CreateUserSchema)) dto: CreateUserDto,
    @User() user: any
  ) {
    return this.usersService.create(dto, user.id);
  }

  @Put(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) dto: UpdateUserDto,
    @User() user: any
  ) {
    return this.usersService.update(id, dto, user.id);
  }

  @Patch(':id/password')
  updatePassword(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdatePasswordSchema)) dto: UpdatePasswordDto,
    @User() user: any
  ) {
    // Users can only change their own password unless they're admin/super admin
    if (id !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('You can only change your own password');
    }
    return this.usersService.updatePassword(id, dto, user.id);
  }

  @Patch(':id/reset-password')
  @Roles('ADMIN', 'SUPER_ADMIN')
  resetPassword(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ResetPasswordSchema)) dto: ResetPasswordDto,
    @User() user: any
  ) {
    return this.usersService.resetPassword(id, dto, user.id);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string, @User() user: any) {
    return this.usersService.remove(id, user.id);
  }
}
