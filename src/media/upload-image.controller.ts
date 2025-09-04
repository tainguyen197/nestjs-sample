import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaService } from './media.service';
import { User } from '../auth/decorators/user.decorator';

@Controller('upload_image')
export class UploadImageController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'public/uploads',
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async upload(@UploadedFile() file: any, @User('id') userId: string) {
    return this.mediaService.createFromFile(
      { filename: file.filename, mimetype: file.mimetype, size: file.size },
      userId,
    );
  }
}


