import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news/news.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { User } from './auth/decorators/user.decorator';

@Controller('news')
export class NewsController {
  constructor(private readonly svc: NewsService) {}

  @Get()
  list(@Query() q: any) {
    return this.svc.list(q);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR') // EDITOR and above can create/update
  @Post()
  create(@Body() dto: any, @User() user: any) {
    return this.svc.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR') // EDITOR and above can create/update
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any, @User() user: any) {
    return this.svc.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.svc.remove(id, user.id);
  }
}
