import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

// GET /api/student/certificates - List student's certificates
export async function GET(request: NextRequest) {
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

    // Fetch student certificates
    const { data: certificates, error } = await supabase
      .from('student_certificates')
      .select(`
        id,
        certificate_number,
        issued_at,
        expires_at,
        pdf_url,
        verification_code,
        metadata,
        course_enrollments (
          id,
          completed_at,
          courses (
            id,
            title,
            description,
            duration_hours
          )
        )
      `)
      .eq('student_id', student.id)
      .order('issued_at', { ascending: false })

    if (error) {
      console.error('Error fetching certificates:', error)
      return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
    }

    return NextResponse.json({ data: certificates })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
