import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('v1/services')
export class ServicesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list() {
    return this.prisma.service.findMany({ take: 100, orderBy: { name: 'asc' } });
  }

  @Post()
  async create(@Body() body: any) {
    const { tenantId, name, slug, basePrice, durationMin, category, description } = body;
    return this.prisma.service.create({ data: { tenantId, name, slug, basePrice, durationMin, category, description } });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.prisma.service.update({ where: { id }, data: body });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prisma.service.delete({ where: { id } });
    return { ok: true };
  }
}
