import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { stripe, formatAmountForStripe, createPaymentMetadata } from '@/lib/stripe/stripe'

const prisma = new PrismaClient()

interface JWTPayload {
  userId: string
  email: string
  roles: string[]
}

const createPaymentIntentSchema = z.object({
  type: z.enum(['booking', 'course']),
  itemId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('gbp'),
  metadata: z.record(z.string()).optional(),
})

export async function POST(request: NextRequest) {
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
    
    // Parse request body
    const body = await request.json()
    const { type, itemId, amount, currency, metadata: additionalMetadata } = createPaymentIntentSchema.parse(body)

    // Verify the item exists and get details
    let itemDetails: any
    let description: string

    if (type === 'booking') {
      const treatment = await prisma.treatment.findUnique({
        where: { id: itemId },
        include: { practitioner: true }
      })
      
      if (!treatment) {
        return NextResponse.json(
          { error: 'Treatment not found' },
          { status: 404 }
        )
      }
      
      itemDetails = treatment
      description = `Booking deposit for ${treatment.name}`
    } else if (type === 'course') {
      const course = await prisma.course.findUnique({
        where: { id: itemId },
        include: { educator: true }
      })
      
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        )
      }
      
      itemDetails = course
      description = `Course enrollment for ${course.title}`
    } else {
      return NextResponse.json(
        { error: 'Invalid payment type' },
        { status: 400 }
      )
    }

    // Create payment metadata
    const paymentMetadata = createPaymentMetadata(
      type,
      itemId,
      decoded.userId,
      additionalMetadata
    )

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount, currency),
      currency: currency.toLowerCase(),
      description,
      metadata: paymentMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
      // Add customer if they exist in Stripe
      customer: undefined, // TODO: Implement customer creation/lookup
    })

    // Store payment intent in database for tracking
    await prisma.payment.create({
      data: {
        id: paymentIntent.id,
        userId: decoded.userId,
        amount: amount,
        currency: currency.toUpperCase(),
        status: 'PENDING',
        type: type.toUpperCase() as 'BOOKING' | 'COURSE',
        itemId,
        stripePaymentIntentId: paymentIntent.id,
        metadata: paymentMetadata,
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: formatAmountForStripe(amount, currency),
      currency: currency.toLowerCase(),
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

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
