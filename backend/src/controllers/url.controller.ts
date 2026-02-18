import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { UrlService } from '../services/url.service';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('url')
  async create(@Body() body: { original: string }) {
    if (!body.original) {
      throw new BadRequestException('URL is required');
    }
    return this.urlService.create(body.original);
  }

  @Get('url')
  async findAll() {
    return this.urlService.findAll();
  }

  @Get(':id')
  async redirect(@Param('id') id: string, @Res() res: Response) {
    const original = await this.urlService.findById(id);
    return res.redirect(HttpStatus.FOUND, original);
  }
}
