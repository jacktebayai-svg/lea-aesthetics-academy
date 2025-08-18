import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

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
    
    // Get payment intent ID from query params
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent')

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      )
    }

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        user: true,
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Verify payment belongs to authenticated user
    if (payment.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get item details based on payment type
    let itemName = 'Unknown Item'
    
    if (payment.type === 'BOOKING') {
      const treatment = await prisma.treatment.findUnique({
        where: { id: payment.itemId }
      })
      itemName = treatment?.name || 'Treatment'
    } else if (payment.type === 'COURSE') {
      const course = await prisma.course.findUnique({
        where: { id: payment.itemId }
      })
      itemName = course?.title || 'Course'
    }

    // Return payment details
    return NextResponse.json({
      type: payment.type.toLowerCase(),
      itemName,
      amount: payment.amount,
      paymentId: payment.id,
      status: payment.status,
      itemId: payment.itemId,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    
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
