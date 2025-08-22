'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import StudentLayout from '../../../../../../components/portal/StudentLayout';

interface Discussion {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  pinned: boolean;
  locked: boolean;
  category: 'general' | 'help' | 'announcements' | 'assignments' | 'study_group';
  view_count: number;
  student: {
    id: string;
    name: string;
    profile_picture?: string;
  };
  course_modules?: {
    id: string;
    title: string;
  };
  discussion_replies: Array<{
    id: string;
    content: string;
    created_at: string;
    student: {
      id: string;
      name: string;
      profile_picture?: string;
    };
  }>;
  _count: {
    discussion_replies: number;
  };
}

interface Course {
  id: string;
  title: string;
  course_modules: Array<{
    id: string;
    title: string;
  }>;
}

export default function DiscussionsPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  
  const courseId = params.courseId as string;
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState<Discussion[]>([]);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'replies'>('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: 'general' as Discussion['category'],
    module_id: ''
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'All Discussions', icon: '💬' },
    { value: 'general', label: 'General', icon: '🗨️' },
    { value: 'help', label: 'Help & Support', icon: '🙋‍♀️' },
    { value: 'announcements', label: 'Announcements', icon: '📢' },
    { value: 'assignments', label: 'Assignments', icon: '📝' },
    { value: 'study_group', label: 'Study Groups', icon: '👥' }
  ];

  useEffect(() => {
    fetchDiscussions();
  }, [courseId]);

  useEffect(() => {
    filterAndSortDiscussions();
  }, [discussions, selectedCategory, searchQuery, sortBy]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);

      // Get current user and student info
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push('/auth/signin');
        return;
      }

      const { data: student } = await supabase
        .from('students')
        .select('id, name, profile_picture')
        .eq('user_id', user.id)
        .single();

      if (!student) {
        throw new Error('Student profile not found');
      }

      setCurrentStudent(student);

      // Verify enrollment
      const { data: enrollment } = await supabase
        .from('course_enrollments')
        .select('id, status')
        .eq('student_id', student.id)
        .eq('course_id', courseId)
        .single();

      if (!enrollment || !['enrolled', 'in_progress'].includes(enrollment.status)) {
        router.push(`/academy/courses/${courseId}`);
        return;
      }

      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          course_modules (
            id,
            title
          )
        `)
        .eq('id', courseId)
        .single();

      if (courseError || !courseData) {
        throw new Error('Course not found');
      }

      setCourse(courseData as Course);

      // Fetch discussions
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('course_discussions')
        .select(`
          *,
          student:students (
            id,
            name,
            profile_picture
          ),
          course_modules (
            id,
            title
          ),
          discussion_replies (
            id,
            content,
            created_at,
            student:students (
              id,
              name,
              profile_picture
            )
          )
        `)
        .eq('course_id', courseId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (discussionsError) {
        console.error('Error fetching discussions:', discussionsError);
        throw new Error('Failed to fetch discussions');
      }

      // Process discussions to add reply counts
      const processedDiscussions = discussionsData?.map(discussion => ({
        ...discussion,
        _count: {
          discussion_replies: discussion.discussion_replies?.length || 0
        }
      })) || [];

      setDiscussions(processedDiscussions as Discussion[]);

    } catch (err) {
      console.error('Error fetching discussions:', err);
      setError('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDiscussions = () => {
    let filtered = discussions;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(discussion => discussion.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(discussion =>
        discussion.title.toLowerCase().includes(query) ||
        discussion.content.toLowerCase().includes(query)
      );
    }

    // Sort discussions
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.view_count - a.view_count);
        break;
      case 'replies':
        filtered.sort((a, b) => b._count.discussion_replies - a._count.discussion_replies);
        break;
    }

    // Always show pinned discussions first
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

    setFilteredDiscussions(filtered);
  };

  const createDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const { data, error } = await supabase
        .from('course_discussions')
        .insert({
          course_id: courseId,
          student_id: currentStudent.id,
          title: newDiscussion.title.trim(),
          content: newDiscussion.content.trim(),
          category: newDiscussion.category,
          module_id: newDiscussion.module_id || null
        })
        .select(`
          *,
          student:students (
            id,
            name,
            profile_picture
          ),
          course_modules (
            id,
            title
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      // Add to discussions list
      const newDiscussionWithCount = {
        ...data,
        discussion_replies: [],
        _count: {
          discussion_replies: 0
        }
      } as Discussion;

      setDiscussions(prev => [newDiscussionWithCount, ...prev]);
      setShowCreateModal(false);
      setNewDiscussion({
        title: '',
        content: '',
        category: 'general',
        module_id: ''
      });

    } catch (err) {
      console.error('Error creating discussion:', err);
      setError('Failed to create discussion');
    } finally {
      setCreating(false);
    }
  };

  const getCategoryInfo = (category: Discussion['category']) => {
    const info = categories.find(cat => cat.value === category);
    return info || { label: category, icon: '💬' };
  };

  const incrementViewCount = async (discussionId: string) => {
    // Increment view count when clicking on a discussion
    supabase
      .from('course_discussions')
      .update({ view_count: discussions.find(d => d.id === discussionId)?.view_count + 1 || 1 })
      .eq('id', discussionId)
      .then();
  };

  if (loading) {
    return (
      <StudentLayout title="Course Discussions">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </StudentLayout>
    );
  }

  if (error && !course) {
    return (
      <StudentLayout title="Discussions">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Discussions Not Available</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/portal/student/courses/${courseId}`)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Course
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title={`${course?.title} - Discussions`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <nav className="text-sm text-gray-500 mb-2">
                <button
                  onClick={() => router.push(`/portal/student/courses/${courseId}`)}
                  className="hover:text-purple-600"
                >
                  {course?.title}
                </button>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Discussions</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">Course Discussions</h1>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200"
            >
              + New Discussion
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Connect with your classmates, ask questions, and share insights about the course content.
          </p>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon} {category.label}
                </button>
              ))}
            </div>

            <div className="flex gap-4 flex-1 lg:justify-end">
              {/* Search */}
              <input
                type="text"
                placeholder="Search discussions..."
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
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="replies">Most Replies</option>
              </select>
            </div>
          </div>
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

        {/* Discussions List */}
        {filteredDiscussions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No discussions found' 
                : 'No discussions yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Be the first to start a discussion in this course!'
              }
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
              >
                Start First Discussion
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDiscussions.map((discussion) => (
              <div
                key={discussion.id}
                className={`bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 ${
                  discussion.pinned ? 'ring-2 ring-yellow-200' : ''
                }`}
                onClick={() => {
                  incrementViewCount(discussion.id);
                  router.push(`/portal/student/courses/${courseId}/discussions/${discussion.id}`);
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {discussion.student.profile_picture ? (
                      <img
                        src={discussion.student.profile_picture}
                        alt={discussion.student.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-purple-600 font-semibold text-lg">
                        {discussion.student.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {discussion.pinned && (
                          <span className="text-yellow-500 text-sm">📌</span>
                        )}
                        {discussion.locked && (
                          <span className="text-gray-500 text-sm">🔒</span>
                        )}
                        <span className="text-sm text-purple-600 font-medium">
                          {getCategoryInfo(discussion.category).icon} {getCategoryInfo(discussion.category).label}
                        </span>
                        {discussion.course_modules && (
                          <span className="text-sm text-gray-500">
                            • {discussion.course_modules.title}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Title and Content */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-purple-600">
                      {discussion.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {discussion.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>by {discussion.student.name}</span>
                        <span>👁️ {discussion.view_count}</span>
                        <span>💬 {discussion._count.discussion_replies} replies</span>
                      </div>
                      
                      {discussion.discussion_replies.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs">Last reply:</span>
                          <span className="font-medium">
                            {formatDistanceToNow(
                              new Date(discussion.discussion_replies[discussion.discussion_replies.length - 1].created_at),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Discussion Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-semibold text-gray-900">Create New Discussion</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discussion Title *
                  </label>
                  <input
                    type="text"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter a clear, descriptive title..."
                  />
                </div>

                {/* Category and Module */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={newDiscussion.category}
                      onChange={(e) => setNewDiscussion(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {categories.slice(1).map(category => (
                        <option key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Module (Optional)
                    </label>
                    <select
                      value={newDiscussion.module_id}
                      onChange={(e) => setNewDiscussion(prev => ({ ...prev, module_id: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">None</option>
                      {course?.course_modules.map(module => (
                        <option key={module.id} value={module.id}>
                          {module.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical"
                    placeholder="Share your thoughts, ask questions, or start a conversation..."
                  />
                </div>

                {/* Guidelines */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Discussion Guidelines</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Be respectful and constructive in your communication</li>
                    <li>• Stay on topic and provide valuable insights</li>
                    <li>• Search existing discussions before creating new ones</li>
                    <li>• Use clear, descriptive titles to help others find your discussion</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewDiscussion({ title: '', content: '', category: 'general', module_id: '' });
                  }}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={createDiscussion}
                  disabled={creating || !newDiscussion.title.trim() || !newDiscussion.content.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Discussion'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
