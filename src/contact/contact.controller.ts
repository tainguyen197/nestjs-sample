import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UpdateContactSchema } from './schemas/contact.schema';
import type { UpdateContactDto } from './schemas/contact.schema';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  getPublic() {
    return this.contactService.getPublic();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('admin')
  get() {
    return this.contactService.get();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('history')
  getHistory() {
    return this.contactService.getHistory();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('stats')
  getStats() {
    return this.contactService.getStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR', 'ADMIN', 'SUPER_ADMIN')
  @Put()
  update(
    @Body(new ZodValidationPipe(UpdateContactSchema)) dto: UpdateContactDto,
    @User() user: any
  ) {
    return this.contactService.update(dto, user.id);
  }
}
