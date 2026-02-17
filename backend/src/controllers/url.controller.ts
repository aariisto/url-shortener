import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from '../services/url.service';
import { CreateUrlDto } from '../models/create-url.dto';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('url')
  async create(@Body() dto: CreateUrlDto) {
    return this.urlService.create(dto);
  }

  @Get('url')
  async findAll() {
    return this.urlService.findAll();
  }

  @Get(':slug')
  async redirect(@Param('slug') slug: string, @Res() res: Response) {
    const url = await this.urlService.findBySlug(slug);
    return res.redirect(HttpStatus.FOUND, url.original);
  }
}
