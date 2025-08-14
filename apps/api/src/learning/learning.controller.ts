import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import {
  LearningService,
  CreateCourseDto,
  CreateModuleDto,
  CreateLessonDto,
  CreateAssessmentDto,
  SubmitAssessmentDto,
} from './learning.service';

@ApiTags('Learning Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/learning')
export class LearningController {
  constructor(private learningService: LearningService) {}

  @ApiOperation({ summary: 'Get all available courses' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  @Get('courses')
  async getAllCourses() {
    return this.learningService.getAllCourses();
  }

  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @Get('courses/:id')
  async getCourseById(@Param('id') id: string) {
    return this.learningService.getCourseById(id);
  }

  @ApiOperation({ summary: 'Get course by slug' })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @Get('courses/slug/:slug')
  async getCourseBySlug(@Param('slug') slug: string) {
    return this.learningService.getCourseBySlug(slug);
  }

  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiResponse({ status: 201, description: 'Enrolled successfully' })
  @ApiResponse({ status: 400, description: 'Already enrolled or prerequisites not met' })
  @Post('enroll/:courseId')
  async enrollInCourse(@Request() req, @Param('courseId') courseId: string) {
    return this.learningService.enrollUser(req.user.id, courseId);
  }

  @ApiOperation({ summary: 'Get my enrollments' })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved' })
  @Get('my-enrollments')
  async getMyEnrollments(@Request() req) {
    return this.learningService.getUserEnrollments(req.user.id);
  }

  @ApiOperation({ summary: 'Get my enrollment for a specific course' })
  @ApiResponse({ status: 200, description: 'Enrollment found' })
  @Get('my-enrollments/:courseId')
  async getMyEnrollment(
    @Request() req,
    @Param('courseId') courseId: string
  ) {
    return this.learningService.getUserEnrollment(req.user.id, courseId);
  }

  @ApiOperation({ summary: 'Start a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson started' })
  @Post('lessons/:lessonId/start')
  async startLesson(@Request() req, @Param('lessonId') lessonId: string) {
    return this.learningService.startLesson(req.user.id, lessonId);
  }

  @ApiOperation({ summary: 'Update lesson progress' })
  @ApiResponse({ status: 200, description: 'Progress updated' })
  @Put('lessons/:lessonId/progress')
  async updateLessonProgress(
    @Request() req,
    @Param('lessonId') lessonId: string,
    @Body() body: { progress: number }
  ) {
    return this.learningService.updateLessonProgress(
      req.user.id,
      lessonId,
      body.progress
    );
  }

  @ApiOperation({ summary: 'Submit an assessment' })
  @ApiResponse({ status: 200, description: 'Assessment submitted' })
  @Post('assessments/submit')
  async submitAssessment(
    @Request() req,
    @Body() submitData: SubmitAssessmentDto
  ) {
    return this.learningService.submitAssessment(req.user.id, submitData);
  }

  @ApiOperation({ summary: 'Get my certificates' })
  @ApiResponse({ status: 200, description: 'Certificates retrieved' })
  @Get('my-certificates')
  async getMyCertificates(@Request() req) {
    return this.learningService.getUserCertificates(req.user.id);
  }

  @ApiOperation({ summary: 'Get student dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved' })
  @Get('dashboard')
  async getStudentDashboard(@Request() req) {
    return this.learningService.getStudentDashboard(req.user.id);
  }
}
