import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUrlDto } from '../models/create-url.dto';
import { UrlResponseDto } from '../models/url-response.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class UrlService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUrlDto): Promise<UrlResponseDto> {
    // Générer un slug unique
    let slug: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      slug = nanoid(6);
      const existing = await this.prisma.url.findUnique({ where: { slug } });
      if (!existing) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts === maxAttempts) {
      throw new ConflictException('Impossible de générer un slug unique');
    }

    const url = await this.prisma.url.create({
      data: {
        slug,
        original: dto.original,
      },
    });

    return {
      ...url,
      shortUrl: `http://localhost:3001/${url.slug}`,
    };
  }

  async findAll(): Promise<UrlResponseDto[]> {
    const urls = await this.prisma.url.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return urls.map((url) => ({
      ...url,
      shortUrl: `http://localhost:3001/${url.slug}`,
    }));
  }

  async findBySlug(slug: string): Promise<UrlResponseDto> {
    const url = await this.prisma.url.findUnique({ where: { slug } });

    if (!url) {
      throw new NotFoundException('URL non trouvée');
    }

    // Incrémenter le compteur de clics
    await this.prisma.url.update({
      where: { slug },
      data: { clicks: url.clicks + 1 },
    });

    return {
      ...url,
      shortUrl: `http://localhost:3001/${url.slug}`,
    };
  }
}
