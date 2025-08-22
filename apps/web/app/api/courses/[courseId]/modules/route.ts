import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema for creating/updating course modules
const moduleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  order_index: z.number().int().min(0),
  duration_minutes: z.number().int().min(0).default(0),
  is_required: z.boolean().default(true),
  prerequisites: z.record(z.any()).optional()
})

interface RouteParams {
  params: {
    courseId: string
  }
}

// GET /api/courses/[courseId]/modules - List all modules for a course
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { courseId } = params
    const { searchParams } = new URL(request.url)
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const userRole = profile?.role
    const includeProgress = searchParams.get('include_progress') === 'true'

    // Build query with modules and lessons
    let query = supabase
      .from('course_modules')
      .select(`
        id,
        title,
        description,
        order_index,
        duration_minutes,
        is_required,
        prerequisites,
        created_at,
        updated_at,
        course_lessons (
          id,
          title,
          description,
          type,
          duration_minutes,
          order_index,
          is_required,
          created_at
        )
      `)
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    // Add progress data for students
    if (includeProgress && userRole === 'student') {
      // Get student record
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (student) {
        // Get module progress
        const { data: moduleProgress } = await supabase
          .from('student_module_progress')
          .select('module_id, completion_percentage, completed_at')
          .eq('student_id', student.id)
        
        // Get lesson progress
        const { data: lessonProgress } = await supabase
          .from('student_lesson_progress')
          .select('lesson_id, status, completion_percentage, completed_at')
          .eq('student_id', student.id)
        
        const { data: modules, error } = await query
        
        if (error) {
          console.error('Error fetching modules:', error)
          return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
        }
        
        // Merge progress data
        const modulesWithProgress = modules.map(module => {
          const progress = moduleProgress?.find(p => p.module_id === module.id)
          const lessonsWithProgress = module.course_lessons?.map(lesson => {
            const lessonProg = lessonProgress?.find(p => p.lesson_id === lesson.id)
            return {
              ...lesson,
              progress: lessonProg ? {
                status: lessonProg.status,
                completion_percentage: lessonProg.completion_percentage,
                completed_at: lessonProg.completed_at
              } : null
            }
          })
          
          return {
            ...module,
            course_lessons: lessonsWithProgress,
            progress: progress ? {
              completion_percentage: progress.completion_percentage,
              completed_at: progress.completed_at
            } : null
          }
        })
        
        return NextResponse.json({ data: modulesWithProgress })
      }
    }

    const { data: modules, error } = await query
    
    if (error) {
      console.error('Error fetching modules:', error)
      return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
    }

    return NextResponse.json({ data: modules })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/courses/[courseId]/modules - Create new module (owner only)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { courseId } = params

    // Check if user is authenticated and is owner
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify course exists
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single()

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = moduleSchema.parse(body)

    // Check for order_index conflicts
    const { data: existingModule } = await supabase
      .from('course_modules')
      .select('id')
      .eq('course_id', courseId)
      .eq('order_index', validatedData.order_index)
      .single()

    if (existingModule) {
      return NextResponse.json({ 
        error: 'Order index already exists. Please choose a different order.' 
      }, { status: 409 })
    }

    // Create module
    const { data: module, error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        ...validatedData,
        prerequisites: validatedData.prerequisites || {}
      })
      .select(`
        id,
        title,
        description,
        order_index,
        duration_minutes,
        is_required,
        prerequisites,
        created_at,
        updated_at
      `)
      .single()

    if (error) {
      console.error('Error creating module:', error)
      return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
    }

    // Log module creation
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'course_module_created',
        resource: 'course_module',
        resource_id: module.id,
        new_values: module
      })

    return NextResponse.json({ data: module }, { status: 201 })
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
