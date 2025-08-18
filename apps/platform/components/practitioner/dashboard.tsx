'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/auth/auth-provider'
import { Calendar, Users, DollarSign, Clock, Phone, Mail, CheckCircle, X } from 'lucide-react'
import { format } from 'date-fns'

interface Booking {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  treatment: {
    name: string
    duration: number
    price: number
  }
  dateTime: Date
  status: string
  totalAmount: number
  depositPaid: boolean
  balancePaid: boolean
  notes?: string
}

interface DashboardStats {
  todayBookings: number
  weeklyRevenue: number
  pendingDeposits: number
  totalClients: number
}

export function PractitionerDashboard({ user }: { user: User }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    loadDashboardData()
  }, [selectedDate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load bookings for selected date
      const bookingsResponse = await fetch(`/api/practitioner/bookings?date=${format(selectedDate, 'yyyy-MM-dd')}`, {
        credentials: 'include'
      })
      const bookingsData = await bookingsResponse.json()
      
      // Load dashboard stats
      const statsResponse = await fetch('/api/practitioner/stats', {
        credentials: 'include'
      })
      const statsData = await statsResponse.json()
      
      setBookings(bookingsData.bookings || [])
      setStats(statsData.stats)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'cancel' | 'complete') => {
    try {
      const response = await fetch(`/api/practitioner/bookings/${bookingId}/${action}`, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        // Refresh bookings
        loadDashboardData()
      } else {
        throw new Error('Failed to update booking')
      }
    } catch (error) {
      console.error(`Failed to ${action} booking:`, error)
      alert(`Failed to ${action} booking. Please try again.`)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      'PENDING_DEPOSIT': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-green-100 text-green-800',
      'COMPLETED': 'bg-blue-100 text-blue-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'NO_SHOW': 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user.firstName}
        </h1>
        <p className="text-gray-600">Here's what's happening with your practice today.</p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Weekly Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">£{(stats.weeklyRevenue / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Deposits</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingDeposits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clients</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalClients}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Daily Schedule</h2>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Bookings List */}
        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{booking.clientName}</h3>
                        <p className="text-sm text-gray-600">{booking.treatment.name}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(booking.dateTime), 'HH:mm')}</span>
                          <span>({booking.treatment.duration} min)</span>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{booking.clientEmail}</span>
                      </div>
                      {booking.clientPhone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{booking.clientPhone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>£{(booking.totalAmount / 100).toFixed(2)}</span>
                        {!booking.depositPaid && <span className="text-yellow-600">(Deposit Pending)</span>}
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <span className="font-medium">Notes:</span> {booking.notes}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {booking.status === 'PENDING_DEPOSIT' && (
                      <button
                        onClick={() => handleBookingAction(booking.id, 'confirm')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleBookingAction(booking.id, 'complete')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    
                    {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleBookingAction(booking.id, 'cancel')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings for this date</h3>
            <p className="text-gray-600">You have a free day! Time to relax or catch up on other tasks.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <span className="text-sm font-medium">View Clients</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <span className="text-sm font-medium">Manage Treatments</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <span className="text-sm font-medium">View Payments</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
            <span className="text-sm font-medium">Set Availability</span>
          </button>
        </div>
      </div>
    </div>
  )
}
