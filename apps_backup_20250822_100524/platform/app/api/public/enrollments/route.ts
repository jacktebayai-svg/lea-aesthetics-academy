import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findById, create, getCurrentUser, getStudentByUserId, getCourseBySlug, handleDatabaseError, formatPrice } from '@/lib/supabase/helpers'
import { z } from 'zod'

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
    const supabase = await createClient()
    
    // Parse request body
    const body = await request.json()
    const { courseId, studentInfo } = createEnrollmentSchema.parse(body)

    // Get course details
    const course = await findById(supabase, 'courses', courseId)

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (!course.is_active) {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 400 }
      )
    }

    // Check enrollment capacity
    if (course.max_students) {
      const { count: currentEnrollments } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .in('status', ['enrolled', 'in_progress', 'completed'])

      if ((currentEnrollments || 0) >= course.max_students) {
        return NextResponse.json(
          { error: 'Course is fully booked' },
          { status: 400 }
        )
      }
    }

    // Determine student ID
    let studentId: string | null = null
    
    // Try to get authenticated user
    try {
      const user = await getCurrentUser(supabase)
      if (user) {
        const student = await getStudentByUserId(supabase, user.id)
        studentId = student?.id || null
      }
    } catch (authError) {
      // User not authenticated - for now require authentication
      if (!studentInfo?.email) {
        return NextResponse.json(
          { error: 'Authentication required or student email must be provided' },
          { status: 401 }
        )
      }
    }

    // If no authenticated student, require authentication for course enrollment
    if (!studentId) {
      return NextResponse.json(
        { error: 'Please sign in to enroll in courses' },
        { status: 401 }
      )
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .in('status', ['enrolled', 'in_progress', 'completed'])
      .single()

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      )
    }

    // Create enrollment record
    const enrollment = await create(supabase, 'course_enrollments', {
      student_id: studentId,
      course_id: courseId,
      status: 'enrolled',
      progress: {},
      certificate_issued: false
    })

    // Create payment record if course has a price
    let payment = null
    if (course.price > 0) {
      payment = await create(supabase, 'payments', {
        course_enrollment_id: enrollment.id,
        amount: course.price,
        deposit_amount: course.price, // Full payment for courses
        currency: 'GBP',
        status: 'pending'
      })
    }

    // Return enrollment details for payment processing
    return NextResponse.json({
      success: true,
      enrollment: {
        id: enrollment.id,
        courseTitle: course.title,
        duration: course.duration_hours,
        price: course.price,
        status: enrollment.status,
        formattedPrice: formatPrice(course.price)
      },
      payment: payment ? {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency
      } : null,
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

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
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
    const supabase = await createClient()
    
    // Authenticate user
    const user = await getCurrentUser(supabase)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get student record
    const student = await getStudentByUserId(supabase, user.id)
    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('course_enrollments')
      .select(`
        *,
        course:courses(*),
        payments(*)
      `)
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (limit > 0) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data: enrollments, error } = await query

    if (error) {
      handleDatabaseError(error)
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', student.id)

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    const { count: total } = await countQuery

    return NextResponse.json({
      success: true,
      enrollments: enrollments?.map(enrollment => ({
        id: enrollment.id,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          duration: enrollment.course.duration_hours,
          price: enrollment.course.price,
          formattedPrice: formatPrice(enrollment.course.price)
        },
        status: enrollment.status,
        progress: enrollment.progress,
        completedAt: enrollment.completed_at,
        certificateIssued: enrollment.certificate_issued,
        paymentStatus: enrollment.payments?.[0]?.status || 'pending',
        createdAt: enrollment.created_at,
        updatedAt: enrollment.updated_at,
      })) || [],
      pagination: {
        total: total || 0,
        limit,
        offset,
        hasMore: offset + limit < (total || 0),
      },
    })
  } catch (error) {
    console.error('Get enrollments error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
