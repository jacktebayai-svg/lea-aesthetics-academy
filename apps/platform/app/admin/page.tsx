'use client';

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

// Mock data for demo
const dashboardStats = {
  appointments: {
    total: 342,
    thisMonth: 89,
    change: '+12%',
    trend: 'up'
  },
  clients: {
    total: 1567,
    active: 234,
    change: '+8%',
    trend: 'up'
  },
  revenue: {
    total: 45678,
    thisMonth: 12456,
    change: '+15%',
    trend: 'up'
  },
  courses: {
    total: 28,
    enrolled: 456,
    change: '+22%',
    trend: 'up'
  }
};

const recentAppointments = [
  { id: 1, client: 'Emma Watson', service: 'Botox Consultation', time: '10:00 AM', status: 'confirmed' },
  { id: 2, client: 'Sarah Johnson', service: 'Dermal Fillers', time: '11:30 AM', status: 'pending' },
  { id: 3, client: 'Maria Garcia', service: 'Laser Treatment', time: '2:15 PM', status: 'completed' },
  { id: 4, client: 'Jennifer Lee', service: 'Consultation', time: '3:45 PM', status: 'confirmed' },
];

const courseEnrollments = [
  { course: 'Advanced Aesthetics Level 3', students: 24, completion: 78 },
  { course: 'Botox & Fillers Certification', students: 18, completion: 92 },
  { course: 'Laser Safety Training', students: 31, completion: 65 },
  { course: 'Business Development', students: 12, completion: 88 },
];

function StatCard({ title, value, subtitle, change, trend, icon }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">{value}</p>
          <p className="text-sm text-silver-500 mt-1">{subtitle}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
        <span className="text-sm text-silver-500 ml-2">vs last month</span>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment }) {
  const statusColors = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-platinum-50 rounded-xl hover:bg-white hover:shadow-subtle transition-all duration-200">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-silver-300 to-primary-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {appointment.client.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <p className="font-semibold text-primary-900">{appointment.client}</p>
          <p className="text-sm text-silver-600">{appointment.service}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-primary-900">{appointment.time}</p>
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
          {appointment.status}
        </span>
      </div>
    </div>
  );
}

function CourseProgressCard({ course }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-elegant transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-primary-900 text-sm">{course.course}</h4>
        <span className="text-xs text-silver-600">{course.students} students</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-silver-600">Progress</span>
          <span className="font-medium text-primary-900">{course.completion}%</span>
        </div>
        <div className="w-full bg-platinum-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-600 to-silver-600 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${course.completion}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminLayout 
      title="Dashboard" 
      subtitle="Welcome back, here&apos;s what&apos;s happening with your academy"
    >
      <div className="space-y-8 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Appointments"
            value={dashboardStats.appointments.total.toLocaleString()}
            subtitle={`${dashboardStats.appointments.thisMonth} this month`}
            change={dashboardStats.appointments.change}
            trend={dashboardStats.appointments.trend}
            icon="📅"
          />
          <StatCard
            title="Active Clients"
            value={dashboardStats.clients.total.toLocaleString()}
            subtitle={`${dashboardStats.clients.active} active this month`}
            change={dashboardStats.clients.change}
            trend={dashboardStats.clients.trend}
            icon="👥"
          />
          <StatCard
            title="Revenue"
            value={`£${dashboardStats.revenue.total.toLocaleString()}`}
            subtitle={`£${dashboardStats.revenue.thisMonth.toLocaleString()} this month`}
            change={dashboardStats.revenue.change}
            trend={dashboardStats.revenue.trend}
            icon="💰"
          />
          <StatCard
            title="Course Enrollments"
            value={dashboardStats.courses.enrolled.toLocaleString()}
            subtitle={`${dashboardStats.courses.total} active courses`}
            change={dashboardStats.courses.change}
            trend={dashboardStats.courses.trend}
            icon="🎓"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-elegant p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-elegant font-semibold text-primary-900">
                  Today&apos;s Appointments
                </h2>
                <button className="text-sm text-silver-600 hover:text-primary-900 font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {recentAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </div>
          </div>

          {/* Course Progress */}
          <div>
            <div className="bg-white rounded-2xl shadow-elegant p-6">
              <h2 className="text-xl font-elegant font-semibold text-primary-900 mb-6">
                Course Progress
              </h2>
              <div className="space-y-4">
                {courseEnrollments.map((course, index) => (
                  <CourseProgressCard key={index} course={course} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-elegant p-6">
          <h2 className="text-xl font-elegant font-semibold text-primary-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-gradient-to-br from-platinum-100 to-silver-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium text-primary-900">New Appointment</div>
              <div className="text-sm text-silver-600">Schedule client visit</div>
            </button>
            <button className="p-4 bg-gradient-to-br from-platinum-100 to-silver-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium text-primary-900">Add Client</div>
              <div className="text-sm text-silver-600">Register new client</div>
            </button>
            <button className="p-4 bg-gradient-to-br from-platinum-100 to-silver-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium text-primary-900">Create Course</div>
              <div className="text-sm text-silver-600">New training program</div>
            </button>
            <button className="p-4 bg-gradient-to-br from-platinum-100 to-silver-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-primary-900">View Reports</div>
              <div className="text-sm text-silver-600">Analytics & insights</div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

