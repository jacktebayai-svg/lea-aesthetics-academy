import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { stripe } from '@/lib/stripe/stripe'
import Stripe from 'stripe'
import { Resend } from 'resend'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('Stripe webhook event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status in database
    const payment = await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { 
        status: 'SUCCEEDED',
      },
      include: {
        user: true,
      }
    })

    const metadata = paymentIntent.metadata
    const type = metadata.type
    const itemId = metadata.itemId
    const userId = metadata.userId

    if (type === 'booking') {
      // Create the booking record
      const treatment = await prisma.treatment.findUnique({
        where: { id: itemId },
        include: { practitioner: true }
      })

      if (treatment) {
        const booking = await prisma.booking.create({
          data: {
            clientId: userId,
            treatmentId: itemId,
            practitionerId: treatment.practitionerId,
            status: 'CONFIRMED',
            dateTime: metadata.scheduledAt ? new Date(metadata.scheduledAt) : new Date(),
            duration: treatment.duration,
            clientName: `${payment.user.firstName} ${payment.user.lastName}`,
            clientEmail: payment.user.email,
            clientPhone: payment.user.phone || '',
            depositAmount: payment.amount,
            totalAmount: treatment.price,
            depositPaid: true,
            notes: metadata.notes || '',
          }
        })

        // Send booking confirmation email
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: 'LEA Aesthetics <bookings@leaaesthetics.com>',
            to: payment.user.email,
            subject: 'Booking Confirmed - LEA Aesthetics',
            html: `
              <h2>Your booking has been confirmed!</h2>
              <p>Dear ${payment.user.firstName},</p>
              <p>Your booking for <strong>${treatment.name}</strong> has been confirmed.</p>
              <p><strong>Booking Details:</strong></p>
              <ul>
                <li>Treatment: ${treatment.name}</li>
                <li>Duration: ${treatment.duration} minutes</li>
                <li>Deposit Paid: £${payment.amount}</li>
                <li>Booking ID: ${booking.id}</li>
              </ul>
              <p>You will receive further details about scheduling soon.</p>
              <p>Best regards,<br>LEA Aesthetics Team</p>
            `
          })
        }
      }
    } else if (type === 'course') {
      // Create the course enrollment
      const course = await prisma.course.findUnique({
        where: { id: itemId },
        include: { educator: true }
      })

      if (course) {
        const enrollment = await prisma.enrollment.create({
          data: {
            studentId: userId,
            courseId: itemId,
            status: 'ENROLLED',
            progress: 0,
            amountPaid: payment.amount,
            paymentComplete: true,
          }
        })

        // Send enrollment confirmation email
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: 'LEA Aesthetics <courses@leaaesthetics.com>',
            to: payment.user.email,
            subject: 'Course Enrollment Confirmed - LEA Aesthetics',
            html: `
              <h2>Welcome to your course!</h2>
              <p>Dear ${payment.user.firstName},</p>
              <p>Your enrollment in <strong>${course.title}</strong> has been confirmed.</p>
              <p><strong>Course Details:</strong></p>
              <ul>
                <li>Course: ${course.title}</li>
                <li>Duration: ${course.duration} hours</li>
                <li>Level: ${course.level}</li>
                <li>Payment: £${payment.amount}</li>
                <li>Enrollment ID: ${enrollment.id}</li>
              </ul>
              <p>You can access your course materials in your student dashboard.</p>
              <p>Best regards,<br>LEA Aesthetics Academy</p>
            `
          })
        }
      }
    }

    console.log(`Payment succeeded for ${type}: ${itemId}`)
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
    throw error
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status in database
    await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { 
        status: 'FAILED',
      }
    })

    console.log(`Payment failed for intent: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment failed:', error)
    throw error
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status in database
    await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { 
        status: 'CANCELLED',
      }
    })

    console.log(`Payment canceled for intent: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment canceled:', error)
    throw error
  }
}
