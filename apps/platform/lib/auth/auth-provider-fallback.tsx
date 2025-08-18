'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export type UserRole = 'ADMIN' | 'CLIENT' | 'STUDENT'

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  role: UserRole
  isActive: boolean
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  lastLoginAt?: Date
  preferences?: Record<string, any>
  metadata?: Record<string, any>
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
      // For fallback mode, create a basic user object from auth metadata
      const userRole = (supabaseUser.user_metadata?.role || 'CLIENT') as UserRole
      
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        firstName: supabaseUser.user_metadata?.first_name,
        lastName: supabaseUser.user_metadata?.last_name,
        phone: supabaseUser.user_metadata?.phone,
        avatar: supabaseUser.user_metadata?.avatar,
        role: userRole,
        isActive: true,
        emailVerified: !!supabaseUser.email_confirmed_at,
        phoneVerified: !!supabaseUser.phone_confirmed_at,
        twoFactorEnabled: false,
        lastLoginAt: supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : undefined,
        preferences: supabaseUser.user_metadata?.preferences || {},
        metadata: supabaseUser.user_metadata
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
          
          // Redirect based on role
          const redirectPath = getRedirectPath(transformedUser.role)
          router.push(redirectPath)
          
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

  // Register function using Supabase Auth (fallback mode)
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true)
      
      // Use a simpler signup without the problematic trigger
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            role: userData.role,
            // Store additional data in user metadata for now
            client_data: userData.clientData,
            student_data: userData.studentData,
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      console.log('✅ User registration successful (fallback mode)')
      console.log('⚠️  Note: You\'ll need to run the database trigger fix to enable full profile creation')
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  // Rest of the functions remain the same...
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

  const verifyEmail = async (token: string) => {
    // Placeholder for email verification
    return { success: true }
  }

  const enableTwoFactor = async () => {
    // Placeholder for 2FA
    return { success: false, error: '2FA not implemented in fallback mode' }
  }

  const verifyTwoFactor = async (token: string, secret: string) => {
    // Placeholder for 2FA verification
    return { success: false, error: '2FA not implemented in fallback mode' }
  }

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
      router.push('/login')
    }
  }

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

  const updateProfile = async (data: Partial<User>) => {
    try {
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

      await refreshUser()
      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Helper function to get redirect path based on role
  const getRedirectPath = (role: UserRole): string => {
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
