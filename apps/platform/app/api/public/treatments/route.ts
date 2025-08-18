import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveServices, formatPrice, handleDatabaseError } from '@/lib/supabase/helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const services = await getActiveServices(supabase)

    const formattedTreatments = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      duration: service.duration_minutes,
      price: service.base_price,
      depositAmount: Math.floor(service.base_price * 0.25), // 25% deposit as per Master Aesthetics Suite spec
      category: service.category,
      slug: service.slug,
      // Extract settings for backward compatibility
      requiresConsultation: service.settings?.requiresConsultation || false,
      minimumAge: service.settings?.minimumAge || 18,
      aftercareRequired: service.settings?.aftercareRequired || true,
      formattedPrice: formatPrice(service.base_price),
      formattedDepositAmount: formatPrice(Math.floor(service.base_price * 0.25))
    }))

    return NextResponse.json({ 
      success: true, 
      treatments: formattedTreatments 
    })
  } catch (error) {
    console.error('Error fetching treatments:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to load treatments' },
      { status: 500 }
    )
  }
}
