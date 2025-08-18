import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const treatments = await prisma.treatment.findMany({
      where: {
        isActive: true,
      },
      include: {
        practitioner: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    })

    const formattedTreatments = treatments.map(treatment => ({
      id: treatment.id,
      name: treatment.name,
      description: treatment.description,
      duration: treatment.duration,
      price: treatment.price,
      depositAmount: treatment.depositAmount || Math.floor(treatment.price * 0.5),
      category: treatment.category,
      requiresConsultation: treatment.requiresConsultation,
      minimumAge: treatment.minimumAge,
      aftercareRequired: treatment.aftercareRequired,
      practitioner: {
        name: `${treatment.practitioner.user.firstName} ${treatment.practitioner.user.lastName}`,
        title: treatment.practitioner.title,
      },
    }))

    return NextResponse.json({ 
      success: true, 
      treatments: formattedTreatments 
    })
  } catch (error) {
    console.error('Error fetching treatments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load treatments' },
      { status: 500 }
    )
  }
}
