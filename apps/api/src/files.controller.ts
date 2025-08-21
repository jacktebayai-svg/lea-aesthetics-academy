import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Inject } from '@nestjs/common';
import type { IStorageService } from './storage/storage.types';
import { PrismaService } from './prisma/prisma.service';

@Controller('v1/files')
export class FilesController {
  constructor(
    @Inject('IStorageService') private storage: IStorageService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('file is required');

    const stored = await this.storage.upload({
      filename: file.originalname,
      contentType: file.mimetype,
      buffer: file.buffer,
      isPublic: false,
    });

    const created = await this.prisma.file.create({
      data: {
        filename: stored.key,
        originalName: file.originalname,
        mimetype: stored.contentType,
        size: stored.size,
        s3Key: stored.key,
        s3Bucket: 'vercel-blob',
        isPublic: false,
      },
    });

    return { id: created.id, url: stored.url };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const f = await this.prisma.file.findUnique({ where: { id } });
    if (!f) {
      throw new BadRequestException('Not found');
    }
    return { id: f.id, filename: f.originalName, size: f.size, url: `${process.env.BLOB_PUBLIC_BASE_URL || ''}/${f.s3Key}` };
  }
}
