'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentLayout from '../../../components/portal/StudentLayout';
import { createClient } from '@/lib/supabase/client';
import { format, parseISO, addDays, isAfter } from 'date-fns';

interface CourseEnrollment {
  id: string;
  status: string;
  progress: {
    completion_percentage: number;
  };
  completed_at?: string;
  certificate_issued: boolean;
  courses: {
    id: string;
    title: string;
    description?: string;
    duration_hours: number;
    modules?: {
      id: string;
      title: string;
      order_index: number;
      progress?: {
        completion_percentage: number;
        completed_at?: string;
      };
      lessons?: {
        id: string;
        title: string;
        type: string;
        order_index: number;
        progress?: {
          status: string;
          completed_at?: string;
        };
        assignments?: any[];
        quizzes?: any[];
      }[];
    }[];
  };
}

interface StudentStats {
  totalEnrollments: number;
  completedCourses: number;
  totalModules: number;
  completedModules: number;
  averageScore: number;
  certificatesEarned: number;
}

interface UserProfile {
  email: string;
  profile: {
    firstName?: string;
    lastName?: string;
  };
  personal_info?: {
    firstName?: string;
    lastName?: string;
  };
}

export default function StudentDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    totalEnrollments: 0,
    completedCourses: 0,
    totalModules: 0,
    completedModules: 0,
    averageScore: 0,
    certificatesEarned: 0
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        router.push('/auth/signin');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email, profile')
        .eq('id', authUser.id)
        .single();
      
      // Get student profile for additional info
      const { data: student } = await supabase
        .from('students')
        .select('personal_info')
        .eq('user_id', authUser.id)
        .single();
      
      if (profile) {
        setUser({
          ...profile,
          personal_info: student?.personal_info
        });
      }

      // Fetch student progress with detailed information
      const response = await fetch('/api/student/progress?include_details=true');
      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }
      
      const { data: progressData } = await response.json();
      setEnrollments(progressData || []);
      calculateStats(progressData || []);

    } catch (err) {
      console.error('Error fetching student data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (enrollmentData: CourseEnrollment[]) => {
    const completedCourses = enrollmentData.filter(e => e.status === 'completed').length;
    const certificatesEarned = enrollmentData.filter(e => e.certificate_issued).length;
    
    let totalModules = 0;
    let completedModules = 0;
    let totalScores: number[] = [];
    
    enrollmentData.forEach(enrollment => {
      const modules = enrollment.courses?.modules || [];
      totalModules += modules.length;
      
      modules.forEach(module => {
        if (module.progress?.completion_percentage === 100) {
          completedModules++;
        }
        
        // Collect quiz scores for average calculation
        module.lessons?.forEach(lesson => {
          lesson.quizzes?.forEach(quiz => {
            if (quiz.percentage) {
              totalScores.push(quiz.percentage);
            }
          });
        });
      });
    });
    
    const averageScore = totalScores.length > 0 
      ? Math.round(totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length)
      : 0;
    
    setStats({
      totalEnrollments: enrollmentData.length,
      completedCourses,
      totalModules,
      completedModules,
      averageScore,
      certificatesEarned
    });
  };

  const getNextModule = (enrollment: CourseEnrollment) => {
    const modules = enrollment.courses?.modules || [];
    const sortedModules = modules.sort((a, b) => a.order_index - b.order_index);
    
    for (const module of sortedModules) {
      if (!module.progress || module.progress.completion_percentage < 100) {
        return module;
      }
    }
    return null;
  };

  const getUpcomingAssignments = () => {
    const assignments: any[] = [];
    
    enrollments.forEach(enrollment => {
      enrollment.courses?.modules?.forEach(module => {
        module.lessons?.forEach(lesson => {
          lesson.assignments?.forEach(assignment => {
            if (assignment.status === 'not_started' || assignment.status === 'in_progress') {
              assignments.push({
                id: assignment.assignment_id,
                title: assignment.course_assignments?.title || 'Assignment',
                course: enrollment.courses.title,
                type: 'assignment',
                status: assignment.status
              });
            }
          });
          
          lesson.quizzes?.forEach(quiz => {
            if (!quiz.completed_at) {
              assignments.push({
                id: quiz.quiz_id,
                title: quiz.course_quizzes?.title || 'Quiz',
                course: enrollment.courses.title,
                type: 'quiz',
                attempts: quiz.attempt_number || 0
              });
            }
          });
        });
      });
    });
    
    return assignments.slice(0, 4); // Limit to 4 most recent
  };

  const getRecentAchievements = () => {
    const achievements: any[] = [];
    
    enrollments.forEach(enrollment => {
      // Course completion achievements
      if (enrollment.status === 'completed' && enrollment.completed_at) {
        achievements.push({
          id: `course-${enrollment.id}`,
          title: 'Course Completed',
          description: `Completed ${enrollment.courses.title}`,
          date: enrollment.completed_at,
          icon: '🎓'
        });
      }
      
      // Certificate achievements
      if (enrollment.certificate_issued) {
        achievements.push({
          id: `cert-${enrollment.id}`,
          title: 'Certificate Earned',
          description: `Earned certificate for ${enrollment.courses.title}`,
          date: enrollment.completed_at,
          icon: '🏆'
        });
      }
      
      // Perfect quiz scores
      enrollment.courses?.modules?.forEach(module => {
        module.lessons?.forEach(lesson => {
          lesson.quizzes?.forEach(quiz => {
            if (quiz.percentage === 100 && quiz.completed_at) {
              achievements.push({
                id: `quiz-${quiz.quiz_id}`,
                title: 'Perfect Quiz Score',
                description: `Scored 100% on ${quiz.course_quizzes?.title || 'Quiz'}`,
                date: quiz.completed_at,
                icon: '⭐'
              });
            }
          });
        });
      });
    });
    
    return achievements
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  };

  const activeCourses = enrollments
    .filter(e => ['enrolled', 'in_progress'].includes(e.status))
    .slice(0, 2);
    
  const upcomingAssignments = getUpcomingAssignments();
  const recentAchievements = getRecentAchievements();

  if (loading) {
    return (
      <StudentLayout title="My Learning Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout title="My Learning Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchStudentData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </StudentLayout>
    );
  }

  const firstName = user?.personal_info?.firstName || user?.profile?.firstName || 'Student';
  return (
    <StudentLayout title="My Learning Dashboard">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-elegant p-8 text-white">
          <h2 className="text-2xl font-elegant font-semibold mb-2">
            Welcome back, {firstName}!
          </h2>
          <p className="text-purple-100 mb-6">
            {stats.totalEnrollments > 0 
              ? `You're enrolled in ${stats.totalEnrollments} course${stats.totalEnrollments === 1 ? '' : 's'}. Keep up the great work on your certification journey!`
              : "Ready to start your aesthetics education journey? Browse our available courses to get started."
            }
          </p>
          <div className="flex gap-4">
            {activeCourses.length > 0 ? (
              <button 
                onClick={() => router.push(`/portal/student/courses/${activeCourses[0].courses.id}`)}
                className="bg-white text-purple-600 px-6 py-2 rounded-xl font-medium hover:bg-purple-50 transition-colors duration-200"
              >
                Continue Learning
              </button>
            ) : (
              <button 
                onClick={() => router.push('/academy')}
                className="bg-white text-purple-600 px-6 py-2 rounded-xl font-medium hover:bg-purple-50 transition-colors duration-200"
              >
                Browse Courses
              </button>
            )}
            <button 
              onClick={() => router.push('/portal/student/schedule')}
              className="border border-white text-white px-6 py-2 rounded-xl font-medium hover:bg-white hover:text-purple-600 transition-colors duration-200"
            >
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
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">{stats.totalEnrollments}</p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Completed Modules</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">{stats.completedModules}</p>
                <p className="text-xs text-silver-500 mt-1">of {stats.totalModules} total</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Average Score</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">
                  {stats.averageScore > 0 ? `${stats.averageScore}%` : '—'}
                </p>
              </div>
              <div className="text-3xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-silver-600 uppercase tracking-wide">Certificates Earned</p>
                <p className="text-3xl font-elegant font-semibold text-primary-900 mt-2">{stats.certificatesEarned}</p>
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
              {activeCourses.length > 0 ? (
                activeCourses.map((enrollment) => {
                  const nextModule = getNextModule(enrollment);
                  const progress = enrollment.progress?.completion_percentage || 0;
                  
                  return (
                    <div key={enrollment.id} className="p-6 bg-purple-50 rounded-xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary-900 text-lg mb-2">{enrollment.courses.title}</h4>
                          <p className="text-sm text-silver-600 mb-3">LEA Aesthetics Clinical Academy</p>
                          <p className="text-sm text-purple-600 font-medium">
                            {nextModule ? `Next: ${nextModule.title}` : 'Course Complete!'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">{progress}%</div>
                          <div className="text-xs text-silver-500">Complete</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-purple-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-silver-500">
                          {enrollment.courses.duration_hours} hours • {enrollment.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <button 
                          onClick={() => router.push(`/portal/student/courses/${enrollment.courses.id}`)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
                        >
                          Continue Learning
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-gray-500 mb-4">No active courses</p>
                  <button 
                    onClick={() => router.push('/academy')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
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
