import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subDays } from 'date-fns'

export async function GET(request: NextRequest) {
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

    // Get user profile to verify they are a practitioner/owner
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, profile')
      .eq('id', user.id)
      .single()

    if (!profile || !['owner', 'practitioner'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Practitioner access required' },
        { status: 403 }
      )
    }

    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday start
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Get upcoming appointments (next 7 days)
    const { data: upcomingAppointments } = await supabase
      .from('appointments')
      .select(`
        *,
        services (name, duration, base_price),
        clients (personal_info),
        payments (amount, status)
      `)
      .gte('start_time', now.toISOString())
      .lte('start_time', subDays(now, -7).toISOString())
      .in('status', ['confirmed'])
      .order('start_time', { ascending: true })
      .limit(10)

    // Return mock data for now since this is a template
    return NextResponse.json({
      profile: {
        name: `${profile.profile?.firstName || 'Practitioner'} ${profile.profile?.lastName || 'User'}`,
        title: 'Senior Aesthetic Practitioner',
        bio: 'Specialized in advanced facial treatments and skin rejuvenation',
        isActive: true,
        specialties: ['Botox', 'Dermal Fillers', 'Chemical Peels'],
        joinedAt: new Date().toISOString(),
      },
      
      statistics: {
        total: {
          bookings: 156,
          revenue: 18500,
        },
        weekly: {
          bookings: 12,
          revenue: 1800,
        },
        monthly: {
          bookings: 48,
          revenue: 7200,
        },
        pending: {
          bookings: 3,
        }
      },
      
      upcomingBookings: upcomingAppointments || [],
      
      recentActivity: [
        {
          id: '1',
          type: 'booking',
          client: 'Sarah Wilson',
          treatment: 'HydraFacial',
          status: 'confirmed',
          amount: 150,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'booking',
          client: 'James Thompson',
          treatment: 'Botox Treatment',
          status: 'completed',
          amount: 300,
          createdAt: subDays(new Date(), 1).toISOString(),
        },
      ],
      
      trends: {
        weekly: [
          { week: 'Jan 01', bookings: 8 },
          { week: 'Jan 08', bookings: 12 },
          { week: 'Jan 15', bookings: 10 },
          { week: 'Jan 22', bookings: 15 },
        ],
        popularTreatments: [
          { name: 'HydraFacial', bookings: 45 },
          { name: 'Botox', bookings: 38 },
          { name: 'Chemical Peel', bookings: 32 },
          { name: 'Dermal Fillers', bookings: 28 },
        ],
      },
      
      treatments: [
        {
          id: '1',
          name: 'HydraFacial',
          category: 'facial',
          price: 15000, // in pence
          duration: 60,
          isActive: true,
        },
        {
          id: '2',
          name: 'Botox Treatment',
          category: 'injectables',
          price: 30000,
          duration: 30,
          isActive: true,
        },
      ],
    })
  } catch (error) {
    console.error('Practitioner dashboard error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
