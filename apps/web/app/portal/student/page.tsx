'use client';

import React from 'react';
import StudentLayout from '../../../components/portal/StudentLayout';

const activeCourses = [
  {
    id: 1,
    title: 'Advanced Botox Techniques',
    instructor: 'Dr. Sarah Mitchell',
    progress: 75,
    nextModule: 'Module 6: Advanced Injection Patterns',
    dueDate: '2024-08-25'
  },
  {
    id: 2,
    title: 'Dermal Filler Certification',
    instructor: 'Dr. Emily Carter',
    progress: 45,
    nextModule: 'Module 3: Facial Anatomy',
    dueDate: '2024-09-02'
  }
];

const upcomingAssignments = [
  {
    id: 1,
    title: 'Botox Case Study Analysis',
    course: 'Advanced Botox Techniques',
    dueDate: '2024-08-20',
    type: 'assignment'
  },
  {
    id: 2,
    title: 'Facial Anatomy Quiz',
    course: 'Dermal Filler Certification',
    dueDate: '2024-08-22',
    type: 'quiz'
  }
];

const recentAchievements = [
  {
    id: 1,
    title: 'Perfect Quiz Score',
    description: 'Scored 100% on Safety Protocols Quiz',
    date: '2024-08-15',
    icon: '🏆'
  },
  {
    id: 2,
    title: 'Module Complete',
    description: 'Completed Basic Injection Techniques',
    date: '2024-08-12',
    icon: '✅'
  }
];

export default function StudentDashboard() {
  return (
    <StudentLayout title="My Learning Dashboard">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-elegant p-8 text-white">
          <h2 className="text-2xl font-elegant font-semibold mb-2">
            Welcome back, Alex!
          </h2>
          <p className="text-purple-100 mb-6">
            You&apos;re making excellent progress! Keep up the great work on your certification journey.
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-purple-600 px-6 py-2 rounded-xl font-medium hover:bg-purple-50 transition-colors duration-200">
              Continue Learning
            </button>
            <button className="border border-white text-white px-6 py-2 rounded-xl font-medium hover:bg-white hover:text-purple-600 transition-colors duration-200">
              View Schedule
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Courses Enrolled</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">6</p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Completed Modules</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">24</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Average Score</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">92%</p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Certificates Earned</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">2</p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Active Courses - spans 2 columns */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-elegant p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-elegant font-semibold text-primary-900">
                Active Courses
              </h3>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View All Courses
              </button>
            </div>
            <div className="space-y-6">
              {activeCourses.map((course) => (
                <div key={course.id} className="p-6 bg-purple-50 rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary-900 text-lg mb-2">{course.title}</h4>
                      <p className="text-sm text-silver-600 mb-3">{course.instructor}</p>
                      <p className="text-sm text-purple-600 font-medium">{course.nextModule}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{course.progress}%</div>
                      <div className="text-xs text-silver-500">Complete</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-purple-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-silver-500">Due: {course.dueDate}</span>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors duration-200">
                      Continue Learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-8">
            {/* Upcoming Assignments */}
            <div className="bg-white rounded-2xl shadow-elegant p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-elegant font-semibold text-primary-900">
                  Due Soon
                </h3>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-400">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-primary-900 text-sm">{assignment.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assignment.type === 'quiz' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {assignment.type}
                      </span>
                    </div>
                    <p className="text-xs text-silver-600 mb-2">{assignment.course}</p>
                    <p className="text-xs text-orange-600 font-medium">Due: {assignment.dueDate}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-2xl shadow-elegant p-6">
              <h3 className="text-xl font-elegant font-semibold text-primary-900 mb-6">
                Recent Achievements
              </h3>
              <div className="space-y-4">
                {recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="p-4 bg-yellow-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary-900 text-sm">{achievement.title}</h4>
                        <p className="text-xs text-silver-600">{achievement.description}</p>
                        <p className="text-xs text-yellow-600 font-medium">{achievement.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-elegant p-6">
          <h3 className="text-xl font-elegant font-semibold text-primary-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">📖</div>
              <div className="font-medium text-primary-900">Browse Courses</div>
              <div className="text-sm text-silver-600">Explore available programs</div>
            </button>
            <button className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium text-primary-900">View Schedule</div>
              <div className="text-sm text-silver-600">Check upcoming deadlines</div>
            </button>
            <button className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-medium text-primary-900">Discussion Forums</div>
              <div className="text-sm text-silver-600">Connect with peers</div>
            </button>
            <button className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl hover:shadow-elegant hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">❓</div>
              <div className="font-medium text-primary-900">Get Help</div>
              <div className="text-sm text-silver-600">Contact support</div>
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
