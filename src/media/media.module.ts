import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { UploadImageController } from './upload-image.controller';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [MediaController, UploadImageController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}


