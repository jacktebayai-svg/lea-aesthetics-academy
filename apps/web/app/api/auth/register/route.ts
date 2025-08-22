import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Registration schema with role-based validation
const registrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['client', 'student'], { 
    errorMap: () => ({ message: 'Role must be either client or student' })
  }),
  profile: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    // Client-specific fields
    medicalHistory: z.string().optional(),
    allergies: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    // Student-specific fields
    educationLevel: z.string().optional(),
    previousExperience: z.string().optional(),
    goals: z.string().optional(),
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = registrationSchema.parse(body)
    
    const { email, password, role, profile = {} } = validatedData

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find((user: any) => user.email === email)
    
    if (existingUser) {
      return NextResponse.json({ 
        error: 'User already exists with this email address' 
      }, { status: 409 })
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for development
      user_metadata: {
        role,
        firstName: profile.firstName,
        lastName: profile.lastName,
        profile
      }
    })

    if (authError || !authData.user) {
      console.error('Auth user creation failed:', authError)
      return NextResponse.json({ 
        error: 'Failed to create user account' 
      }, { status: 500 })
    }

    // Create user profile (handled by trigger, but we'll verify)
    let retryCount = 0
    let userProfile = null
    
    // Wait for trigger to create profile (with retries)
    while (retryCount < 5 && !userProfile) {
      await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms
      
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
        
      userProfile = data
      retryCount++
    }

    if (!userProfile) {
      console.error('User profile not created by trigger')
      // Manually create user profile as fallback
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email,
          role,
          profile: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            ...profile
          }
        })

      if (profileError) {
        console.error('Manual profile creation failed:', profileError)
        return NextResponse.json({ 
          error: 'Failed to create user profile' 
        }, { status: 500 })
      }
    }

    // Create role-specific profile
    if (role === 'client') {
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: authData.user.id,
          personal_info: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            dateOfBirth: profile.dateOfBirth,
            medicalHistory: profile.medicalHistory || '',
            allergies: profile.allergies || '',
            emergencyContactName: profile.emergencyContactName,
            emergencyContactPhone: profile.emergencyContactPhone
          },
          preferences: {},
          tags: []
        })
        .single()

      if (clientError) {
        console.error('Client profile creation failed:', clientError)
        return NextResponse.json({ 
          error: 'Failed to create client profile' 
        }, { status: 500 })
      }
    } else if (role === 'student') {
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: authData.user.id,
          personal_info: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            dateOfBirth: profile.dateOfBirth,
            educationLevel: profile.educationLevel || '',
            previousExperience: profile.previousExperience || '',
            goals: profile.goals || ''
          },
          certifications: [],
          progress: {}
        })
        .single()

      if (studentError) {
        console.error('Student profile creation failed:', studentError)
        return NextResponse.json({ 
          error: 'Failed to create student profile' 
        }, { status: 500 })
      }
    }

    // Generate session for immediate login
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: role === 'client' ? '/portal/client' : '/portal/student'
      }
    })

    if (sessionError) {
      console.error('Session generation failed:', sessionError)
    }

    // Log successful registration
    await supabase
      .from('audit_logs')
      .insert({
        user_id: authData.user.id,
        action: 'user_registered',
        resource: 'user',
        resource_id: authData.user.id,
        new_values: { email, role }
      })

    return NextResponse.json({
      message: 'Registration successful',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role
        },
        redirect_url: role === 'client' ? '/portal/client' : '/portal/student',
        magic_link: sessionData?.properties?.action_link // For development
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    
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
