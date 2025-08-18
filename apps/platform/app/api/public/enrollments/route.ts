import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const prisma = new PrismaClient()

interface JWTPayload {
  userId: string
  email: string
  roles: string[]
}

const createEnrollmentSchema = z.object({
  courseId: z.string(),
  studentInfo: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { courseId, studentInfo } = createEnrollmentSchema.parse(body)

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { 
        educator: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (!course.isActive) {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 400 }
      )
    }

    // Check enrollment capacity
    if (course.maxStudents) {
      const currentEnrollments = await prisma.enrollment.count({
        where: { 
          courseId,
          status: {
            in: ['ENROLLED', 'IN_PROGRESS', 'COMPLETED']
          }
        }
      })

      if (currentEnrollments >= course.maxStudents) {
        return NextResponse.json(
          { error: 'Course is fully booked' },
          { status: 400 }
        )
      }
    }

    // Check if user is authenticated (optional for public enrollments)
    let userId: string | null = null
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
        userId = decoded.userId
      } catch (error) {
        // Token is invalid but we can still proceed with guest enrollment
        console.warn('Invalid token for enrollment:', error)
      }
    }

    // Create or find student user
    let studentId = userId
    
    if (!userId && studentInfo?.email) {
      // Try to find existing user by email
      let existingUser = await prisma.user.findUnique({
        where: { email: studentInfo.email }
      })

      if (!existingUser && studentInfo.firstName && studentInfo.lastName) {
        // Create new student user
        existingUser = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              firstName: studentInfo.firstName!,
              lastName: studentInfo.lastName!,
              email: studentInfo.email!,
              password: '', // Will need to set password later
              phone: studentInfo.phone,
              roles: ['STUDENT'], // Set STUDENT role
            }
          })

          return newUser
        })
      }

      studentId = existingUser?.id || null
    }

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student information required for enrollment' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
        status: {
          in: ['ENROLLED', 'IN_PROGRESS', 'COMPLETED']
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      )
    }

    // Create enrollment record
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        status: 'ENROLLED',
        progress: 0,
        amountPaid: course.price || 0,
        paymentComplete: (course.price || 0) === 0,
      },
      include: {
        student: true,
        course: {
          include: {
            educator: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    // Return enrollment details for payment processing
    return NextResponse.json({
      success: true,
      enrollment: {
        id: enrollment.id,
        courseTitle: course.title,
        educatorName: `${course.educator.user.firstName} ${course.educator.user.lastName}`,
        duration: course.duration,
        level: course.level,
        price: course.price,
        status: enrollment.status,
      },
      paymentRequired: course.price > 0,
      nextStep: course.price > 0 ? 'payment' : 'complete',
    })
  } catch (error) {
    console.error('Create enrollment error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {
      studentId: decoded.userId,
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    // Fetch user's enrollments
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        course: {
          include: {
            educator: {
              include: {
                user: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: {
        startDate: 'desc',
      },
      take: limit,
      skip: offset,
    })

    const total = await prisma.enrollment.count({ where })

    return NextResponse.json({
      enrollments: enrollments.map(enrollment => ({
        id: enrollment.id,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          category: enrollment.course.category,
          duration: enrollment.course.duration,
          level: enrollment.course.level,
          price: enrollment.course.price,
        },
        educator: {
          id: enrollment.course.educator.id,
          name: `${enrollment.course.educator.user.firstName} ${enrollment.course.educator.user.lastName}`,
          title: enrollment.course.educator.title,
        },
        startDate: enrollment.startDate,
        status: enrollment.status,
        progress: enrollment.progress,
        completionDate: enrollment.completionDate,
        certificateIssued: enrollment.certificateIssued,
        paymentStatus: enrollment.payments?.[0]?.status,
        createdAt: enrollment.createdAt,
        updatedAt: enrollment.updatedAt,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Get enrollments error:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
