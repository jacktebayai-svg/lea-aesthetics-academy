import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBusinessSettings, updateBusinessSettings, getCurrentUserProfile, handleDatabaseError } from '@/lib/supabase/helpers'
import { z } from 'zod'

const updateBusinessSettingsSchema = z.object({
  business_name: z.string().min(1).optional(),
  owner_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.record(z.any()).optional(),
  timezone: z.string().optional(),
  branding: z.record(z.any()).optional(),
  policies: z.record(z.any()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user and check if they have access
    const userProfile = await getCurrentUserProfile(supabase)
    
    // Only owners can access business settings
    if (userProfile.role !== 'owner') {
      return NextResponse.json(
        { error: 'Access denied. Owner role required.' },
        { status: 403 }
      )
    }

    const settings = await getBusinessSettings(supabase)
    
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        success: true,
        settings: {
          id: 'business_settings',
          business_name: 'LEA Aesthetics Academy',
          owner_name: 'Business Owner',
          email: 'contact@leaaesthetics.com',
          phone: '',
          address: {},
          timezone: 'Europe/London',
          branding: {
            primaryColor: '#2563eb',
            logo: '',
            favicon: ''
          },
          policies: {
            workingHours: {
              monday: { available: true, start: '09:00', end: '17:00' },
              tuesday: { available: true, start: '09:00', end: '17:00' },
              wednesday: { available: true, start: '09:00', end: '17:00' },
              thursday: { available: true, start: '09:00', end: '17:00' },
              friday: { available: true, start: '09:00', end: '17:00' },
              saturday: { available: true, start: '10:00', end: '16:00' },
              sunday: { available: false, start: '10:00', end: '16:00' }
            },
            cancellationPolicy: '24 hours notice required',
            depositPercentage: 25,
            termsAndConditions: ''
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Error fetching business settings:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch business settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user and check if they have access
    const userProfile = await getCurrentUserProfile(supabase)
    
    // Only owners can modify business settings
    if (userProfile.role !== 'owner') {
      return NextResponse.json(
        { error: 'Access denied. Owner role required.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const updates = updateBusinessSettingsSchema.parse(body)

    // Update business settings
    const updatedSettings = await updateBusinessSettings(supabase, updates)

    return NextResponse.json({
      success: true,
      settings: updatedSettings
    })
  } catch (error) {
    console.error('Error updating business settings:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update business settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  // PATCH works the same as PUT for business settings
  return PUT(request)
}
