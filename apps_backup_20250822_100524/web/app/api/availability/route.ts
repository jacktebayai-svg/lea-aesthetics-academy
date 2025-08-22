import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { addMinutes, format, isAfter, isBefore, parseISO, startOfDay } from 'date-fns'

interface TimeSlot {
  start: string
  end: string
  available: boolean
  service?: any
}

interface BusinessHours {
  [key: string]: {
    open?: string
    close?: string
    closed?: boolean
  }
}

// GET /api/availability - Get available time slots
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const serviceId = searchParams.get('service_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    if (!serviceId || !dateFrom) {
      return NextResponse.json({ 
        error: 'Missing required parameters: service_id, date_from' 
      }, { status: 400 })
    }

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .eq('is_active', true)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Get business settings for hours and timezone
    const { data: businessSettings } = await supabase
      .from('business_settings')
      .select('*')
      .eq('id', 'business_settings')
      .single()

    const defaultBusinessHours: BusinessHours = {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '10:00', close: '16:00' },
      sunday: { closed: true, open: '', close: '' }
    }

    // Use business hours from settings or default
    const businessHours = businessSettings?.policies?.business_hours || defaultBusinessHours

    // Calculate date range
    const startDate = parseISO(dateFrom)
    const endDate = dateTo ? parseISO(dateTo) : addMinutes(startDate, 24 * 60) // Default to same day + 24hrs

    // Generate slots for each day
    const allSlots: TimeSlot[] = []
    let currentDate = startOfDay(startDate)

    while (isBefore(currentDate, endDate)) {
      const daySlots = await generateSlotsForDate(
        supabase, 
        currentDate, 
        service, 
        businessHours
      )
      allSlots.push(...daySlots)
      
      // Move to next day
      currentDate = addMinutes(currentDate, 24 * 60)
    }

    return NextResponse.json({ 
      data: {
        service,
        slots: allSlots,
        date_from: dateFrom,
        date_to: dateTo || dateFrom
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateSlotsForDate(
  supabase: any,
  date: Date,
  service: any,
  businessHours: BusinessHours
): Promise<TimeSlot[]> {
  const slots: TimeSlot[] = []
  
  // Get day name
  const dayName = format(date, 'EEEE').toLowerCase() as keyof BusinessHours
  const dayHours = businessHours[dayName]
  
  // Skip if business is closed
  if (!dayHours || dayHours.closed || !dayHours.open || !dayHours.close) {
    return slots
  }

  // Parse business hours for this day
  const [openHour, openMinute] = dayHours.open.split(':').map(Number)
  const [closeHour, closeMinute] = dayHours.close.split(':').map(Number)
  
  let currentTime = new Date(date)
  currentTime.setHours(openHour, openMinute, 0, 0)
  
  const closeTime = new Date(date)
  closeTime.setHours(closeHour, closeMinute, 0, 0)

  // Get existing appointments for this date
  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('service_id', service.id)
    .gte('start_time', format(date, 'yyyy-MM-dd'))
    .lt('start_time', format(addMinutes(date, 24 * 60), 'yyyy-MM-dd'))
    .in('status', ['confirmed', 'in_progress'])

  // Calculate service duration including buffers
  const serviceDuration = service.duration_minutes
  const bufferBefore = service.buffer_minutes?.before || 0
  const bufferAfter = service.buffer_minutes?.after || 0
  const totalDuration = bufferBefore + serviceDuration + bufferAfter
  
  // Generate 15-minute intervals
  const slotInterval = 15

  while (isBefore(currentTime, closeTime)) {
    const slotEnd = addMinutes(currentTime, totalDuration)
    
    // Check if slot fits within business hours
    if (isAfter(slotEnd, closeTime)) {
      break
    }
    
    // Skip if slot is in the past
    if (isBefore(currentTime, new Date())) {
      currentTime = addMinutes(currentTime, slotInterval)
      continue
    }

    // Check for conflicts with existing appointments
    const hasConflict = existingAppointments?.some((appointment: any) => {
      const appointmentStart = parseISO(appointment.start_time)
      const appointmentEnd = parseISO(appointment.end_time)
      
      // Check if slots overlap
      return (
        isBefore(currentTime, appointmentEnd) && 
        isAfter(slotEnd, appointmentStart)
      )
    })

    slots.push({
      start: currentTime.toISOString(),
      end: slotEnd.toISOString(),
      available: !hasConflict,
      service: {
        id: service.id,
        name: service.name,
        duration: serviceDuration,
        price: service.base_price
      }
    })
    
    // Move to next slot
    currentTime = addMinutes(currentTime, slotInterval)
  }

  return slots
}
