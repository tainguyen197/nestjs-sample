import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NewsController } from '../news.controller';

@Module({
  imports: [PrismaModule],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
