import { Controller, Get, Param } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from '@prisma/client';
import { Public } from '../common/auth/public.decorator';

@Controller('courses')
@Public()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(): Promise<Course[]> {
    return this.coursesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Course | null> {
    return this.coursesService.findOne(id);
  }
}
