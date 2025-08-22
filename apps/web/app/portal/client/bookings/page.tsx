'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ClientLayout from '../../../../components/portal/ClientLayout';
import { createClient } from '@/lib/supabase/client';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  services: {
    id: string;
    name: string;
    base_price: number;
    duration: number;
  };
  payments: {
    id: string;
    amount: number;
    status: string;
    paid_at?: string;
  }[];
}

type FilterType = 'all' | 'upcoming' | 'completed' | 'cancelled';
type SortType = 'date_asc' | 'date_desc' | 'service' | 'status';

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('date_desc');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
    
    // Set initial filter from URL parameter
    const filterParam = searchParams.get('filter');
    if (filterParam && ['upcoming', 'completed', 'cancelled'].includes(filterParam)) {
      setFilterType(filterParam as FilterType);
    }
  }, [searchParams]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [appointments, searchQuery, filterType, sortType]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push('/auth/signin');
        return;
      }

      // Fetch all appointments for the user
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            id,
            name,
            base_price,
            duration
          ),
          payments (
            id,
            amount,
            status,
            paid_at
          )
        `)
        .eq('client_id', user.id)
        .order('start_time', { ascending: false });

      if (appointmentError) {
        console.error('Error fetching appointments:', appointmentError);
        setError('Failed to load appointments');
      } else if (appointmentData) {
        setAppointments(appointmentData);
      }

    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load booking data');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...appointments];
    const now = new Date();

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(apt => 
        apt.services.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (filterType) {
      case 'upcoming':
        filtered = filtered.filter(apt => 
          isAfter(parseISO(apt.start_time), now) && apt.status !== 'cancelled'
        );
        break;
      case 'completed':
        filtered = filtered.filter(apt => apt.status === 'completed');
        break;
      case 'cancelled':
        filtered = filtered.filter(apt => apt.status === 'cancelled');
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    switch (sortType) {
      case 'date_asc':
        filtered.sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
        break;
      case 'date_desc':
        filtered.sort((a, b) => parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime());
        break;
      case 'service':
        filtered.sort((a, b) => a.services.name.localeCompare(b.services.name));
        break;
      case 'status':
        filtered.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }

    setFilteredAppointments(filtered);
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

  const formatPrice = (price: number) => {
    return `£${(price / 100).toFixed(2)}`;
  };

  const canReschedule = (appointment: Appointment) => {
    const now = new Date();
    const appointmentTime = parseISO(appointment.start_time);
    const hoursDifference = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return appointment.status !== 'cancelled' && 
           appointment.status !== 'completed' && 
           hoursDifference > 24; // At least 24 hours notice
  };

  const canCancel = (appointment: Appointment) => {
    const now = new Date();
    const appointmentTime = parseISO(appointment.start_time);
    const hoursDifference = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return appointment.status !== 'cancelled' && 
           appointment.status !== 'completed' && 
           hoursDifference > 48; // At least 48 hours notice
  };

  if (loading) {
    return (
      <ClientLayout title="My Bookings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout title="My Bookings">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchAppointments}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="My Bookings">
      <div className="space-y-6">
        {/* Header with New Booking Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-elegant font-semibold text-primary-900">
              Appointment History
            </h2>
            <p className="text-silver-600 mt-1">
              Manage your appointments and view treatment history
            </p>
          </div>
          <button 
            onClick={() => router.push('/clinic')}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Book New Appointment
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-elegant p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-silver-700 mb-2">
                Search appointments
              </label>
              <input
                type="text"
                placeholder="Search by service, status, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-platinum-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-silver-700 mb-2">
                Filter by status
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="w-full px-4 py-2 border border-platinum-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All appointments</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-silver-700 mb-2">
                Sort by
              </label>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="w-full px-4 py-2 border border-platinum-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date_desc">Date (newest first)</option>
                <option value="date_asc">Date (oldest first)</option>
                <option value="service">Service name</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-2xl shadow-elegant p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Appointment Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-primary-900 mb-1">
                          {appointment.services.name}
                        </h3>
                        <p className="text-silver-600">LEA Aesthetics Academy</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-silver-500 font-medium">Date & Time</p>
                        <p className="text-primary-900">
                          {format(parseISO(appointment.start_time), 'EEEE, MMMM do, yyyy')}
                        </p>
                        <p className="text-primary-900">
                          {format(parseISO(appointment.start_time), 'h:mm a')} - {format(parseISO(appointment.end_time), 'h:mm a')}
                        </p>
                      </div>

                      <div>
                        <p className="text-silver-500 font-medium">Duration</p>
                        <p className="text-primary-900">{appointment.services.duration} minutes</p>
                      </div>

                      <div>
                        <p className="text-silver-500 font-medium">Price</p>
                        <p className="text-primary-900 font-semibold">
                          {formatPrice(appointment.services.base_price)}
                        </p>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-4 p-3 bg-platinum-50 rounded-lg">
                        <p className="text-sm text-silver-700">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                    <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                      View Details
                    </button>
                    
                    {canReschedule(appointment) && (
                      <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors">
                        Reschedule
                      </button>
                    )}
                    
                    {canCancel(appointment) && (
                      <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors">
                        Cancel
                      </button>
                    )}
                    
                    {appointment.status === 'completed' && (
                      <>
                        <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors">
                          View Receipt
                        </button>
                        <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors">
                          Book Again
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-elegant p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">
                {searchQuery || filterType !== 'all' ? 'No appointments found' : 'No appointments yet'}
              </h3>
              <p className="text-silver-600 mb-6">
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Book your first appointment to get started on your aesthetic journey'
                }
              </p>
              {(!searchQuery && filterType === 'all') && (
                <button 
                  onClick={() => router.push('/clinic')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Book Your First Appointment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
