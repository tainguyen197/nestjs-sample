import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { NewsService } from './news/news.service';

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

  @Post()
  create(@Body() dto: any) {
    return this.svc.create(dto, 'temp-user');
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.svc.update(id, dto, 'temp-user');
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id, 'temp-user');
  }
}
