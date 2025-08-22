import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/stripe'
import Stripe from 'stripe'
import { Resend } from 'resend'
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
    const supabase = await createClient()
    
    // Update payment status in database
    const { data: payment } = await supabase
      .from('payments')
      .update({ status: 'succeeded' })
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .select('*')
      .single()

    if (!payment) {
      console.error('Payment not found for intent:', paymentIntent.id)
      return
    }

    const metadata = paymentIntent.metadata
    const type = metadata.type
    const itemId = metadata.itemId
    const userId = metadata.userId

    // Get user info for email
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (type === 'booking' && payment.appointment_id) {
      // Update appointment status
      await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', payment.appointment_id)

      // Get appointment details for email
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name, duration, base_price)
        `)
        .eq('id', payment.appointment_id)
        .single()

      // Send booking confirmation email
      if (process.env.RESEND_API_KEY && appointment && userProfile) {
        await resend.emails.send({
          from: 'LEA Aesthetics <bookings@leaaesthetics.com>',
          to: userProfile.email,
          subject: 'Booking Confirmed - LEA Aesthetics',
          html: `
            <h2>Your booking has been confirmed!</h2>
            <p>Dear ${userProfile.profile?.firstName || 'Client'},</p>
            <p>Your booking for <strong>${appointment.services.name}</strong> has been confirmed.</p>
            <p><strong>Booking Details:</strong></p>
            <ul>
              <li>Treatment: ${appointment.services.name}</li>
              <li>Duration: ${appointment.services.duration} minutes</li>
              <li>Deposit Paid: £${(payment.amount / 100).toFixed(2)}</li>
              <li>Booking ID: ${appointment.id}</li>
            </ul>
            <p>You will receive further details about scheduling soon.</p>
            <p>Best regards,<br>LEA Aesthetics Team</p>
          `
        })
      }
    } else if (type === 'course' && payment.course_enrollment_id) {
      // Update enrollment status
      await supabase
        .from('course_enrollments')
        .update({ 
          status: 'enrolled',
          enrolled_at: new Date().toISOString()
        })
        .eq('id', payment.course_enrollment_id)

      // Get course details for email
      const { data: enrollment } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (title, duration_hours, price)
        `)
        .eq('id', payment.course_enrollment_id)
        .single()

      // Send enrollment confirmation email
      if (process.env.RESEND_API_KEY && enrollment && userProfile) {
        await resend.emails.send({
          from: 'LEA Aesthetics <courses@leaaesthetics.com>',
          to: userProfile.email,
          subject: 'Course Enrollment Confirmed - LEA Aesthetics',
          html: `
            <h2>Welcome to your course!</h2>
            <p>Dear ${userProfile.profile?.firstName || 'Student'},</p>
            <p>Your enrollment in <strong>${enrollment.courses.title}</strong> has been confirmed.</p>
            <p><strong>Course Details:</strong></p>
            <ul>
              <li>Course: ${enrollment.courses.title}</li>
              <li>Duration: ${enrollment.courses.duration_hours} hours</li>
              <li>Payment: £${(payment.amount / 100).toFixed(2)}</li>
              <li>Enrollment ID: ${enrollment.id}</li>
            </ul>
            <p>You can access your course materials in your student dashboard.</p>
            <p>Best regards,<br>LEA Aesthetics Academy</p>
          `
        })
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
    const supabase = await createClient()
    
    // Update payment status in database
    await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    console.log(`Payment failed for intent: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment failed:', error)
    throw error
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const supabase = await createClient()
    
    // Update payment status in database
    await supabase
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    console.log(`Payment canceled for intent: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment canceled:', error)
    throw error
  }
}
