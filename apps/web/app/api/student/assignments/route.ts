import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');
    const status = searchParams.get('status');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    // Verify enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('student_id', student.id)
      .eq('course_id', courseId)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in course' }, { status: 403 });
    }

    let query = supabase
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
        ),
        assignment_submissions (
          id,
          submitted_at,
          grade,
          status,
          graded_at,
          student_id
        )
      `)
      .eq('course_lessons.course_modules.course_id', courseId)
      .eq('assignment_submissions.student_id', student.id)
      .order('due_date', { ascending: true });

    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }

    const { data: assignments, error } = await query;

    if (error) {
      console.error('Error fetching assignments:', error);
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }

    // Filter by status if provided
    let filteredAssignments = assignments;
    if (status) {
      filteredAssignments = assignments?.filter(assignment => {
        const submission = assignment.assignment_submissions?.[0];
        switch (status) {
          case 'pending':
            return !submission;
          case 'submitted':
            return submission && submission.status === 'submitted';
          case 'graded':
            return submission && submission.status === 'graded';
          case 'overdue':
            return !submission && assignment.due_date && new Date(assignment.due_date) < new Date();
          default:
            return true;
        }
      });
    }

    return NextResponse.json({ assignments: filteredAssignments });

  } catch (error) {
    console.error('Error in GET /api/student/assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { assignmentId, action, textContent, submissionId } = body;

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID required' }, { status: 400 });
    }

    // Get assignment details
    const { data: assignment, error: assignmentError } = await supabase
      .from('course_assignments')
      .select(`
        *,
        course_lessons (
          course_modules (
            course_id
          )
        )
      `)
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Verify enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('student_id', student.id)
      .eq('course_id', assignment.course_lessons.course_modules.course_id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in course' }, { status: 403 });
    }

    if (action === 'submit') {
      // Check if assignment is overdue (still allow submission but mark as late)
      const isOverdue = assignment.due_date && new Date() > new Date(assignment.due_date);

      // Check if submission already exists
      const { data: existingSubmission } = await supabase
        .from('assignment_submissions')
        .select('id')
        .eq('student_id', student.id)
        .eq('assignment_id', assignmentId)
        .single();

      let submission;

      if (existingSubmission) {
        // Update existing submission
        const { data: updatedSubmission, error: updateError } = await supabase
          .from('assignment_submissions')
          .update({
            text_content: textContent || null,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            late_submission: isOverdue
          })
          .eq('id', existingSubmission.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating submission:', updateError);
          return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
        }

        submission = updatedSubmission;
      } else {
        // Create new submission
        const { data: newSubmission, error: submissionError } = await supabase
          .from('assignment_submissions')
          .insert({
            student_id: student.id,
            assignment_id: assignmentId,
            text_content: textContent || null,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            late_submission: isOverdue
          })
          .select()
          .single();

        if (submissionError) {
          console.error('Error creating submission:', submissionError);
          return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
        }

        submission = newSubmission;
      }

      return NextResponse.json({ submission });

    } else if (action === 'save_draft') {
      // Save work without submitting
      const { data: existingSubmission } = await supabase
        .from('assignment_submissions')
        .select('id')
        .eq('student_id', student.id)
        .eq('assignment_id', assignmentId)
        .single();

      let submission;

      if (existingSubmission) {
        // Update existing draft
        const { data: updatedSubmission, error: updateError } = await supabase
          .from('assignment_submissions')
          .update({
            text_content: textContent || null,
            status: 'draft'
          })
          .eq('id', existingSubmission.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating draft:', updateError);
          return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
        }

        submission = updatedSubmission;
      } else {
        // Create new draft
        const { data: newSubmission, error: submissionError } = await supabase
          .from('assignment_submissions')
          .insert({
            student_id: student.id,
            assignment_id: assignmentId,
            text_content: textContent || null,
            status: 'draft'
          })
          .select()
          .single();

        if (submissionError) {
          console.error('Error creating draft:', submissionError);
          return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
        }

        submission = newSubmission;
      }

      return NextResponse.json({ submission });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in POST /api/student/assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE method for deleting assignment files
export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    // Get file details and verify ownership
    const { data: file, error: fileError } = await supabase
      .from('assignment_files')
      .select(`
        *,
        assignment_submissions (
          student_id,
          assignment_id,
          course_assignments (
            course_lessons (
              course_modules (
                course_id
              )
            )
          )
        )
      `)
      .eq('id', fileId)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Verify ownership
    if (file.assignment_submissions.student_id !== student.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('student_id', student.id)
      .eq('course_id', file.assignment_submissions.course_assignments.course_lessons.course_modules.course_id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in course' }, { status: 403 });
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('course-content')
      .remove([file.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
    }

    // Delete file record
    const { error: deleteError } = await supabase
      .from('assignment_files')
      .delete()
      .eq('id', fileId);

    if (deleteError) {
      console.error('Error deleting file record:', deleteError);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/student/assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
