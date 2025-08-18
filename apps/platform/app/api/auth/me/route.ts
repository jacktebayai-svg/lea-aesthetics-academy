import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

interface JWTPayload {
  userId: string
  email: string
  roles: string[]
}

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload

    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
        { error: 'User not found' },
        { status: 404 }
      )
    }

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

    return NextResponse.json({
      success: true,
      user: userData,
    })
  } catch (error) {
    console.error('Auth verification error:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
