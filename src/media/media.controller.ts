import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateFromUrlSchema, MediaQuerySchema } from './schemas/media.schema';
import type { CreateFromUrlDto, MediaQueryDto } from './schemas/media.schema';
import { User } from '../auth/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Query(new ZodValidationPipe(MediaQuerySchema)) q: MediaQueryDto) {
    return this.mediaService.list(q);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.mediaService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('fetchUrl')
  async createFromUrl(
    @Body(new ZodValidationPipe(CreateFromUrlSchema)) data: CreateFromUrlDto,
    @User('id') userId: string,
  ) {
    return this.mediaService.createFromUrl(data, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @User('id') userId: string) {
    return this.mediaService.delete(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/stats')
  async getStats() {
    return this.mediaService.getStats();
  }
}


