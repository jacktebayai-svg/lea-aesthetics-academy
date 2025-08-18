import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const prisma = new PrismaClient()

interface JWTPayload {
  userId: string
  email: string
  roles: string[]
}

const updateModeSchema = z.object({
  activeMode: z.enum(['PRACTITIONER', 'EDUCATOR']),
})

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { activeMode } = updateModeSchema.parse(body)

    // Verify user has the role they're trying to switch to
    if (!decoded.roles.includes(activeMode)) {
      return NextResponse.json(
        { error: 'User does not have permission for this mode' },
        { status: 403 }
      )
    }

    // Update user's active mode in database
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { activeMode },
    })

    return NextResponse.json({
      success: true,
      activeMode,
      message: 'Mode updated successfully',
    })
  } catch (error) {
    console.error('Update mode error:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

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
