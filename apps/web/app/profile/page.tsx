'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { 
  LuxuryCard, 
  LuxuryButton, 
  LuxuryInput,
  LuxuryLoader,
  LuxuryBadge,
  LuxuryAvatar,
  fadeInUp,
  staggerContainer
} from '@/components/ui/luxury-components'
import { LEAHeader } from '@/components/layout/Header'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  Edit,
  Save,
  X,
  Camera,
  Crown
} from 'lucide-react'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  address?: string
  city?: string
  postalCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  medicalConditions?: string
  allergies?: string
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    postalCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    allergies: ''
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    } else if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        medicalConditions: user.medicalConditions || '',
        allergies: user.allergies || ''
      })
    }
  }, [user, isLoading, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        setIsEditing(false)
      } else {
        throw new Error('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        medicalConditions: user.medicalConditions || '',
        allergies: user.allergies || ''
      })
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen lea-gradient-bg flex items-center justify-center">
        <LuxuryLoader size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Business Owner'
      case 'CLIENT': return 'Valued Client'
      case 'STUDENT': return 'Academy Student'
      default: return role
    }
  }

  const getRoleColor = (role: string): 'gold' | 'rose' | 'success' | 'warning' | 'info' => {
    switch (role) {
      case 'ADMIN': return 'gold'
      case 'CLIENT': return 'rose'
      case 'STUDENT': return 'info'
      default: return 'gold'
    }
  }

  return (
    <div className="min-h-screen lea-gradient-bg">
      <LEAHeader />
      
      <main className="lea-container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-[#b45309] mr-3" />
            <h1 className="text-4xl font-bold lea-text-gradient">Your Profile</h1>
          </div>
          <p className="text-xl text-[#78716c]">Manage your personal information and preferences</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header Card */}
          <motion.div variants={fadeInUp} className="mb-8">
            <LuxuryCard variant="premium">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <LuxuryAvatar 
                    fallback={user.firstName?.[0] || user.email[0]} 
                    size="xl"
                  />
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#b45309] text-white rounded-full flex items-center justify-center hover:bg-[#92400e] transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#1c1917] mb-2">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-[#78716c] mb-2">{user.email}</p>
                  <LuxuryBadge variant={getRoleColor(user.roles[0])}>
                    {getRoleDisplayName(user.roles[0])}
                  </LuxuryBadge>
                </div>
                <div>
                  {!isEditing ? (
                    <LuxuryButton
                      variant="secondary"
                      onClick={() => setIsEditing(true)}
                      leftIcon={<Edit className="h-4 w-4" />}
                    >
                      Edit Profile
                    </LuxuryButton>
                  ) : (
                    <div className="flex space-x-3">
                      <LuxuryButton
                        variant="primary"
                        isLoading={saving}
                        onClick={handleSave}
                        leftIcon={<Save className="h-4 w-4" />}
                      >
                        Save
                      </LuxuryButton>
                      <LuxuryButton
                        variant="ghost"
                        onClick={handleCancel}
                        leftIcon={<X className="h-4 w-4" />}
                      >
                        Cancel
                      </LuxuryButton>
                    </div>
                  )}
                </div>
              </div>
            </LuxuryCard>
          </motion.div>

          {/* Personal Information */}
          <motion.div variants={fadeInUp} className="mb-8">
            <LuxuryCard variant="default">
              <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LuxuryInput
                  label="First Name"
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  disabled={!isEditing}
                  leftIcon={<User className="h-4 w-4" />}
                />
                
                <LuxuryInput
                  label="Last Name"
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  disabled={!isEditing}
                  leftIcon={<User className="h-4 w-4" />}
                />
                
                <LuxuryInput
                  label="Email Address"
                  type="email"
                  value={profile.email}
                  disabled={true}
                  leftIcon={<Mail className="h-4 w-4" />}
                />
                
                <LuxuryInput
                  label="Phone Number"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  disabled={!isEditing}
                  placeholder="07XXX XXXXXX"
                  leftIcon={<Phone className="h-4 w-4" />}
                />
                
                <LuxuryInput
                  label="Date of Birth"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                  disabled={!isEditing}
                  leftIcon={<Calendar className="h-4 w-4" />}
                />
              </div>
            </LuxuryCard>
          </motion.div>

          {/* Address Information */}
          <motion.div variants={fadeInUp} className="mb-8">
            <LuxuryCard variant="default">
              <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Address Information</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <LuxuryInput
                  label="Address"
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Street address"
                  leftIcon={<MapPin className="h-4 w-4" />}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LuxuryInput
                    label="City"
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({...profile, city: e.target.value})}
                    disabled={!isEditing}
                    placeholder="City"
                  />
                  
                  <LuxuryInput
                    label="Postal Code"
                    type="text"
                    value={profile.postalCode}
                    onChange={(e) => setProfile({...profile, postalCode: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Postal code"
                  />
                </div>
              </div>
            </LuxuryCard>
          </motion.div>

          {/* Emergency Contact & Medical Information */}
          {user.roles.includes('CLIENT') && (
            <>
              <motion.div variants={fadeInUp} className="mb-8">
                <LuxuryCard variant="default">
                  <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Emergency Contact</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LuxuryInput
                      label="Emergency Contact Name"
                      type="text"
                      value={profile.emergencyContactName}
                      onChange={(e) => setProfile({...profile, emergencyContactName: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Full name"
                      leftIcon={<User className="h-4 w-4" />}
                    />
                    
                    <LuxuryInput
                      label="Emergency Contact Phone"
                      type="tel"
                      value={profile.emergencyContactPhone}
                      onChange={(e) => setProfile({...profile, emergencyContactPhone: e.target.value})}
                      disabled={!isEditing}
                      placeholder="07XXX XXXXXX"
                      leftIcon={<Phone className="h-4 w-4" />}
                    />
                  </div>
                </LuxuryCard>
              </motion.div>

              <motion.div variants={fadeInUp} className="mb-8">
                <LuxuryCard variant="default">
                  <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Medical Information</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#44403c] mb-2">
                        Medical Conditions
                      </label>
                      <textarea
                        value={profile.medicalConditions}
                        onChange={(e) => setProfile({...profile, medicalConditions: e.target.value})}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-4 py-3 border border-[#d6d3d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fcd34d] focus:border-[#fcd34d] transition-colors disabled:bg-gray-50"
                        placeholder="Please list any medical conditions we should be aware of..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#44403c] mb-2">
                        Allergies
                      </label>
                      <textarea
                        value={profile.allergies}
                        onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-4 py-3 border border-[#d6d3d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fcd34d] focus:border-[#fcd34d] transition-colors disabled:bg-gray-50"
                        placeholder="Please list any allergies or sensitivities..."
                      />
                    </div>
                  </div>
                </LuxuryCard>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}
