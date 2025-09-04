import { Module } from '@nestjs/common';
import { AuditLogService } from './services/audit-log.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class CommonModule {}
