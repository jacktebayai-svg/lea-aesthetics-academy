'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  duration_hours: number;
  max_students: number;
  curriculum: any;
  prerequisites: any;
  is_active: boolean;
  created_at: string;
  enrollment_count: number;
  available_slots: number | null;
}

interface EnrollmentStatus {
  enrolled: boolean;
  enrollment?: {
    id: string;
    status: string;
    progress: any;
  };
}

export default function AcademyCourseCatalog() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<Record<string, EnrollmentStatus>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [courses, searchQuery, priceFilter, durationFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      // Fetch all active courses
      const response = await fetch('/api/courses?active=true');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const { data: coursesData } = await response.json();
      setCourses(coursesData || []);

      // Check enrollment status for each course
      await checkEnrollmentStatuses(coursesData || []);

    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatuses = async (coursesData: Course[]) => {
    try {
      const statuses: Record<string, EnrollmentStatus> = {};

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Set all courses as not enrolled for unauthenticated users
        coursesData.forEach(course => {
          statuses[course.id] = { enrolled: false };
        });
        setEnrollmentStatuses(statuses);
        return;
      }

      // Check enrollment status for each course
      await Promise.all(
        coursesData.map(async (course) => {
          try {
            const response = await fetch(`/api/courses/${course.id}/enroll`);
            if (response.ok) {
              const enrollmentData = await response.json();
              statuses[course.id] = enrollmentData;
            } else {
              statuses[course.id] = { enrolled: false };
            }
          } catch {
            statuses[course.id] = { enrolled: false };
          }
        })
      );

      setEnrollmentStatuses(statuses);
    } catch (error) {
      console.error('Error checking enrollment statuses:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price filter
    switch (priceFilter) {
      case 'free':
        filtered = filtered.filter(course => course.price === 0);
        break;
      case 'paid':
        filtered = filtered.filter(course => course.price > 0);
        break;
      default:
        // 'all' - no price filtering
        break;
    }

    // Apply duration filter
    switch (durationFilter) {
      case 'short':
        filtered = filtered.filter(course => course.duration_hours <= 10);
        break;
      case 'medium':
        filtered = filtered.filter(course => course.duration_hours > 10 && course.duration_hours <= 40);
        break;
      case 'long':
        filtered = filtered.filter(course => course.duration_hours > 40);
        break;
      default:
        // 'all' - no duration filtering
        break;
    }

    setFilteredCourses(filtered);
  };

  const handleEnroll = async (course: Course) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin?redirect=/academy');
        return;
      }

      // Navigate to enrollment page with course details
      router.push(`/academy/courses/${course.slug}/enroll`);
    } catch (error) {
      console.error('Error handling enrollment:', error);
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `£${(price / 100).toFixed(2)}`;
  };

  const getEnrollmentButton = (course: Course) => {
    const status = enrollmentStatuses[course.id];
    
    if (!status) {
      return (
        <button
          disabled
          className="w-full bg-gray-300 text-gray-500 px-6 py-3 rounded-xl font-medium cursor-not-allowed"
        >
          Loading...
        </button>
      );
    }

    if (status.enrolled) {
      return (
        <div className="space-y-2">
          <button
            onClick={() => router.push(`/portal/student/courses/${course.id}`)}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200"
          >
            Continue Learning
          </button>
          <p className="text-xs text-green-600 text-center">
            Status: {status.enrollment?.status?.replace('_', ' ').toUpperCase()}
          </p>
        </div>
      );
    }

    // Check if course is full
    if (course.available_slots !== null && course.available_slots <= 0) {
      return (
        <button
          disabled
          className="w-full bg-red-100 text-red-600 px-6 py-3 rounded-xl font-medium cursor-not-allowed"
        >
          Course Full
        </button>
      );
    }

    return (
      <button
        onClick={() => handleEnroll(course)}
        className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200"
      >
        {course.price === 0 ? 'Enroll Free' : `Enroll for ${formatPrice(course.price)}`}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={fetchCourses}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-elegant font-bold text-primary-900 mb-4">
            LEA Aesthetics Clinical Academy
          </h1>
          <p className="text-xl text-silver-600 max-w-3xl mx-auto">
            Advance your career with professional aesthetics training. Our comprehensive courses combine 
            theoretical knowledge with hands-on practical experience.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-elegant p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by course title or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Price Filter */}
            <div>
              <label htmlFor="price-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <select
                id="price-filter"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Prices</option>
                <option value="free">Free Courses</option>
                <option value="paid">Paid Courses</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label htmlFor="duration-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                id="duration-filter"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Durations</option>
                <option value="short">Short (≤10 hours)</option>
                <option value="medium">Medium (11-40 hours)</option>
                <option value="long">Long (40+ hours)</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredCourses.length} of {courses.length} courses
            </p>
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl shadow-elegant overflow-hidden hover:shadow-2xl transition-all duration-300">
                {/* Course Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-elegant font-semibold text-primary-900 leading-tight">
                      {course.title}
                    </h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatPrice(course.price)}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-silver-600 text-sm line-clamp-3 mb-4">
                    {course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center gap-4 text-sm text-silver-500 mb-4">
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{course.duration_hours} hours</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>👥</span>
                      <span>{course.enrollment_count} enrolled</span>
                    </div>
                    {course.max_students && (
                      <div className="flex items-center gap-1">
                        <span>📍</span>
                        <span>{course.available_slots} spots left</span>
                      </div>
                    )}
                  </div>

                  {/* Prerequisites */}
                  {course.prerequisites && Object.keys(course.prerequisites).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                        Prerequisites
                      </h4>
                      <p className="text-sm text-gray-600">
                        {course.prerequisites.description || 'Basic knowledge required'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Course Actions */}
                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    {getEnrollmentButton(course)}
                    
                    <button
                      onClick={() => router.push(`/academy/courses/${course.slug}`)}
                      className="w-full border border-purple-600 text-purple-600 px-6 py-2 rounded-xl font-medium hover:bg-purple-50 transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || priceFilter !== 'all' || durationFilter !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'No courses are currently available'}
            </p>
            {(searchQuery || priceFilter !== 'all' || durationFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPriceFilter('all');
                  setDurationFilter('all');
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-elegant p-8 text-white text-center">
          <h2 className="text-3xl font-elegant font-bold mb-4">
            Start Your Aesthetics Journey Today
          </h2>
          <p className="text-xl text-purple-100 mb-6 max-w-2xl mx-auto">
            Join thousands of practitioners who have advanced their careers with LEA Aesthetics Clinical Academy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/auth/signin')}
              className="bg-white text-purple-600 px-8 py-3 rounded-xl font-medium hover:bg-purple-50 transition-colors duration-200"
            >
              Sign Up Today
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="border border-white text-white px-8 py-3 rounded-xl font-medium hover:bg-white hover:text-purple-600 transition-colors duration-200"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
