'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Route } from 'next'
import { useAuth } from '@/lib/auth/auth-provider'
import { 
  LuxuryInput,
  LuxuryButton,
  LuxuryCard,
  LuxuryLayout,
  LuxuryToast,
  LuxuryForm,
  LuxuryBadge
} from '@/components/ui/luxury-components'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Mail, KeyRound, Eye, EyeOff, User, Phone, Calendar, Target, Shield } from 'lucide-react'

type UserRole = 'ADMIN' | 'CLIENT' | 'STUDENT'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'CLIENT' as UserRole,
    dateOfBirth: '',
    emergencyContact: '',
    goals: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const router = useRouter()
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError('')
    setIsLoading(true)

    // Client-side validation
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone,
        role: formData.role,
        ...(formData.role === 'CLIENT' && {
          clientData: {
            dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
            emergencyContact: formData.emergencyContact ? { name: formData.emergencyContact } : undefined,
          }
        }),
        ...(formData.role === 'STUDENT' && {
          studentData: {
            dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
            emergencyContact: formData.emergencyContact ? { name: formData.emergencyContact } : undefined,
            goals: formData.goals,
          }
        })
      }

      const result = await register(userData)
      
      if (result.success) {
        // Registration successful, user will be automatically redirected by AuthProvider
      } else {
        setApiError(result.error || 'Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setApiError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }))
  }

  return (
    <LuxuryLayout 
      title="Join LEA Aesthetics" 
      subtitle="Create your luxury experience account"
      className="max-w-2xl"
    >
      <LuxuryCard variant="premium">
        {apiError && (
          <div className="mb-6">
            <LuxuryToast type="error" message={apiError} onClose={() => setApiError('')} />
          </div>
        )}
        
        {/* Role Selection */}
        <div className="text-center mb-6">
          <LuxuryBadge 
            variant={formData.role === 'CLIENT' ? 'gold' : formData.role === 'STUDENT' ? 'rose' : 'info'} 
            size="lg"
          >
            {formData.role === 'CLIENT' ? 'Client Registration' : 'Student Registration'}
          </LuxuryBadge>
        </div>
        
        <LuxuryForm onSubmit={handleSubmit}>
          {/* Account Type Selection */}
          <div className="text-center mb-6">
            <div className="inline-flex rounded-lg bg-[#fafaf9] p-1 border border-[#e7e5e4]">
              <button
                type="button"
                onClick={() => handleRoleChange('CLIENT')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  formData.role === 'CLIENT'
                    ? 'bg-white text-[#92400e] shadow-sm border border-[#fde68a]'
                    : 'text-[#78716c] hover:text-[#44403c]'
                }`}
              >
                <User className="h-4 w-4 mr-2 inline" />
                Client
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('STUDENT')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  formData.role === 'STUDENT'
                    ? 'bg-white text-[#92400e] shadow-sm border border-[#fde68a]'
                    : 'text-[#78716c] hover:text-[#44403c]'
                }`}
              >
                <Target className="h-4 w-4 mr-2 inline" />
                Student
              </button>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <LuxuryInput
              id="firstName"
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Your first name"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.firstName}
              disabled={isLoading}
            />
            
            <LuxuryInput
              id="lastName"
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Your last name"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.lastName}
              disabled={isLoading}
            />
          </div>

          {/* Email and Phone */}
          <LuxuryInput
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your@email.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email}
            disabled={isLoading}
          />

          <LuxuryInput
            id="phone"
            name="phone"
            label="Phone Number (Optional)"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+44 7XXX XXXXXX"
            leftIcon={<Phone className="h-4 w-4" />}
            disabled={isLoading}
          />

          {/* Role-specific fields */}
          {(formData.role === 'CLIENT' || formData.role === 'STUDENT') && (
            <>
              <LuxuryInput
                id="dateOfBirth"
                name="dateOfBirth"
                label="Date of Birth (Optional)"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                leftIcon={<Calendar className="h-4 w-4" />}
                disabled={isLoading}
              />
              
              <LuxuryInput
                id="emergencyContact"
                name="emergencyContact"
                label="Emergency Contact (Optional)"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="Emergency contact name"
                leftIcon={<User className="h-4 w-4" />}
                disabled={isLoading}
              />
            </>
          )}

          {formData.role === 'STUDENT' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#44403c]">
                Learning Goals (Optional)
              </label>
              <Textarea
                id="goals"
                name="goals"
                value={formData.goals}
                onChange={handleInputChange}
                placeholder="What do you hope to achieve through our courses?"
                disabled={isLoading}
                rows={3}
                className="lea-input w-full rounded-lg border-2 border-[#e7e5e4] bg-white px-3 py-2 focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20 placeholder:text-[#78716c] placeholder:italic transition-all duration-200"
              />
            </div>
          )}

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LuxuryInput
              id="password"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password"
              leftIcon={<KeyRound className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password}
              disabled={isLoading}
            />

            <LuxuryInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              leftIcon={<KeyRound className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.confirmPassword}
              disabled={isLoading}
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3 p-4 bg-[#fefce8] rounded-lg border border-[#fde68a]">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              disabled={isLoading}
              className="mt-1"
            />
            <div className="text-sm">
              <label htmlFor="terms" className="text-[#44403c] cursor-pointer">
                I accept the{' '}
                <Link href="/terms" as Route className="font-medium text-[#b45309] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" as Route className="font-medium text-[#b45309] hover:underline">
                  Privacy Policy
                </Link>
              </label>
              {errors.terms && (
                <p className="text-red-600 mt-1 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  {errors.terms}
                </p>
              )}
            </div>
          </div>

          <LuxuryButton 
            type="submit" 
            size="lg" 
            className="w-full" 
            isLoading={isLoading}
            disabled={!acceptTerms}
          >
            Create Your Account
          </LuxuryButton>
        </LuxuryForm>

        <div className="text-center mt-6 text-sm text-[#78716c]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#b45309] hover:underline">
            Sign in here
          </Link>
        </div>
      </LuxuryCard>
    </LuxuryLayout>
  )
}
