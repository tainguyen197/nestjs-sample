import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LogsService } from './logs.service';
import { z } from 'zod';

const LogsQuerySchema = z.object({
  skip: z.string().transform(Number).default('0'),
  take: z.string().transform(Number).default('20'),
});

@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async getLogs(@Query() query: any) {
    const { skip, take } = LogsQuerySchema.parse(query);
    return this.logsService.getLogs({ skip, take });
  }
}
