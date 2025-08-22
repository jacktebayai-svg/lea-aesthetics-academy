import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

// Schema for enrollment request
const enrollmentSchema = z.object({
  payment_method_id: z.string().optional(), // For immediate payment
  payment_type: z.enum(['full', 'installments']).default('full'),
  student_info: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
    emergency_contact: z.object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string()
    }).optional()
  }).optional()
})

// POST /api/courses/[courseId]/enroll - Enroll in course with payment
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const supabase = await createClient()
    const { courseId } = params

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = enrollmentSchema.parse(body)

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price, max_students, is_active')
      .eq('id', courseId)
      .eq('is_active', true)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found or inactive' }, { status: 404 })
    }

    // Check if course has available slots
    if (course.max_students) {
      const { count: enrollmentCount } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .in('status', ['enrolled', 'in_progress', 'completed'])

      if (enrollmentCount && enrollmentCount >= course.max_students) {
        return NextResponse.json({ error: 'Course is full' }, { status: 409 })
      }
    }

    // Get or create student profile
    let { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      // Create student profile if it doesn't exist
      const studentInfo = validatedData.student_info || {}
      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: user.id,
          personal_info: {
            firstName: studentInfo.firstName || '',
            lastName: studentInfo.lastName || '',
            phone: studentInfo.phone || '',
            emergency_contact: studentInfo.emergency_contact || null
          }
        })
        .select('id')
        .single()

      if (studentError || !newStudent) {
        console.error('Error creating student profile:', studentError)
        return NextResponse.json({ error: 'Failed to create student profile' }, { status: 500 })
      }

      student = newStudent
    } else {
      // Update student info if provided
      if (validatedData.student_info) {
        await supabase
          .from('students')
          .update({
            personal_info: validatedData.student_info
          })
          .eq('id', student.id)
      }
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('course_enrollments')
      .select('id, status')
      .eq('student_id', student.id)
      .eq('course_id', courseId)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ 
        error: 'Already enrolled in this course',
        enrollment_id: existingEnrollment.id,
        status: existingEnrollment.status
      }, { status: 409 })
    }

    // Create enrollment record
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .insert({
        student_id: student.id,
        course_id: courseId,
        status: 'enrolled',
        progress: { completion_percentage: 0 }
      })
      .select('id')
      .single()

    if (enrollmentError || !enrollment) {
      console.error('Error creating enrollment:', enrollmentError)
      return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 })
    }

    // Create Stripe Payment Intent
    let paymentIntent = null
    let clientSecret = null

    if (course.price > 0) {
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: course.price, // Already in pence from database
          currency: 'gbp',
          payment_method_types: ['card'],
          metadata: {
            type: 'course_enrollment',
            course_id: courseId,
            enrollment_id: enrollment.id,
            student_id: student.id,
            user_id: user.id,
            course_title: course.title
          },
          description: `Course Enrollment: ${course.title}`,
          ...(validatedData.payment_method_id && {
            payment_method: validatedData.payment_method_id,
            confirmation_method: 'manual',
            confirm: true
          })
        })

        clientSecret = paymentIntent.client_secret

        // Create payment record
        await supabase
          .from('payments')
          .insert({
            course_enrollment_id: enrollment.id,
            stripe_payment_intent_id: paymentIntent.id,
            amount: course.price,
            currency: 'GBP',
            status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
            paid_at: paymentIntent.status === 'succeeded' ? new Date().toISOString() : null,
            metadata: {
              course_title: course.title,
              student_name: `${validatedData.student_info?.firstName || ''} ${validatedData.student_info?.lastName || ''}`.trim()
            }
          })

        // If payment succeeded immediately, update enrollment status
        if (paymentIntent.status === 'succeeded') {
          await supabase
            .from('course_enrollments')
            .update({ status: 'enrolled' })
            .eq('id', enrollment.id)
        }

      } catch (stripeError) {
        console.error('Stripe error:', stripeError)
        
        // Delete the enrollment if payment setup failed
        await supabase
          .from('course_enrollments')
          .delete()
          .eq('id', enrollment.id)

        return NextResponse.json({ 
          error: 'Payment processing failed',
          details: stripeError.message
        }, { status: 400 })
      }
    } else {
      // Free course - mark as enrolled immediately
      await supabase
        .from('course_enrollments')
        .update({ status: 'enrolled' })
        .eq('id', enrollment.id)
    }

    // Log enrollment
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'course_enrollment_created',
        resource: 'course_enrollment',
        resource_id: enrollment.id,
        new_values: {
          course_id: courseId,
          student_id: student.id,
          amount: course.price
        }
      })

    const response = {
      enrollment_id: enrollment.id,
      course: {
        id: course.id,
        title: course.title,
        price: course.price
      },
      ...(clientSecret && { 
        client_secret: clientSecret,
        requires_payment: true 
      }),
      ...(course.price === 0 && { 
        requires_payment: false,
        status: 'enrolled' 
      })
    }

    return NextResponse.json({ data: response }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/courses/[courseId]/enroll - Check enrollment status
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const supabase = await createClient()
    const { courseId } = params

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student record
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json({ 
        enrolled: false, 
        can_enroll: true 
      })
    }

    // Check enrollment status
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        status,
        progress,
        completed_at,
        certificate_issued,
        created_at,
        courses (
          title,
          price
        ),
        payments (
          status,
          amount,
          paid_at
        )
      `)
      .eq('student_id', student.id)
      .eq('course_id', courseId)
      .single()

    if (!enrollment) {
      return NextResponse.json({ 
        enrolled: false, 
        can_enroll: true 
      })
    }

    return NextResponse.json({
      enrolled: true,
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        progress: enrollment.progress,
        completed_at: enrollment.completed_at,
        certificate_issued: enrollment.certificate_issued,
        enrolled_at: enrollment.created_at,
        course: enrollment.courses,
        payments: enrollment.payments
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
