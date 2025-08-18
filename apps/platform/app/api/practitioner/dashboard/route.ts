import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subDays } from 'date-fns'

const prisma = new PrismaClient()

interface JWTPayload {
  userId: string
  email: string
  roles: string[]
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
    
    // Verify user has practitioner role
    if (!decoded.roles.includes('PRACTITIONER')) {
      return NextResponse.json(
        { error: 'Practitioner access required' },
        { status: 403 }
      )
    }

    // Get practitioner profile
    const practitioner = await prisma.practitionerProfile.findUnique({
      where: { userId: decoded.userId },
      include: {
        user: true,
        treatments: {
          where: { isActive: true },
          include: { category: true }
        },
        specialties: true,
      }
    })

    if (!practitioner) {
      return NextResponse.json(
        { error: 'Practitioner profile not found' },
        { status: 404 }
      )
    }

    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday start
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Get upcoming bookings (next 7 days)
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        practitionerId: decoded.userId,
        scheduledAt: {
          gte: now,
          lte: subDays(now, -7),
        },
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS']
        }
      },
      include: {
        client: true,
        treatment: true,
        payment: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: 10,
    })

    // Get recent bookings for activity feed
    const recentBookings = await prisma.booking.findMany({
      where: {
        practitionerId: decoded.userId,
      },
      include: {
        client: true,
        treatment: true,
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    // Calculate statistics
    const [
      totalBookings,
      weeklyBookings,
      monthlyBookings,
      totalRevenue,
      weeklyRevenue,
      monthlyRevenue,
      pendingBookings,
    ] = await Promise.all([
      // Total bookings
      prisma.booking.count({
        where: {
          practitionerId: decoded.userId,
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      }),
      
      // Weekly bookings
      prisma.booking.count({
        where: {
          practitionerId: decoded.userId,
          scheduledAt: { gte: weekStart, lte: weekEnd },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      }),
      
      // Monthly bookings
      prisma.booking.count({
        where: {
          practitionerId: decoded.userId,
          scheduledAt: { gte: monthStart, lte: monthEnd },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      }),
      
      // Total revenue
      prisma.payment.aggregate({
        where: {
          booking: {
            practitionerId: decoded.userId,
          },
          status: 'COMPLETED',
        },
        _sum: { amount: true }
      }),
      
      // Weekly revenue
      prisma.payment.aggregate({
        where: {
          booking: {
            practitionerId: decoded.userId,
            scheduledAt: { gte: weekStart, lte: weekEnd },
          },
          status: 'COMPLETED',
        },
        _sum: { amount: true }
      }),
      
      // Monthly revenue
      prisma.payment.aggregate({
        where: {
          booking: {
            practitionerId: decoded.userId,
            scheduledAt: { gte: monthStart, lte: monthEnd },
          },
          status: 'COMPLETED',
        },
        _sum: { amount: true }
      }),
      
      // Pending bookings
      prisma.booking.count({
        where: {
          practitionerId: decoded.userId,
          status: 'PENDING_PAYMENT',
        }
      }),
    ])

    // Get weekly booking trends (last 4 weeks)
    const weeklyTrends = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(now, i * 7), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(subDays(now, i * 7), { weekStartsOn: 1 })
      
      const count = await prisma.booking.count({
        where: {
          practitionerId: decoded.userId,
          scheduledAt: { gte: weekStart, lte: weekEnd },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      })
      
      weeklyTrends.push({
        week: format(weekStart, 'MMM dd'),
        bookings: count,
      })
    }

    // Get treatment popularity
    const treatmentStats = await prisma.booking.groupBy({
      by: ['treatmentId'],
      where: {
        practitionerId: decoded.userId,
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      _count: {
        treatmentId: true,
      },
      orderBy: {
        _count: {
          treatmentId: 'desc',
        }
      },
      take: 5,
    })

    const popularTreatments = await Promise.all(
      treatmentStats.map(async (stat) => {
        const treatment = await prisma.treatment.findUnique({
          where: { id: stat.treatmentId },
        })
        return {
          name: treatment?.name || 'Unknown',
          bookings: stat._count.treatmentId,
        }
      })
    )

    return NextResponse.json({
      profile: {
        id: practitioner.id,
        name: `${practitioner.user.firstName} ${practitioner.user.lastName}`,
        title: practitioner.title,
        bio: practitioner.bio,
        isActive: practitioner.isActive,
        specialties: practitioner.specialties.map(s => s.name),
        joinedAt: practitioner.createdAt,
      },
      
      statistics: {
        total: {
          bookings: totalBookings,
          revenue: totalRevenue._sum.amount || 0,
        },
        weekly: {
          bookings: weeklyBookings,
          revenue: weeklyRevenue._sum.amount || 0,
        },
        monthly: {
          bookings: monthlyBookings,
          revenue: monthlyRevenue._sum.amount || 0,
        },
        pending: {
          bookings: pendingBookings,
        }
      },
      
      upcomingBookings: upcomingBookings.map(booking => ({
        id: booking.id,
        client: {
          name: `${booking.client.firstName} ${booking.client.lastName}`,
          email: booking.client.email,
          phone: booking.client.phone,
        },
        treatment: {
          name: booking.treatment.name,
          duration: booking.treatment.duration,
        },
        scheduledAt: booking.scheduledAt,
        status: booking.status,
        totalAmount: booking.totalAmount,
        notes: booking.notes,
      })),
      
      recentActivity: recentBookings.map(booking => ({
        id: booking.id,
        type: 'booking',
        client: `${booking.client.firstName} ${booking.client.lastName}`,
        treatment: booking.treatment.name,
        status: booking.status,
        amount: booking.totalAmount,
        createdAt: booking.createdAt,
      })),
      
      trends: {
        weekly: weeklyTrends,
        popularTreatments,
      },
      
      treatments: practitioner.treatments.map(treatment => ({
        id: treatment.id,
        name: treatment.name,
        category: treatment.category?.name,
        price: treatment.price,
        duration: treatment.duration,
        isActive: treatment.isActive,
      })),
    })
  } catch (error) {
    console.error('Practitioner dashboard error:', error)
    
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
