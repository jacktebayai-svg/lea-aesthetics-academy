'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientLayout from '../../../components/portal/ClientLayout';
import { createClient } from '@/lib/supabase/client';
import { format, parseISO, isAfter } from 'date-fns';

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  services: {
    name: string;
    base_price: number;
  };
  payments: {
    amount: number;
    status: string;
    paid_at?: string;
  }[];
}

interface ClientStats {
  totalAppointments: number;
  upcomingAppointments: number;
  totalSpent: number;
  loyaltyPoints: number;
  nextAppointmentDays?: number;
}

interface UserProfile {
  email: string;
  profile: {
    firstName?: string;
    lastName?: string;
  };
}

export default function ClientDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<ClientStats>({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        router.push('/auth/signin');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email, profile')
        .eq('id', authUser.id)
        .single();
      
      if (profile) {
        setUser(profile);
      }

      // Fetch appointments (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            id,
            name,
            base_price
          ),
          payments (
            id,
            amount,
            status,
            paid_at
          )
        `)
        .gte('start_time', sixMonthsAgo.toISOString())
        .order('start_time', { ascending: false });

      if (appointmentError) {
        console.error('Error fetching appointments:', appointmentError);
        setError('Failed to load appointment data');
      } else if (appointmentData) {
        setAppointments(appointmentData);
        calculateStats(appointmentData);
      }

    } catch (err) {
      console.error('Error fetching client data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointmentData: Appointment[]) => {
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), 0, 1);
    
    const thisYearAppointments = appointmentData.filter(apt => 
      parseISO(apt.start_time) >= thisYear
    );
    
    const upcomingAppointments = appointmentData.filter(apt => 
      isAfter(parseISO(apt.start_time), now) && apt.status !== 'cancelled'
    );
    
    const totalSpent = appointmentData.reduce((total, apt) => {
      const paidPayments = apt.payments?.filter(p => p.status === 'succeeded') || [];
      return total + paidPayments.reduce((sum, p) => sum + p.amount, 0);
    }, 0);
    
    // Calculate next appointment days
    const nextAppointment = upcomingAppointments
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())[0];
    
    const nextAppointmentDays = nextAppointment 
      ? Math.ceil((parseISO(nextAppointment.start_time).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : undefined;
    
    setStats({
      totalAppointments: thisYearAppointments.length,
      upcomingAppointments: upcomingAppointments.length,
      totalSpent: totalSpent / 100, // Convert from pence to pounds
      loyaltyPoints: Math.floor(totalSpent / 100), // 1 point per pound spent
      nextAppointmentDays
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending_deposit': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingAppointments = appointments
    .filter(apt => isAfter(parseISO(apt.start_time), new Date()))
    .slice(0, 3);
    
  const recentAppointments = appointments
    .filter(apt => apt.status === 'completed')
    .slice(0, 3);

  if (loading) {
    return (
      <ClientLayout title="My Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout title="My Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchClientData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </ClientLayout>
    );
  }

  const firstName = user?.profile?.firstName || 'Client';

  return (
    <ClientLayout title="My Dashboard">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-elegant p-8 text-white">
          <h2 className="text-2xl font-elegant font-semibold mb-2">
            Welcome back, {firstName}!
          </h2>
          <p className="text-blue-100 mb-6">
            {stats.nextAppointmentDays 
              ? `Your next appointment is in ${stats.nextAppointmentDays} day${stats.nextAppointmentDays === 1 ? '' : 's'}. We're looking forward to seeing you.`
              : "Book your next appointment to continue your aesthetic journey."
            }
          </p>
          <button 
            onClick={() => router.push('/clinic')}
            className="bg-white text-blue-600 px-6 py-2 rounded-xl font-medium hover:bg-blue-50 transition-colors duration-200"
          >
            Book New Appointment
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Appointments This Year</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">{stats.totalAppointments}</p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Total Spent</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">£{stats.totalSpent.toFixed(0)}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Next Appointment</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">
                  {stats.nextAppointmentDays || '—'}
                </p>
                <p className="text-sm text-silver-500">
                  {stats.nextAppointmentDays ? 'days away' : 'None scheduled'}
                </p>
              </div>
              <div className="text-3xl">⏰</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl shadow-elegant p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-elegant font-semibold text-primary-900">
                Upcoming Appointments
              </h3>
              <button 
                onClick={() => router.push('/portal/client/bookings?filter=upcoming')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-primary-900">{appointment.services.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-silver-600">LEA Aesthetics Academy</p>
                    <p className="text-sm text-blue-600 font-medium">
                      {format(parseISO(appointment.start_time), 'EEEE, MMMM do')} at {format(parseISO(appointment.start_time), 'h:mm a')}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200">
                        View Details
                      </button>
                      <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs hover:bg-yellow-200">
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-gray-500">No upcoming appointments</p>
                  <button 
                    onClick={() => router.push('/clinic')}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Book Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Treatments */}
          <div className="bg-white rounded-2xl shadow-elegant p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-elegant font-semibold text-primary-900">
                Recent Treatments
              </h3>
              <button 
                onClick={() => router.push('/portal/client/bookings?filter=completed')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View History
              </button>
            </div>
            <div className="space-y-4">
              {recentAppointments.length > 0 ? (
                recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-platinum-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-primary-900">{appointment.services.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-silver-600">LEA Aesthetics Academy</p>
                    <p className="text-sm text-silver-500">
                      {format(parseISO(appointment.start_time), 'MMMM do, yyyy')}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs hover:bg-purple-200">
                        View Receipt
                      </button>
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200">
                        Book Again
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💆‍♀️</div>
                  <p className="text-gray-500">No previous treatments</p>
                  <p className="text-sm text-gray-400 mt-1">Your treatment history will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-elegant p-6">
          <h3 className="text-xl font-elegant font-semibold text-primary-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/clinic')}
              className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium text-primary-900">Book Appointment</div>
              <div className="text-sm text-silver-600">Schedule your next visit</div>
            </button>
            <button 
              onClick={() => router.push('/portal/client/bookings')}
              className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium text-primary-900">My Bookings</div>
              <div className="text-sm text-silver-600">Manage appointments</div>
            </button>
            <button 
              onClick={() => router.push('/portal/client/documents')}
              className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200"
            >
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium text-primary-900">My Documents</div>
              <div className="text-sm text-silver-600">View consultation forms</div>
            </button>
            <button 
              onClick={() => router.push('/portal/client/profile')}
              className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium text-primary-900">My Profile</div>
              <div className="text-sm text-silver-600">Update your information</div>
            </button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
