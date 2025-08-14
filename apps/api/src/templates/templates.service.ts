import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Template } from '@prisma/client';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Template[]> {
    return this.prisma.template.findMany();
  }

  async findOne(id: string): Promise<Template | null> {
    return this.prisma.template.findUnique({ where: { id } });
  }

  // You can add create, update, delete methods here later
}
