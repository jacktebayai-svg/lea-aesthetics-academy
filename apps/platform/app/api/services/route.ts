import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/services - List all active services
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    // Optional category filter
    const category = searchParams.get('category')

    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data: services, error } = await query

    if (error) {
      console.error('Error fetching services:', error)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    return NextResponse.json({ data: services })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/services - Create new service (owner only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      name, 
      description, 
      base_price, 
      duration_minutes, 
      category, 
      buffer_minutes,
      settings 
    } = body

    // Validate required fields
    if (!name || !base_price || !duration_minutes || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, base_price, duration_minutes, category' 
      }, { status: 400 })
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Create service
    const { data: service, error } = await supabase
      .from('services')
      .insert({
        name,
        slug,
        description,
        base_price: parseInt(base_price), // Ensure integer (pence)
        duration_minutes: parseInt(duration_minutes),
        category,
        buffer_minutes: buffer_minutes || {},
        settings: settings || {},
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating service:', error)
      
      // Handle unique constraint violation
      if (error.code === '23505' && error.details?.includes('slug')) {
        return NextResponse.json({ error: 'Service name must be unique' }, { status: 409 })
      }
      
      return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
    }

    return NextResponse.json({ data: service }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
