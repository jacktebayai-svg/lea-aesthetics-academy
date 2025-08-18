'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-provider'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      setIsInitializing(false)
      
      if (user) {
        // Redirect based on user role
        switch (user.role) {
          case 'ADMIN':
            router.push('/admin/dashboard')
            break
          case 'CLIENT':
            router.push('/client/dashboard')
            break
          case 'STUDENT':
            router.push('/student/dashboard')
            break
          default:
            router.push('/login')
        }
      } else {
        router.push('/login')
      }
    }
  }, [isLoading, user, router])

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-amber-800 mb-2">LEA Aesthetics Academy</h2>
          <p className="text-amber-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // This should not render as we redirect above
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-amber-800 mb-4">Welcome to LEA Aesthetics Academy</h1>
        <p className="text-amber-600 mb-8">Luxury aesthetics training and practice management</p>
        <div className="space-y-4">
          <a 
            href="/login" 
            className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Sign In
          </a>
          <br />
          <a 
            href="/register" 
            className="inline-block text-amber-600 hover:text-amber-700 transition-colors"
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  )
}
