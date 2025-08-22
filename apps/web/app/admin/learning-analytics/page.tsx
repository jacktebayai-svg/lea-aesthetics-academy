'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts';

interface LearningAnalytics {
  overview: {
    totalStudents: number;
    activeStudents: number;
    avgCompletionRate: number;
    avgEngagementScore: number;
    coursesCompleted: number;
    certificatesIssued: number;
  };
  studentPerformance: {
    performanceDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    topPerformers: Array<{
      studentId: string;
      studentName: string;
      avgScore: number;
      coursesCompleted: number;
      totalTime: number;
    }>;
    strugglingStudents: Array<{
      studentId: string;
      studentName: string;
      avgScore: number;
      timeStuck: number;
      lastActive: string;
    }>;
  };
  courseEffectiveness: {
    courseMetrics: Array<{
      courseId: string;
      courseName: string;
      enrollments: number;
      completionRate: number;
      averageScore: number;
      avgTimeToComplete: number;
      satisfactionScore: number;
      dropoffRate: number;
    }>;
    contentAnalysis: Array<{
      lessonId: string;
      lessonTitle: string;
      courseId: string;
      viewCount: number;
      avgTimeSpent: number;
      dropoffRate: number;
      quizPerformance: number;
    }>;
  };
  engagementPatterns: {
    dailyActivity: Array<{
      date: string;
      activeStudents: number;
      lessonsCompleted: number;
      quizzesTaken: number;
      timeSpent: number;
    }>;
    peakHours: Array<{
      hour: number;
      activity: number;
    }>;
    deviceUsage: Array<{
      device: string;
      users: number;
      sessions: number;
      avgDuration: number;
      color: string;
    }>;
  };
  predictiveInsights: {
    riskFactors: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
    recommendations: Array<{
      type: 'course' | 'student' | 'content';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      expectedImpact: string;
    }>;
    trends: Array<{
      metric: string;
      current: number;
      predicted: number;
      confidence: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
}

export default function LearningAnalyticsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'courses' | 'engagement' | 'predictions'>('overview');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const colors = {
    primary: '#9333ea',
    secondary: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (analytics === null) {
      fetchLearningAnalytics();
    }
  }, [dateRange, selectedCourse]);

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
      fetchLearningAnalytics();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/portal');
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('status', 'published')
        .order('title');

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const getDateRange = (range: string) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (range) {
      case '7d':
        startDate = subDays(endDate, 7);
        break;
      case '30d':
        startDate = subDays(endDate, 30);
        break;
      case '90d':
        startDate = subDays(endDate, 90);
        break;
      case '1y':
        startDate = subDays(endDate, 365);
        break;
    }

