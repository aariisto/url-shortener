import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UrlController } from './controllers/url.controller';
import { UrlService } from './services/url.service';

@Module({
  imports: [],
  controllers: [UrlController],
  providers: [PrismaService, UrlService],
})
export class AppModule {}
