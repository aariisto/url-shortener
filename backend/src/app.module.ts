import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { UrlController } from './controllers/url.controller';
import { UrlService } from './services/url.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
  ],
  controllers: [UrlController],
  providers: [PrismaService, UrlService],
})
export class AppModule {}
