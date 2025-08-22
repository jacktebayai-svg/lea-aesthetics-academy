import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { stripe, formatAmountForStripe, createPaymentMetadata } from '@/lib/stripe/stripe'

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
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { type, itemId, amount, currency, metadata: additionalMetadata } = createPaymentIntentSchema.parse(body)

    // Verify the item exists and get details
    let itemDetails: any
    let description: string

    if (type === 'booking') {
      const { data: service } = await supabase
        .from('services')
        .select('*')
        .eq('id', itemId)
        .single()
      
      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        )
      }
      
      itemDetails = service
      description = `Booking deposit for ${service.name}`
    } else if (type === 'course') {
      const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', itemId)
        .single()
      
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
      user.id,
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
    await supabase
      .from('payments')
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount,
        currency: currency.toUpperCase(),
        status: 'pending',
        appointment_id: type === 'booking' ? itemId : null,
        course_enrollment_id: type === 'course' ? itemId : null,
        metadata: paymentMetadata,
      })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: formatAmountForStripe(amount, currency),
      currency: currency.toLowerCase(),
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    
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
