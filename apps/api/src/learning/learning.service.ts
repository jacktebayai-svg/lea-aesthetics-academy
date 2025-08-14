import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateCourseDto {
  title: string;
  slug: string;
  description?: string;
  level: string;
  category: string;
  prerequisites?: string[];
  duration: number;
  content: any;
  order?: number;
}

export interface CreateModuleDto {
  courseId: string;
  title: string;
  slug: string;
  description?: string;
  content: any;
  order?: number;
  duration: number;
  isRequired?: boolean;
}

export interface CreateLessonDto {
  moduleId: string;
  title: string;
  slug: string;
  content: any;
  type: string;
  order?: number;
  duration: number;
  isRequired?: boolean;
  resources?: any;
}

export interface CreateAssessmentDto {
  moduleId: string;
  title: string;
  description?: string;
  type: string;
  questions: any;
  passingScore?: number;
  timeLimit?: number;
  maxAttempts?: number;
  isRequired?: boolean;
  order?: number;
}

export interface SubmitAssessmentDto {
  assessmentId: string;
  answers: any;
  timeSpent: number;
}

@Injectable()
export class LearningService {
  constructor(private prisma: PrismaService) {}

  // Course Management
  async createCourse(data: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        level: data.level,
        category: data.category,
        prerequisites: data.prerequisites || [],
        duration: data.duration,
        content: data.content,
        order: data.order || 0,
      },
    });
  }

  async getAllCourses() {
    return this.prisma.course.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
            assessments: {
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });
  }

  async getCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id, isActive: true },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
            assessments: {
              orderBy: { order: 'asc' },
            },
          },
        },
        enrollments: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async getCourseBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug, isActive: true },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
            assessments: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  // Module Management
  async createModule(data: CreateModuleDto) {
    // Verify course exists
    const course = await this.getCourseById(data.courseId);

    return this.prisma.module.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content,
        order: data.order || 0,
        duration: data.duration,
        isRequired: data.isRequired ?? true,
      },
    });
  }

  async getModuleById(id: string) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        course: true,
        lessons: {
          orderBy: { order: 'asc' },
        },
        assessments: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return module;
  }

  // Lesson Management
  async createLesson(data: CreateLessonDto) {
    // Verify module exists
    const module = await this.getModuleById(data.moduleId);

    return this.prisma.lesson.create({
      data: {
        moduleId: data.moduleId,
        title: data.title,
        slug: data.slug,
        content: data.content,
        type: data.type,
        order: data.order || 0,
        duration: data.duration,
        isRequired: data.isRequired ?? true,
        resources: data.resources,
      },
    });
  }

  async getLessonById(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  // Assessment Management
  async createAssessment(data: CreateAssessmentDto) {
    const module = await this.getModuleById(data.moduleId);

    return this.prisma.assessment.create({
      data: {
        moduleId: data.moduleId,
        courseId: module.courseId,
        title: data.title,
        description: data.description,
        type: data.type,
        questions: data.questions,
        passingScore: data.passingScore || 70,
        timeLimit: data.timeLimit,
        maxAttempts: data.maxAttempts || 3,
        isRequired: data.isRequired ?? true,
        order: data.order || 0,
      },
    });
  }

  async getAssessmentById(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    return assessment;
  }

  // Student Enrollment
  async enrollUser(userId: string, courseId: string) {
    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('User is already enrolled in this course');
    }

    // Verify prerequisites
    const course = await this.getCourseById(courseId);
    if (course.prerequisites && course.prerequisites.length > 0) {
      const completedCourses = await this.prisma.enrollment.findMany({
        where: {
          userId,
          courseId: { in: course.prerequisites },
          status: 'completed',
        },
      });

      if (completedCourses.length < course.prerequisites.length) {
        throw new BadRequestException('Prerequisites not met');
      }
    }

    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'enrolled',
      },
      include: {
        course: true,
      },
    });
  }

  async getUserEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
                assessments: true,
              },
            },
          },
        },
        lessonProgress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserEnrollment(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order: 'asc' },
              include: {
                lessons: {
                  orderBy: { order: 'asc' },
                },
                assessments: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
        lessonProgress: {
          include: {
            lesson: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  // Progress Tracking
  async startLesson(userId: string, lessonId: string) {
    const lesson = await this.getLessonById(lessonId);
    
    // Find user's enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('User not enrolled in this course');
    }

    // Check if progress already exists
    const existingProgress = await this.prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
    });

    if (existingProgress) {
      return existingProgress;
    }

    // Create new progress
    return this.prisma.lessonProgress.create({
      data: {
        enrollmentId: enrollment.id,
        lessonId,
        status: 'in_progress',
        startedAt: new Date(),
      },
    });
  }

  async updateLessonProgress(userId: string, lessonId: string, progress: number) {
    const lesson = await this.getLessonById(lessonId);
    
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('User not enrolled in this course');
    }

    const lessonProgress = await this.prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: {
        progress: Math.min(100, Math.max(0, progress)),
        status: progress >= 100 ? 'completed' : 'in_progress',
        completedAt: progress >= 100 ? new Date() : null,
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        progress: Math.min(100, Math.max(0, progress)),
        status: progress >= 100 ? 'completed' : 'in_progress',
        startedAt: new Date(),
        completedAt: progress >= 100 ? new Date() : null,
      },
    });

    // Update overall course progress
    await this.updateCourseProgress(enrollment.id);

    return lessonProgress;
  }

  async updateCourseProgress(enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
        lessonProgress: true,
      },
    });

    if (!enrollment) return;

    const totalLessons = enrollment.course.modules.reduce(
      (count, module) => count + module.lessons.length,
      0
    );

    const completedLessons = enrollment.lessonProgress.filter(
      (progress) => progress.status === 'completed'
    ).length;

    const overallProgress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    const updatedEnrollment = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: overallProgress,
        status: overallProgress === 100 ? 'completed' : 'in_progress',
        completedAt: overallProgress === 100 ? new Date() : null,
      },
    });

    // Generate certificate if course completed
    if (overallProgress === 100) {
      await this.generateCertificate(enrollment.userId, enrollment.courseId);
    }

    return updatedEnrollment;
  }

  // Assessment Submission
  async submitAssessment(userId: string, data: SubmitAssessmentDto) {
    const assessment = await this.getAssessmentById(data.assessmentId);
    
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: assessment.module.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('User not enrolled in this course');
    }

    // Check attempt limits
    const previousAttempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        assessmentId: data.assessmentId,
        userId,
      },
    });

    if (previousAttempts.length >= assessment.maxAttempts) {
      throw new BadRequestException('Maximum attempts exceeded');
    }

    // Calculate score
    const { score, totalScore, feedback } = this.calculateAssessmentScore(
      assessment.questions,
      data.answers
    );

    const passed = score >= assessment.passingScore;

    const attempt = await this.prisma.assessmentAttempt.create({
      data: {
        assessmentId: data.assessmentId,
        userId,
        answers: data.answers,
        score,
        totalScore,
        passed,
        timeSpent: data.timeSpent,
        completedAt: new Date(),
        feedback,
      },
    });

    return {
      ...attempt,
      percentage: Math.round((score / totalScore) * 100),
      passRequired: assessment.passingScore,
    };
  }

  private calculateAssessmentScore(questions: any, answers: any) {
    let score = 0;
    const totalScore = questions.length;
    const feedback: any[] = [];

    questions.forEach((question: any, index: number) => {
      const userAnswer = answers[question.id] || answers[index];
      const correct = this.isAnswerCorrect(question, userAnswer);
      
      if (correct) {
        score++;
      }

      feedback.push({
        questionId: question.id,
        correct,
        userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      });
    });

    return { score, totalScore, feedback };
  }

  private isAnswerCorrect(question: any, userAnswer: any): boolean {
    switch (question.type) {
      case 'multiple_choice':
        return userAnswer === question.correctAnswer;
      case 'multiple_select':
        const correctAnswers = question.correctAnswers || [];
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        return correctAnswers.sort().join(',') === userAnswers.sort().join(',');
      case 'true_false':
        return userAnswer === question.correctAnswer;
      case 'text':
        return userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
      default:
        return false;
    }
  }

  async getUserAssessmentAttempts(userId: string, assessmentId: string) {
    return this.prisma.assessmentAttempt.findMany({
      where: {
        userId,
        assessmentId,
      },
      orderBy: { startedAt: 'desc' },
      include: {
        assessment: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });
  }

  // Certificate Generation
  async generateCertificate(userId: string, courseId: string) {
    const existingCertificate = await this.prisma.certificate.findFirst({
      where: { userId, courseId },
    });

    if (existingCertificate) {
      return existingCertificate;
    }

    const course = await this.getCourseById(courseId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const certificateNumber = `LACA-${course.level}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    return this.prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateNumber,
        metadata: {
          studentName: `${user?.firstName} ${user?.lastName}`,
          courseName: course.title,
          completionDate: new Date(),
          level: course.level,
        },
      },
    });
  }

  async getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: {
        course: true,
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  // Analytics and Reporting
  async getCourseAnalytics(courseId: string) {
    const course = await this.getCourseById(courseId);
    
    const enrollmentStats = await this.prisma.enrollment.groupBy({
      by: ['status'],
      where: { courseId },
      _count: true,
    });

    const completionRate = await this.prisma.enrollment.aggregate({
      where: { courseId },
      _avg: { progress: true },
    });

    const assessmentStats = await this.prisma.assessmentAttempt.aggregate({
      where: {
        assessment: {
          courseId,
        },
      },
      _avg: { score: true },
      _count: true,
    });

    return {
      course: course.title,
      enrollments: enrollmentStats,
      averageProgress: completionRate._avg.progress || 0,
      assessmentStats,
    };
  }

  async getStudentDashboard(userId: string) {
    const enrollments = await this.getUserEnrollments(userId);
    const certificates = await this.getUserCertificates(userId);
    
    const inProgress = enrollments.filter(e => e.status === 'in_progress');
    const completed = enrollments.filter(e => e.status === 'completed');

    return {
      enrollments: {
        total: enrollments.length,
        inProgress: inProgress.length,
        completed: completed.length,
      },
      certificates: certificates.length,
      recentActivity: enrollments.slice(0, 5),
    };
  }
}
