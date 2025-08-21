import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailUser {
  firstName: string
  lastName: string
  email: string
}

export interface BookingEmailData {
  booking: {
    id: string
    scheduledAt: Date
    notes?: string
    depositAmount: number
    totalAmount: number
  }
  treatment: {
    name: string
    duration: number
    description?: string
  }
  practitioner: {
    firstName: string
    lastName: string
    title?: string
    email: string
    phone?: string
  }
  client: EmailUser
}

export interface CourseEmailData {
  enrollment: {
    id: string
    enrolledAt: Date
    progress: number
  }
  course: {
    title: string
    description?: string
    duration: number
    level: string
    price: number
  }
  educator: {
    firstName: string
    lastName: string
    title?: string
    email: string
  }
  student: EmailUser
}

// Email templates
const getBookingConfirmationTemplate = (data: BookingEmailData): string => {
  const { booking, treatment, practitioner, client } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e1e5e9; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .highlight { color: #667eea; font-weight: bold; }
        .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
          <p>Your appointment has been successfully booked</p>
        </div>
        
        <div class="content">
          <p>Dear ${client.firstName},</p>
          
          <p>Thank you for booking with <strong>LEA Aesthetics</strong>. Your appointment has been confirmed and your deposit payment has been processed successfully.</p>
          
          <div class="booking-details">
            <h3>📋 Booking Details</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Treatment:</strong> ${treatment.name}</li>
              <li><strong>Duration:</strong> ${treatment.duration} minutes</li>
              <li><strong>Scheduled:</strong> ${booking.scheduledAt.toLocaleDateString('en-GB', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</li>
              <li><strong>Practitioner:</strong> ${practitioner.firstName} ${practitioner.lastName}${practitioner.title ? ` - ${practitioner.title}` : ''}</li>
              <li><strong>Booking ID:</strong> ${booking.id}</li>
            </ul>
          </div>
          
          <div class="booking-details">
            <h3>💳 Payment Information</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Deposit Paid:</strong> <span class="highlight">£${booking.depositAmount.toFixed(2)}</span></li>
              <li><strong>Total Cost:</strong> £${booking.totalAmount.toFixed(2)}</li>
              <li><strong>Balance Due:</strong> <span class="highlight">£${(booking.totalAmount - booking.depositAmount).toFixed(2)}</span> (payable on appointment day)</li>
            </ul>
          </div>
          
          ${booking.notes ? `
          <div class="booking-details">
            <h3>📝 Notes</h3>
            <p>${booking.notes}</p>
          </div>
          ` : ''}
          
          <h3>📞 Contact Information</h3>
          <p>Your practitioner will contact you shortly to finalize the appointment details. If you need to reach them directly:</p>
          <ul>
            <li><strong>Email:</strong> ${practitioner.email}</li>
            ${practitioner.phone ? `<li><strong>Phone:</strong> ${practitioner.phone}</li>` : ''}
          </ul>
          
          <p style="margin-top: 30px;">
            <a href="https://leaaesthetics.com/dashboard" class="button">View Your Bookings</a>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>LEA Aesthetics Clinical Academy</strong></p>
          <p>Professional Beauty & Wellness Treatments</p>
          <p>
            <a href="mailto:support@leaaesthetics.com">support@leaaesthetics.com</a> | 
            <a href="https://leaaesthetics.com">leaaesthetics.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

const getCourseEnrollmentTemplate = (data: CourseEmailData): string => {
  const { enrollment, course, educator, student } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e1e5e9; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .course-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .highlight { color: #11998e; font-weight: bold; }
        .button { background: #11998e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Welcome to Your Course!</h1>
          <p>Your enrollment has been confirmed</p>
        </div>
        
        <div class="content">
          <p>Dear ${student.firstName},</p>
          
          <p>Congratulations! You've successfully enrolled in <strong>${course.title}</strong> at LEA Aesthetics Clinical Academy. We're excited to have you join us on this learning journey.</p>
          
          <div class="course-details">
            <h3>📚 Course Details</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Course:</strong> ${course.title}</li>
              <li><strong>Level:</strong> ${course.level}</li>
              <li><strong>Duration:</strong> ${course.duration} hours</li>
              <li><strong>Instructor:</strong> ${educator.firstName} ${educator.lastName}${educator.title ? ` - ${educator.title}` : ''}</li>
              <li><strong>Enrollment ID:</strong> ${enrollment.id}</li>
              <li><strong>Enrolled:</strong> ${enrollment.enrolledAt.toLocaleDateString('en-GB', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</li>
            </ul>
          </div>
          
          ${course.description ? `
          <div class="course-details">
            <h3>📖 Course Description</h3>
            <p>${course.description}</p>
          </div>
          ` : ''}
          
          <div class="course-details">
            <h3>💳 Payment Information</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Course Fee:</strong> <span class="highlight">£${course.price.toFixed(2)}</span></li>
              <li><strong>Status:</strong> <span style="color: green;">✅ Paid</span></li>
            </ul>
          </div>
          
          <h3>🎯 Next Steps</h3>
          <ol>
            <li>Access your student dashboard to view course materials</li>
            <li>Complete the course modules at your own pace</li>
            <li>Participate in practical sessions (if applicable)</li>
            <li>Complete assessments and receive your certificate</li>
          </ol>
          
          <h3>📧 Instructor Contact</h3>
          <p>Your instructor is available to help throughout the course:</p>
          <ul>
            <li><strong>Email:</strong> ${educator.email}</li>
          </ul>
          
          <p style="margin-top: 30px;">
            <a href="https://leaaesthetics.com/dashboard" class="button">Access Course Materials</a>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>LEA Aesthetics Clinical Academy</strong></p>
          <p>Professional Beauty & Wellness Education</p>
          <p>
            <a href="mailto:academy@leaaesthetics.com">academy@leaaesthetics.com</a> | 
            <a href="https://leaaesthetics.com">leaaesthetics.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Email sending functions
export const sendBookingConfirmation = async (data: BookingEmailData): Promise<boolean> => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email')
    return false
  }

  try {
    await resend.emails.send({
      from: 'LEA Aesthetics <bookings@leaaesthetics.com>',
      to: data.client.email,
      subject: `Booking Confirmed - ${data.treatment.name}`,
      html: getBookingConfirmationTemplate(data),
    })

    // Send notification to practitioner
    await resend.emails.send({
      from: 'LEA Aesthetics <bookings@leaaesthetics.com>',
      to: data.practitioner.email,
      subject: `New Booking - ${data.treatment.name}`,
      html: `
        <h2>New Booking Received</h2>
        <p>You have a new booking from ${data.client.firstName} ${data.client.lastName}.</p>
        <ul>
          <li><strong>Treatment:</strong> ${data.treatment.name}</li>
          <li><strong>Scheduled:</strong> ${data.booking.scheduledAt.toLocaleDateString('en-GB')}</li>
          <li><strong>Client Email:</strong> ${data.client.email}</li>
          <li><strong>Booking ID:</strong> ${data.booking.id}</li>
        </ul>
        <p>Please contact the client to finalize appointment details.</p>
      `,
    })

    return true
  } catch (error) {
    console.error('Failed to send booking confirmation:', error)
    return false
  }
}

export const sendCourseEnrollmentConfirmation = async (data: CourseEmailData): Promise<boolean> => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email')
    return false
  }

  try {
    await resend.emails.send({
      from: 'LEA Aesthetics Academy <academy@leaaesthetics.com>',
      to: data.student.email,
      subject: `Welcome to ${data.course.title}!`,
      html: getCourseEnrollmentTemplate(data),
    })

    // Send notification to educator
    await resend.emails.send({
      from: 'LEA Aesthetics Academy <academy@leaaesthetics.com>',
      to: data.educator.email,
      subject: `New Student Enrollment - ${data.course.title}`,
      html: `
        <h2>New Student Enrolled</h2>
        <p>${data.student.firstName} ${data.student.lastName} has enrolled in your course.</p>
        <ul>
          <li><strong>Course:</strong> ${data.course.title}</li>
          <li><strong>Student Email:</strong> ${data.student.email}</li>
          <li><strong>Enrollment ID:</strong> ${data.enrollment.id}</li>
          <li><strong>Enrolled:</strong> ${data.enrollment.enrolledAt.toLocaleDateString('en-GB')}</li>
        </ul>
      `,
    })

    return true
  } catch (error) {
    console.error('Failed to send course enrollment confirmation:', error)
    return false
  }
}

export const sendPasswordResetEmail = async (user: EmailUser, resetToken: string): Promise<boolean> => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email')
    return false
  }

  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

    await resend.emails.send({
      from: 'LEA Aesthetics <support@leaaesthetics.com>',
      to: user.email,
      subject: 'Reset Your Password - LEA Aesthetics',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.firstName},</p>
        <p>We received a request to reset your password for your LEA Aesthetics account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>LEA Aesthetics Team</p>
      `,
    })

    return true
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return false
  }
}

export const sendWelcomeEmail = async (user: EmailUser, role: string): Promise<boolean> => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email')
    return false
  }

  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

    await resend.emails.send({
      from: 'LEA Aesthetics <welcome@leaaesthetics.com>',
      to: user.email,
      subject: 'Welcome to LEA Aesthetics!',
      html: `
        <h2>Welcome to LEA Aesthetics!</h2>
        <p>Hello ${user.firstName},</p>
        <p>Thank you for joining LEA Aesthetics as a ${role.toLowerCase()}. We're excited to have you as part of our community.</p>
        <p>Your account has been created successfully. You can now access your dashboard to:</p>
        <ul>
          ${role === 'CLIENT' ? '<li>Book treatments with our qualified practitioners</li>' : ''}
          ${role === 'STUDENT' ? '<li>Enroll in professional courses</li>' : ''}
          ${role === 'PRACTITIONER' ? '<li>Manage your treatment bookings and clients</li>' : ''}
          ${role === 'EDUCATOR' ? '<li>Create and manage your courses</li>' : ''}
          <li>Update your profile information</li>
          <li>Access support and resources</li>
        </ul>
        <p><a href="${dashboardUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Access Your Dashboard</a></p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>LEA Aesthetics Team</p>
      `,
    })

    return true
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return false
  }
}
