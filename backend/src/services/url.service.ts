import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UrlService {
  constructor(private prisma: PrismaService) {}

  async create(original: string) {
    const url = await this.prisma.url.create({
      data: { original },
    });

    return {
      id: url.id,
      original: url.original,
      shortUrl: `${process.env.FRONTEND_URL}/${url.id}`,
      clicks: url.clicks,
      createdAt: url.createdAt,
    };
  }

  async findAll() {
    const urls = await this.prisma.url.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return urls.map((url) => ({
      id: url.id,
      original: url.original,
      shortUrl: `${process.env.FRONTEND_URL}/${url.id}`,
      clicks: url.clicks,
      createdAt: url.createdAt,
    }));
  }

  async findById(id: string) {
    const url = await this.prisma.url.findUnique({
      where: { id },
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    await this.prisma.url.update({
      where: { id },
      data: { clicks: url.clicks + 1 },
    });

    return url.original;
  }
}