    return { startDate, endDate };
  };

  const fetchLearningAnalytics = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange(dateRange);

      // Fetch enrollments with progress
      const enrollmentQuery = supabase
        .from('course_enrollments')
        .select(`
          *,
          students (
            id,
            name,
            user_id
          ),
          courses (
            id,
            title,
            duration_weeks
          ),
          student_progress (
            lesson_id,
            completed_at,
            time_spent,
            quiz_attempts (
              score,
              max_score
            )
          )
        `)
        .gte('enrolled_at', startDate.toISOString())
        .lte('enrolled_at', endDate.toISOString());

      if (selectedCourse !== 'all') {
        enrollmentQuery.eq('course_id', selectedCourse);
      }

      const { data: enrollments, error: enrollmentsError } = await enrollmentQuery;
      if (enrollmentsError) throw enrollmentsError;

      // Fetch quiz attempts for performance analysis
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          course_quizzes (
            course_lessons (
              course_modules (
                courses (
                  id,
                  title
                )
              )
            )
          ),
          students (
            id,
            name
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Fetch assignment submissions
      const { data: assignments } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          course_assignments (
            course_lessons (
              course_modules (
                courses (
                  id,
                  title
                )
              )
            )
          ),
          students (
            id,
            name
          )
        `)
        .gte('submitted_at', startDate.toISOString())
        .lte('submitted_at', endDate.toISOString());

      // Process the data to generate analytics
      const processedAnalytics = processAnalyticsData(enrollments, quizAttempts, assignments);
      setAnalytics(processedAnalytics);

    } catch (err) {
      console.error('Error fetching learning analytics:', err);
      setError('Failed to load learning analytics');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (enrollments: any[], quizAttempts: any[], assignments: any[]): LearningAnalytics => {
    // Overview metrics
    const totalStudents = new Set(enrollments?.map(e => e.student_id)).size || 0;
    const activeStudents = enrollments?.filter(e => e.status === 'in_progress').length || 0;
    const completedCourses = enrollments?.filter(e => e.status === 'completed').length || 0;
    const avgCompletionRate = enrollments?.length > 0 ? (completedCourses / enrollments.length) * 100 : 0;

    // Student performance analysis
    const studentScores = new Map();
    quizAttempts?.forEach(attempt => {
      if (attempt.percentage !== null) {
        const studentId = attempt.student_id;
        if (!studentScores.has(studentId)) {
          studentScores.set(studentId, []);
        }
        studentScores.get(studentId).push(attempt.percentage);
      }
    });

    // Performance distribution
    const performanceRanges = [
      { range: '90-100%', min: 90, max: 100 },
      { range: '80-89%', min: 80, max: 89 },
      { range: '70-79%', min: 70, max: 79 },
      { range: '60-69%', min: 60, max: 69 },
      { range: 'Below 60%', min: 0, max: 59 }
    ];

    const performanceDistribution = performanceRanges.map(range => {
      let count = 0;
      studentScores.forEach(scores => {
        const avgScore = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
        if (avgScore >= range.min && avgScore <= range.max) {
          count++;
        }
      });
      return {
        range: range.range,
        count,
        percentage: totalStudents > 0 ? (count / totalStudents) * 100 : 0
      };
    });

    // Top performers
    const topPerformers = Array.from(studentScores.entries())
      .map(([studentId, scores]) => {
        const enrollment = enrollments?.find(e => e.student_id === studentId);
        const avgScore = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
        return {
          studentId,
          studentName: enrollment?.students?.name || 'Unknown',
          avgScore,
          coursesCompleted: enrollments?.filter(e => e.student_id === studentId && e.status === 'completed').length || 0,
          totalTime: 0 // Mock data
        };
      })
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    // Course effectiveness
    const courseMetricsMap = new Map();
    enrollments?.forEach(enrollment => {
      const courseId = enrollment.course_id;
      const course = enrollment.courses;
      
      if (!courseMetricsMap.has(courseId)) {
        courseMetricsMap.set(courseId, {
          courseId,
          courseName: course?.title || 'Unknown Course',
          enrollments: 0,
          completed: 0,
          totalScores: [],
          totalTime: 0
        });
      }

      const metrics = courseMetricsMap.get(courseId);
      metrics.enrollments += 1;
      
      if (enrollment.status === 'completed') {
        metrics.completed += 1;
      }
    });

    const courseMetrics = Array.from(courseMetricsMap.values()).map(course => ({
      ...course,
      completionRate: course.enrollments > 0 ? (course.completed / course.enrollments) * 100 : 0,
      averageScore: course.totalScores.length > 0 
        ? course.totalScores.reduce((sum: number, score: number) => sum + score, 0) / course.totalScores.length 
        : 0,
      avgTimeToComplete: 45, // Mock data
      satisfactionScore: 4.2, // Mock data
      dropoffRate: Math.random() * 20 // Mock data
    }));

    // Mock engagement patterns
    const dailyActivity = generateDailyActivity(getDateRange(dateRange).startDate, getDateRange(dateRange).endDate);
    const peakHours = generatePeakHours();
    const deviceUsage = [
      { device: 'Desktop', users: 156, sessions: 1240, avgDuration: 28, color: colors.primary },
      { device: 'Mobile', users: 89, sessions: 756, avgDuration: 15, color: colors.secondary },
      { device: 'Tablet', users: 34, sessions: 298, avgDuration: 22, color: colors.success }
    ];

    // Mock predictive insights
    const riskFactors = [
      { factor: 'Low engagement in first week', impact: 85, description: 'Students inactive for >3 days in first week' },
      { factor: 'Quiz failure rate >50%', impact: 72, description: 'Multiple failed quiz attempts' },
      { factor: 'No lesson completion in 7 days', impact: 68, description: 'Extended periods of inactivity' }
    ];

    const recommendations = [
      {
        type: 'student' as const,
        priority: 'high' as const,
        title: 'Implement early intervention program',
        description: 'Reach out to students showing early warning signs of disengagement',
        expectedImpact: '+15% retention rate'
      },
      {
        type: 'content' as const,
        priority: 'medium' as const,
        title: 'Optimize lesson 3 content',
        description: 'High dropoff rate detected in lesson 3 across multiple courses',
        expectedImpact: '+8% completion rate'
      },
      {
        type: 'course' as const,
        priority: 'low' as const,
        title: 'Add interactive elements',
        description: 'Courses with interactive content show 20% higher engagement',
        expectedImpact: '+12% engagement score'
      }
    ];

    const trends = [
      { metric: 'Completion Rate', current: avgCompletionRate, predicted: avgCompletionRate + 5.2, confidence: 87, trend: 'up' as const },
      { metric: 'Average Score', current: 78.5, predicted: 81.2, confidence: 74, trend: 'up' as const },
      { metric: 'Engagement Score', current: 72.8, predicted: 69.4, confidence: 82, trend: 'down' as const }
    ];

    return {
      overview: {
        totalStudents,
        activeStudents,
        avgCompletionRate,
        avgEngagementScore: 72.8, // Mock data
        coursesCompleted: completedCourses,
        certificatesIssued: Math.floor(completedCourses * 0.8) // Mock data
      },
      studentPerformance: {
        performanceDistribution,
        topPerformers,
        strugglingStudents: [] // Mock data
      },
      courseEffectiveness: {
        courseMetrics,
        contentAnalysis: [] // Mock data
      },
      engagementPatterns: {
        dailyActivity,
        peakHours,
        deviceUsage
      },
      predictiveInsights: {
        riskFactors,
        recommendations,
        trends
      }
    };
  };

  const generateDailyActivity = (startDate: Date, endDate: Date) => {
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push({
        date: format(current, 'MMM dd'),
        activeStudents: Math.floor(Math.random() * 80) + 20,
        lessonsCompleted: Math.floor(Math.random() * 150) + 50,
        quizzesTaken: Math.floor(Math.random() * 60) + 20,
        timeSpent: Math.floor(Math.random() * 400) + 200
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const generatePeakHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      let activity;
      if (i >= 6 && i <= 10) activity = Math.floor(Math.random() * 30) + 40; // Morning peak
      else if (i >= 14 && i <= 16) activity = Math.floor(Math.random() * 25) + 35; // Afternoon peak
      else if (i >= 19 && i <= 22) activity = Math.floor(Math.random() * 40) + 60; // Evening peak
      else activity = Math.floor(Math.random() * 20) + 5; // Off hours
      
      hours.push({ hour: i, activity });
    }
    return hours;
  };

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

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Learning Analytics Unavailable</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchLearningAnalytics()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Analytics</h1>
              <p className="text-gray-600 mt-1">Advanced insights into student performance and course effectiveness</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Course Filter */}
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>

              {/* Date Range */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 border-b">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'performance', label: 'Student Performance', icon: '🎯' },
              { key: 'courses', label: 'Course Analytics', icon: '📚' },
              { key: 'engagement', label: 'Engagement', icon: '💡' },
              { key: 'predictions', label: 'Predictions', icon: '🔮' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedView(tab.key as any)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  selectedView === tab.key
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {selectedView === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <div className="text-2xl mb-2">👨‍🎓</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.overview.totalStudents}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <div className="text-2xl mb-2">🟢</div>
                <div className="text-2xl font-bold text-green-600">{analytics.overview.activeStudents}</div>
                <div className="text-sm text-gray-600">Active Students</div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-2xl font-bold text-purple-600">{analytics.overview.avgCompletionRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <div className="text-2xl mb-2">💡</div>
                <div className="text-2xl font-bold text-blue-600">{analytics.overview.avgEngagementScore.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Engagement Score</div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-2xl font-bold text-green-600">{analytics.overview.coursesCompleted}</div>
                <div className="text-sm text-gray-600">Courses Completed</div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-2xl font-bold text-yellow-600">{analytics.overview.certificatesIssued}</div>
                <div className="text-sm text-gray-600">Certificates Issued</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Daily Activity */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Learning Activity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.engagementPatterns.dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="activeStudents" stroke={colors.primary} fill={`${colors.primary}20`} />
                    <Area type="monotone" dataKey="lessonsCompleted" stroke={colors.secondary} fill={`${colors.secondary}20`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Distribution */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.studentPerformance.performanceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill={colors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Student Performance Tab */}
        {selectedView === 'performance' && (
          <div className="space-y-8">
            {/* Top Performers */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Students</h3>
              <div className="space-y-4">
                {analytics.studentPerformance.topPerformers.map((student, index) => (
                  <div key={student.studentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-yellow-600 font-semibold text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{student.studentName}</div>
                        <div className="text-sm text-gray-500">{student.coursesCompleted} courses completed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">{student.avgScore.toFixed(1)}%</div>
                      <div className="text-sm text-gray-500">Average Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Trends */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.studentPerformance.performanceDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="percentage"
                      label={({ range, percentage }) => `${range}: ${percentage.toFixed(1)}%`}
                    >
                      {analytics.studentPerformance.performanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={[colors.success, colors.info, colors.warning, colors.danger, colors.primary][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Patterns</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Average Study Time</span>
                      <span className="font-medium">2.3 hrs/week</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Quiz Success Rate</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Assignment Completion</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Analytics Tab */}
        {selectedView === 'courses' && (
          <div className="space-y-8">
            {/* Course Effectiveness Table */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Effectiveness Metrics</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satisfaction</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dropoff Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.courseEffectiveness.courseMetrics.map((course) => (
                      <tr key={course.courseId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{course.courseName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {course.enrollments}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${course.completionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{course.completionRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {course.averageScore.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">⭐</span>
                            <span className="text-sm text-gray-600">{course.satisfactionScore.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            course.dropoffRate < 10 ? 'bg-green-100 text-green-800' : 
                            course.dropoffRate < 20 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.dropoffRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Tab */}
        {selectedView === 'engagement' && (
          <div className="space-y-8">
            {/* Peak Hours */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Peak Learning Hours</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.engagementPatterns.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Activity Level']} />
                  <Bar dataKey="activity" fill={colors.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Device Usage */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Device Usage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.engagementPatterns.deviceUsage}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="users"
                      label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.engagementPatterns.deviceUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Engagement Metrics</h3>
                <div className="space-y-4">
                  {analytics.engagementPatterns.deviceUsage.map((device, index) => (
                    <div key={device.device} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{device.device}</span>
                        <span className="text-sm text-gray-500">{device.users} users</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Sessions: </span>
                          <span className="font-medium">{device.sessions}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Avg Duration: </span>
                          <span className="font-medium">{device.avgDuration}min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {selectedView === 'predictions' && (
          <div className="space-y-8">
            {/* Risk Factors */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Factors for Student Success</h3>
              <div className="space-y-4">
                {analytics.predictiveInsights.riskFactors.map((factor, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{factor.factor}</span>
                      <span className="text-sm font-medium text-red-600">{factor.impact}% impact</span>
                    </div>
                    <p className="text-sm text-gray-600">{factor.description}</p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${factor.impact}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">AI-Powered Recommendations</h3>
              <div className="space-y-4">
                {analytics.predictiveInsights.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{rec.title}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rec.priority} priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                      <span className="text-sm font-medium text-green-600">{rec.expectedImpact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trend Predictions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Trend Predictions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analytics.predictiveInsights.trends.map((trend, index) => (
                  <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="text-lg font-medium text-gray-900 mb-2">{trend.metric}</div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-gray-600">{trend.current.toFixed(1)}</span>
                      <span className={`text-xl ${trend.trend === 'up' ? 'text-green-600' : trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                        {trend.trend === 'up' ? '↗️' : trend.trend === 'down' ? '↘️' : '➡️'}
                      </span>
                      <span className="text-2xl font-bold text-purple-600">{trend.predicted.toFixed(1)}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {trend.confidence}% confidence
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
