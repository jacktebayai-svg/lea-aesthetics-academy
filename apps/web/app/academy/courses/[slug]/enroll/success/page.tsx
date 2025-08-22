'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface Enrollment {
  id: string;
  status: string;
  created_at: string;
  progress: any;
  courses: {
    id: string;
    title: string;
    description: string;
    duration_hours: number;
  };
  payments?: {
    amount: number;
    status: string;
    paid_at: string;
  }[];
}

// Interface matching Supabase query result
interface EnrollmentQueryResult {
  id: string;
  status: string;
  created_at: string;
  progress: any;
  courses: {
    id: string;
    title: string;
    description: string;
    duration_hours: number;
  }[];
  payments?: {
    amount: number;
    status: string;
    paid_at: string;
  }[];
}

export default function EnrollmentSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const slug = params.slug as string;
  const enrollmentId = searchParams.get('enrollment_id');
  
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollmentDetails();
    } else {
      setError('No enrollment ID provided');
      setLoading(false);
    }
  }, [enrollmentId]);

  const fetchEnrollmentDetails = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push('/auth/signin');
        return;
      }

      // Get student record
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!student) {
        throw new Error('Student profile not found');
      }

      // Fetch enrollment details
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          status,
          created_at,
          progress,
          courses (
            id,
            title,
            description,
            duration_hours
          ),
          payments (
            amount,
            status,
            paid_at
          )
        `)
        .eq('id', enrollmentId)
        .eq('student_id', student.id)
        .single();

      if (enrollmentError || !enrollmentData) {
        throw new Error('Enrollment not found');
      }

      // Transform the query result to match our interface
      const queryResult = enrollmentData as EnrollmentQueryResult;
      const transformedEnrollment: Enrollment = {
        ...queryResult,
        courses: Array.isArray(queryResult.courses) ? queryResult.courses[0] : queryResult.courses
      };

      setEnrollment(transformedEnrollment);
    } catch (err) {
      console.error('Error fetching enrollment:', err);
      setError('Failed to load enrollment details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = () => {
    if (enrollment) {
      router.push(`/portal/student/courses/${enrollment.courses.id}` as any);
    }
  };

  const handleViewDashboard = () => {
    router.push('/portal/student');
  };

  const formatPrice = (amount: number) => {
    return `£${(amount / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">😞</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/academy')}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Browse Courses
            </button>
            <button
              onClick={() => router.push('/portal/student')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Student Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const payment = enrollment.payments?.[0];
  const isFree = !payment || payment.amount === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Enrollment Successful!
          </h1>
          <p className="text-xl text-gray-600">
            Welcome to your aesthetics education journey
          </p>
        </div>

        {/* Enrollment Summary */}
        <div className="bg-white rounded-2xl shadow-elegant p-8 mb-8">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-semibold text-purple-600 mb-2">
              {enrollment.courses.title}
            </h2>
            <p className="text-gray-600 mb-4">{enrollment.courses.description}</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>⏱️ {enrollment.courses.duration_hours} hours of content</span>
              <span>📅 Enrolled {format(new Date(enrollment.created_at), 'MMMM do, yyyy')}</span>
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  enrollment.status === 'enrolled' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                {enrollment.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Enrollment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Enrollment ID:</span>
                  <span className="font-mono text-xs">{enrollment.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="capitalize font-medium text-green-600">
                    {enrollment.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress:</span>
                  <span>{enrollment.progress?.completion_percentage || 0}% Complete</span>
                </div>
              </div>
            </div>

            {payment && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">
                      {isFree ? 'Free' : formatPrice(payment.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="capitalize font-medium text-green-600">
                      {payment.status}
                    </span>
                  </div>
                  {payment.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid On:</span>
                      <span>{format(new Date(payment.paid_at), 'MMM do, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-elegant p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">What's Next?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-3xl mb-3">📖</div>
              <h3 className="font-semibold text-gray-900 mb-2">Start Learning</h3>
              <p className="text-sm text-gray-600 mb-4">
                Access your course materials and begin your first lesson
              </p>
              <button
                onClick={handleStartLearning}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Start Course
              </button>
            </div>

            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-sm text-gray-600 mb-4">
                Monitor your learning journey and achievements
              </p>
              <button
                onClick={handleViewDashboard}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                View Dashboard
              </button>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Support</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect with instructors and fellow students
              </p>
              <button
                onClick={() => router.push('/support')}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Get Help
              </button>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 text-xl">💡</div>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Important Information</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• You have lifetime access to this course content</li>
                <li>• Check your email for course materials and important updates</li>
                <li>• Complete lessons in order to track your progress properly</li>
                <li>• Contact support if you need help accessing your course</li>
                {!isFree && (
                  <li>• Your payment receipt has been sent to your email address</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartLearning}
              className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-200"
            >
              Start Learning Now
            </button>
            <button
              onClick={() => router.push('/academy')}
              className="border border-purple-600 text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors duration-200"
            >
              Browse More Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
