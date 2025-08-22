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
      .from('course_quizzes')
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
        quiz_attempts (
          id,
          attempt_number,
          score,
          max_score,
          percentage,
          completed_at,
          student_id
        )
      `)
      .eq('course_lessons.course_modules.course_id', courseId)
      .eq('quiz_attempts.student_id', student.id)
      .order('created_at', { ascending: false });

    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }

    const { data: quizzes, error } = await query;

    if (error) {
      console.error('Error fetching quizzes:', error);
      return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
    }

    return NextResponse.json({ quizzes });

  } catch (error) {
    console.error('Error in GET /api/student/quizzes:', error);
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
    const { quizId, action, answers } = body;

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID required' }, { status: 400 });
    }

    // Get quiz details
    const { data: quiz, error: quizError } = await supabase
      .from('course_quizzes')
      .select(`
        *,
        course_lessons (
          course_modules (
            course_id
          )
        )
      `)
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Verify enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('student_id', student.id)
      .eq('course_id', quiz.course_lessons.course_modules.course_id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in course' }, { status: 403 });
    }

    if (action === 'start') {
      // Check attempt limits
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('id')
        .eq('student_id', student.id)
        .eq('quiz_id', quizId);

      if (attempts && attempts.length >= quiz.max_attempts) {
        return NextResponse.json({ error: 'Maximum attempts exceeded' }, { status: 400 });
      }

      // Create new attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          student_id: student.id,
          quiz_id: quizId,
          attempt_number: (attempts?.length || 0) + 1,
          started_at: new Date().toISOString(),
          answers: {}
        })
        .select()
        .single();

      if (attemptError) {
        console.error('Error creating attempt:', attemptError);
        return NextResponse.json({ error: 'Failed to start quiz' }, { status: 500 });
      }

      return NextResponse.json({ attempt });

    } else if (action === 'submit') {
      const { attemptId } = body;
      
      if (!attemptId || !answers) {
        return NextResponse.json({ error: 'Attempt ID and answers required' }, { status: 400 });
      }

      // Get quiz questions for scoring
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (!questions) {
        return NextResponse.json({ error: 'Quiz questions not found' }, { status: 404 });
      }

      // Calculate score
      let totalScore = 0;
      let maxScore = 0;

      questions.forEach(question => {
        maxScore += question.points;
        const studentAnswer = answers[question.id];
        
        if (studentAnswer !== undefined && studentAnswer !== null && studentAnswer !== '') {
          if (isAnswerCorrect(question, studentAnswer)) {
            totalScore += question.points;
          }
        }
      });

      const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

      // Update attempt with results
      const { data: updatedAttempt, error: updateError } = await supabase
        .from('quiz_attempts')
        .update({
          completed_at: new Date().toISOString(),
          score: totalScore,
          max_score: maxScore,
          percentage,
          answers
        })
        .eq('id', attemptId)
        .eq('student_id', student.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating attempt:', updateError);
        return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
      }

      return NextResponse.json({ attempt: updatedAttempt });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in POST /api/student/quizzes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function isAnswerCorrect(question: any, studentAnswer: any): boolean {
  switch (question.type) {
    case 'multiple_choice':
    case 'true_false':
      return studentAnswer === question.correct_answer?.choice;
    
    case 'short_answer':
      const correctText = question.correct_answer?.text?.toLowerCase().trim();
      const studentText = studentAnswer?.toLowerCase().trim();
      return correctText === studentText;
    
    case 'matching':
      const correctMatching = question.correct_answer?.matching || {};
      const studentMatching = studentAnswer || {};
      return Object.keys(correctMatching).every(key => 
        correctMatching[key] === studentMatching[key]
      );
    
    default:
      return false;
  }
}
