'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export type UserRole = 'ADMIN' | 'CLIENT' | 'STUDENT' | 'PRACTITIONER' | 'EDUCATOR'
export type ActiveMode = 'PRACTITIONER' | 'EDUCATOR'

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  roles: UserRole[]
  isActive: boolean
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  lastLoginAt?: Date
  preferences?: Record<string, any>
  metadata?: Record<string, any>
  // Profile data based on role
  client?: {
    id: string
    totalSpent: number
    visitCount: number
    isVip: boolean
    tags: string[]
  }
  student?: {
    id: string
    studentNumber: string
    enrollmentDate: Date
    qualifications?: Record<string, any>
  }
  practitioner?: {
    id: string
    title?: string
    bio?: string
    specialties: string[]
    isActive: boolean
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, totpCode?: string) => Promise<{ success: boolean; requiresTwoFactor?: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>
  enableTwoFactor: () => Promise<{ success: boolean; qrCode?: string; secret?: string; error?: string }>
  verifyTwoFactor: (token: string, secret: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  role: UserRole
  // Additional data based on role
  clientData?: {
    dateOfBirth?: Date
    emergencyContact?: Record<string, any>
    preferences?: Record<string, any>
  }
  studentData?: {
    dateOfBirth?: Date
    emergencyContact?: Record<string, any>
    qualifications?: Record<string, any>
    goals?: string
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Helper function to transform Supabase user to our User type
  const transformUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      // Get user profile from our public.users table
      const { data: userProfile, error } = await supabase
        .from('users')
        .select(`
          *,
          client:clients(*),
          student:students(*),
          practitioner:practitioners(*)
        `)
        .eq('id', supabaseUser.id)
        .single()

      if (error || !userProfile) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        phone: userProfile.phone,
        avatar: userProfile.avatar,
        roles: userProfile.roles || [userProfile.role],
        isActive: userProfile.is_active,
        emailVerified: userProfile.email_verified,
        phoneVerified: userProfile.phone_verified,
        twoFactorEnabled: userProfile.two_factor_enabled,
        lastLoginAt: userProfile.last_login_at ? new Date(userProfile.last_login_at) : undefined,
        preferences: userProfile.preferences,
        metadata: userProfile.metadata,
        client: userProfile.client ? {
          id: userProfile.client.id,
          totalSpent: userProfile.client.total_spent,
          visitCount: userProfile.client.visit_count,
          isVip: userProfile.client.is_vip,
          tags: userProfile.client.tags
        } : undefined,
        student: userProfile.student ? {
          id: userProfile.student.id,
          studentNumber: userProfile.student.student_number,
          enrollmentDate: new Date(userProfile.student.enrollment_date),
          qualifications: userProfile.student.qualifications
        } : undefined,
        practitioner: userProfile.practitioner ? {
          id: userProfile.practitioner.id,
          title: userProfile.practitioner.title,
          bio: userProfile.practitioner.bio,
          specialties: userProfile.practitioner.specialties,
          isActive: userProfile.practitioner.is_active
        } : undefined
      }
    } catch (error) {
      console.error('Error transforming user:', error)
      return null
    }
  }

  // Login function using Supabase Auth
  const login = async (email: string, password: string, totpCode?: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        const transformedUser = await transformUser(data.user)
        if (transformedUser) {
          setUser(transformedUser)
          
          // Don't auto-redirect here - let the calling component handle it
          // This allows for better UX when booking is in progress
          return { success: true }
        }
      }
      
      return { success: false, error: 'Failed to get user profile' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  // Register function using Supabase Auth
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            role: userData.role,
            client_data: userData.clientData,
            student_data: userData.studentData,
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  // Reset password function using Supabase Auth
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Password reset error:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Verify email function
  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const result = await response.json()
      
      if (response.ok) {
        // Update user state
        if (user) {
          setUser({ ...user, emailVerified: true })
        }
        return { success: true }
      }
      
      return { success: false, error: result.message || 'Email verification failed' }
    } catch (error) {
      console.error('Email verification error:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Enable 2FA function
  const enableTwoFactor = async () => {
    try {
      const response = await fetch('/api/auth/enable-2fa', {
        method: 'POST',
        credentials: 'include'
      })

      const result = await response.json()
      
      if (response.ok) {
        return { success: true, qrCode: result.qrCode, secret: result.secret }
      }
      
      return { success: false, error: result.message || '2FA setup failed' }
    } catch (error) {
      console.error('2FA setup error:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Verify 2FA function
  const verifyTwoFactor = async (token: string, secret: string) => {
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, secret }),
        credentials: 'include'
      })

      const result = await response.json()
      
      if (response.ok) {
        // Update user state
        if (user) {
          setUser({ ...user, twoFactorEnabled: true })
        }
        return { success: true }
      }
      
      return { success: false, error: result.message || '2FA verification failed' }
    } catch (error) {
      console.error('2FA verification error:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }


  // Logout function using Supabase Auth
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      router.push('/login' as any)
    }
  }

  // Refresh user data using Supabase
  const refreshUser = async () => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      
      if (supabaseUser) {
        const transformedUser = await transformUser(supabaseUser)
        setUser(transformedUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('User refresh error:', error)
      setUser(null)
    }
  }

  // Update profile function using Supabase
  const updateProfile = async (data: Partial<User>) => {
    try {
      // Update Supabase user metadata if needed
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
        }
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      // Update user profile in our database
      const updateData: any = {}
      if (data.firstName !== undefined) updateData.first_name = data.firstName
      if (data.lastName !== undefined) updateData.last_name = data.lastName
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.avatar !== undefined) updateData.avatar = data.avatar
      if (data.preferences !== undefined) updateData.preferences = data.preferences
      if (data.metadata !== undefined) updateData.metadata = data.metadata

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user?.id)

      if (error) {
        return { success: false, error: error.message }
      }

      // Refresh user data
      await refreshUser()
      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Helper function to get redirect path based on role
  const getRedirectPath = (roles: UserRole[]): string => {
    const primaryRole = roles[0] || 'CLIENT'
    switch (primaryRole) {
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

  // Check authentication status and listen for auth changes
  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        
        if (supabaseUser) {
          const transformedUser = await transformUser(supabaseUser)
          setUser(transformedUser)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkInitialAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const transformedUser = await transformUser(session.user)
          setUser(transformedUser)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const transformedUser = await transformUser(session.user)
          setUser(transformedUser)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    verifyEmail,
    enableTwoFactor,
    verifyTwoFactor,
    updateProfile,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
