'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-provider'
import { 
  LuxuryInput,
  LuxuryButton,
  LuxuryCard,
  LuxuryLayout,
  LuxuryToast,
  LuxuryForm
} from '@/components/ui/luxury-components'
import { Mail, KeyRound, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    setIsLoading(true)

    if (!formData.email || !formData.password) {
      setApiError('Please enter both email and password.')
      setIsLoading(false)
      return
    }

    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        router.push('/dashboard')
      } else {
        setApiError('Invalid credentials. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setApiError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <LuxuryLayout title="Welcome Back" subtitle="Sign in to your LEA Aesthetics account">
      <LuxuryCard variant="premium" className="w-full max-w-md">
        {apiError && (
          <LuxuryToast type="error" message={apiError} onClose={() => setApiError('')} />
        )}
        
        <LuxuryForm onSubmit={handleSubmit} className="space-y-6">
          <LuxuryInput
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your@email.com"
            leftIcon={<Mail className="h-4 w-4" />}
            disabled={isLoading}
          />

          <LuxuryInput
            id="password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            leftIcon={<KeyRound className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            disabled={isLoading}
          />

          <div className="flex items-center justify-between">
            <div />
            <Link href="/forgot-password" as any className="text-sm font-medium text-[#92400e] hover:text-[#b45309]">
              Forgot password?
            </Link>
          </div>

          <LuxuryButton type="submit" size="lg" className="w-full" isLoading={isLoading}>
            Sign In
          </LuxuryButton>
        </LuxuryForm>

        <div className="text-center mt-6 text-sm text-[#78716c]">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-[#b45309] hover:underline">
            Sign up now
          </Link>
        </div>
      </LuxuryCard>
    </LuxuryLayout>
  )
}
