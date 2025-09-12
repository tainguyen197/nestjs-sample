import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { MediaService } from "./media.service";
import { User } from "../auth/decorators/user.decorator";

@Controller("upload_image")
export class UploadImageController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype?.startsWith("image/")) return cb(null, false);
        cb(null, true);
      }
    })
  )
  async upload(@UploadedFile() file: any, @User("id") userId: string) {
    if (!file)
      throw new BadRequestException("Invalid file. Only images up to 5MB.");

    const media = await (this.mediaService as any).createFromBuffer(
      {
        buffer: file.buffer,
        originalName: file.originalname,
        mimetype: file.mimetype
      },
      userId
    );

    return media; // media.url should already be absolute or public
  }
}
