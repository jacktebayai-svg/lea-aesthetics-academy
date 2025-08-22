'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import StudentLayout from '../../../../../../components/portal/StudentLayout';

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'pdf' | 'quiz' | 'assignment' | 'interactive';
  content: {
    video_url?: string;
    text_content?: string;
    pdf_url?: string;
    interactive_content?: any;
  };
  duration_minutes: number;
  order_index: number;
  is_required: boolean;
  resources: {
    downloads?: Array<{
      name: string;
      url: string;
      type: string;
    }>;
    links?: Array<{
      title: string;
      url: string;
      description?: string;
    }>;
  };
  course_modules: {
    id: string;
    title: string;
    course_id: string;
  };
}

interface Progress {
  id?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  time_spent_minutes: number;
  completed_at?: string;
  notes?: string;
}

interface Note {
  id: string;
  content: string;
  timestamp_seconds?: number;
  created_at: string;
}

interface NavigationLesson {
  id: string;
  title: string;
  order_index: number;
}

export default function LessonViewer() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Progress>({
    status: 'not_started',
    completion_percentage: 0,
    time_spent_minutes: 0
  });
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [navigation, setNavigation] = useState<{
    previous?: NavigationLesson;
    next?: NavigationLesson;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchLessonData();
    
    // Update progress every 30 seconds while lesson is active
    const progressInterval = setInterval(() => {
      if (document.hasFocus()) {
        updateTimeSpent();
      }
    }, 30000);

    // Save progress on page unload
    const handleBeforeUnload = () => {
      updateTimeSpent();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(progressInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateTimeSpent();
    };
  }, [lessonId]);

  const fetchLessonData = async () => {
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
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!student) {
        throw new Error('Student profile not found');
      }

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

      // Fetch lesson details
      const { data: lessonData, error: lessonError } = await supabase
        .from('course_lessons')
        .select(`
          *,
          course_modules (
            id,
            title,
            course_id
          )
        `)
        .eq('id', lessonId)
        .single();

      if (lessonError || !lessonData) {
        throw new Error('Lesson not found');
      }

      // Verify lesson belongs to the course
      if (lessonData.course_modules?.course_id !== courseId) {
        throw new Error('Lesson does not belong to this course');
      }

      setLesson(lessonData as Lesson);

      // Fetch lesson progress
      const { data: progressData } = await supabase
        .from('student_lesson_progress')
        .select('*')
        .eq('student_id', student.id)
        .eq('lesson_id', lessonId)
        .single();

      if (progressData) {
        setProgress(progressData);
      } else {
        // Mark as in_progress when first accessed
        await updateProgress('in_progress', 0);
      }

      // Fetch student notes
      const { data: notesData } = await supabase
        .from('student_notes')
        .select('*')
        .eq('student_id', student.id)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });

      setNotes(notesData || []);

      // Fetch navigation (previous/next lessons)
      await fetchNavigation(lessonData.course_modules.id, lessonData.order_index);

    } catch (err) {
      console.error('Error fetching lesson data:', err);
      setError('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const fetchNavigation = async (moduleId: string, currentOrder: number) => {
    try {
      // Get all lessons in the module
      const { data: moduleLessons } = await supabase
        .from('course_lessons')
        .select('id, title, order_index')
        .eq('module_id', moduleId)
        .order('order_index');

      if (moduleLessons) {
        const currentIndex = moduleLessons.findIndex(l => l.order_index === currentOrder);
        
        const navigation: { previous?: NavigationLesson; next?: NavigationLesson } = {};
        
        if (currentIndex > 0) {
          navigation.previous = moduleLessons[currentIndex - 1];
        }
        
        if (currentIndex < moduleLessons.length - 1) {
          navigation.next = moduleLessons[currentIndex + 1];
        }

        setNavigation(navigation);
      }
    } catch (error) {
      console.error('Error fetching navigation:', error);
    }
  };

  const updateTimeSpent = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / (1000 * 60)); // Convert to minutes
    if (timeSpent > 0) {
      const newTimeSpent = progress.time_spent_minutes + timeSpent;
      await updateProgress(progress.status, progress.completion_percentage, newTimeSpent);
    }
  };

  const updateProgress = async (
    status: 'not_started' | 'in_progress' | 'completed',
    completionPercentage?: number,
    timeSpentMinutes?: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!student) return;

      const updateData = {
        student_id: student.id,
        lesson_id: lessonId,
        status,
        completion_percentage: completionPercentage ?? progress.completion_percentage,
        time_spent_minutes: timeSpentMinutes ?? progress.time_spent_minutes,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        notes: progress.notes
      };

      const { data, error } = await supabase
        .from('student_lesson_progress')
        .upsert(updateData, { onConflict: 'student_id,lesson_id' })
        .select()
        .single();

      if (error) {
        console.error('Error updating progress:', error);
      } else if (data) {
        setProgress(data);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const markAsComplete = async () => {
    await updateProgress('completed', 100);
    
    // Show success message or redirect to next lesson
    if (navigation.next) {
      const shouldContinue = window.confirm(
        'Great job! You completed this lesson. Would you like to continue to the next lesson?'
      );
      if (shouldContinue) {
        router.push(`/portal/student/courses/${courseId}/lessons/${navigation.next.id}`);
      }
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!student) return;

      const noteData = {
        student_id: student.id,
        lesson_id: lessonId,
        content: newNote.trim(),
        timestamp_seconds: lesson?.type === 'video' ? Math.floor(currentTime) : null
      };

      const { data, error } = await supabase
        .from('student_notes')
        .insert(noteData)
        .select()
        .single();

      if (error) {
        console.error('Error adding note:', error);
      } else if (data) {
        setNotes(prev => [...prev, data]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('student_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Error deleting note:', error);
      } else {
        setNotes(prev => prev.filter(note => note.id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleVideoProgress = (currentTime: number, duration: number) => {
    setCurrentTime(currentTime);
    setDuration(duration);
    
    const percentComplete = Math.floor((currentTime / duration) * 100);
    if (percentComplete > progress.completion_percentage) {
      updateProgress('in_progress', percentComplete);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderLessonContent = () => {
    if (!lesson) return null;

    switch (lesson.type) {
      case 'video':
        return (
          <div className="space-y-6">
            {lesson.content.video_url ? (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  className="w-full aspect-video"
                  controls
                  onTimeUpdate={(e) => {
                    const video = e.target as HTMLVideoElement;
                    handleVideoProgress(video.currentTime, video.duration);
                  }}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                >
                  <source src={lesson.content.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Video Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-600">Video content not available</p>
              </div>
            )}
            
            {lesson.description && (
              <div className="prose max-w-none">
                <p className="text-gray-700">{lesson.description}</p>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="prose max-w-none">
            {lesson.content.text_content ? (
              <div dangerouslySetInnerHTML={{ __html: lesson.content.text_content }} />
            ) : (
              <p>Text content not available</p>
            )}
          </div>
        );

      case 'pdf':
        return (
          <div className="space-y-4">
            {lesson.content.pdf_url ? (
              <div className="bg-white rounded-lg border">
                <iframe
                  src={lesson.content.pdf_url}
                  className="w-full h-96"
                  title={lesson.title}
                />
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-600">PDF content not available</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              This lesson type ({lesson.type}) is not yet supported in the viewer.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <StudentLayout title="Loading Lesson...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !lesson) {
    return (
      <StudentLayout title="Lesson Not Found">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">😞</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Lesson Not Available</h2>
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
    <StudentLayout title={lesson.title}>
      <div className="max-w-7xl mx-auto">
        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <nav className="text-sm text-gray-500 mb-2">
                <button
                  onClick={() => router.push(`/portal/student/courses/${courseId}`)}
                  className="hover:text-purple-600"
                >
                  {lesson.course_modules.title}
                </button>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{lesson.title}</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Progress</div>
              <div className="text-2xl font-bold text-purple-600">
                {progress.completion_percentage}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.completion_percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Content */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {renderLessonContent()}
            </div>

            {/* Resources */}
            {lesson.resources && (lesson.resources.downloads?.length > 0 || lesson.resources.links?.length > 0) && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                
                {lesson.resources.downloads && lesson.resources.downloads.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Downloads</h4>
                    <div className="space-y-2">
                      {lesson.resources.downloads.map((download, index) => (
                        <a
                          key={index}
                          href={download.url}
                          download
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-purple-600">📁</span>
                          <span className="font-medium">{download.name}</span>
                          <span className="text-sm text-gray-500">({download.type})</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {lesson.resources.links && lesson.resources.links.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Additional Resources</h4>
                    <div className="space-y-2">
                      {lesson.resources.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium text-purple-600">{link.title}</div>
                          {link.description && (
                            <div className="text-sm text-gray-600 mt-1">{link.description}</div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Completion Button */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Mark as Complete</h3>
                  <p className="text-sm text-gray-600">
                    Mark this lesson as completed to track your progress
                  </p>
                </div>
                <button
                  onClick={markAsComplete}
                  disabled={progress.status === 'completed'}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    progress.status === 'completed'
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {progress.status === 'completed' ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notes */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Notes</h3>
              
              {/* Add Note */}
              <div className="mb-4">
                <div className="flex gap-2 mb-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    rows={3}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>
                {lesson.type === 'video' && (
                  <p className="text-xs text-gray-500 mb-2">
                    Note will be saved at current video time: {formatTime(currentTime)}
                  </p>
                )}
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{note.content}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            {note.timestamp_seconds && (
                              <span>🎥 {formatTime(note.timestamp_seconds)}</span>
                            )}
                            <span>{format(new Date(note.created_at), 'MMM d, h:mm a')}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No notes yet. Add your first note above!
                  </p>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
              
              <div className="space-y-3">
                {navigation.previous && (
                  <button
                    onClick={() => router.push(`/portal/student/courses/${courseId}/lessons/${navigation.previous!.id}`)}
                    className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-sm text-gray-500">← Previous Lesson</div>
                    <div className="font-medium text-gray-900">{navigation.previous.title}</div>
                  </button>
                )}
                
                {navigation.next && (
                  <button
                    onClick={() => router.push(`/portal/student/courses/${courseId}/lessons/${navigation.next!.id}`)}
                    className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="text-sm text-purple-600">Next Lesson →</div>
                    <div className="font-medium text-gray-900">{navigation.next.title}</div>
                  </button>
                )}
                
                <button
                  onClick={() => router.push(`/portal/student/courses/${courseId}`)}
                  className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  <div className="font-medium text-gray-900">Back to Course</div>
                </button>
              </div>
            </div>

            {/* Lesson Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-medium ${
                    progress.status === 'completed' ? 'text-green-600' : 
                    progress.status === 'in_progress' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    {progress.status === 'completed' ? 'Completed' :
                     progress.status === 'in_progress' ? 'In Progress' :
                     'Not Started'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Time Spent</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.floor(progress.time_spent_minutes / 60)}h {progress.time_spent_minutes % 60}m
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.floor(lesson.duration_minutes / 60)}h {lesson.duration_minutes % 60}m
                  </span>
                </div>
                
                {progress.completed_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-sm font-medium text-gray-900">
                      {format(new Date(progress.completed_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
