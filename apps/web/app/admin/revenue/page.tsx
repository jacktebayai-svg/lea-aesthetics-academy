'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, startOfYear, endOfYear } from 'date-fns';
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

interface RevenueData {
  overview: {
    totalRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    revenueGrowth: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  courseRevenue: Array<{
    courseId: string;
    courseName: string;
    enrollments: number;
    revenue: number;
    price: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    enrollments: number;
    averagePrice: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
    color: string;
  }>;
  refundsData: {
    totalRefunds: number;
    refundRate: number;
    refundsByReason: Array<{
      reason: string;
      count: number;
      amount: number;
    }>;
  };
  subscriptionsData: {
    active: number;
    churned: number;
    mrr: number;
    ltv: number;
  };
}

interface Transaction {
  id: string;
  amount: number;
  type: 'payment' | 'refund';
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  payment_method?: string;
  course_title?: string;
  student_name?: string;
  student_email?: string;
}

export default function AdminRevenuePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'payments' | 'refunds'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
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
    if (revenueData === null) {
      fetchRevenueData();
      fetchTransactions();
    }
  }, [dateRange]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, transactionFilter, searchQuery]);

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

      fetchRevenueData();
      fetchTransactions();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/portal');
    }
  };

  const getDateRange = (range: string) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate = startOfYear(new Date());
        break;
      default:
        startDate = new Date('2020-01-01');
    }

    return { startDate, endDate };
  };

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange(dateRange);

      // Fetch payments data
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          course_enrollments (
            courses (
              id,
              title,
              price
            ),
            students (
              name,
              user_id
            )
          )
        `)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch refunds data
      const { data: refunds, error: refundsError } = await supabase
        .from('refunds')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (refundsError) throw refundsError;

      // Calculate overview metrics
      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount / 100), 0) || 0;
      const totalRefunds = refunds?.reduce((sum, r) => sum + r.amount, 0) || 0;
      const netRevenue = totalRevenue - totalRefunds;

      // Calculate monthly revenue for current month
      const thisMonth = startOfMonth(new Date());
      const monthlyPayments = payments?.filter(p => new Date(p.created_at) >= thisMonth) || [];
      const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (p.amount / 100), 0);

      // Calculate yearly revenue
      const thisYear = startOfYear(new Date());
      const yearlyPayments = payments?.filter(p => new Date(p.created_at) >= thisYear) || [];
      const yearlyRevenue = yearlyPayments.reduce((sum, p) => sum + (p.amount / 100), 0);

      // Calculate growth
      const lastMonth = subMonths(thisMonth, 1);
      const lastMonthEnd = endOfMonth(lastMonth);
      const lastMonthPayments = payments?.filter(p => {
        const date = new Date(p.created_at);
        return date >= lastMonth && date <= lastMonthEnd;
      }) || [];
      const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + (p.amount / 100), 0);
      const revenueGrowth = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // Calculate average order value
      const averageOrderValue = payments?.length ? totalRevenue / payments.length : 0;

      // Group revenue by course
      const courseRevenueMap = new Map();
      payments?.forEach(payment => {
        const course = payment.course_enrollments?.courses;
        if (course) {
          const existing = courseRevenueMap.get(course.id) || {
            courseId: course.id,
            courseName: course.title,
            enrollments: 0,
            revenue: 0,
            price: course.price || 0
          };
          existing.enrollments += 1;
          existing.revenue += payment.amount / 100;
          courseRevenueMap.set(course.id, existing);
        }
      });

      // Generate monthly trends
      const monthlyTrends = generateMonthlyTrends(payments, startDate, endDate);

      // Payment methods breakdown
      const paymentMethodsMap = new Map();
      payments?.forEach(payment => {
        const method = payment.payment_method || 'Unknown';
        const existing = paymentMethodsMap.get(method) || { method, count: 0, amount: 0 };
        existing.count += 1;
        existing.amount += payment.amount / 100;
        paymentMethodsMap.set(method, existing);
      });

      const paymentMethods = Array.from(paymentMethodsMap.values()).map((pm, index) => ({
        ...pm,
        color: [colors.primary, colors.secondary, colors.success, colors.warning, colors.info][index % 5]
      }));

      // Refunds breakdown
      const refundsByReason = groupRefundsByReason(refunds);
      const refundRate = totalRevenue > 0 ? (totalRefunds / totalRevenue) * 100 : 0;

      // Mock subscription data (would be real in actual implementation)
      const subscriptionsData = {
        active: 156,
        churned: 12,
        mrr: 15600,
        ltv: 1250
      };

      const revenueData: RevenueData = {
        overview: {
          totalRevenue: netRevenue,
          monthlyRevenue,
          yearlyRevenue,
          revenueGrowth,
          averageOrderValue,
          conversionRate: 3.2 // Mock data
        },
        courseRevenue: Array.from(courseRevenueMap.values()),
        monthlyTrends,
        paymentMethods,
        refundsData: {
          totalRefunds,
          refundRate,
          refundsByReason
        },
        subscriptionsData
      };

      setRevenueData(revenueData);

    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { startDate, endDate } = getDateRange(dateRange);

      // Fetch payments
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          *,
          course_enrollments (
            courses (
              title
            ),
            students (
              name,
              users (
                email
              )
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      // Fetch refunds
      const { data: refunds } = await supabase
        .from('refunds')
        .select(`
          *,
          payments (
            course_enrollments (
              courses (
                title
              ),
              students (
                name,
                users (
                  email
                )
              )
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      // Combine and format transactions
      const allTransactions: Transaction[] = [];

      // Add payments
      payments?.forEach(payment => {
        const enrollment = payment.course_enrollments;
        allTransactions.push({
          id: payment.id,
          amount: payment.amount / 100,
          type: 'payment',
          status: payment.status,
          created_at: payment.created_at,
          payment_method: payment.payment_method,
          course_title: enrollment?.courses?.title,
          student_name: enrollment?.students?.name,
          student_email: enrollment?.students?.users?.email
        });
      });

      // Add refunds
      refunds?.forEach(refund => {
        const enrollment = refund.payments?.course_enrollments;
        allTransactions.push({
          id: refund.id,
          amount: refund.amount,
          type: 'refund',
          status: 'completed',
          created_at: refund.created_at,
          course_title: enrollment?.courses?.title,
          student_name: enrollment?.students?.name,
          student_email: enrollment?.students?.users?.email
        });
      });

      // Sort by date
      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(allTransactions);

    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const generateMonthlyTrends = (payments: any[], startDate: Date, endDate: Date) => {
    const trends = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const monthStart = startOfMonth(current);
      const monthEnd = endOfMonth(current);
      
      const monthPayments = payments?.filter(p => {
        const date = new Date(p.created_at);
        return date >= monthStart && date <= monthEnd;
      }) || [];

      const revenue = monthPayments.reduce((sum, p) => sum + (p.amount / 100), 0);
      const enrollments = monthPayments.length;
      const averagePrice = enrollments > 0 ? revenue / enrollments : 0;

      trends.push({
        month: format(current, 'MMM yyyy'),
        revenue,
        enrollments,
        averagePrice
      });

      current.setMonth(current.getMonth() + 1);
    }

    return trends;
  };

  const groupRefundsByReason = (refunds: any[]) => {
    const reasonMap = new Map();
    
    refunds?.forEach(refund => {
      const reason = refund.reason || 'Other';
      const existing = reasonMap.get(reason) || { reason, count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += refund.amount;
      reasonMap.set(reason, existing);
    });

    return Array.from(reasonMap.values());
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (transactionFilter !== 'all') {
      filtered = filtered.filter(t => {
        if (transactionFilter === 'payments') return t.type === 'payment';
        if (transactionFilter === 'refunds') return t.type === 'refund';
        return true;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.student_name?.toLowerCase().includes(query) ||
        t.student_email?.toLowerCase().includes(query) ||
        t.course_title?.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(filtered);
  };

  const exportReport = async (format: 'csv' | 'pdf') => {
    try {
      setExporting(true);

      // Prepare data for export
      const reportData = {
        overview: revenueData?.overview,
        courseRevenue: revenueData?.courseRevenue,
        transactions: filteredTransactions,
        dateRange: `${format(getDateRange(dateRange).startDate, 'MMM d, yyyy')} - ${format(getDateRange(dateRange).endDate, 'MMM d, yyyy')}`
      };

      if (format === 'csv') {
        downloadCSV(reportData);
      } else {
        // In a real implementation, you would call an API to generate PDF
        console.log('PDF export would be implemented here');
      }

    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report');
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  const downloadCSV = (data: any) => {
    const csvContent = [
      ['Transaction ID', 'Type', 'Amount', 'Status', 'Date', 'Course', 'Student', 'Email'],
      ...data.transactions.map((t: Transaction) => [
        t.id,
        t.type,
        t.amount.toFixed(2),
        t.status,
        format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss'),
        t.course_title || '',
        t.student_name || '',
        t.student_email || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  if (error || !revenueData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💰</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Revenue Data Unavailable</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchRevenueData()}
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
              <h1 className="text-3xl font-bold text-gray-900">Revenue & Financial Analytics</h1>
              <p className="text-gray-600 mt-1">Comprehensive financial performance tracking and insights</p>
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
                <option value="1y">This year</option>
                <option value="all">All time</option>
              </select>

              {/* Export Button */}
              <button 
                onClick={() => setShowExportModal(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                📊 Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">💰</div>
              <div className={`flex items-center text-sm font-medium ${
                revenueData.overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {revenueData.overview.revenueGrowth >= 0 ? '↗️' : '↘️'} {Math.abs(revenueData.overview.revenueGrowth).toFixed(1)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${revenueData.overview.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">📅</div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${revenueData.overview.monthlyRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">🛒</div>
              <div className="text-sm text-gray-600">AOV</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${revenueData.overview.averageOrderValue.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Average Order Value</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">💳</div>
              <div className="text-sm text-gray-600">Rate</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {revenueData.overview.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [`$${value}`, 'Revenue']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={colors.primary} 
                  fill={`${colors.primary}20`} 
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData.paymentMethods}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="amount"
                  label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                >
                  {revenueData.paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Revenue & Refunds */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Top Courses by Revenue */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Courses by Revenue</h3>
            <div className="space-y-4">
              {revenueData.courseRevenue.slice(0, 5).map((course, index) => (
                <div key={course.courseId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{course.courseName}</div>
                      <div className="text-sm text-gray-500">{course.enrollments} enrollments</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${course.revenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">${course.price}/course</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refunds Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Refunds Overview</h3>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  ${revenueData.refundsData.totalRefunds.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Refunds</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {revenueData.refundsData.refundRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Refund Rate</div>
              </div>

              {revenueData.refundsData.refundsByReason.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">By Reason</h4>
                  <div className="space-y-2">
                    {revenueData.refundsData.refundsByReason.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.reason}</span>
                        <span className="font-medium">${item.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            
            <div className="flex items-center gap-4">
              {/* Filter */}
              <select
                value={transactionFilter}
                onChange={(e) => setTransactionFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              >
                <option value="all">All Transactions</option>
                <option value="payments">Payments Only</option>
                <option value="refunds">Refunds Only</option>
              </select>

              {/* Search */}
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.slice(0, 20).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.type === 'payment' ? '💳' : '↩️'} {transaction.id.substring(0, 8)}...
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.payment_method || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.student_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.student_email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.course_title || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        transaction.type === 'payment' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'payment' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(transaction.created_at), 'h:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">No transactions found</div>
              <div className="text-sm text-gray-400">
                {searchQuery || transactionFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Transactions will appear here as they occur'
                }
              </div>
            </div>
          )}
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Export Revenue Report</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Export revenue data for the selected date range: <br/>
                      <strong>{format(getDateRange(dateRange).startDate, 'MMM d, yyyy')} - {format(getDateRange(dateRange).endDate, 'MMM d, yyyy')}</strong>
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => exportReport('csv')}
                      disabled={exporting}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">CSV Export</div>
                          <div className="text-sm text-green-100">Spreadsheet-friendly format</div>
                        </div>
                        <div className="text-xl">📊</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => exportReport('pdf')}
                      disabled={exporting}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">PDF Report</div>
                          <div className="text-sm text-red-100">Professional formatted report</div>
                        </div>
                        <div className="text-xl">📄</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
