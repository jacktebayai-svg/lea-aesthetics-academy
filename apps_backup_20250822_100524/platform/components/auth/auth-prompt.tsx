'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-provider'
import { 
  LuxuryCard, 
  LuxuryButton, 
  LuxuryInput,
  LuxuryLoader,
  fadeInUp 
} from '@/components/ui/luxury-components'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  CheckCircle, 
  X, 
  Crown,
  Sparkles,
  Shield
} from 'lucide-react'

interface AuthPromptProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  mode?: 'signin' | 'signup'
  title?: string
  message?: string
  preserveBookingData?: boolean
}

export function AuthPrompt({
  isOpen,
  onClose,
  onSuccess,
  mode: initialMode = 'signin',
  title = "Sign in to continue booking",
  message = "To complete your booking and access your appointment history, please sign in or create an account.",
  preserveBookingData = true
}: AuthPromptProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (mode === 'signin') {
        const result = await login(formData.email, formData.password)
        if (result.success) {
          onSuccess()
        } else {
          setError(result.error || 'Sign in failed')
        }
      } else {
        // Validation for signup
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          return
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long')
          setIsLoading(false)
          return
        }

        const result = await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: 'CLIENT',
        })

        if (result.success) {
          // For now, show success message and ask them to check email
          setMode('signup-success')
        } else {
          setError(result.error || 'Sign up failed')
        }
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
    })
    setError('')
    setIsLoading(false)
  }

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md"
        >
          <LuxuryCard variant="premium" className="relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[#78716c] hover:text-[#1c1917] transition-colors rounded-full hover:bg-[#fef3c7]/20"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-8">
              {mode === 'signup-success' ? (
                /* Success State */
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1c1917] mb-4">Account Created!</h2>
                  <p className="text-[#78716c] mb-6">
                    Please check your email to verify your account before signing in.
                  </p>
                  <LuxuryButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => switchMode('signin')}
                  >
                    Continue to Sign In
                  </LuxuryButton>
                </div>
              ) : (
                /* Auth Form */
                <div>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <Crown className="h-8 w-8 text-[#b45309] mr-3" />
                      <h2 className="text-2xl font-bold lea-text-gradient">
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      </h2>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-[#1c1917]">{title}</h3>
                      <p className="text-sm text-[#78716c]">{message}</p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="bg-gradient-to-r from-[#fefce8] to-[#fef3c7] rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-2">
                      <Sparkles className="h-4 w-4 text-[#b45309] mr-2" />
                      <span className="text-sm font-medium text-[#1c1917]">Benefits of having an account:</span>
                    </div>
                    <ul className="text-xs text-[#78716c] space-y-1 ml-6">
                      <li>• Access booking confirmation and receipts</li>
                      <li>• View and manage appointment history</li>
                      <li>• Receive treatment reminders and aftercare</li>
                      <li>• Download and sign consent forms</li>
                      <li>• Build your aesthetic journey profile</li>
                    </ul>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="rounded-md bg-red-50 p-4 border border-red-200">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <X className="h-4 w-4 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {mode === 'signup' && (
                      <div className="grid grid-cols-2 gap-3">
                        <LuxuryInput
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={handleChange}
                          leftIcon={<User className="h-4 w-4" />}
                        />
                        <LuxuryInput
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={handleChange}
                          leftIcon={<User className="h-4 w-4" />}
                        />
                      </div>
                    )}

                    <LuxuryInput
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                      leftIcon={<Mail className="h-4 w-4" />}
                    />

                    {mode === 'signup' && (
                      <LuxuryInput
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Phone number (optional)"
                        value={formData.phone}
                        onChange={handleChange}
                        leftIcon={<Phone className="h-4 w-4" />}
                      />
                    )}

                    <LuxuryInput
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder={mode === 'signin' ? 'Password' : 'Create password (min 6 characters)'}
                      value={formData.password}
                      onChange={handleChange}
                      leftIcon={<Lock className="h-4 w-4" />}
                    />

                    {mode === 'signup' && (
                      <LuxuryInput
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        leftIcon={<Lock className="h-4 w-4" />}
                      />
                    )}

                    <LuxuryButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isLoading}
                    >
                      {isLoading 
                        ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                        : (mode === 'signin' ? 'Sign In' : 'Create Account')
                      }
                    </LuxuryButton>
                  </form>

                  {/* Switch Mode */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-[#78716c]">
                      {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                      <button
                        type="button"
                        onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                        className="font-medium text-[#b45309] hover:text-[#d97706] transition-colors"
                      >
                        {mode === 'signin' ? 'Create one here' : 'Sign in here'}
                      </button>
                    </p>
                  </div>

                  {/* Trust Indicators */}
                  <div className="mt-6 pt-6 border-t border-[#e7e5e4]">
                    <div className="flex items-center justify-center text-xs text-[#78716c]">
                      <Shield className="h-3 w-3 mr-1" />
                      <span>Your data is protected and secure</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </LuxuryCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
