'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-provider'
import { ModeSelector } from '@/components/shared/mode-selector'
import { PractitionerDashboard } from '@/components/practitioner/dashboard'
import { EducatorDashboard } from '@/components/educator/dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

function DashboardContent() {
  const { user, activeMode, setActiveMode, isLoading } = useAuth()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      setIsInitializing(false)
    }
  }, [isLoading])

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null // AuthGuard will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mode Selector Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">
                LEA Aesthetics
              </h1>
            </div>

            {/* Mode Selector */}
            <ModeSelector 
              user={user}
              activeMode={activeMode}
              onModeChange={setActiveMode}
            />

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeMode === 'PRACTITIONER' ? (
          <PractitionerDashboard user={user} />
        ) : (
          <EducatorDashboard user={user} />
        )}
      </main>
    </div>
  )
}
