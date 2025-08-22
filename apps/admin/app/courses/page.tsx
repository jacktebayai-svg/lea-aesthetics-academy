'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';

// Mock data for courses
const courses = [
  {
    id: 1,
    title: 'Advanced Aesthetics Level 3',
    description: 'Comprehensive advanced training in aesthetic procedures including advanced injectables, thread lifts, and laser treatments.',
    level: 'Level 3',
    duration: '6 weeks',
    format: 'hybrid',
    price: 2850,
    status: 'published',
    enrolledStudents: 24,
    totalLessons: 48,
    completionRate: 78,
    instructor: 'Dr. Sarah Mitchell',
    startDate: '2024-09-15',
    category: 'Advanced Procedures',
    thumbnail: '🎓'
  },
  {
    id: 2,
    title: 'Botox & Fillers Certification',
    description: 'Professional certification program covering botulinum toxin and dermal filler treatments with hands-on training.',
    level: 'Level 2',
    duration: '3 weeks',
    format: 'in-person',
    price: 1950,
    status: 'published',
    enrolledStudents: 18,
    totalLessons: 24,
    completionRate: 92,
    instructor: 'Dr. Emily Carter',
    startDate: '2024-10-01',
    category: 'Injectables',
    thumbnail: '💉'
  },
  {
    id: 3,
    title: 'Laser Safety Training',
    description: 'Essential laser safety training covering all major laser platforms, safety protocols, and treatment techniques.',
    level: 'Foundation',
    duration: '2 weeks',
    format: 'online',
    price: 750,
    status: 'published',
    enrolledStudents: 31,
    totalLessons: 16,
    completionRate: 65,
    instructor: 'Dr. Michael Thompson',
    startDate: '2024-08-20',
    category: 'Safety & Compliance',
    thumbnail: '⚡'
  },
  {
    id: 4,
    title: 'Business Development for Aesthetics',
    description: 'Business skills for aesthetic practitioners including marketing, patient management, and practice growth strategies.',
    level: 'Professional',
    duration: '4 weeks',
    format: 'online',
    price: 1250,
    status: 'published',
    enrolledStudents: 12,
    totalLessons: 32,
    completionRate: 88,
    instructor: 'Lisa Rodriguez',
    startDate: '2024-09-01',
    category: 'Business',
    thumbnail: '📈'
  },
  {
    id: 5,
    title: 'Chemical Peels Masterclass',
    description: 'In-depth training on chemical peel treatments, patient assessment, and post-treatment care.',
    level: 'Level 2',
    duration: '2 weeks',
    format: 'hybrid',
    price: 1100,
    status: 'draft',
    enrolledStudents: 0,
    totalLessons: 20,
    completionRate: 0,
    instructor: 'Dr. Sarah Mitchell',
    startDate: '2024-11-15',
    category: 'Skin Treatments',
    thumbnail: '🧴'
  }
];

const levelColors = {
  'Foundation': 'bg-blue-100 text-blue-800',
  'Level 2': 'bg-green-100 text-green-800',
  'Level 3': 'bg-purple-100 text-purple-800',
  'Professional': 'bg-gold-100 text-gold-800'
};

const statusColors = {
  'published': 'bg-green-100 text-green-800',
  'draft': 'bg-yellow-100 text-yellow-800',
  'archived': 'bg-red-100 text-red-800'
};

const formatIcons = {
  'online': '💻',
  'in-person': '🏢',
  'hybrid': '🔄'
};

