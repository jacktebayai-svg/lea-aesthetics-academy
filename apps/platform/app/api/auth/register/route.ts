import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const prisma = new PrismaClient()

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['PRACTITIONER', 'EDUCATOR', 'CLIENT', 'STUDENT']).default('CLIENT'),
  title: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  expertise: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      role, 
      title,
      specialties,
      expertise 
    } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with profiles in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          activeMode: role === 'PRACTITIONER' || role === 'EDUCATOR' ? role : 'PRACTITIONER',
        }
      })

      // Create user role
      await tx.userRole.create({
        data: {
          userId: newUser.id,
          name: role,
        }
      })

      // Create specific profile based on role
      if (role === 'PRACTITIONER') {
        await tx.practitionerProfile.create({
          data: {
            userId: newUser.id,
            title: title || '',
            bio: '',
            isActive: true,
          }
        })

        // Add specialties if provided
        if (specialties && specialties.length > 0) {
          await Promise.all(
            specialties.map(specialty =>
              tx.practitionerSpecialty.create({
                data: {
                  name: specialty,
                  practitionerId: newUser.id,
                }
              })
            )
          )
        }
      }

      if (role === 'EDUCATOR') {
        await tx.educatorProfile.create({
          data: {
            userId: newUser.id,
            title: title || '',
            bio: '',
            isActive: true,
          }
        })

        // Add expertise if provided
        if (expertise && expertise.length > 0) {
          await Promise.all(
            expertise.map(exp =>
              tx.educatorExpertise.create({
                data: {
                  name: exp,
                  educatorId: newUser.id,
                }
              })
            )
          )
        }
      }

      return newUser
    })

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        roles: [role],
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Prepare user data for response
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: [role],
      activeMode: user.activeMode,
    }

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: userData,
      message: 'Account created successfully',
    })

    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
