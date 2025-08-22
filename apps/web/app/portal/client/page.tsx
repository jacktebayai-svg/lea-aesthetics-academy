'use client';

import React from 'react';
import ClientLayout from '../../../components/portal/ClientLayout';

const upcomingAppointments = [
  {
    id: 1,
    service: 'Botox Consultation',
    practitioner: 'Dr. Sarah Mitchell',
    date: '2024-08-18',
    time: '10:00 AM',
    status: 'confirmed'
  },
  {
    id: 2,
    service: 'Dermal Fillers Follow-up',
    practitioner: 'Dr. Emily Carter', 
    date: '2024-08-25',
    time: '2:30 PM',
    status: 'confirmed'
  }
];

const recentTreatments = [
  {
    id: 1,
    service: 'Laser Facial',
    practitioner: 'Dr. Sarah Mitchell',
    date: '2024-08-10',
    status: 'completed'
  },
  {
    id: 2,
    service: 'Chemical Peel',
    practitioner: 'Dr. Emily Carter',
    date: '2024-07-28',
    status: 'completed'
  }
];

export default function ClientDashboard() {
  return (
    <ClientLayout title="My Dashboard">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-elegant p-8 text-white">
          <h2 className="text-2xl font-elegant font-semibold mb-2">
            Welcome back, Emma!
          </h2>
          <p className="text-blue-100 mb-6">
            Your next appointment is in 3 days. We&apos;re looking forward to seeing you.
          </p>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-xl font-medium hover:bg-blue-50 transition-colors duration-200">
            Book New Appointment
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Appointments This Year</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">12</p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Loyalty Points</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">2,450</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Next Appointment</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">3</p>
                <p className="text-sm text-silver-500">days away</p>
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
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-primary-900">{appointment.service}</h4>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {appointment.status}
                    </span>
                  </div>
                  <p className="text-sm text-silver-600">{appointment.practitioner}</p>
                  <p className="text-sm text-blue-600 font-medium">
                    {appointment.date} at {appointment.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Treatments */}
          <div className="bg-white rounded-2xl shadow-elegant p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-elegant font-semibold text-primary-900">
                Recent Treatments
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View History
              </button>
            </div>
            <div className="space-y-4">
              {recentTreatments.map((treatment) => (
                <div key={treatment.id} className="p-4 bg-platinum-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-primary-900">{treatment.service}</h4>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {treatment.status}
                    </span>
                  </div>
                  <p className="text-sm text-silver-600">{treatment.practitioner}</p>
                  <p className="text-sm text-silver-500">{treatment.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-elegant p-6">
          <h3 className="text-xl font-elegant font-semibold text-primary-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium text-primary-900">Book Appointment</div>
              <div className="text-sm text-silver-600">Schedule your next visit</div>
            </button>
            <button className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">💆‍♀️</div>
              <div className="font-medium text-primary-900">Browse Services</div>
              <div className="text-sm text-silver-600">Explore our treatments</div>
            </button>
            <button className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium text-primary-900">My Documents</div>
              <div className="text-sm text-silver-600">View consultation forms</div>
            </button>
            <button className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">❓</div>
              <div className="font-medium text-primary-900">Help & Support</div>
              <div className="text-sm text-silver-600">Get assistance</div>
            </button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
