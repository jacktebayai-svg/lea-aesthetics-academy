'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth, UserRole } from './auth-provider'

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function RouteGuard({
  children,
  allowedRoles,
  requireAuth = true,
  redirectTo,
  fallback = <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
  </div>
}: RouteGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      const loginUrl = redirectTo || '/login'
      router.push(loginUrl as any)
      return
    }

    // If user is logged in but roles are restricted
    if (user && allowedRoles && !user.roles.some(role => allowedRoles.includes(role))) {
      // Redirect to appropriate dashboard based on user's role
      const userDashboard = getRoleDashboard(user.roles[0])
      router.push(userDashboard as any)
      return
    }

    // If user is logged in and trying to access auth pages
    if (!requireAuth && user) {
      const userDashboard = getRoleDashboard(user.roles[0])
      router.push(userDashboard as any)
      return
    }
  }, [user, isLoading, requireAuth, allowedRoles, redirectTo, router])

  // Show loading state
  if (isLoading) {
    return fallback
  }

  // If auth is required but user is not logged in
  if (requireAuth && !user) {
    return null // Router will handle redirect
  }

  // If roles are restricted and user doesn't have access
  if (user && allowedRoles && !user.roles.some(role => allowedRoles.includes(role))) {
    return null // Router will handle redirect
  }

  // If user is logged in and trying to access auth pages
  if (!requireAuth && user) {
    return null // Router will handle redirect
  }

  return <>{children}</>
}

// Helper function to get dashboard URL based on role
function getRoleDashboard(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard'
    case 'CLIENT':
      return '/client/dashboard'
    case 'STUDENT':
      return '/student/dashboard'
    default:
      return '/dashboard'
  }
}

// Higher-order component for easier use
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<RouteGuardProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <RouteGuard {...options}>
        <Component {...props} />
      </RouteGuard>
    )
  }
}

// Specific route guards for different roles
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      {children}
    </RouteGuard>
  )
}

export function ClientRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['CLIENT']}>
      {children}
    </RouteGuard>
  )
}

export function StudentRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['STUDENT']}>
      {children}
    </RouteGuard>
  )
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requireAuth={false}>
      {children}
    </RouteGuard>
  )
}

// Hook for checking permissions
export function usePermissions() {
  const { user } = useAuth()

  return {
    isAdmin: user?.roles.includes('ADMIN') || false,
    isClient: user?.roles.includes('CLIENT') || false,
    isStudent: user?.roles.includes('STUDENT') || false,
    hasRole: (role: UserRole) => user?.roles.includes(role) || false,
    hasAnyRole: (roles: UserRole[]) => user ? roles.some(role => user.roles.includes(role)) : false,
    canAccess: (allowedRoles: UserRole[]) => user ? user.roles.some(role => allowedRoles.includes(role)) : false,
  }
}
