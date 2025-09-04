import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NewsController } from '../news.controller';
import { AuditLogService } from '../common/services/audit-log.service';

@Module({
  imports: [PrismaModule],
  controllers: [NewsController],
  providers: [NewsService, AuditLogService],
  exports: [NewsService],
})
export class NewsModule {}
