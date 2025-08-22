'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import StudentLayout from '../../../../../../../components/portal/StudentLayout';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching';
  options: {
    choices?: string[];
    matching_pairs?: { left: string; right: string }[];
  };
  correct_answer: {
    choice?: string;
    choices?: string[];
    text?: string;
    matching?: Record<string, string>;
  };
  points: number;
  explanation?: string;
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  time_limit_minutes?: number;
  max_attempts: number;
  passing_score: number;
  show_answers: boolean;
  randomize_questions: boolean;
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

interface QuizAttempt {
  id: string;
  attempt_number: number;
  started_at: string;
  completed_at?: string;
  score?: number;
  max_score?: number;
  percentage?: number;
  time_taken_minutes?: number;
  answers: Record<string, any>;
}

interface StudentAnswer {
  questionId: string;
  answer: any;
}

export default function QuizTaker() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  
  const courseId = params.courseId as string;
  const quizId = params.quizId as string;
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<'preview' | 'taking' | 'completed' | 'reviewing'>('preview');
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  useEffect(() => {
    // Timer for timed quizzes
    if (quizState === 'taking' && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev !== null && prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizState, timeRemaining]);

  const fetchQuizData = async () => {
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

      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
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
          )
        `)
        .eq('id', quizId)
        .single();

      if (quizError || !quizData) {
        throw new Error('Quiz not found');
      }

      // Verify quiz belongs to the course
      if (quizData.course_lessons?.course_modules?.course_id !== courseId) {
        throw new Error('Quiz does not belong to this course');
      }

      setQuiz(quizData as Quiz);

      // Fetch quiz questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
      } else if (questionsData) {
        const shuffledQuestions = quizData.randomize_questions 
          ? [...questionsData].sort(() => Math.random() - 0.5)
          : questionsData;
        setQuestions(shuffledQuestions);
      }

      // Fetch previous attempts
      const { data: attemptsData } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('student_id', student.id)
        .eq('quiz_id', quizId)
        .order('attempt_number', { ascending: false });

      if (attemptsData) {
        setAttempts(attemptsData);
        
        // Check if there's an incomplete attempt
        const incompleteAttempt = attemptsData.find(a => !a.completed_at);
        if (incompleteAttempt) {
          setCurrentAttempt(incompleteAttempt);
          setAnswers(incompleteAttempt.answers || {});
          setQuizState('taking');
          
          if (quizData.time_limit_minutes) {
            const startTime = new Date(incompleteAttempt.started_at).getTime();
            const elapsed = (Date.now() - startTime) / 1000 / 60;
            const remaining = Math.max(0, quizData.time_limit_minutes - elapsed);
            setTimeRemaining(Math.floor(remaining * 60));
          }
        }
      }

    } catch (err) {
      console.error('Error fetching quiz data:', err);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      // Check attempt limits
      if (attempts.length >= quiz!.max_attempts) {
        setError('Maximum attempts exceeded');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!student) return;

      // Create new attempt
      const { data: attempt, error } = await supabase
        .from('quiz_attempts')
        .insert({
          student_id: student.id,
          quiz_id: quizId,
          attempt_number: attempts.length + 1,
          started_at: new Date().toISOString(),
          answers: {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating attempt:', error);
        setError('Failed to start quiz');
        return;
      }

      setCurrentAttempt(attempt);
      setQuizState('taking');
      setAnswers({});
      
      if (quiz!.time_limit_minutes) {
        setTimeRemaining(quiz!.time_limit_minutes * 60);
      }

    } catch (error) {
      console.error('Error starting quiz:', error);
      setError('Failed to start quiz');
    }
  };

  const updateAnswer = (questionId: string, answer: any) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    
    // Save to database immediately for auto-save
    if (currentAttempt) {
      supabase
        .from('quiz_attempts')
        .update({ answers: newAnswers })
        .eq('id', currentAttempt.id)
        .then();
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentAttempt || !quiz) return;

    try {
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
      const timeTaken = quiz.time_limit_minutes 
        ? Math.ceil((quiz.time_limit_minutes * 60 - (timeRemaining || 0)) / 60)
        : undefined;

      // Update attempt with results
      const { error } = await supabase
        .from('quiz_attempts')
        .update({
          completed_at: new Date().toISOString(),
          score: totalScore,
          max_score: maxScore,
          percentage,
          time_taken_minutes: timeTaken,
          answers
        })
        .eq('id', currentAttempt.id);

      if (error) {
        console.error('Error submitting quiz:', error);
        setError('Failed to submit quiz');
        return;
      }

      // Update current attempt state
      setCurrentAttempt(prev => prev ? {
        ...prev,
        completed_at: new Date().toISOString(),
        score: totalScore,
        max_score: maxScore,
        percentage,
        time_taken_minutes: timeTaken
      } : null);

      setQuizState('completed');
      setShowResults(true);
      
      // Refresh attempts list
      await fetchQuizData();

    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz');
    }
  };

  const isAnswerCorrect = (question: QuizQuestion, studentAnswer: any): boolean => {
    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        return studentAnswer === question.correct_answer.choice;
      
      case 'short_answer':
        const correctText = question.correct_answer.text?.toLowerCase().trim();
        const studentText = studentAnswer?.toLowerCase().trim();
        return correctText === studentText;
      
      case 'matching':
        const correctMatching = question.correct_answer.matching || {};
        const studentMatching = studentAnswer || {};
        return Object.keys(correctMatching).every(key => 
          correctMatching[key] === studentMatching[key]
        );
      
      default:
        return false;
    }
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const answer = answers[question.id];

    return (
      <div key={question.id} className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Question {index + 1} of {questions.length}
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {question.points} point{question.points !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-800 text-base leading-relaxed">{question.question}</p>
        </div>

        {renderAnswerInput(question, answer)}
      </div>
    );
  };

  const renderAnswerInput = (question: QuizQuestion, currentAnswer: any) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options.choices?.map((choice, index) => (
              <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={choice}
                  checked={currentAnswer === choice}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="ml-3 text-gray-800">{choice}</span>
              </label>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            {['True', 'False'].map((choice) => (
              <label key={choice} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={choice}
                  checked={currentAnswer === choice}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="ml-3 text-gray-800">{choice}</span>
              </label>
            ))}
          </div>
        );

      case 'short_answer':
        return (
          <input
            type="text"
            value={currentAnswer || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter your answer..."
          />
        );

      case 'essay':
        return (
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Write your essay answer here..."
          />
        );

      case 'matching':
        const matchingPairs = question.options.matching_pairs || [];
        const leftItems = matchingPairs.map(pair => pair.left);
        const rightItems = matchingPairs.map(pair => pair.right).sort(() => Math.random() - 0.5);
        
        return (
          <div className="space-y-4">
            {leftItems.map((leftItem, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1 p-3 bg-gray-100 rounded-lg">
                  {leftItem}
                </div>
                <span className="text-gray-400">→</span>
                <select
                  value={currentAnswer?.[leftItem] || ''}
                  onChange={(e) => updateAnswer(question.id, {
                    ...currentAnswer,
                    [leftItem]: e.target.value
                  })}
                  className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select match...</option>
                  {rightItems.map((rightItem, idx) => (
                    <option key={idx} value={rightItem}>{rightItem}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        );

      default:
        return <p className="text-gray-500 italic">Question type not supported</p>;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <StudentLayout title="Loading Quiz...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !quiz) {
    return (
      <StudentLayout title="Quiz Not Found">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">😞</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Quiz Not Available</h2>
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
    <StudentLayout title={quiz.title}>
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <nav className="text-sm text-gray-500 mb-2">
                <button
                  onClick={() => router.push(`/portal/student/courses/${courseId}`)}
                  className="hover:text-purple-600"
                >
                  {quiz.course_lessons.course_modules.title}
                </button>
                <span className="mx-2">/</span>
                <button
                  onClick={() => router.push(`/portal/student/courses/${courseId}/lessons/${quiz.course_lessons.id}`)}
                  className="hover:text-purple-600"
                >
                  {quiz.course_lessons.title}
                </button>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{quiz.title}</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            </div>
            
            {quizState === 'taking' && timeRemaining !== null && (
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Time Remaining</div>
                <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-purple-600'}`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            )}
          </div>

          {quiz.description && (
            <p className="text-gray-600 mb-4">{quiz.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>📝 {questions.length} questions</span>
            <span>🎯 {quiz.passing_score}% to pass</span>
            <span>🔄 {quiz.max_attempts} max attempts</span>
            {quiz.time_limit_minutes && (
              <span>⏰ {quiz.time_limit_minutes} minutes</span>
            )}
          </div>
        </div>

        {/* Quiz States */}
        {quizState === 'preview' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Start?</h2>
            
            {quiz.instructions && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                <p className="text-blue-800 whitespace-pre-wrap">{quiz.instructions}</p>
              </div>
            )}

            {attempts.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Previous Attempts</h3>
                <div className="space-y-2">
                  {attempts.slice(0, 3).map((attempt, index) => (
                    <div key={attempt.id} className="flex items-center justify-between text-sm">
                      <span>Attempt {attempt.attempt_number}</span>
                      <span className={attempt.percentage! >= quiz.passing_score ? 'text-green-600' : 'text-red-600'}>
                        {attempt.percentage}% ({attempt.score}/{attempt.max_score} points)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {attempts.length >= quiz.max_attempts ? (
              <div className="text-red-600">
                <p className="mb-4">You have used all {quiz.max_attempts} attempts for this quiz.</p>
                <p>Your best score: {Math.max(...attempts.map(a => a.percentage || 0))}%</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Attempt {attempts.length + 1} of {quiz.max_attempts}
                </p>
                <button
                  onClick={startQuiz}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200"
                >
                  Start Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {quizState === 'taking' && (
          <div>
            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{currentQuestionIndex + 1} of {questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current Question */}
            {questions[currentQuestionIndex] && renderQuestion(questions[currentQuestionIndex], currentQuestionIndex)}

            {/* Navigation */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        )}

        {quizState === 'completed' && showResults && currentAttempt && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className={`text-6xl mb-4 ${currentAttempt.percentage! >= quiz.passing_score ? '🎉' : '😔'}`}>
              {currentAttempt.percentage! >= quiz.passing_score ? '🎉' : '😔'}
            </div>
            
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              {currentAttempt.percentage! >= quiz.passing_score ? 'Congratulations!' : 'Keep Learning!'}
            </h2>
            
            <p className="text-xl text-gray-600 mb-6">
              You scored {currentAttempt.percentage}% ({currentAttempt.score}/{currentAttempt.max_score} points)
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-gray-900">Passing Score</div>
                  <div className="text-gray-600">{quiz.passing_score}%</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Time Taken</div>
                  <div className="text-gray-600">{currentAttempt.time_taken_minutes || 0} minutes</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Attempts Used</div>
                  <div className="text-gray-600">{attempts.length} of {quiz.max_attempts}</div>
                </div>
              </div>
            </div>

            <div className="space-x-4">
              {quiz.show_answers && (
                <button
                  onClick={() => setQuizState('reviewing')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Review Answers
                </button>
              )}
              
              {currentAttempt.percentage! < quiz.passing_score && attempts.length < quiz.max_attempts && (
                <button
                  onClick={() => setQuizState('preview')}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                >
                  Try Again
                </button>
              )}
              
              <button
                onClick={() => router.push(`/portal/student/courses/${courseId}/lessons/${quiz.course_lessons.id}`)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Back to Lesson
              </button>
            </div>
          </div>
        )}

        {quizState === 'reviewing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Quiz Review</h2>
              <p className="text-gray-600">Review your answers and explanations</p>
            </div>

            {questions.map((question, index) => {
              const studentAnswer = answers[question.id];
              const isCorrect = isAnswerCorrect(question, studentAnswer);

              return (
                <div key={question.id} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {index + 1}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isCorrect ? `✓ Correct (+${question.points} pts)` : '✗ Incorrect (0 pts)'}
                    </div>
                  </div>
                  
                  <p className="text-gray-800 mb-4">{question.question}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Your Answer: </span>
                      <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {typeof studentAnswer === 'object' 
                          ? JSON.stringify(studentAnswer) 
                          : studentAnswer || 'No answer'
                        }
                      </span>
                    </div>
                    
                    {!isCorrect && (
                      <div>
                        <span className="font-medium text-gray-700">Correct Answer: </span>
                        <span className="text-green-600">
                          {typeof question.correct_answer.choice === 'string' 
                            ? question.correct_answer.choice
                            : question.correct_answer.text ||
                              JSON.stringify(question.correct_answer.matching) ||
                              'See explanation'
                          }
                        </span>
                      </div>
                    )}
                    
                    {question.explanation && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <span className="font-medium text-blue-900">Explanation: </span>
                        <span className="text-blue-800">{question.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="text-center">
              <button
                onClick={() => router.push(`/portal/student/courses/${courseId}/lessons/${quiz.course_lessons.id}`)}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700"
              >
                Back to Lesson
              </button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
