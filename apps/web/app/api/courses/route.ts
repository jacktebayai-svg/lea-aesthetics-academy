import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema for creating/updating courses
const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.number().int().min(0, 'Price must be a positive integer'),
  duration_hours: z.number().int().min(1, 'Duration must be at least 1 hour'),
  max_students: z.number().int().min(1).optional(),
  curriculum: z.record(z.any()).optional(),
  prerequisites: z.record(z.any()).optional(),
  certificate_template: z.record(z.any()).optional(),
  is_active: z.boolean().optional()
})

// GET /api/courses - List all courses
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const isActive = searchParams.get('active')
    const category = searchParams.get('category')
    const includeEnrollments = searchParams.get('include_enrollments') === 'true'
    
    // Check if user is authenticated to see additional details
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    let userRole = null
    
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      userRole = profile?.role
    }

    let query = supabase
      .from('courses')
      .select(`
        id,
        title,
        slug,
        description,
        price,
        duration_hours,
        max_students,
        curriculum,
        prerequisites,
        certificate_template,
        is_active,
        created_at,
        updated_at,
        ${includeEnrollments && userRole === 'owner' ? `
        course_enrollments (
          id,
          student_id,
          status,
          progress,
          completed_at,
          students (
            id,
            personal_info
          )
        )
        ` : ''}
      `)

    // Apply filters
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    // Non-owners can only see active courses
    if (userRole !== 'owner') {
      query = query.eq('is_active', true)
    }

    query = query.order('title', { ascending: true })

    const { data: courses, error } = await query

    if (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }

    // Add enrollment count for each course
    const coursesWithCounts = await Promise.all(
      courses.map(async (course) => {
        const { count } = await supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', (course as any).id)
          .in('status', ['enrolled', 'in_progress', 'completed'])

        return {
          ...(course as any),
          enrollment_count: count || 0,
          available_slots: (course as any).max_students ? (course as any).max_students - (count || 0) : null
        }
      })
    )

    return NextResponse.json({ data: coursesWithCounts })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/courses - Create new course (owner only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = courseSchema.parse(body)

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create course
    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        ...validatedData,
        slug,
        curriculum: validatedData.curriculum || {},
        prerequisites: validatedData.prerequisites || {},
        certificate_template: validatedData.certificate_template || {},
        is_active: validatedData.is_active ?? true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating course:', error)
      
      // Handle unique constraint violation
      if (error.code === '23505' && error.details?.includes('slug')) {
        return NextResponse.json({ error: 'Course title must be unique' }, { status: 409 })
      }
      
      return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
    }

    // Log course creation
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'course_created',
        resource: 'course',
        resource_id: course.id,
        new_values: course
      })

    return NextResponse.json({ data: course }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
