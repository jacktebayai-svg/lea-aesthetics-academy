import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema for progress update
const progressUpdateSchema = z.object({
  lesson_id: z.string().uuid(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  completion_percentage: z.number().int().min(0).max(100).optional(),
  time_spent_minutes: z.number().int().min(0).optional(),
  notes: z.string().optional()
})

// GET /api/student/progress - Get student's overall progress
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student record
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    const courseId = searchParams.get('course_id')
    const includeDetails = searchParams.get('include_details') === 'true'

    // Get course enrollments with progress
    let enrollmentsQuery = supabase
      .from('course_enrollments')
      .select(`
        id,
        status,
        progress,
        completed_at,
        certificate_issued,
        created_at,
        courses (
          id,
          title,
          description,
          duration_hours${includeDetails ? `,
          course_modules (
            id,
            title,
            order_index,
            duration_minutes,
            course_lessons (
              id,
              title,
              type,
              duration_minutes,
              order_index
            )
          )` : ''}
        )
      `)
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })

    if (courseId) {
      enrollmentsQuery = enrollmentsQuery.eq('course_id', courseId)
    }

    const { data: enrollments, error: enrollmentError } = await enrollmentsQuery

    if (enrollmentError) {
      console.error('Error fetching enrollments:', enrollmentError)
      return NextResponse.json({ error: 'Failed to fetch progress data' }, { status: 500 })
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Get detailed progress if requested
    if (includeDetails) {
      // Get lesson progress for all enrollments
      const { data: lessonProgress } = await supabase
        .from('student_lesson_progress')
        .select(`
          lesson_id,
          status,
          completion_percentage,
          time_spent_minutes,
          completed_at,
          course_lessons (
            id,
            module_id,
            title,
            type
          )
        `)
        .eq('student_id', student.id)

      // Get module progress
      const { data: moduleProgress } = await supabase
        .from('student_module_progress')
        .select(`
          module_id,
          completion_percentage,
          completed_at,
          total_time_minutes
        `)
        .eq('student_id', student.id)

      // Get quiz attempts
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select(`
          quiz_id,
          attempt_number,
          score,
          max_score,
          percentage,
          completed_at,
          course_quizzes (
            lesson_id,
            title,
            passing_score
          )
        `)
        .eq('student_id', student.id)
        .order('completed_at', { ascending: false })

      // Get assignment submissions
      const { data: assignments } = await supabase
        .from('assignment_submissions')
        .select(`
          assignment_id,
          status,
          score,
          submitted_at,
          graded_at,
          feedback,
          course_assignments (
            lesson_id,
            title,
            max_points
          )
        `)
        .eq('student_id', student.id)

      // Merge progress data with enrollments
      const enrichedEnrollments = enrollments.map(enrollment => {
        const courseModules = (enrollment.courses as any)?.course_modules || []
        
        const modulesWithProgress = courseModules.map(module => {
          const modProgress = moduleProgress?.find(mp => mp.module_id === module.id)
          const lessonsWithProgress = module.course_lessons?.map(lesson => {
            const lessonProg = lessonProgress?.find(lp => lp.lesson_id === lesson.id)
            const lessonQuizzes = quizAttempts?.filter(qa => qa.course_quizzes?.lesson_id === lesson.id) || []
            const lessonAssignments = assignments?.filter(a => a.course_assignments?.lesson_id === lesson.id) || []
            
            return {
              ...lesson,
              progress: lessonProg ? {
                status: lessonProg.status,
                completion_percentage: lessonProg.completion_percentage,
                time_spent_minutes: lessonProg.time_spent_minutes,
                completed_at: lessonProg.completed_at
              } : null,
              quizzes: lessonQuizzes.map(quiz => ({
                attempt_number: quiz.attempt_number,
                score: quiz.score,
                max_score: quiz.max_score,
                percentage: quiz.percentage,
                completed_at: quiz.completed_at,
                passed: quiz.percentage >= (quiz.course_quizzes?.passing_score || 70)
              })),
              assignments: lessonAssignments.map(assignment => ({
                status: assignment.status,
                score: assignment.score,
                max_points: assignment.course_assignments?.max_points,
                submitted_at: assignment.submitted_at,
                graded_at: assignment.graded_at,
                has_feedback: !!assignment.feedback
              }))
            }
          }) || []

          return {
            ...module,
            lessons: lessonsWithProgress,
            progress: modProgress ? {
              completion_percentage: modProgress.completion_percentage,
              completed_at: modProgress.completed_at,
              total_time_minutes: modProgress.total_time_minutes
            } : null
          }
        })

        return {
          ...enrollment,
          courses: {
            ...enrollment.courses,
            modules: modulesWithProgress
          }
        }
      })

      return NextResponse.json({ data: enrichedEnrollments })
    }

    return NextResponse.json({ data: enrollments })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/student/progress - Update lesson progress
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student record
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = progressUpdateSchema.parse(body)

    // Verify student is enrolled in the course containing this lesson
    const { data: lessonCourse } = await supabase
      .from('course_lessons')
      .select(`
        id,
        module_id,
        course_modules (
          course_id
        )
      `)
      .eq('id', validatedData.lesson_id)
      .single()

    if (!lessonCourse) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const courseId = (lessonCourse.course_modules as any)?.course_id
    
    // Verify enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id, status')
      .eq('student_id', student.id)
      .eq('course_id', courseId)
      .single()

    if (!enrollment || !['enrolled', 'in_progress'].includes(enrollment.status)) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 })
    }

    // Update or create lesson progress
    const progressData = {
      student_id: student.id,
      lesson_id: validatedData.lesson_id,
      status: validatedData.status,
      completion_percentage: validatedData.completion_percentage || (validatedData.status === 'completed' ? 100 : 0),
      time_spent_minutes: validatedData.time_spent_minutes || 0,
      notes: validatedData.notes,
      completed_at: validatedData.status === 'completed' ? new Date().toISOString() : null
    }

    const { data: progress, error: progressError } = await supabase
      .from('student_lesson_progress')
      .upsert(progressData, {
        onConflict: 'student_id,lesson_id'
      })
      .select()
      .single()

    if (progressError) {
      console.error('Error updating lesson progress:', progressError)
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
    }

    // The progress calculation will be handled by database triggers
    // which will update module and course progress automatically

    // Get updated enrollment progress
    const { data: updatedEnrollment } = await supabase
      .from('course_enrollments')
      .select('progress, status, completed_at')
      .eq('id', enrollment.id)
      .single()

    return NextResponse.json({
      data: {
        lesson_progress: progress,
        course_progress: updatedEnrollment?.progress,
        course_status: updatedEnrollment?.status,
        course_completed_at: updatedEnrollment?.completed_at
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
