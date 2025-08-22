import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Schema for payment intent creation
const paymentIntentSchema = z.object({
  appointment_id: z.string().uuid().optional(),
  course_enrollment_id: z.string().uuid().optional(),
  amount: z.number().int().min(1, 'Amount must be at least 1 pence'),
  currency: z.string().default('GBP'),
  payment_method_types: z.array(z.string()).default(['card']),
  metadata: z.record(z.string()).optional()
}).refine(data => data.appointment_id || data.course_enrollment_id, {
  message: "Either appointment_id or course_enrollment_id must be provided"
})

// GET /api/payments - List payments with role-based filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Parse query parameters
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const type = searchParams.get('type') // 'appointment' or 'course'
    
    let query = supabase
      .from('payments')
      .select(`
        *,
        appointments (
          id,
          start_time,
          status,
          services (
            id,
            name,
            base_price
          ),
          clients (
            id,
            personal_info
          )
        ),
        course_enrollments (
          id,
          status,
          progress,
          courses (
            id,
            title,
            price
          ),
          students (
            id,
            personal_info
          )
        )
      `)

    // Apply role-based filtering
    if (profile.role === 'client') {
      // Get client record
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (client) {
        // Only show payments for appointments by this client
        query = query.not('appointment_id', 'is', null)
          .in('appointment_id', [
            // Subquery would be ideal, but using join instead
          ])
        
        // We need to filter after the query since we can't do complex subqueries
        const { data: clientAppointments } = await supabase
          .from('appointments')
          .select('id')
          .eq('client_id', client.id)
        
        const appointmentIds = clientAppointments?.map(a => a.id) || []
        query = query.in('appointment_id', appointmentIds)
      } else {
        return NextResponse.json({ data: [] }) // No payments if no client record
      }
    } else if (profile.role === 'student') {
      // Get student record
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (student) {
        // Only show payments for course enrollments by this student
        const { data: studentEnrollments } = await supabase
          .from('course_enrollments')
          .select('id')
          .eq('student_id', student.id)
        
        const enrollmentIds = studentEnrollments?.map(e => e.id) || []
        query = query.in('course_enrollment_id', enrollmentIds)
      } else {
        return NextResponse.json({ data: [] }) // No payments if no student record
      }
    }
    // Owner can see all payments (no additional filtering)

    // Apply additional filters
    if (status) {
      query = query.eq('status', status)
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }
    if (type === 'appointment') {
      query = query.not('appointment_id', 'is', null)
    } else if (type === 'course') {
      query = query.not('course_enrollment_id', 'is', null)
    }

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false })

    const { data: payments, error } = await query

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    return NextResponse.json({ data: payments })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/payments - Create payment intent
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = paymentIntentSchema.parse(body)

    const { 
      appointment_id, 
      course_enrollment_id, 
      amount, 
      currency, 
      payment_method_types, 
      metadata = {} 
    } = validatedData

    // Verify the appointment or enrollment belongs to the user (for clients/students)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Authorization checks
    if (appointment_id) {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          id,
          client_id,
          student_id,
          services (base_price),
          clients!appointments_client_id_fkey (user_id),
          students!appointments_student_id_fkey (user_id)
        `)
        .eq('id', appointment_id)
        .single()

      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
      }

      // Check authorization
      if (profile.role === 'client' && (appointment as any).clients?.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      } else if (profile.role === 'student' && (appointment as any).students?.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    if (course_enrollment_id) {
      const { data: enrollment } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          student_id,
          courses (title, price),
          students (user_id)
        `)
        .eq('id', course_enrollment_id)
        .single()

      if (!enrollment) {
        return NextResponse.json({ error: 'Course enrollment not found' }, { status: 404 })
      }

      // Check authorization
      if (profile.role === 'student' && (enrollment as any).students?.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      payment_method_types,
      metadata: {
        user_id: user.id,
        appointment_id: appointment_id || '',
        course_enrollment_id: course_enrollment_id || '',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      }
    })

    // Create payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        appointment_id: appointment_id || null,
        course_enrollment_id: course_enrollment_id || null,
        stripe_payment_intent_id: paymentIntent.id,
        amount,
        currency: currency.toUpperCase(),
        status: 'pending',
        metadata: {
          stripe_client_secret: paymentIntent.client_secret,
          ...metadata
        }
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })
    }

    // Log payment creation
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'payment_created',
        resource: 'payment',
        resource_id: payment.id,
        new_values: { 
          amount, 
          currency, 
          type: appointment_id ? 'appointment' : 'course',
          stripe_payment_intent_id: paymentIntent.id 
        }
      })

    return NextResponse.json({
      data: {
        payment,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({
        error: 'Payment processing error',
        details: error.message
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
