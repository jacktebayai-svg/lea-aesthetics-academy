'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ModeSelector } from '@/components/shared/mode-selector'
import { PractitionerDashboard } from '@/components/practitioner/dashboard'
import { EducatorDashboard } from '@/components/educator/dashboard'
import { ClientDashboard } from '@/components/client/dashboard'
import { StudentDashboard } from '@/components/student/dashboard'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, activeMode, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  // Check if user has professional roles for mode switching
  const hasProfessionalRoles = user.roles.some(role => 
    role === 'PRACTITIONER' || role === 'EDUCATOR'
  )

  const renderDashboard = () => {
    if (hasProfessionalRoles) {
      // Professional users get mode-based dashboard
      switch (activeMode) {
        case 'PRACTITIONER':
          return <PractitionerDashboard />
        case 'EDUCATOR':
          return <EducatorDashboard />
        default:
          return <PractitionerDashboard />
      }
    } else {
      // Client/Student users get role-based dashboard
      if (user.roles.includes('CLIENT')) {
        return <ClientDashboard />
      } else if (user.roles.includes('STUDENT')) {
        return <StudentDashboard />
      } else {
        return <ClientDashboard />
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {hasProfessionalRoles && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ModeSelector />
          </div>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderDashboard()}
      </main>
    </div>
  )
}
