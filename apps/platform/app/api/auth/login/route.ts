import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const prisma = new PrismaClient()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        practitionerProfile: {
          include: {
            specialties: true,
          },
        },
        educatorProfile: {
          include: {
            expertise: true,
          },
        },
        roles: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        roles: user.roles.map(r => r.name),
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
      roles: user.roles.map(r => r.name),
      activeMode: user.activeMode || 'PRACTITIONER',
      practitionerProfile: user.practitionerProfile ? {
        id: user.practitionerProfile.id,
        title: user.practitionerProfile.title,
        bio: user.practitionerProfile.bio,
        specialties: user.practitionerProfile.specialties.map(s => s.name),
        isActive: user.practitionerProfile.isActive,
      } : undefined,
      educatorProfile: user.educatorProfile ? {
        id: user.educatorProfile.id,
        title: user.educatorProfile.title,
        bio: user.educatorProfile.bio,
        expertise: user.educatorProfile.expertise.map(e => e.name),
        isActive: user.educatorProfile.isActive,
      } : undefined,
    }

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: userData,
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
    console.error('Login error:', error)
    
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