function CourseCard({ course, onEdit, onViewStudents }) {
  return (
    <div className="bg-white rounded-2xl shadow-elegant hover:shadow-elegant-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-silver-200 to-primary-400 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">{course.thumbnail}</span>
            </div>
            <div>
              <h3 className="text-xl font-elegant font-semibold text-primary-900 mb-1">
                {course.title}
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${levelColors[course.level] || 'bg-silver-100 text-silver-800'}`}>
                  {course.level}
                </span>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[course.status]}`}>
                  {course.status}
                </span>
              </div>
              <p className="text-sm text-silver-600">{course.category}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-silver-700 mb-6 leading-relaxed">
          {course.description}
        </p>

        {/* Course Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-silver-600 uppercase tracking-wide">Duration</p>
            <p className="font-semibold text-primary-900">{course.duration}</p>
          </div>
          <div>
            <p className="text-xs text-silver-600 uppercase tracking-wide">Format</p>
            <p className="font-semibold text-primary-900 flex items-center">
              <span className="mr-1">{formatIcons[course.format]}</span>
              {course.format}
            </p>
          </div>
          <div>
            <p className="text-xs text-silver-600 uppercase tracking-wide">Price</p>
            <p className="font-semibold text-primary-900">£{course.price.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-silver-600 uppercase tracking-wide">Instructor</p>
            <p className="font-semibold text-primary-900">{course.instructor}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-platinum-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-elegant font-semibold text-primary-900">{course.enrolledStudents}</p>
              <p className="text-xs text-silver-600 uppercase tracking-wide">Students</p>
            </div>
            <div>
              <p className="text-2xl font-elegant font-semibold text-primary-900">{course.totalLessons}</p>
              <p className="text-xs text-silver-600 uppercase tracking-wide">Lessons</p>
            </div>
            <div>
              <p className="text-2xl font-elegant font-semibold text-primary-900">{course.completionRate}%</p>
              <p className="text-xs text-silver-600 uppercase tracking-wide">Completion</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {course.status === 'published' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-silver-600">Course Progress</span>
              <span className="font-medium text-primary-900">{course.completionRate}%</span>
            </div>
            <div className="w-full bg-platinum-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-600 to-silver-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${course.completionRate}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onEdit(course)}
              className="px-4 py-2 text-sm font-medium text-silver-700 hover:text-primary-900 hover:bg-platinum-100 rounded-lg transition-colors duration-200"
            >
              Edit
            </button>
            {course.enrolledStudents > 0 && (
              <button 
                onClick={() => onViewStudents(course)}
                className="px-4 py-2 text-sm font-medium text-silver-700 hover:text-primary-900 hover:bg-platinum-100 rounded-lg transition-colors duration-200"
              >
                View Students
              </button>
            )}
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-primary-900 to-silver-800 text-white text-sm font-medium rounded-lg hover:shadow-elegant transform hover:scale-105 transition-all duration-200">
            Manage Course
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = courses.filter(course => {
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesLevel && matchesSearch;
  });

  const handleEdit = (course) => {
    console.log('Edit course:', course);
    // TODO: Open edit modal
  };

  const handleViewStudents = (course) => {
    console.log('View students for course:', course);
    // TODO: Navigate to students page with filter
  };

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.status === 'published').length,
    totalStudents: courses.reduce((sum, course) => sum + course.enrolledStudents, 0),
    avgCompletion: Math.round(courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length)
  };

  return (
    <AdminLayout 
      title="Courses" 
      subtitle="Manage your training programs and educational content"
    >
      <div className="space-y-8 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Total Courses</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">{stats.total}</p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Published</p>
                <p className="text-3xl font-elegant font-semibold text-green-600 mt-2">{stats.published}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Total Students</p>
                <p className="text-3xl font-elegant font-semibold text-blue-600 mt-2">{stats.totalStudents}</p>
              </div>
              <div className="text-3xl">🎓</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Avg Completion</p>
                <p className="text-3xl font-elegant font-semibold text-purple-600 mt-2">{stats.avgCompletion}%</p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-elegant p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 px-4 py-2 border border-platinum-200 rounded-xl text-sm text-primary-900 placeholder-silver-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-platinum-200 rounded-xl text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2 border border-platinum-200 rounded-xl text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="Foundation">Foundation</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-primary-900 to-silver-800 text-white font-medium rounded-xl hover:shadow-elegant transform hover:scale-105 transition-all duration-200">
              Create New Course
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEdit}
              onViewStudents={handleViewStudents}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-elegant p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-elegant font-semibold text-primary-900 mb-2">
              No courses found
            </h3>
            <p className="text-silver-600 mb-6">
              Try adjusting your search criteria or create your first course.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-primary-900 to-silver-800 text-white font-medium rounded-xl hover:shadow-elegant transform hover:scale-105 transition-all duration-200">
              Create New Course
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
