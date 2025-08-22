import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { format } from 'date-fns'

interface RouteParams {
  params: {
    certificateId: string
  }
}

// GET /api/student/certificates/[certificateId]/download - Download certificate PDF
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { certificateId } = params
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student record
    const { data: student } = await supabase
      .from('students')
      .select('id, personal_info')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // Fetch certificate with course details
    const { data: certificate, error: certificateError } = await supabase
      .from('student_certificates')
      .select(`
        id,
        certificate_number,
        issued_at,
        expires_at,
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
      .eq('id', certificateId)
      .eq('student_id', student.id)
      .single()

    if (certificateError || !certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Generate PDF certificate
    const pdfBuffer = await generateCertificatePDF(certificate, student.personal_info)

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="LEA_Certificate_${certificate.certificate_number}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating certificate PDF:', error)
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 })
  }
}

async function generateCertificatePDF(certificate: any, studentInfo: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      })

      const chunks: Buffer[] = []
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))

      const course = certificate.course_enrollments.courses
      const studentName = `${studentInfo?.firstName || ''} ${studentInfo?.lastName || ''}`.trim() || 'Student'
      const completionDate = certificate.course_enrollments.completed_at
      const issueDate = certificate.issued_at

      // Set up colors
      const primaryColor = '#7C3AED' // Purple
      const goldColor = '#F59E0B'
      const darkGray = '#374151'

      // Background gradient effect
      doc.save()
      doc.rect(0, 0, doc.page.width, doc.page.height)
      doc.fillColor('#F9FAFB')
      doc.fill()
      doc.restore()

      // Header border
      doc.save()
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      doc.lineWidth(3)
      doc.strokeColor(primaryColor)
      doc.stroke()
      doc.restore()

      // Inner border
      doc.save()
      doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
      doc.lineWidth(1)
      doc.strokeColor(goldColor)
      doc.stroke()
      doc.restore()

      // LEA Logo placeholder (you can add actual logo here)
      doc.save()
      doc.fontSize(24)
      doc.fillColor(primaryColor)
      doc.font('Helvetica-Bold')
      doc.text('LEA', 70, 80, { align: 'left' })
      doc.restore()

      // Title
      doc.save()
      doc.fontSize(36)
      doc.fillColor(darkGray)
      doc.font('Helvetica-Bold')
      doc.text('CERTIFICATE OF COMPLETION', 0, 140, { align: 'center', width: doc.page.width })
      doc.restore()

      // Subtitle
      doc.save()
      doc.fontSize(18)
      doc.fillColor(primaryColor)
      doc.font('Helvetica')
      doc.text('LEA Aesthetics Clinical Academy', 0, 190, { align: 'center', width: doc.page.width })
      doc.restore()

      // Main content - "This is to certify that"
      doc.save()
      doc.fontSize(16)
      doc.fillColor(darkGray)
      doc.font('Helvetica')
      doc.text('This is to certify that', 0, 250, { align: 'center', width: doc.page.width })
      doc.restore()

      // Student name (prominent)
      doc.save()
      doc.fontSize(32)
      doc.fillColor(primaryColor)
      doc.font('Helvetica-Bold')
      doc.text(studentName, 0, 290, { align: 'center', width: doc.page.width })
      doc.restore()

      // Course completion text
      doc.save()
      doc.fontSize(16)
      doc.fillColor(darkGray)
      doc.font('Helvetica')
      doc.text('has successfully completed the course', 0, 340, { align: 'center', width: doc.page.width })
      doc.restore()

      // Course title
      doc.save()
      doc.fontSize(24)
      doc.fillColor(primaryColor)
      doc.font('Helvetica-Bold')
      doc.text(course.title, 0, 370, { align: 'center', width: doc.page.width })
      doc.restore()

      // Course details
      if (course.duration_hours) {
        doc.save()
        doc.fontSize(14)
        doc.fillColor(darkGray)
        doc.font('Helvetica')
        doc.text(`Duration: ${course.duration_hours} hours`, 0, 410, { align: 'center', width: doc.page.width })
        doc.restore()
      }

      // Completion date
      doc.save()
      doc.fontSize(14)
      doc.fillColor(darkGray)
      doc.font('Helvetica')
      const completionDateFormatted = format(new Date(completionDate), 'MMMM do, yyyy')
      doc.text(`Completed on: ${completionDateFormatted}`, 0, 435, { align: 'center', width: doc.page.width })
      doc.restore()

      // Certificate details (left side)
      doc.save()
      doc.fontSize(10)
      doc.fillColor('#6B7280')
      doc.font('Helvetica')
      doc.text('Certificate Number:', 70, doc.page.height - 140)
      doc.font('Helvetica-Bold')
      doc.text(certificate.certificate_number, 70, doc.page.height - 125)
      
      doc.font('Helvetica')
      doc.text('Issue Date:', 70, doc.page.height - 105)
      doc.font('Helvetica-Bold')
      doc.text(format(new Date(issueDate), 'MMM do, yyyy'), 70, doc.page.height - 90)
      
      if (certificate.expires_at) {
        doc.font('Helvetica')
        doc.text('Expires:', 70, doc.page.height - 70)
        doc.font('Helvetica-Bold')
        doc.text(format(new Date(certificate.expires_at), 'MMM do, yyyy'), 70, doc.page.height - 55)
      }
      doc.restore()

      // Verification info (right side)
      doc.save()
      doc.fontSize(10)
      doc.fillColor('#6B7280')
      doc.font('Helvetica')
      doc.text('Verification Code:', doc.page.width - 200, doc.page.height - 140)
      doc.font('Helvetica-Bold')
      doc.text(certificate.verification_code, doc.page.width - 200, doc.page.height - 125)
      
      doc.font('Helvetica')
      doc.text('Verify at:', doc.page.width - 200, doc.page.height - 105)
      doc.font('Helvetica-Bold')
      doc.fillColor(primaryColor)
      doc.text('lea-aesthetics.com/verify', doc.page.width - 200, doc.page.height - 90)
      doc.restore()

      // Signature area
      doc.save()
      doc.fontSize(12)
      doc.fillColor(darkGray)
      doc.font('Helvetica-Oblique')
      
      // Signature line
      doc.moveTo(doc.page.width - 300, doc.page.height - 140)
      doc.lineTo(doc.page.width - 100, doc.page.height - 140)
      doc.strokeColor('#9CA3AF')
      doc.lineWidth(1)
      doc.stroke()
      
      doc.text('Director, LEA Aesthetics Clinical Academy', doc.page.width - 300, doc.page.height - 125, {
        align: 'center',
        width: 200
      })
      doc.restore()

      // Decorative elements (corner flourishes)
      doc.save()
      doc.strokeColor(goldColor)
      doc.lineWidth(2)
      
      // Top-left corner
      doc.moveTo(60, 60).lineTo(90, 60).lineTo(90, 90)
      doc.stroke()
      
      // Top-right corner  
      doc.moveTo(doc.page.width - 60, 60).lineTo(doc.page.width - 90, 60).lineTo(doc.page.width - 90, 90)
      doc.stroke()
      
      // Bottom-left corner
      doc.moveTo(60, doc.page.height - 60).lineTo(90, doc.page.height - 60).lineTo(90, doc.page.height - 90)
      doc.stroke()
      
      // Bottom-right corner
      doc.moveTo(doc.page.width - 60, doc.page.height - 60).lineTo(doc.page.width - 90, doc.page.height - 60).lineTo(doc.page.width - 90, doc.page.height - 90)
      doc.stroke()
      doc.restore()

      // Final score if available
      if (certificate.metadata?.final_score) {
        doc.save()
        doc.fontSize(12)
        doc.fillColor(goldColor)
        doc.font('Helvetica-Bold')
        doc.text(`Final Score: ${certificate.metadata.final_score}%`, 0, 460, { align: 'center', width: doc.page.width })
        doc.restore()
      }

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
