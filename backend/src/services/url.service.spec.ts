import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UrlService } from './url.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppModule } from '../app.module';

describe('UrlService', () => {
  let service: UrlService;
  let prisma: PrismaService;

  const mockPrismaService = {
    url: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new URL with CUID', async () => {
      const original = 'https://example.com';
      const mockUrl = {
        id: 'cldr2gx4w0000qzrm8n4g5h7k',
        original,
        clicks: 0,
        createdAt: new Date(),
      };

      mockPrismaService.url.create.mockResolvedValue(mockUrl);

      const result = await service.create(original);

      expect(prisma.url.create).toHaveBeenCalledWith({
        data: { original },
      });
      expect(result).toEqual({
        id: mockUrl.id,
        original: mockUrl.original,
        shortUrl: expect.stringContaining(mockUrl.id),
        clicks: 0,
        createdAt: mockUrl.createdAt,
      });
      expect(result.id).toMatch(/^c[a-z0-9]{24}$/);
    });
  });

  describe('findAll', () => {
    it('should return all URLs ordered by createdAt desc', async () => {
      const mockUrls = [
        {
          id: 'cldr2gx4w0000qzrm8n4g5h7k',
          original: 'https://example.com',
          clicks: 5,
          createdAt: new Date('2026-02-18'),
        },
        {
          id: 'cldr2gx4w0001qzrm8n4g5h7l',
          original: 'https://github.com',
          clicks: 10,
          createdAt: new Date('2026-02-17'),
        },
      ];

      mockPrismaService.url.findMany.mockResolvedValue(mockUrls);

      const result = await service.findAll();

      expect(prisma.url.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].clicks).toBe(5);
    });
  });

  describe('findById', () => {
    it('should return URL and increment clicks', async () => {
      const id = 'cldr2gx4w0000qzrm8n4g5h7k';
      const mockUrl = {
        id,
        original: 'https://example.com',
        clicks: 5,
        createdAt: new Date(),
      };

      mockPrismaService.url.findUnique.mockResolvedValue(mockUrl);
      mockPrismaService.url.update.mockResolvedValue({
        ...mockUrl,
        clicks: 6,
      });

      const result = await service.findById(id);

      expect(prisma.url.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(prisma.url.update).toHaveBeenCalledWith({
        where: { id },
        data: { clicks: 6 },
      });
      expect(result).toBe('https://example.com');
    });

    it('should throw NotFoundException if URL not found', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

describe('UrlService HTTP (e2e with mock)', () => {
  let app: INestApplication;

  const mockPrismaService = {
    url: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /url', () => {
    it('should create a new short URL', () => {
      const mockUrl = {
        id: 'cldr2gx4w0000qzrm8n4g5h7k',
        original: 'https://example.com',
        clicks: 0,
        createdAt: new Date(),
      };

      mockPrismaService.url.create.mockResolvedValue(mockUrl);

      return request(app.getHttpServer())
        .post('/url')
        .send({ original: 'https://example.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('shortUrl');
          expect(res.body.original).toBe('https://example.com');
          expect(res.body.clicks).toBe(0);
          expect(res.body.id).toMatch(/^c[a-z0-9]{24}$/);
        });
    });

    it('should return 400 if original URL is missing', () => {
      return request(app.getHttpServer()).post('/url').send({}).expect(400);
    });
  });

  describe('GET /url', () => {
    it('should return empty array when no URLs exist', () => {
      mockPrismaService.url.findMany.mockResolvedValue([]);

      return request(app.getHttpServer()).get('/url').expect(200).expect([]);
    });

    it('should return all URLs ordered by createdAt desc', () => {
      const mockUrls = [
        {
          id: 'cldr2gx4w0001qzrm8n4g5h7l',
          original: 'https://second.com',
          clicks: 0,
          createdAt: new Date('2026-02-18T10:00:00Z'),
        },
        {
          id: 'cldr2gx4w0000qzrm8n4g5h7k',
          original: 'https://first.com',
          clicks: 0,
          createdAt: new Date('2026-02-18T09:00:00Z'),
        },
      ];

      mockPrismaService.url.findMany.mockResolvedValue(mockUrls);

      return request(app.getHttpServer())
        .get('/url')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0].original).toBe('https://second.com');
          expect(res.body[1].original).toBe('https://first.com');
        });
    });
  });

  describe('GET /:id', () => {
    it('should redirect to original URL and increment clicks', () => {
      const mockUrl = {
        id: 'cldr2gx4w0000qzrm8n4g5h7k',
        original: 'https://example.com',
        clicks: 5,
        createdAt: new Date(),
      };

      mockPrismaService.url.findUnique.mockResolvedValue(mockUrl);
      mockPrismaService.url.update.mockResolvedValue({
        ...mockUrl,
        clicks: 6,
      });

      return request(app.getHttpServer())
        .get('/cldr2gx4w0000qzrm8n4g5h7k')
        .expect(302)
        .expect('Location', 'https://example.com')
        .expect(() => {
          expect(mockPrismaService.url.findUnique).toHaveBeenCalledWith({
            where: { id: 'cldr2gx4w0000qzrm8n4g5h7k' },
          });
          expect(mockPrismaService.url.update).toHaveBeenCalledWith({
            where: { id: 'cldr2gx4w0000qzrm8n4g5h7k' },
            data: { clicks: 6 },
          });
        });
    });

    it('should return 404 for non-existent ID', () => {
      mockPrismaService.url.findUnique.mockResolvedValue(null);

      return request(app.getHttpServer()).get('/nonexistent-id').expect(404);
    });
  });
});
