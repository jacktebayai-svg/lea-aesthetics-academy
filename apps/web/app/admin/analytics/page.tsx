'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AnalyticsData {
  revenue: {
    total: number;
    monthlyGrowth: number;
    thisMonth: number;
    lastMonth: number;
    chartData: Array<{
      month: string;
      revenue: number;
      enrollments: number;
    }>;
  };
  students: {
    totalActive: number;
    newThisMonth: number;
    completionRate: number;
    engagementScore: number;
    demographics: Array<{
      name: string;
      value: number;
      color: string;
    }>;
  };
  courses: {
    totalCourses: number;
    avgCompletionRate: number;
    popularCourses: Array<{
      id: string;
      title: string;
      enrollments: number;
      revenue: number;
      rating: number;
      completionRate: number;
    }>;
    coursePerformance: Array<{
      course: string;
      enrolled: number;
      completed: number;
      dropped: number;
    }>;
  };
  engagement: {
    dailyActiveUsers: Array<{
      date: string;
      active: number;
      lessons: number;
      discussions: number;
    }>;
    contentMetrics: {
      totalLessons: number;
      avgLessonTime: number;
      quizzesTaken: number;
      assignmentsSubmitted: number;
      discussionPosts: number;
    };
  };
}

interface KPICard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'students' | 'engagement'>('revenue');
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
      fetchAnalyticsData();
    }
  }, [dateRange]);

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

      fetchAnalyticsData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/portal');
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const endDate = new Date();
      const startDate = getStartDate(dateRange, endDate);

      // Fetch revenue data
      const revenueData = await fetchRevenueAnalytics(startDate, endDate);
      
      // Fetch student data
      const studentData = await fetchStudentAnalytics(startDate, endDate);
      
      // Fetch course data
      const courseData = await fetchCourseAnalytics();
      
      // Fetch engagement data
      const engagementData = await fetchEngagementAnalytics(startDate, endDate);

      setAnalytics({
        revenue: revenueData,
        students: studentData,
        courses: courseData,
        engagement: engagementData
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (range: string, endDate: Date) => {
    switch (range) {
      case '7d':
        return startOfWeek(new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000));
      case '30d':
        return new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  const fetchRevenueAnalytics = async (startDate: Date, endDate: Date) => {
    // Fetch payment data
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, created_at, status')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('created_at, courses(price)')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Calculate totals
    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount / 100), 0) || 0;
    const thisMonth = startOfMonth(new Date());
    const lastMonth = startOfMonth(subMonths(new Date(), 1));

    const thisMonthRevenue = payments?.filter(p => 
      new Date(p.created_at) >= thisMonth
    ).reduce((sum, p) => sum + (p.amount / 100), 0) || 0;

    const lastMonthRevenue = payments?.filter(p => 
      new Date(p.created_at) >= lastMonth && new Date(p.created_at) < thisMonth
    ).reduce((sum, p) => sum + (p.amount / 100), 0) || 0;

    const monthlyGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Generate chart data
    const chartData = generateMonthlyData(payments, enrollments, startDate, endDate);

    return {
      total: totalRevenue,
      monthlyGrowth,
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      chartData
    };
  };

  const fetchStudentAnalytics = async (startDate: Date, endDate: Date) => {
    // Fetch student data
    const { data: allStudents } = await supabase
      .from('students')
      .select('created_at, user_id');

    const { data: newStudents } = await supabase
      .from('students')
      .select('created_at')
      .gte('created_at', startOfMonth(new Date()).toISOString());

    const { data: completions } = await supabase
      .from('course_enrollments')
      .select('status')
      .eq('status', 'completed');

    const { data: totalEnrollments } = await supabase
      .from('course_enrollments')
      .select('id');

    const totalActive = allStudents?.length || 0;
    const newThisMonth = newStudents?.length || 0;
    const completionRate = totalEnrollments?.length > 0 
      ? ((completions?.length || 0) / totalEnrollments.length) * 100 
      : 0;

    // Mock engagement score (would calculate from actual activity)
    const engagementScore = 78.5;

    // Mock demographics data
    const demographics = [
      { name: 'Professionals', value: 45, color: colors.primary },
      { name: 'Students', value: 30, color: colors.secondary },
      { name: 'Career Changers', value: 25, color: colors.success }
    ];

    return {
      totalActive,
      newThisMonth,
      completionRate,
      engagementScore,
      demographics
    };
  };

  const fetchCourseAnalytics = async () => {
    const { data: courses } = await supabase
      .from('courses')
      .select(`
        *,
        course_enrollments (
          id,
          status,
          created_at
        )
      `);

    const totalCourses = courses?.length || 0;
    
    // Calculate popular courses
    const popularCourses = courses?.map(course => ({
      id: course.id,
      title: course.title,
      enrollments: course.course_enrollments?.length || 0,
      revenue: (course.course_enrollments?.length || 0) * (course.price || 0),
      rating: course.average_rating || 0,
      completionRate: calculateCompletionRate(course.course_enrollments)
    }))
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 5) || [];

    const avgCompletionRate = popularCourses.length > 0
      ? popularCourses.reduce((sum, course) => sum + course.completionRate, 0) / popularCourses.length
      : 0;

    // Course performance data for charts
    const coursePerformance = popularCourses.map(course => ({
      course: course.title.substring(0, 20) + '...',
      enrolled: course.enrollments,
      completed: Math.floor(course.enrollments * (course.completionRate / 100)),
      dropped: Math.floor(course.enrollments * (1 - course.completionRate / 100))
    }));

    return {
      totalCourses,
      avgCompletionRate,
      popularCourses,
      coursePerformance
    };
  };

  const fetchEngagementAnalytics = async (startDate: Date, endDate: Date) => {
    // Mock daily active users data (would fetch from actual activity logs)
    const dailyActiveUsers = generateDailyEngagementData(startDate, endDate);

    // Fetch content metrics
    const { data: lessons } = await supabase
      .from('course_lessons')
      .select('id');

    const { data: quizAttempts } = await supabase
      .from('quiz_attempts')
      .select('id')
      .gte('created_at', startDate.toISOString());

    const { data: assignments } = await supabase
      .from('assignment_submissions')
      .select('id')
      .gte('submitted_at', startDate.toISOString());

    const { data: discussions } = await supabase
      .from('course_discussions')
      .select('id')
      .gte('created_at', startDate.toISOString());

    const contentMetrics = {
      totalLessons: lessons?.length || 0,
      avgLessonTime: 12.5, // Mock data
      quizzesTaken: quizAttempts?.length || 0,
      assignmentsSubmitted: assignments?.length || 0,
      discussionPosts: discussions?.length || 0
    };

    return {
      dailyActiveUsers,
      contentMetrics
    };
  };

  const calculateCompletionRate = (enrollments: any[]) => {
    if (!enrollments || enrollments.length === 0) return 0;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    return (completed / enrollments.length) * 100;
  };

  const generateMonthlyData = (payments: any[], enrollments: any[], startDate: Date, endDate: Date) => {
    const months = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const monthStart = startOfMonth(current);
      const monthEnd = endOfMonth(current);
      
      const monthRevenue = payments?.filter(p => {
        const date = new Date(p.created_at);
        return date >= monthStart && date <= monthEnd;
      }).reduce((sum, p) => sum + (p.amount / 100), 0) || 0;

      const monthEnrollments = enrollments?.filter(e => {
        const date = new Date(e.created_at);
        return date >= monthStart && date <= monthEnd;
      }).length || 0;

      months.push({
        month: format(current, 'MMM yyyy'),
        revenue: monthRevenue,
        enrollments: monthEnrollments
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  const generateDailyEngagementData = (startDate: Date, endDate: Date) => {
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push({
        date: format(current, 'MMM dd'),
        active: Math.floor(Math.random() * 100) + 50,
        lessons: Math.floor(Math.random() * 50) + 20,
        discussions: Math.floor(Math.random() * 30) + 10
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getKPICards = (): KPICard[] => {
    if (!analytics) return [];

    return [
      {
        title: 'Total Revenue',
        value: `$${analytics.revenue.total.toLocaleString()}`,
        change: analytics.revenue.monthlyGrowth,
        trend: analytics.revenue.monthlyGrowth >= 0 ? 'up' : 'down',
        icon: '💰',
        color: colors.success
      },
      {
        title: 'Active Students',
        value: analytics.students.totalActive,
        change: ((analytics.students.newThisMonth / analytics.students.totalActive) * 100),
        trend: 'up',
        icon: '👨‍🎓',
        color: colors.primary
      },
      {
        title: 'Course Completion',
        value: `${analytics.students.completionRate.toFixed(1)}%`,
        change: 5.2,
        trend: 'up',
        icon: '🎯',
        color: colors.info
      },
      {
        title: 'Engagement Score',
        value: `${analytics.students.engagementScore}%`,
        change: 2.1,
        trend: 'up',
        icon: '📊',
        color: colors.secondary
      }
    ];
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Analytics Unavailable</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchAnalyticsData()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const kpis = getKPICards();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive business intelligence and performance metrics</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Date Range Selector */}
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

              {/* Export Button */}
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                📊 Export Report
              </button>
            </div>
          </div>

          {/* Metric Tabs */}
          <div className="flex space-x-1 border-b">
            {[
              { key: 'revenue', label: 'Revenue', icon: '💰' },
              { key: 'students', label: 'Students', icon: '👨‍🎓' },
              { key: 'engagement', label: 'Engagement', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedMetric(tab.key as any)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  selectedMetric === tab.key
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{kpi.icon}</div>
                <div className={`flex items-center text-sm font-medium ${
                  kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {kpi.trend === 'up' ? '↗️' : kpi.trend === 'down' ? '↘️' : '➡️'} {Math.abs(kpi.change).toFixed(1)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
              <div className="text-sm text-gray-600">{kpi.title}</div>
            </div>
          ))}
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue & Enrollments</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
                  Revenue
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-cyan-600 rounded-full mr-2"></div>
                  Enrollments
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.revenue.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${value}` : value,
                    name === 'revenue' ? 'Revenue' : 'Enrollments'
                  ]}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke={colors.primary} fill={`${colors.primary}20`} strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="enrollments" stroke={colors.secondary} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Course Performance */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.courses.coursePerformance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="course" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="enrolled" fill={colors.primary} name="Enrolled" />
                <Bar dataKey="completed" fill={colors.success} name="Completed" />
                <Bar dataKey="dropped" fill={colors.danger} name="Dropped" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Student Demographics */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Demographics</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics?.students.demographics || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics?.students.demographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Engagement */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Active Users</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics?.engagement.dailyActiveUsers || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="active" stroke={colors.primary} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Content Metrics */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Content Engagement</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Lessons', value: analytics?.engagement.contentMetrics.totalLessons || 0, icon: '📚' },
                { label: 'Avg. Lesson Time', value: `${analytics?.engagement.contentMetrics.avgLessonTime || 0} min`, icon: '⏱️' },
                { label: 'Quizzes Taken', value: analytics?.engagement.contentMetrics.quizzesTaken || 0, icon: '🧠' },
                { label: 'Assignments Submitted', value: analytics?.engagement.contentMetrics.assignmentsSubmitted || 0, icon: '📝' },
                { label: 'Discussion Posts', value: analytics?.engagement.contentMetrics.discussionPosts || 0, icon: '💬' }
              ].map((metric, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{metric.icon}</span>
                    <span className="text-sm text-gray-600">{metric.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Courses Table */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Courses</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Enrollments</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Completion Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rating</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.courses.popularCourses.map((course, index) => (
                  <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{course.title}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{course.enrollments}</td>
                    <td className="py-4 px-4 text-gray-600">${course.revenue.toLocaleString()}</td>
                    <td className="py-4 px-4">
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
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">⭐</span>
                        <span className="text-gray-600">{course.rating.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
