import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Course } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Course[]> {
    return this.prisma.course.findMany({
      include: {
        modules: true,
        enrollments: true,
      },
    });
  }

  async findOne(id: string): Promise<Course | null> {
    return this.prisma.course.findUnique({ 
      where: { id },
      include: {
        modules: true,
        enrollments: true,
      },
    });
  }
}
