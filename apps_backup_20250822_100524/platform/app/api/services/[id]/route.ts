import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/services/[id] - Get specific service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 })
      }
      console.error('Error fetching service:', error)
      return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 })
    }

    return NextResponse.json({ data: service })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/services/[id] - Update service (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

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
      settings,
      is_active 
    } = body

    const updateData: any = { updated_at: new Date().toISOString() }

    // Only update provided fields
    if (name !== undefined) {
      updateData.name = name
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    if (description !== undefined) updateData.description = description
    if (base_price !== undefined) updateData.base_price = parseInt(base_price)
    if (duration_minutes !== undefined) updateData.duration_minutes = parseInt(duration_minutes)
    if (category !== undefined) updateData.category = category
    if (buffer_minutes !== undefined) updateData.buffer_minutes = buffer_minutes
    if (settings !== undefined) updateData.settings = settings
    if (is_active !== undefined) updateData.is_active = is_active

    // Update service
    const { data: service, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 })
      }
      
      // Handle unique constraint violation
      if (error.code === '23505' && error.details?.includes('slug')) {
        return NextResponse.json({ error: 'Service name must be unique' }, { status: 409 })
      }
      
      console.error('Error updating service:', error)
      return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
    }

    return NextResponse.json({ data: service })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/services/[id] - Soft delete service (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

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

    // Check if service has any appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id')
      .eq('service_id', id)
      .limit(1)

    if (appointmentsError) {
      console.error('Error checking appointments:', appointmentsError)
      return NextResponse.json({ error: 'Failed to check service dependencies' }, { status: 500 })
    }

    if (appointments && appointments.length > 0) {
      // Soft delete - mark as inactive instead of hard delete
      const { data: service, error } = await supabase
        .from('services')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Service not found' }, { status: 404 })
        }
        console.error('Error deactivating service:', error)
        return NextResponse.json({ error: 'Failed to deactivate service' }, { status: 500 })
      }

      return NextResponse.json({ 
        message: 'Service deactivated (has existing appointments)',
        data: service 
      })
    } else {
      // Hard delete if no appointments
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Service not found' }, { status: 404 })
        }
        console.error('Error deleting service:', error)
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Service deleted successfully' })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
