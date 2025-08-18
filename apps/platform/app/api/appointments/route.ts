import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { addMinutes, parseISO } from 'date-fns'

// GET /api/appointments - List appointments
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
    const clientId = searchParams.get('client_id')
    const studentId = searchParams.get('student_id')

    let query = supabase
      .from('appointments')
      .select(`
        *,
        services (
          id,
          name,
          duration_minutes,
          base_price,
          category
        ),
        clients!appointments_client_id_fkey (
          id,
          personal_info
        ),
        students!appointments_student_id_fkey (
          id,
          personal_info
        ),
        payments (
          id,
          amount,
          deposit_amount,
          status,
          paid_at
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
        query = query.eq('client_id', client.id)
      } else {
        return NextResponse.json({ data: [] }) // No appointments if no client record
      }
    } else if (profile.role === 'student') {
      // Get student record
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (student) {
        query = query.eq('student_id', student.id)
      } else {
        return NextResponse.json({ data: [] }) // No appointments if no student record
      }
    }
    // Owner can see all appointments (no additional filtering)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (dateFrom) {
      query = query.gte('start_time', dateFrom)
    }
    if (dateTo) {
      query = query.lte('start_time', dateTo)
    }
    if (clientId && profile.role === 'owner') {
      query = query.eq('client_id', clientId)
    }
    if (studentId && profile.role === 'owner') {
      query = query.eq('student_id', studentId)
    }

    // Order by start time
    query = query.order('start_time', { ascending: true })

    const { data: appointments, error } = await query

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    return NextResponse.json({ data: appointments })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Parse request body
    const body = await request.json()
    const {
      service_id,
      client_id,
      student_id,
      start_time,
      notes,
      client_info // For new client registration
    } = body

    // Validate required fields
    if (!service_id || !start_time) {
      return NextResponse.json({ 
        error: 'Missing required fields: service_id, start_time' 
      }, { status: 400 })
    }

    // Must have either client_id, student_id, or client_info
    if (!client_id && !student_id && !client_info) {
      return NextResponse.json({ 
        error: 'Must provide client_id, student_id, or client_info for new client' 
      }, { status: 400 })
    }

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', service_id)
      .eq('is_active', true)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Calculate end time
    const startDateTime = parseISO(start_time)
    const endDateTime = addMinutes(startDateTime, service.duration_minutes)

    let finalClientId = client_id
    let finalStudentId = student_id

    // Handle new client registration
    if (client_info && !client_id) {
      // Create auth user for new client
      const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
        email: client_info.email,
        password: generateTempPassword(), // Generate temporary password
        email_confirm: true,
        user_metadata: {
          role: 'client',
          firstName: client_info.firstName,
          lastName: client_info.lastName
        }
      })

      if (signUpError || !authData.user) {
        console.error('Error creating auth user:', signUpError)
        return NextResponse.json({ error: 'Failed to create client account' }, { status: 500 })
      }

      // Create user profile
      await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: client_info.email,
          role: 'client',
          profile: {
            firstName: client_info.firstName,
            lastName: client_info.lastName,
            phone: client_info.phone
          }
        })

      // Create client record
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: authData.user.id,
          personal_info: {
            firstName: client_info.firstName,
            lastName: client_info.lastName,
            email: client_info.email,
            phone: client_info.phone,
            dateOfBirth: client_info.dateOfBirth
          }
        })
        .select()
        .single()

      if (clientError) {
        console.error('Error creating client:', clientError)
        return NextResponse.json({ error: 'Failed to create client record' }, { status: 500 })
      }

      finalClientId = newClient.id
    }

    // Check availability
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('id')
      .eq('service_id', service_id)
      .gte('start_time', startDateTime.toISOString())
      .lt('end_time', endDateTime.toISOString())
      .in('status', ['confirmed', 'in_progress'])

    if (existingAppointments && existingAppointments.length > 0) {
      return NextResponse.json({ error: 'Time slot is not available' }, { status: 409 })
    }

    // Create appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        service_id,
        client_id: finalClientId,
        student_id: finalStudentId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'pending_deposit',
        notes,
        reminders_sent: 0
      })
      .select(`
        *,
        services (*),
        clients (id, personal_info),
        students (id, personal_info)
      `)
      .single()

    if (error) {
      console.error('Error creating appointment:', error)
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
    }

    // Calculate deposit amount (25% by default)
    const depositPercentage = 0.25
    const depositAmount = Math.round(service.base_price * depositPercentage)

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        appointment_id: appointment.id,
        amount: service.base_price,
        deposit_amount: depositAmount,
        currency: 'GBP',
        status: 'pending'
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
      // Don't fail the appointment creation, just log the error
    }

    return NextResponse.json({ 
      data: {
        appointment,
        payment,
        deposit_amount: depositAmount,
        total_amount: service.base_price
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateTempPassword(): string {
  // Generate a secure temporary password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
