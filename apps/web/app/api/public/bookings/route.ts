import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findById, create, getCurrentUser, getClientByUserId, handleDatabaseError, formatPrice } from '@/lib/supabase/helpers'
import { z } from 'zod'
import { addDays, parseISO, addMinutes } from 'date-fns'

const createBookingSchema = z.object({
  serviceId: z.string(),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
  clientInfo: z.object({
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
    const { serviceId, scheduledAt, notes, clientInfo } = createBookingSchema.parse(body)

    // Get service details
    const service = await findById(supabase, 'services', serviceId)

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    if (!service.is_active) {
      return NextResponse.json(
        { error: 'Service is not available for booking' },
        { status: 400 }
      )
    }

    // Parse scheduled date and calculate end time
    const scheduledDate = parseISO(scheduledAt)
    const endDate = addMinutes(scheduledDate, service.duration_minutes)
    
    // Validate scheduling constraints
    const now = new Date()
    const minBookingTime = addDays(now, 1) // Minimum 1 day in advance
    
    if (scheduledDate < minBookingTime) {
      return NextResponse.json(
        { error: 'Bookings must be made at least 24 hours in advance' },
        { status: 400 }
      )
    }

    // Check for conflicts
    const { data: conflictingAppointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('service_id', serviceId)
      .not('status', 'eq', 'cancelled')
      .not('status', 'eq', 'no_show')
      .or(`and(start_time.lte.${scheduledDate.toISOString()},end_time.gt.${scheduledDate.toISOString()}),and(start_time.lt.${endDate.toISOString()},end_time.gte.${endDate.toISOString()}),and(start_time.gte.${scheduledDate.toISOString()},end_time.lte.${endDate.toISOString()})`)

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is not available' },
        { status: 400 }
      )
    }

    // Determine client ID
    let clientId: string | null = null
    
    // Try to get authenticated user
    let user = null
    try {
      user = await getCurrentUser(supabase)
      if (user) {
        const client = await getClientByUserId(supabase, user.id)
        clientId = client?.id || null
        
        // If user exists but no client profile, create one
        if (!client) {
          const newClient = await create(supabase, 'clients', {
            user_id: user.id,
            personal_info: {},
            preferences: {},
            tags: [],
            total_spent: 0
          })
          clientId = newClient.id
        }
      }
    } catch (authError) {
      console.error('Authentication error:', authError)
    }

    // If no authenticated user, require authentication
    if (!user || !clientId) {
      return NextResponse.json(
        { 
          error: 'Please sign in to book an appointment',
          code: 'AUTH_REQUIRED',
          message: 'Authentication is required to complete your booking and access your appointment history.'
        },
        { status: 401 }
      )
    }

    // Calculate deposit amount (25% as per Master Aesthetics Suite spec)
    const depositAmount = Math.floor(service.base_price * 0.25)

    // Create appointment record
    const appointment = await create(supabase, 'appointments', {
      client_id: clientId,
      service_id: serviceId,
      start_time: scheduledDate.toISOString(),
      end_time: endDate.toISOString(),
      status: 'pending_deposit',
      notes: notes || '',
      reminders_sent: 0
    })

    // Create payment record
    const payment = await create(supabase, 'payments', {
      appointment_id: appointment.id,
      amount: service.base_price,
      deposit_amount: depositAmount,
      currency: 'GBP',
      status: 'pending'
    })

    // Return booking details for payment processing
    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        serviceName: service.name,
        scheduledAt: appointment.start_time,
        duration: service.duration_minutes,
        totalAmount: service.base_price,
        depositAmount: depositAmount,
        status: appointment.status,
        formattedTotal: formatPrice(service.base_price),
        formattedDeposit: formatPrice(depositAmount)
      },
      payment: {
        id: payment.id,
        amount: depositAmount, // Initial payment is deposit
        currency: payment.currency
      },
      paymentRequired: true,
      nextStep: 'payment',
    })
  } catch (error) {
    console.error('Create booking error:', error)
    
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

    // Get client record
    const client = await getClientByUserId(supabase, user.id)
    if (!client) {
      return NextResponse.json(
        { error: 'Client profile not found' },
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
      .from('appointments')
      .select(`
        *,
        service:services(*),
        payments(*)
      `)
      .eq('client_id', client.id)
      .order('start_time', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (limit > 0) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data: appointments, error } = await query

    if (error) {
      handleDatabaseError(error)
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id)

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    const { count: total } = await countQuery

    return NextResponse.json({
      success: true,
      appointments: appointments?.map(appointment => ({
        id: appointment.id,
        service: {
          id: appointment.service.id,
          name: appointment.service.name,
          category: appointment.service.category,
          duration: appointment.service.duration_minutes,
        },
        scheduledAt: appointment.start_time,
        endTime: appointment.end_time,
        status: appointment.status,
        notes: appointment.notes,
        totalAmount: appointment.service.base_price,
        depositAmount: Math.floor(appointment.service.base_price * 0.25),
        formattedTotal: formatPrice(appointment.service.base_price),
        formattedDeposit: formatPrice(Math.floor(appointment.service.base_price * 0.25)),
        paymentStatus: appointment.payments?.[0]?.status || 'pending',
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at,
      })) || [],
      pagination: {
        total: total || 0,
        limit,
        offset,
        hasMore: offset + limit < (total || 0),
      },
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    
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
