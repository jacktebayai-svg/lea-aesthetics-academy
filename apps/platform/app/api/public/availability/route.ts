import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { format, parse, addMinutes, isBefore, isAfter } from 'date-fns'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const treatmentId = searchParams.get('treatmentId')

    if (!date || !treatmentId) {
      return NextResponse.json(
        { success: false, error: 'Date and treatmentId are required' },
        { status: 400 }
      )
    }

    // Get treatment details
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: {
        practitioner: {
          select: {
            workingHours: true,
            bufferTime: true,
          },
        },
      },
    })

    if (!treatment) {
      return NextResponse.json(
        { success: false, error: 'Treatment not found' },
        { status: 404 }
      )
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const requestedDate = new Date(date)
    const dayOfWeek = requestedDate.getDay()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[dayOfWeek]

    // Get working hours for the day
    const workingHours = treatment.practitioner.workingHours as any
    const dayHours = workingHours[dayName]

    if (!dayHours || !dayHours.available) {
      return NextResponse.json({
        success: true,
        slots: [],
        message: 'Practitioner not available on this day'
      })
    }

    // Generate time slots
    const startTime = parse(dayHours.start, 'HH:mm', requestedDate)
    const endTime = parse(dayHours.end, 'HH:mm', requestedDate)
    const treatmentDuration = treatment.duration
    const bufferTime = treatment.practitioner.bufferTime

    const slots: { time: string; available: boolean }[] = []
    let currentSlot = startTime

    while (isBefore(currentSlot, endTime)) {
      const slotEnd = addMinutes(currentSlot, treatmentDuration)
      
      // Check if slot fits within working hours
      if (!isAfter(slotEnd, endTime)) {
        const timeString = format(currentSlot, 'HH:mm')
        
        // Check if slot is available (not booked)
        const isAvailable = await isSlotAvailable(
          treatmentId,
          new Date(`${date}T${timeString}`),
          treatmentDuration
        )

        slots.push({
          time: timeString,
          available: isAvailable
        })
      }

      // Move to next slot (treatment duration + buffer time)
      currentSlot = addMinutes(currentSlot, treatmentDuration + bufferTime)
    }

    return NextResponse.json({
      success: true,
      slots,
      practitionerHours: dayHours
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

async function isSlotAvailable(
  treatmentId: string,
  startTime: Date,
  duration: number
): Promise<boolean> {
  const endTime = addMinutes(startTime, duration)

  // Check for overlapping bookings
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      treatmentId,
      status: {
        not: 'CANCELLED'
      },
      OR: [
        // Booking starts during this slot
        {
          dateTime: {
            gte: startTime,
            lt: endTime
          }
        },
        // Booking ends during this slot
        {
          AND: [
            { dateTime: { lt: startTime } },
            // We need to calculate end time - this is simplified
            // In a real app, you'd store booking end time or calculate it properly
          ]
        }
      ]
    }
  })

  return conflictingBookings.length === 0
}
