'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_weeks: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  average_rating?: number;
  course_modules: {
    id: string;
    title: string;
    course_lessons: {
      id: string;
      title: string;
    }[];
  }[];
  course_enrollments: {
    id: string;
    status: string;
    created_at: string;
    student: {
      id: string;
      name: string;
    };
  }[];
  _count: {
    course_enrollments: number;
    course_modules: number;
  };
}

interface NewCourse {
  title: string;
  description: string;
  price: number;
  duration_weeks: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string;
  learning_objectives: string[];
  status: 'draft' | 'published';
  category_id?: string;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'revenue'>('newest');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [newCourse, setNewCourse] = useState<NewCourse>({
    title: '',
    description: '',
    price: 0,
    duration_weeks: 4,
    difficulty_level: 'beginner',
    prerequisites: '',
    learning_objectives: [''],
    status: 'draft'
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Courses', count: 0 },
    { value: 'published', label: 'Published', count: 0 },
    { value: 'draft', label: 'Drafts', count: 0 },
    { value: 'archived', label: 'Archived', count: 0 }
  ];

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchQuery, statusFilter, sortBy]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push('/auth/signin');
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        router.push('/portal');
        return;
      }

      fetchCourses();
      fetchCategories();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/portal');
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules (
            id,
            title,
            course_lessons (
              id,
              title
            )
          ),
          course_enrollments (
            id,
            status,
            created_at,
            student:students (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Add counts to courses
      const coursesWithCounts = data?.map(course => ({
        ...course,
        _count: {
          course_enrollments: course.course_enrollments?.length || 0,
          course_modules: course.course_modules?.length || 0
        }
      })) || [];

      setCourses(coursesWithCounts as Course[]);

    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const filterAndSortCourses = () => {
    let filtered = courses;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
      );
    }

    // Sort courses
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b._count.course_enrollments - a._count.course_enrollments);
        break;
      case 'revenue':
        filtered.sort((a, b) => (b._count.course_enrollments * b.price) - (a._count.course_enrollments * a.price));
        break;
    }

    setFilteredCourses(filtered);
  };

  const createCourse = async () => {
    if (!newCourse.title.trim() || !newCourse.description.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: newCourse.title.trim(),
          description: newCourse.description.trim(),
          price: newCourse.price,
          duration_weeks: newCourse.duration_weeks,
          difficulty_level: newCourse.difficulty_level,
          prerequisites: newCourse.prerequisites.trim() || null,
          learning_objectives: newCourse.learning_objectives.filter(obj => obj.trim()),
          status: newCourse.status,
          category_id: newCourse.category_id || null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add to courses list
      const newCourseWithCounts = {
        ...data,
        course_modules: [],
        course_enrollments: [],
        _count: {
          course_enrollments: 0,
          course_modules: 0
        }
      } as Course;

      setCourses(prev => [newCourseWithCounts, ...prev]);
      setShowCreateModal(false);
      resetNewCourse();

      // Navigate to course builder
      router.push(`/admin/courses/${data.id}/builder`);

    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const resetNewCourse = () => {
    setNewCourse({
      title: '',
      description: '',
      price: 0,
      duration_weeks: 4,
      difficulty_level: 'beginner',
      prerequisites: '',
      learning_objectives: [''],
      status: 'draft'
    });
  };

  const updateCourseStatus = async (courseId: string, status: Course['status']) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', courseId);

      if (error) throw error;

      setCourses(prev => prev.map(course =>
        course.id === courseId ? { ...course, status } : course
      ));

    } catch (err) {
      console.error('Error updating course status:', err);
      setError('Failed to update course status');
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      setCourses(prev => prev.filter(course => course.id !== courseId));

    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course');
    }
  };

  const handleBulkAction = async (action: 'publish' | 'draft' | 'archive' | 'delete') => {
    if (selectedCourses.size === 0) return;

    const courseIds = Array.from(selectedCourses);
    
    try {
      if (action === 'delete') {
        if (!confirm(`Are you sure you want to delete ${courseIds.length} courses? This action cannot be undone.`)) {
          return;
        }

        const { error } = await supabase
          .from('courses')
          .delete()
          .in('id', courseIds);

        if (error) throw error;

        setCourses(prev => prev.filter(course => !courseIds.includes(course.id)));
      } else {
        const status = action === 'publish' ? 'published' : action === 'draft' ? 'draft' : 'archived';
        
        const { error } = await supabase
          .from('courses')
          .update({ status, updated_at: new Date().toISOString() })
          .in('id', courseIds);

        if (error) throw error;

        setCourses(prev => prev.map(course =>
          courseIds.includes(course.id) ? { ...course, status } : course
        ));
      }

      setSelectedCourses(new Set());
      setShowBulkActions(false);

    } catch (err) {
      console.error('Error performing bulk action:', err);
      setError('Failed to perform bulk action');
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    const newSelection = new Set(selectedCourses);
    if (newSelection.has(courseId)) {
      newSelection.delete(courseId);
    } else {
      newSelection.add(courseId);
    }
    setSelectedCourses(newSelection);
  };

  const selectAllCourses = () => {
    if (selectedCourses.size === filteredCourses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(filteredCourses.map(course => course.id)));
    }
  };

  const getDifficultyInfo = (level: string) => {
    return difficultyLevels.find(d => d.value === level) || difficultyLevels[0];
  };

  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addLearningObjective = () => {
    setNewCourse(prev => ({
      ...prev,
      learning_objectives: [...prev.learning_objectives, '']
    }));
  };

  const updateLearningObjective = (index: number, value: string) => {
    setNewCourse(prev => ({
      ...prev,
      learning_objectives: prev.learning_objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeLearningObjective = (index: number) => {
    if (newCourse.learning_objectives.length > 1) {
      setNewCourse(prev => ({
        ...prev,
        learning_objectives: prev.learning_objectives.filter((_, i) => i !== index)
      }));
    }
  };

  // Update status options with counts
  const updatedStatusOptions = statusOptions.map(option => ({
    ...option,
    count: option.value === 'all' 
      ? courses.length
      : courses.filter(course => course.status === option.value).length
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
              <p className="text-gray-600 mt-1">Create, manage, and monitor all your courses</p>
            </div>
            
            <div className="flex items-center gap-4">
              {selectedCourses.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{selectedCourses.size} selected</span>
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Bulk Actions
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200"
              >
                + Create Course
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Status Filter */}
            <div className="flex gap-2">
              {updatedStatusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    statusFilter === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label} {option.count > 0 && `(${option.count})`}
                </button>
              ))}
            </div>

            <div className="flex gap-4 flex-1 lg:justify-end">
              {/* Search */}
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 flex-1 lg:max-w-sm"
              />

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="revenue">Highest Revenue</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions Menu */}
          {showBulkActions && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('draft')}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                >
                  Move to Draft
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Archive
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-2">⚠️</div>
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' 
                ? 'No courses found' 
                : 'No courses created yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Create your first course to get started with the LMS!'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
              >
                Create First Course
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCourses.size === filteredCourses.length && filteredCourses.length > 0}
                  onChange={selectAllCourses}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Select All ({filteredCourses.length} courses)
                </span>
              </label>
            </div>

            {/* Courses List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-200 ${
                    selectedCourses.has(course.id) 
                      ? 'border-purple-300 bg-purple-50' 
                      : 'border-transparent hover:shadow-md'
                  }`}
                >
                  {/* Course Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCourses.has(course.id)}
                          onChange={() => toggleCourseSelection(course.id)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                      </label>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyInfo(course.difficulty_level).color}`}>
                          {getDifficultyInfo(course.difficulty_level).label}
                        </span>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>💰 ${course.price}</span>
                        <span>⏰ {course.duration_weeks} weeks</span>
                        <span>📚 {course._count.course_modules} modules</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{course._count.course_enrollments}</div>
                        <div className="text-xs text-gray-600">Students</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">
                          ${(course._count.course_enrollments * course.price).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Revenue</div>
                      </div>
                    </div>

                    {/* Rating */}
                    {course.average_rating && (
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-yellow-400 mr-1">⭐</span>
                        <span className="font-medium">{course.average_rating.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm ml-1">rating</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/courses/${course.id}/builder`)}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
                      >
                        Edit Course
                      </button>
                      <button
                        onClick={() => router.push(`/admin/courses/${course.id}/students`)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                      >
                        Students
                      </button>
                    </div>

                    {/* Status Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      {course.status === 'draft' && (
                        <button
                          onClick={() => updateCourseStatus(course.id, 'published')}
                          className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                        >
                          Publish
                        </button>
                      )}
                      {course.status === 'published' && (
                        <button
                          onClick={() => updateCourseStatus(course.id, 'draft')}
                          className="flex-1 bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700"
                        >
                          Unpublish
                        </button>
                      )}
                      <button
                        onClick={() => updateCourseStatus(course.id, 'archived')}
                        className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="px-3 py-1 border border-red-300 text-red-700 rounded text-xs hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Created Date */}
                    <div className="text-xs text-gray-500 mt-3 text-center">
                      Created {format(new Date(course.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Course Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-semibold text-gray-900">Create New Course</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter course title..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newCourse.description}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical"
                      placeholder="Describe what students will learn in this course..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (weeks)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={newCourse.duration_weeks}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, duration_weeks: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={newCourse.difficulty_level}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, difficulty_level: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {difficultyLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newCourse.category_id || ''}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, category_id: e.target.value || undefined }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select category (optional)</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Prerequisites */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prerequisites
                  </label>
                  <textarea
                    value={newCourse.prerequisites}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, prerequisites: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical"
                    placeholder="What knowledge or skills should students have before taking this course?"
                  />
                </div>

                {/* Learning Objectives */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Objectives
                  </label>
                  {newCourse.learning_objectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => updateLearningObjective(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="What will students be able to do after this course?"
                      />
                      {newCourse.learning_objectives.length > 1 && (
                        <button
                          onClick={() => removeLearningObjective(index)}
                          className="px-2 py-2 text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addLearningObjective}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    + Add Learning Objective
                  </button>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Status
                  </label>
                  <select
                    value={newCourse.status}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="draft">Draft (not visible to students)</option>
                    <option value="published">Published (visible to students)</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetNewCourse();
                  }}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={createCourse}
                  disabled={creating || !newCourse.title.trim() || !newCourse.description.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Course'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
