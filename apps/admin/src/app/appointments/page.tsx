'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

// Mock data for appointments
const appointments = [
  {
    id: 1,
    client: 'Emma Watson',
    service: 'Botox Consultation',
    practitioner: 'Dr. Sarah Mitchell',
    date: '2024-08-16',
    time: '10:00 AM',
    duration: 60,
    status: 'confirmed',
    notes: 'First-time client, focus on forehead lines',
    price: 350
  },
  {
    id: 2,
    client: 'Sarah Johnson',
    service: 'Dermal Fillers',
    practitioner: 'Dr. Emily Carter',
    date: '2024-08-16',
    time: '11:30 AM',
    duration: 90,
    status: 'pending',
    notes: 'Lip enhancement, requested natural look',
    price: 550
  },
  {
    id: 3,
    client: 'Maria Garcia',
    service: 'Laser Treatment',
    practitioner: 'Dr. Sarah Mitchell',
    date: '2024-08-16',
    time: '2:15 PM',
    duration: 45,
    status: 'completed',
    notes: 'Pigmentation treatment, 3rd session',
    price: 280
  },
  {
    id: 4,
    client: 'Jennifer Lee',
    service: 'Consultation',
    practitioner: 'Dr. Emily Carter',
    date: '2024-08-17',
    time: '9:00 AM',
    duration: 30,
    status: 'confirmed',
    notes: 'Interested in thread lift procedure',
    price: 150
  },
  {
    id: 5,
    client: 'Charlotte Brown',
    service: 'Chemical Peel',
    practitioner: 'Dr. Sarah Mitchell',
    date: '2024-08-17',
    time: '1:00 PM',
    duration: 60,
    status: 'cancelled',
    notes: 'Medium depth peel for acne scarring',
    price: 320
  }
];

const statusConfig = {
  confirmed: { color: 'bg-green-100 text-green-800', icon: '✓' },
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  completed: { color: 'bg-blue-100 text-blue-800', icon: '✅' },
  cancelled: { color: 'bg-red-100 text-red-800', icon: '❌' }
};

function AppointmentCard({ appointment, onEdit, onCancel }: { appointment: any; onEdit: (appointment: any) => void; onCancel: (appointment: any) => void }) {
  const status = statusConfig[appointment.status];
  
  return (
    <div className="bg-white rounded-2xl shadow-elegant hover:shadow-elegant-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-silver-300 to-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {appointment.client.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-elegant font-semibold text-primary-900">
                {appointment.client}
              </h3>
              <p className="text-silver-600 text-sm">{appointment.service}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
            <span className="mr-1">{status.icon}</span>
            {appointment.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-silver-600">Date & Time</p>
            <p className="font-medium text-primary-900">{appointment.date} at {appointment.time}</p>
          </div>
          <div>
            <p className="text-sm text-silver-600">Practitioner</p>
            <p className="font-medium text-primary-900">{appointment.practitioner}</p>
          </div>
          <div>
            <p className="text-sm text-silver-600">Duration</p>
            <p className="font-medium text-primary-900">{appointment.duration} minutes</p>
          </div>
          <div>
            <p className="text-sm text-silver-600">Price</p>
            <p className="font-medium text-primary-900">£{appointment.price}</p>
          </div>
        </div>

        {appointment.notes && (
          <div className="mb-4">
            <p className="text-sm text-silver-600">Notes</p>
            <p className="text-sm text-primary-800 bg-platinum-50 rounded-lg p-3 mt-1">
              {appointment.notes}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3">
          <button 
            onClick={() => onEdit(appointment)}
            className="px-4 py-2 text-sm font-medium text-silver-700 hover:text-primary-900 hover:bg-platinum-100 rounded-lg transition-colors duration-200"
          >
            Edit
          </button>
          {appointment.status !== 'cancelled' && (
            <button 
              onClick={() => onCancel(appointment)}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          )}
          <button className="px-4 py-2 bg-gradient-to-r from-primary-900 to-silver-800 text-white text-sm font-medium rounded-lg hover:shadow-elegant transform hover:scale-105 transition-all duration-200">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesSearch = appointment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleEdit = (appointment: any) => {
    console.log('Edit appointment:', appointment);
    // TODO: Open edit modal
  };

  const handleCancel = (appointment: any) => {
    console.log('Cancel appointment:', appointment);
    // TODO: Show confirmation dialog
  };

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length
  };

  return (
    <AdminLayout 
      title="Appointments" 
      subtitle="Manage your clinic appointments and schedule"
    >
      <div className="space-y-8 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Total</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">{stats.total}</p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Confirmed</p>
                <p className="text-3xl font-elegant font-semibold text-green-600 mt-2">{stats.confirmed}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-elegant font-semibold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-elegant font-semibold text-blue-600 mt-2">{stats.completed}</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-elegant p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 px-4 py-2 border border-platinum-200 rounded-xl text-sm text-primary-900 placeholder-silver-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-platinum-200 rounded-xl text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-primary-900 to-silver-800 text-white font-medium rounded-xl hover:shadow-elegant transform hover:scale-105 transition-all duration-200">
              New Appointment
            </button>
          </div>
        </div>

        {/* Appointments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onEdit={handleEdit}
              onCancel={handleCancel}
            />
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="bg-white rounded-2xl shadow-elegant p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-elegant font-semibold text-primary-900 mb-2">
              No appointments found
            </h3>
            <p className="text-silver-600 mb-6">
              Try adjusting your search criteria or create a new appointment.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-primary-900 to-silver-800 text-white font-medium rounded-xl hover:shadow-elegant transform hover:scale-105 transition-all duration-200">
              Create New Appointment
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
