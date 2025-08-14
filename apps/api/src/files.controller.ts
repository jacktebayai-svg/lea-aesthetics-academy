import { Controller, Post, UseGuards, UploadedFile, UseInterceptors, BadRequestException, Get, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantGuard } from './common/tenant/tenant.guard';
import { TenantId } from './common/tenant/tenant.decorator';
import { Inject } from '@nestjs/common';
import type { IStorageService } from './storage/storage.types';
import { PrismaService } from './prisma/prisma.service';

@Controller('v1/files')
@UseGuards(TenantGuard)
export class FilesController {
  constructor(
    @Inject('IStorageService') private storage: IStorageService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @TenantId() tenantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('file is required');

    const stored = await this.storage.upload({
      tenantId,
      filename: file.originalname,
      contentType: file.mimetype,
      buffer: file.buffer,
      isPublic: false,
    });

    const created = await this.prisma.file.create({
      data: {
        tenantId,
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
  async get(@TenantId() tenantId: string, @Param('id') id: string) {
    const f = await this.prisma.file.findUnique({ where: { id } });
    if (!f || (f.tenantId && f.tenantId !== tenantId)) {
      throw new BadRequestException('Not found');
    }
    return { id: f.id, filename: f.originalName, size: f.size, url: `${process.env.BLOB_PUBLIC_BASE_URL || ''}/${f.s3Key}` };
  }
}
