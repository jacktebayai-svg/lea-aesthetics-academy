'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import StudentLayout from '../../../../../../../components/portal/StudentLayout';

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  due_date?: string;
  max_points: number;
  submission_type: 'text' | 'file' | 'both';
  allowed_file_types?: string[];
  max_file_size_mb?: number;
  max_files?: number;
  rubric?: {
    criteria: Array<{
      name: string;
      description: string;
      points: number;
      levels: Array<{
        name: string;
        description: string;
        points: number;
      }>;
    }>;
  };
  course_lessons: {
    id: string;
    title: string;
    module_id: string;
    course_modules: {
      id: string;
      title: string;
      course_id: string;
    };
  };
}

interface AssignmentSubmission {
  id: string;
  submitted_at: string;
  text_content?: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'returned';
  graded_at?: string;
  graded_by?: string;
  rubric_scores?: Record<string, number>;
  assignment_files: Array<{
    id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    content_type: string;
    uploaded_at: string;
  }>;
}

export default function AssignmentViewer() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  
  const courseId = params.courseId as string;
  const assignmentId = params.assignmentId as string;
  
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [textContent, setTextContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'assignment' | 'submission' | 'feedback'>('assignment');

  useEffect(() => {
    fetchAssignmentData();
  }, [assignmentId]);

  const fetchAssignmentData = async () => {
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
        router.push('/courses');
        return;
      }

      // Fetch assignment details
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('course_assignments')
        .select(`
          *,
          course_lessons (
            id,
            title,
            module_id,
            course_modules (
              id,
              title,
              course_id
            )
          )
        `)
        .eq('id', assignmentId)
        .single();

      if (assignmentError || !assignmentData) {
        throw new Error('Assignment not found');
      }

      // Verify assignment belongs to the course
      if (assignmentData.course_lessons?.course_modules?.course_id !== courseId) {
        throw new Error('Assignment does not belong to this course');
      }

      setAssignment(assignmentData as Assignment);

      // Fetch existing submission
      const { data: submissionData } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignment_files (
            id,
            file_name,
            file_path,
            file_size,
            content_type,
            uploaded_at
          )
        `)
        .eq('student_id', student.id)
        .eq('assignment_id', assignmentId)
        .single();

      if (submissionData) {
        setSubmission(submissionData as AssignmentSubmission);
        setTextContent(submissionData.text_content || '');
        
        if (submissionData.status === 'graded') {
          setView('feedback');
        } else {
          setView('submission');
        }
      }

    } catch (err) {
      console.error('Error fetching assignment data:', err);
      setError('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const assignment_files = assignment;
    
    if (!assignment_files) return;

    // Validate file count
    if (assignment_files.max_files && files.length > assignment_files.max_files) {
      setError(`Maximum ${assignment_files.max_files} files allowed`);
      return;
    }

    // Validate file types
    if (assignment_files.allowed_file_types?.length) {
      const invalidFiles = files.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return !assignment_files.allowed_file_types!.includes(extension);
      });

      if (invalidFiles.length > 0) {
        setError(`Invalid file type. Allowed: ${assignment_files.allowed_file_types.join(', ')}`);
        return;
      }
    }

    // Validate file sizes
    const maxSizeBytes = (assignment_files.max_file_size_mb || 10) * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSizeBytes);
    
    if (oversizedFiles.length > 0) {
      setError(`File size must be under ${assignment_files.max_file_size_mb || 10}MB`);
      return;
    }

    setSelectedFiles(files);
    setError(null);
  };

  const uploadFiles = async (submissionId: string) => {
    if (selectedFiles.length === 0) return [];

    const uploadedFiles = [];

    for (const file of selectedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `assignments/${assignmentId}/${submissionId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload ${file.name}`);
      }

      // Create file record
      const { data: fileRecord, error: fileError } = await supabase
        .from('assignment_files')
        .insert({
          submission_id: submissionId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          content_type: file.type
        })
        .select()
        .single();

      if (fileError) {
        console.error('File record error:', fileError);
        throw new Error(`Failed to save ${file.name} record`);
      }

      uploadedFiles.push(fileRecord);
    }

    return uploadedFiles;
  };

  const handleSubmit = async () => {
    if (!assignment) return;

    // Validate submission
    if (assignment.submission_type === 'text' && !textContent.trim()) {
      setError('Text content is required');
      return;
    }

    if (assignment.submission_type === 'file' && selectedFiles.length === 0 && !submission?.assignment_files?.length) {
      setError('At least one file is required');
      return;
    }

    if (assignment.submission_type === 'both' && !textContent.trim() && selectedFiles.length === 0 && !submission?.assignment_files?.length) {
      setError('Either text content or file upload is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!student) return;

      let submissionRecord = submission;

      if (!submissionRecord) {
        // Create new submission
        const { data: newSubmission, error: submissionError } = await supabase
          .from('assignment_submissions')
          .insert({
            student_id: student.id,
            assignment_id: assignmentId,
            text_content: textContent || null,
            status: 'submitted',
            submitted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (submissionError) {
          throw new Error('Failed to create submission');
        }

        submissionRecord = newSubmission as AssignmentSubmission;
      } else {
        // Update existing submission
        const { data: updatedSubmission, error: updateError } = await supabase
          .from('assignment_submissions')
          .update({
            text_content: textContent || null,
            status: 'submitted',
            submitted_at: new Date().toISOString()
          })
          .eq('id', submissionRecord.id)
          .select()
          .single();

        if (updateError) {
          throw new Error('Failed to update submission');
        }

        submissionRecord = updatedSubmission as AssignmentSubmission;
      }

      // Upload new files
      if (selectedFiles.length > 0) {
        setUploading(true);
        await uploadFiles(submissionRecord.id);
        setUploading(false);
      }

      // Refresh data
      await fetchAssignmentData();
      setView('submission');
      setSelectedFiles([]);

    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const downloadFile = async (file: AssignmentSubmission['assignment_files'][0]) => {
    try {
      const { data, error } = await supabase.storage
        .from('course-content')
        .download(file.file_path);

      if (error) {
        console.error('Download error:', error);
        setError('Failed to download file');
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('assignment_files')
        .delete()
        .eq('id', fileId);

      if (error) {
        throw new Error('Failed to delete file');
      }

      await fetchAssignmentData();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  const isOverdue = () => {
    if (!assignment?.due_date) return false;
    return new Date() > new Date(assignment.due_date);
  };

  const canSubmit = () => {
    return !isOverdue() || !submission || submission.status !== 'graded';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <StudentLayout title="Loading Assignment...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </StudentLayout>
    );
  }

  if (error && !assignment) {
    return (
      <StudentLayout title="Assignment Not Found">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Assignment Not Available</h2>
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
    <StudentLayout title={assignment?.title || 'Assignment'}>
      <div className="max-w-4xl mx-auto">
        {/* Assignment Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <nav className="text-sm text-gray-500 mb-2">
                <button
                  onClick={() => router.push(`/portal/student/courses/${courseId}`)}
                  className="hover:text-purple-600"
                >
                  {assignment?.course_lessons.course_modules.title}
                </button>
                <span className="mx-2">/</span>
                <button
                  onClick={() => router.push(`/portal/student/courses/${courseId}/lessons/${assignment?.course_lessons.id}`)}
                  className="hover:text-purple-600"
                >
                  {assignment?.course_lessons.title}
                </button>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{assignment?.title}</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">{assignment?.title}</h1>
            </div>
            
            <div className="text-right">
              {assignment?.due_date && (
                <div className="mb-2">
                  <div className="text-sm text-gray-500 mb-1">Due Date</div>
                  <div className={`font-semibold ${isOverdue() ? 'text-red-600' : 'text-gray-900'}`}>
                    {format(new Date(assignment.due_date), 'MMM d, yyyy h:mm a')}
                  </div>
                  {isOverdue() && (
                    <div className="text-sm text-red-600 mt-1">Overdue</div>
                  )}
                </div>
              )}
              <div className="text-sm text-gray-500">
                Max Points: <span className="font-semibold text-gray-900">{assignment?.max_points}</span>
              </div>
            </div>
          </div>

          {assignment?.description && (
            <p className="text-gray-600 mb-4">{assignment.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>📝 {assignment?.submission_type === 'text' ? 'Text only' : assignment?.submission_type === 'file' ? 'File upload' : 'Text or file'}</span>
            {assignment?.max_files && (
              <span>📎 Max {assignment.max_files} files</span>
            )}
            {assignment?.max_file_size_mb && (
              <span>💾 Max {assignment.max_file_size_mb}MB per file</span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setView('assignment')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors duration-200 ${
                view === 'assignment'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Assignment Details
            </button>
            <button
              onClick={() => setView('submission')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors duration-200 ${
                view === 'submission'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Submission {submission && '✓'}
            </button>
            {submission?.status === 'graded' && (
              <button
                onClick={() => setView('feedback')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  view === 'feedback'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Feedback & Grade
              </button>
            )}
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

        {/* Assignment Details Tab */}
        {view === 'assignment' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignment Instructions</h2>
            
            {assignment?.instructions ? (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {assignment.instructions}
                </div>
              </div>
            ) : (
              <p className="text-gray-600 italic">No detailed instructions provided.</p>
            )}

            {assignment?.rubric && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grading Rubric</h3>
                <div className="space-y-6">
                  {assignment.rubric.criteria.map((criterion, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <h4 className="font-semibold text-gray-900">{criterion.name}</h4>
                        <p className="text-sm text-gray-600">{criterion.description}</p>
                        <p className="text-sm text-purple-600 font-medium">Max Points: {criterion.points}</p>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {criterion.levels.map((level, levelIndex) => (
                          <div key={levelIndex} className="px-4 py-3 flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">{level.name}</div>
                              <div className="text-sm text-gray-600">{level.description}</div>
                            </div>
                            <div className="text-sm font-medium text-purple-600 ml-4">
                              {level.points} pts
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => setView('submission')}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200"
              >
                {submission ? 'View My Submission' : 'Start Assignment'}
              </button>
            </div>
          </div>
        )}

        {/* Submission Tab */}
        {view === 'submission' && (
          <div className="space-y-6">
            {/* Submission Status */}
            {submission && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Submission Status</h3>
                    <p className="text-sm text-gray-600">
                      Submitted on {format(new Date(submission.submitted_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    submission.status === 'graded' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {submission.status === 'graded' ? 'Graded' : 'Submitted'}
                  </div>
                </div>
                {submission.status === 'graded' && submission.grade && (
                  <div className="mt-4 text-center bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {submission.grade}/{assignment?.max_points}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round((submission.grade / assignment!.max_points) * 100)}%
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Text Submission */}
            {(['text', 'both'].includes(assignment?.submission_type || '')) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Submission</h3>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical"
                  placeholder="Enter your assignment response here..."
                  disabled={!canSubmit()}
                />
              </div>
            )}

            {/* File Submission */}
            {(['file', 'both'].includes(assignment?.submission_type || '')) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">File Submission</h3>
                
                {/* Existing Files */}
                {submission?.assignment_files && submission.assignment_files.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Submitted Files</h4>
                    <div className="space-y-2">
                      {submission.assignment_files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="text-2xl mr-3">📎</div>
                            <div>
                              <div className="font-medium text-gray-900">{file.file_name}</div>
                              <div className="text-sm text-gray-500">
                                {formatFileSize(file.file_size)} • Uploaded {format(new Date(file.uploaded_at), 'MMM d, h:mm a')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => downloadFile(file)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Download
                            </button>
                            {canSubmit() && (
                              <button
                                onClick={() => deleteFile(file.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Upload */}
                {canSubmit() && (
                  <div>
                    <input
                      type="file"
                      multiple={assignment?.max_files !== 1}
                      accept={assignment?.allowed_file_types?.join(',')}
                      onChange={handleFileSelect}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    />
                    
                    {assignment?.allowed_file_types && (
                      <p className="text-sm text-gray-500 mt-2">
                        Allowed types: {assignment.allowed_file_types.join(', ')}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      {assignment?.max_files && (
                        <span>Max {assignment.max_files} files</span>
                      )}
                      {assignment?.max_file_size_mb && (
                        <span>Max {assignment.max_file_size_mb}MB per file</span>
                      )}
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files</h4>
                        <div className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                              <span className="text-sm text-gray-800">{file.name}</span>
                              <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            {canSubmit() && (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || uploading}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting || uploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {uploading ? 'Uploading Files...' : 'Submitting...'}
                    </div>
                  ) : (
                    submission ? 'Update Submission' : 'Submit Assignment'
                  )}
                </button>
                
                {isOverdue() && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ This assignment is overdue. Late submissions may be penalized.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Feedback Tab */}
        {view === 'feedback' && submission?.status === 'graded' && (
          <div className="space-y-6">
            {/* Grade Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Grade</h2>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {submission.grade}/{assignment?.max_points}
              </div>
              <div className="text-xl text-gray-600">
                {Math.round((submission.grade! / assignment!.max_points) * 100)}%
              </div>
              {submission.graded_at && (
                <p className="text-sm text-gray-500 mt-4">
                  Graded on {format(new Date(submission.graded_at), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>

            {/* Rubric Scores */}
            {assignment?.rubric && submission.rubric_scores && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Scores</h3>
                <div className="space-y-4">
                  {assignment.rubric.criteria.map((criterion, index) => {
                    const score = submission.rubric_scores?.[criterion.name] || 0;
                    const percentage = (score / criterion.points) * 100;
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{criterion.name}</h4>
                          <div className="text-right">
                            <div className="font-semibold text-purple-600">
                              {score}/{criterion.points}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Math.round(percentage)}%
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feedback */}
            {submission.feedback && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor Feedback</h3>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {submission.feedback}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
