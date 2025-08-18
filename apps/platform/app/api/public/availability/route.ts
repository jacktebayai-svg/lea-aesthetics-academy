import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findById, handleDatabaseError } from '@/lib/supabase/helpers'
import { format, parse, addMinutes, isBefore, isAfter } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId') || searchParams.get('treatmentId') // Support both names

    if (!date || !serviceId) {
      return NextResponse.json(
        { success: false, error: 'Date and serviceId are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get service details
    const service = await findById(supabase, 'services', serviceId)

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    // Get business settings for working hours (single-tenant approach)
    const { data: businessSettings, error: settingsError } = await supabase
      .from('business_settings')
      .select('*')
      .eq('id', 'business_settings')
      .single()

    if (settingsError) {
      // Default working hours if not configured
      console.warn('Business settings not found, using default hours')
    }

    // Default working hours (can be made configurable later)
    const defaultWorkingHours = {
      monday: { available: true, start: '09:00', end: '17:00' },
      tuesday: { available: true, start: '09:00', end: '17:00' },
      wednesday: { available: true, start: '09:00', end: '17:00' },
      thursday: { available: true, start: '09:00', end: '17:00' },
      friday: { available: true, start: '09:00', end: '17:00' },
      saturday: { available: true, start: '10:00', end: '16:00' },
      sunday: { available: false, start: '10:00', end: '16:00' }
    }

    const workingHours = businessSettings?.policies?.workingHours || defaultWorkingHours

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const requestedDate = new Date(date)
    const dayOfWeek = requestedDate.getDay()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[dayOfWeek]

    // Get working hours for the day
    const dayHours = workingHours[dayName]

    if (!dayHours || !dayHours.available) {
      return NextResponse.json({
        success: true,
        slots: [],
        message: 'Business closed on this day'
      })
    }

    // Generate time slots
    const startTime = parse(dayHours.start, 'HH:mm', requestedDate)
    const endTime = parse(dayHours.end, 'HH:mm', requestedDate)
    const serviceDuration = service.duration_minutes
    const bufferMinutes = service.buffer_minutes?.before || 15 // Default 15 min buffer

    const slots: { time: string; available: boolean }[] = []
    let currentSlot = startTime

    while (isBefore(currentSlot, endTime)) {
      const slotEnd = addMinutes(currentSlot, serviceDuration)
      
      // Check if slot fits within working hours
      if (!isAfter(slotEnd, endTime)) {
        const timeString = format(currentSlot, 'HH:mm')
        
        // Check if slot is available (not booked)
        const isAvailable = await isSlotAvailable(
          supabase,
          serviceId,
          new Date(`${date}T${timeString}`),
          serviceDuration
        )

        slots.push({
          time: timeString,
          available: isAvailable
        })
      }

      // Move to next slot (service duration + buffer time)
      currentSlot = addMinutes(currentSlot, serviceDuration + bufferMinutes)
    }

    return NextResponse.json({
      success: true,
      slots,
      businessHours: dayHours,
      service: {
        name: service.name,
        duration: serviceDuration,
        bufferTime: bufferMinutes
      }
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

async function isSlotAvailable(
  supabase: any,
  serviceId: string,
  startTime: Date,
  duration: number
): Promise<boolean> {
  const endTime = addMinutes(startTime, duration)

  // Check for overlapping appointments
  const { data: conflictingAppointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('service_id', serviceId)
    .not('status', 'eq', 'cancelled')
    .not('status', 'eq', 'no_show')
    .or(`and(start_time.lte.${startTime.toISOString()},end_time.gt.${startTime.toISOString()}),and(start_time.lt.${endTime.toISOString()},end_time.gte.${endTime.toISOString()}),and(start_time.gte.${startTime.toISOString()},end_time.lte.${endTime.toISOString()})`)

  if (error) {
    console.error('Error checking slot conflicts:', error)
    return false // Assume not available if we can't check
  }

  return conflictingAppointments.length === 0
}
