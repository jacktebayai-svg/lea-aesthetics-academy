'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@master-aesthetics-suite/ui';

// Simple replacements for UI components
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);
const Button = ({ children, onClick, disabled = false, variant = 'default', size = 'default', className = '' }: {
  children: React.ReactNode, onClick?: () => void, disabled?: boolean, variant?: string, size?: string, className?: string
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      variant === 'ghost' ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' :
      variant === 'outline' ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' :
      'bg-purple-600 text-white hover:bg-purple-700'
    } ${size === 'sm' ? 'px-3 py-1 text-sm' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
  >
    {children}
  </button>
);
const Input = ({ placeholder, value, onChange, type = 'text', className = '' }: {
  placeholder?: string, value?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, className?: string
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${className}`}
  />
);
import { 
  Send, 
  GraduationCap, 
  Users, 
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Award,
  FileText
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  level: string;
  description: string;
  modules: number;
  duration: string;
  prerequisites: string[];
  status: 'draft' | 'published' | 'archived';
}

interface Student {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
  status: 'active' | 'inactive' | 'graduated';
  currentCourses: number;
  completedCourses: number;
  lastActivity?: string;
}

function SendCourseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollmentType, setEnrollmentType] = useState<'immediate' | 'scheduled'>('immediate');
  const [startDate, setStartDate] = useState('');
  const [message, setMessage] = useState('');
  const [allowSelfPaced, setAllowSelfPaced] = useState(true);
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockCourse: Course = {
      id: courseId || '1',
      title: 'Level 4 Aesthetics Foundation',
      level: 'Level 4',
      description: 'Comprehensive foundation course covering essential aesthetics principles and practices.',
      modules: 8,
      duration: '12 weeks',
      prerequisites: ['Basic anatomy knowledge', 'First aid certification'],
      status: 'published'
    };

    const mockStudents: Student[] = [
      {
        id: '1',
        name: 'Alex Taylor',
        email: 'alex.taylor@email.com',
        studentNumber: 'STU-0001',
        status: 'active',
        currentCourses: 2,
        completedCourses: 1,
        lastActivity: '2024-01-15'
      },
      {
        id: '2',
        name: 'Morgan Lee',
        email: 'morgan.lee@email.com',
        studentNumber: 'STU-0002',
        status: 'active',
        currentCourses: 1,
        completedCourses: 3,
        lastActivity: '2024-01-14'
      },
      {
        id: '3',
        name: 'Jordan Smith',
        email: 'jordan.smith@email.com',
        studentNumber: 'STU-0003',
        status: 'active',
        currentCourses: 0,
        completedCourses: 0,
        lastActivity: '2024-01-13'
      },
      {
        id: '4',
        name: 'Casey Williams',
        email: 'casey.williams@email.com',
        studentNumber: 'STU-0004',
        status: 'inactive',
        currentCourses: 0,
        completedCourses: 2,
        lastActivity: '2024-01-10'
      }
    ];

    setCourse(mockCourse);
    setStudents(mockStudents);
  }, [courseId]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = async () => {
    if (selectedStudents.length === 0) return;
    
    setSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSending(false);
    router.push('/admin/courses?enrolled=true');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-gray-400';
      case 'graduated':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'inactive':
        return AlertCircle;
      case 'graduated':
        return Award;
      default:
        return Clock;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'graduated':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-noir-900">
            Enroll Students in Course
          </h1>
          <p className="text-platinum-600 mt-1">
            Configure enrollment settings and select students
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Course Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-noir-900">{course.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{course.level}</span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-platinum-600">{course.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-platinum-400" />
                  <span>{course.modules} modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-platinum-400" />
                  <span>{course.duration}</span>
                </div>
              </div>

              {course.prerequisites.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-noir-700 mb-2">Prerequisites:</h4>
                  <ul className="text-xs text-platinum-600 space-y-1">
                    {course.prerequisites.map((prereq, index) => (
                      <li key={index}>• {prereq}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enrollment Settings & Students */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrollment Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-noir-700 mb-2 block">
                    Enrollment Type
                  </label>
                  <select
                    value={enrollmentType}
                    onChange={(e) => setEnrollmentType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Immediate Access</option>
                    <option value="scheduled">Scheduled Start</option>
                  </select>
                </div>

                {enrollmentType === 'scheduled' && (
                  <div>
                    <label className="text-sm font-medium text-noir-700 mb-2 block">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-noir-700 mb-2 block">
                  Welcome Message
                </label>
                <textarea
                  placeholder="Add a welcome message for enrolled students..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="selfPaced"
                    checked={allowSelfPaced}
                    onChange={(e) => setAllowSelfPaced(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="selfPaced"
                    className="text-sm font-medium text-noir-700 cursor-pointer"
                  >
                    Allow self-paced learning
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notify"
                    checked={notifyStudents}
                    onChange={(e) => setNotifyStudents(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="notify"
                    className="text-sm font-medium text-noir-700 cursor-pointer"
                  >
                    Send enrollment notification
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select Students ({selectedStudents.length} selected)
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedStudents.length === filteredStudents.length) {
                      setSelectedStudents([]);
                    } else {
                      setSelectedStudents(filteredStudents.map(s => s.id));
                    }
                  }}
                >
                  {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {filteredStudents.map((student) => {
                  const StatusIcon = getStatusIcon(student.status);
                  return (
                    <div
                      key={student.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedStudents.includes(student.id)
                          ? 'ring-2 ring-champagne-gold bg-champagne-gold/5'
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedStudents(prev =>
                          prev.includes(student.id)
                            ? prev.filter(id => id !== student.id)
                            : [...prev, student.id]
                        );
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            readOnly
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{student.name}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(student.status)}`}>
                                {student.status}
                              </span>
                            </div>
                            <p className="text-xs text-platinum-600">{student.email}</p>
                            <p className="text-xs text-platinum-500">{student.studentNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(student.status)} mb-1`} />
                          <div className="text-xs text-platinum-600">
                            <div>Current: {student.currentCourses}</div>
                            <div>Completed: {student.completedCourses}</div>
                          </div>
                        </div>
                      </div>
                      {student.lastActivity && (
                        <div className="mt-2 text-xs text-platinum-500">
                          Last active: {new Date(student.lastActivity).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Enroll Action */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-noir-900">Ready to Enroll</h3>
                  <p className="text-sm text-platinum-600">
                    {selectedStudents.length} student(s) in "{course.title}"
                  </p>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={selectedStudents.length === 0 || sending}
                  className="bg-champagne-gold hover:bg-champagne-gold/90"
                >
                  {sending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enroll Students
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SendCoursePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SendCourseContent />
    </Suspense>
  );
}
