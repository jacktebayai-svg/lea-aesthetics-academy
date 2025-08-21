import { Controller, Get, Param } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { Template } from '@prisma/client';
import { Public } from '../common/auth/public.decorator';

@Controller('templates')
@Public()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  async findAll(): Promise<Template[]> {
    return this.templatesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Template | null> {
    return this.templatesService.findOne(id);
  }
}
