import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    const supabase = await createClient()

    console.log(`Processing Stripe webhook: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(supabase, event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(supabase, event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentCanceled(supabase, event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.dispute.created':
        await handleChargeDispute(supabase, event.data.object as Stripe.Dispute)
        break

      case 'invoice.payment_succeeded':
        // Handle subscription payments if added later
        console.log('Invoice payment succeeded:', event.data.object.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handlePaymentSucceeded(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id)

    // First get the existing payment record
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    // Update payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        paid_at: new Date().toISOString(),
        metadata: {
          ...existingPayment?.metadata,
          stripe_payment_method_id: paymentIntent.payment_method,
          stripe_charge_id: paymentIntent.latest_charge
        }
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .select()
      .single()

    if (paymentError) {
      console.error('Error updating payment status:', paymentError)
      return
    }

    if (!payment) {
      console.error('Payment record not found for payment intent:', paymentIntent.id)
      return
    }

    // Handle appointment payment
    if (payment.appointment_id) {
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({
          status: payment.deposit_amount > 0 && payment.deposit_amount < payment.amount 
            ? 'confirmed'  // Deposit paid
            : 'confirmed'  // Full payment
        })
        .eq('id', payment.appointment_id)

      if (appointmentError) {
        console.error('Error updating appointment status:', appointmentError)
      } else {
        console.log('Updated appointment status to confirmed for appointment:', payment.appointment_id)
      }

      // Update client's total spent
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          client_id,
          clients (id, total_spent)
        `)
        .eq('id', payment.appointment_id)
        .single()

      if (appointment?.clients) {
        await supabase
          .from('clients')
          .update({
            total_spent: (appointment.clients.total_spent || 0) + payment.amount,
            last_visit: new Date().toISOString()
          })
          .eq('id', appointment.client_id)
      }
    }

    // Handle course enrollment payment
    if (payment.course_enrollment_id) {
      const { error: enrollmentError } = await supabase
        .from('course_enrollments')
        .update({
          status: 'enrolled' // Confirm enrollment after payment
        })
        .eq('id', payment.course_enrollment_id)

      if (enrollmentError) {
        console.error('Error updating enrollment status:', enrollmentError)
      } else {
        console.log('Updated enrollment status to enrolled for enrollment:', payment.course_enrollment_id)
      }
    }

    // Log successful payment
    await supabase
      .from('audit_logs')
      .insert({
        user_id: paymentIntent.metadata.user_id || null,
        action: 'payment_succeeded',
        resource: 'payment',
        resource_id: payment.id,
        new_values: {
          amount: payment.amount,
          currency: payment.currency,
          stripe_payment_intent_id: paymentIntent.id,
          type: payment.appointment_id ? 'appointment' : 'course'
        }
      })

    console.log('Successfully processed payment succeeded webhook')
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id)

    // First get the existing payment record
    const { data: existingFailedPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        metadata: {
          ...existingFailedPayment?.metadata,
          failure_reason: paymentIntent.last_payment_error?.message,
          failure_code: paymentIntent.last_payment_error?.code
        }
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .select()
      .single()

    if (paymentError) {
      console.error('Error updating payment status:', paymentError)
      return
    }

    // Handle appointment payment failure
    if (payment.appointment_id) {
      // Keep appointment as pending_deposit or cancel if max retries reached
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({
          status: 'pending_deposit' // Allow retry
        })
        .eq('id', payment.appointment_id)

      if (appointmentError) {
        console.error('Error updating appointment status:', appointmentError)
      }
    }

    // Handle course enrollment payment failure
    if (payment.course_enrollment_id) {
      // Set enrollment back to pending payment
      const { error: enrollmentError } = await supabase
        .from('course_enrollments')
        .update({
          status: 'enrolled' // Keep as enrolled but note payment failure
        })
        .eq('id', payment.course_enrollment_id)

      if (enrollmentError) {
        console.error('Error updating enrollment status:', enrollmentError)
      }
    }

    // Log payment failure
    await supabase
      .from('audit_logs')
      .insert({
        user_id: paymentIntent.metadata.user_id || null,
        action: 'payment_failed',
        resource: 'payment',
        resource_id: payment.id,
        new_values: {
          amount: payment.amount,
          failure_reason: paymentIntent.last_payment_error?.message,
          stripe_payment_intent_id: paymentIntent.id
        }
      })

    console.log('Successfully processed payment failed webhook')
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handlePaymentCanceled(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment canceled:', paymentIntent.id)

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'failed'
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .select()
      .single()

    if (paymentError) {
      console.error('Error updating payment status:', paymentError)
      return
    }

    // Handle appointment cancellation
    if (payment.appointment_id) {
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled'
        })
        .eq('id', payment.appointment_id)

      if (appointmentError) {
        console.error('Error updating appointment status:', appointmentError)
      }
    }

    // Handle course enrollment cancellation
    if (payment.course_enrollment_id) {
      const { error: enrollmentError } = await supabase
        .from('course_enrollments')
        .update({
          status: 'cancelled'
        })
        .eq('id', payment.course_enrollment_id)

      if (enrollmentError) {
        console.error('Error updating enrollment status:', enrollmentError)
      }
    }

    console.log('Successfully processed payment canceled webhook')
  } catch (error) {
    console.error('Error handling payment canceled:', error)
  }
}

async function handleChargeDispute(supabase: any, dispute: Stripe.Dispute) {
  try {
    console.log('Charge dispute created:', dispute.id)

    // Find the payment record by charge ID
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .contains('metadata', { stripe_charge_id: dispute.charge })

    if (payments && payments.length > 0) {
      const payment = payments[0]

      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'disputed',
          metadata: {
            ...payment.metadata,
            dispute_id: dispute.id,
            dispute_reason: dispute.reason,
            dispute_amount: dispute.amount
          }
        })
        .eq('id', payment.id)

      // Log the dispute
      await supabase
        .from('audit_logs')
        .insert({
          action: 'payment_disputed',
          resource: 'payment',
          resource_id: payment.id,
          new_values: {
            dispute_id: dispute.id,
            dispute_reason: dispute.reason,
            dispute_amount: dispute.amount,
            original_amount: payment.amount
          }
        })
    }

    console.log('Successfully processed charge dispute webhook')
  } catch (error) {
    console.error('Error handling charge dispute:', error)
  }
}
