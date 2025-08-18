import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { format, addDays, parseISO } from 'date-fns'

const prisma = new PrismaClient()

interface JWTPayload {
  userId: string
  email: string
  roles: string[]
}

const createBookingSchema = z.object({
  treatmentId: z.string(),
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
    // Parse request body
    const body = await request.json()
    const { treatmentId, scheduledAt, notes, clientInfo } = createBookingSchema.parse(body)

    // Get treatment details
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: { 
        practitioner: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!treatment) {
      return NextResponse.json(
        { error: 'Treatment not found' },
        { status: 404 }
      )
    }

    if (!treatment.isActive) {
      return NextResponse.json(
        { error: 'Treatment is not available for booking' },
        { status: 400 }
      )
    }

    // Check if user is authenticated (optional for public bookings)
    let userId: string | null = null
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
        userId = decoded.userId
      } catch (error) {
        // Token is invalid but we can still proceed with guest booking
        console.warn('Invalid token for booking:', error)
      }
    }

    // Parse scheduled date
    const scheduledDate = parseISO(scheduledAt)
    
    // Validate scheduling constraints
    const now = new Date()
    const minBookingTime = addDays(now, 1) // Minimum 1 day in advance
    
    if (scheduledDate < minBookingTime) {
      return NextResponse.json(
        { error: 'Bookings must be made at least 24 hours in advance' },
        { status: 400 }
      )
    }

    // Check for conflicts (simplified - in production, you'd want more sophisticated scheduling)
    const existingBooking = await prisma.booking.findFirst({
      where: {
        treatmentId,
        dateTime: {
          gte: new Date(scheduledDate.getTime() - treatment.duration * 60000), // Start of conflict window
          lt: new Date(scheduledDate.getTime() + treatment.duration * 60000),  // End of conflict window
        },
        status: {
          in: ['CONFIRMED']
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is not available' },
        { status: 400 }
      )
    }

    // Create or find client user
    let clientId = userId
    
    if (!userId && clientInfo?.email) {
      // Try to find existing user by email
      let existingUser = await prisma.user.findUnique({
        where: { email: clientInfo.email }
      })

      if (!existingUser && clientInfo.firstName && clientInfo.lastName) {
        // Create new client user
        existingUser = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              firstName: clientInfo.firstName!,
              lastName: clientInfo.lastName!,
              email: clientInfo.email!,
              password: '', // Will need to set password later
              phone: clientInfo.phone,
              roles: ['CLIENT'], // Set CLIENT role
            }
          })

          return newUser
        })
      }

      clientId = existingUser?.id || null
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client information required for booking' },
        { status: 400 }
      )
    }

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        clientId,
        treatmentId,
        practitionerId: treatment.practitionerId,
        dateTime: scheduledDate,
        duration: treatment.duration,
        status: 'PENDING_DEPOSIT',
        clientName: clientInfo?.firstName && clientInfo?.lastName ? `${clientInfo.firstName} ${clientInfo.lastName}` : 'Guest',
        clientEmail: clientInfo?.email || '',
        clientPhone: clientInfo?.phone || '',
        depositAmount: treatment.depositAmount || Math.floor(treatment.price * 0.3), // 30% deposit
        totalAmount: treatment.price,
        notes: notes || '',
      },
      include: {
        client: true,
        treatment: {
          include: {
            practitioner: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    // Return booking details for payment processing
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        treatmentName: treatment.name,
        practitionerName: `${treatment.practitioner.user.firstName} ${treatment.practitioner.user.lastName}`,
        scheduledAt: booking.dateTime,
        duration: treatment.duration,
        totalAmount: booking.totalAmount,
        depositAmount: booking.depositAmount,
        status: booking.status,
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
      clientId: decoded.userId,
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    // Fetch user's bookings
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        treatment: {
          include: {
            practitioner: {
              include: {
                user: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: {
        dateTime: 'desc',
      },
      take: limit,
      skip: offset,
    })

    const total = await prisma.booking.count({ where })

    return NextResponse.json({
      bookings: bookings.map(booking => ({
        id: booking.id,
        treatment: {
          id: booking.treatment.id,
          name: booking.treatment.name,
        category: booking.treatment.category,
          duration: booking.treatment.duration,
        },
        practitioner: {
          id: booking.treatment.practitioner.id,
          name: `${booking.treatment.practitioner.user.firstName} ${booking.treatment.practitioner.user.lastName}`,
          title: booking.treatment.practitioner.title,
        },
        scheduledAt: booking.dateTime,
        status: booking.status,
        totalAmount: booking.totalAmount,
        depositAmount: booking.depositAmount,
        notes: booking.notes,
        paymentStatus: booking.payments?.[0]?.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    
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
