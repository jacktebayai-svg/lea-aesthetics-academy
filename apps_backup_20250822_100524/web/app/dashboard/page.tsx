'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { 
  LuxuryCard, 
  LuxuryButton, 
  LuxuryLoader, 
  LuxuryBadge,
  LuxuryAvatar,
  fadeInUp,
  staggerContainer
} from '@/components/ui/luxury-components'
import { LEAHeader } from '@/components/layout/header'
import { 
  User, 
  BookOpen, 
  Settings, 
  Calendar, 
  TrendingUp, 
  Users, 
  Crown,
  Sparkles,
  ArrowRight,
  Clock,
  CreditCard,
  FileText,
  Heart
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen lea-gradient-bg flex items-center justify-center">
        <LuxuryLoader size="lg" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
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
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-[#b45309] mr-3" />
            <h1 className="text-4xl font-bold lea-text-gradient">Welcome Back</h1>
          </div>
          <p className="text-xl text-[#78716c] mb-4">
            {user.firstName} {user.lastName}
          </p>
          <LuxuryBadge variant={getRoleColor(user.roles[0])} size="lg">
            <Sparkles className="h-4 w-4 mr-2" />
            {getRoleDisplayName(user.roles[0])}
          </LuxuryBadge>
        </motion.div>

        {/* Dashboard Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Profile Summary */}
          <motion.div variants={fadeInUp}>
            <LuxuryCard variant="premium">
              <div className="flex items-center space-x-4 mb-4">
                <LuxuryAvatar 
                  fallback={user.firstName?.[0] || user.email[0]} 
                  size="lg"
                />
                <div>
                  <h3 className="font-semibold text-[#1c1917]">
                    {user.firstName || 'User'} {user.lastName}
                  </h3>
                  <p className="text-sm text-[#78716c]">{user.email}</p>
                </div>
              </div>
              <Link href="/profile">
                <LuxuryButton variant="ghost" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Update Profile
                </LuxuryButton>
              </Link>
            </LuxuryCard>
          </motion.div>

          {/* Client-specific cards */}
          {user.roles.includes('CLIENT') && (
            <>
              <motion.div variants={fadeInUp}>
                <LuxuryCard variant="premium">
                  <div className="text-center mb-4">
                    <Calendar className="h-12 w-12 text-[#b45309] mx-auto mb-2" />
                    <h3 className="font-semibold text-[#1c1917]">Book Treatment</h3>
                    <p className="text-sm text-[#78716c]">Schedule your luxury experience</p>
                  </div>
                  <Link href="/book">
                    <LuxuryButton variant="primary" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Book Now
                    </LuxuryButton>
                  </Link>
                </LuxuryCard>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <LuxuryCard variant="default">
                  <div className="text-center mb-4">
                    <Clock className="h-12 w-12 text-[#ec4899] mx-auto mb-2" />
                    <h3 className="font-semibold text-[#1c1917]">Appointments</h3>
                    <p className="text-sm text-[#78716c]">View your booking history</p>
                  </div>
                  <Link href="/client/appointments">
                    <LuxuryButton variant="secondary" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      View History
                    </LuxuryButton>
                  </Link>
                </LuxuryCard>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <LuxuryCard variant="default">
                  <div className="text-center mb-4">
                    <CreditCard className="h-12 w-12 text-[#6366f1] mx-auto mb-2" />
                    <h3 className="font-semibold text-[#1c1917]">Payments</h3>
                    <p className="text-sm text-[#78716c]">Invoices and receipts</p>
                  </div>
                  <Link href="/client/payments">
                    <LuxuryButton variant="ghost" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      View Payments
                    </LuxuryButton>
                  </Link>
                </LuxuryCard>
              </motion.div>
            </>
          )}

          {/* Student-specific cards */}
          {user.roles.includes('STUDENT') && (
            <>
              <motion.div variants={fadeInUp}>
                <LuxuryCard variant="premium">
                  <div className="text-center mb-4">
                    <BookOpen className="h-12 w-12 text-[#ec4899] mx-auto mb-2" />
                    <h3 className="font-semibold text-[#1c1917]">My Courses</h3>
                    <p className="text-sm text-[#78716c]">Continue your learning journey</p>
                  </div>
                  <Link href="/courses">
                    <LuxuryButton variant="accent" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      View Courses
                    </LuxuryButton>
                  </Link>
                </LuxuryCard>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <LuxuryCard variant="default">
                  <div className="text-center mb-4">
                    <TrendingUp className="h-12 w-12 text-[#10b981] mx-auto mb-2" />
                    <h3 className="font-semibold text-[#1c1917]">Progress</h3>
                    <p className="text-sm text-[#78716c]">Track your achievements</p>
                  </div>
                  <Link href="/student/progress">
                    <LuxuryButton variant="secondary" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      View Progress
                    </LuxuryButton>
                  </Link>
                </LuxuryCard>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <LuxuryCard variant="default">
                  <div className="text-center mb-4">
                    <FileText className="h-12 w-12 text-[#8b5cf6] mx-auto mb-2" />
                    <h3 className="font-semibold text-[#1c1917]">Certificates</h3>
                    <p className="text-sm text-[#78716c]">Your achievements</p>
                  </div>
                  <Link href="/student/certificates">
                    <LuxuryButton variant="ghost" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      View Certificates
                    </LuxuryButton>
                  </Link>
                </LuxuryCard>
              </motion.div>
            </>
          )}

          {/* Admin-specific cards */}
          {user.roles.includes('ADMIN') && (
            <>
              <motion.div variants={fadeInUp}>
                <LuxuryCard variant="premium">
                  <div className="text-center mb-4">
                    <Settings className="h-12 w-12 text-[#b45309] mx-auto mb-2" />
                    <h3 className="font-semibold text-[#1c1917]">Business Management</h3>
                    <p className="text-sm text-[#78716c]">Manage your practice</p>
                  </div>
                  <Link href="/admin/dashboard">
                    <LuxuryButton variant="primary" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Admin Panel
                    </LuxuryButton>
                  </Link>
                </LuxuryCard>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <LuxuryCard variant="default">
                  <div className="text-center mb-4">
                    <Users className="h-12 w-12 text-[#6366f1] mx-auto mb-2" />
                    <h3 className="font-semibold text-[#1c1917]">Clients</h3>
                    <p className="text-sm text-[#78716c]">Manage client relationships</p>
                  </div>
                  <Link href="/admin/clients">
                    <LuxuryButton variant="secondary" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      View Clients
                    </LuxuryButton>
                  </Link>
                </LuxuryCard>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <LuxuryCard variant="default">
                  <div className="text-center mb-4">
                    <TrendingUp className="h-12 w-12 text-[#10b981] mx-auto mb-2" />
                    <h3 className="font-semibold text-[#1c1917]">Analytics</h3>
                    <p className="text-sm text-[#78716c]">Business insights</p>
                  </div>
                  <Link href="/admin/analytics">
                    <LuxuryButton variant="ghost" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      View Reports
                    </LuxuryButton>
                  </Link>
                </LuxuryCard>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <LuxuryCard variant="glass" className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-8 w-8 text-[#ec4899] mr-3" />
              <h2 className="text-2xl font-bold text-[#1c1917]">Welcome to LEA Aesthetics Academy</h2>
            </div>
            <p className="text-[#78716c] text-lg mb-6 max-w-2xl mx-auto">
              Your comprehensive platform for luxury aesthetic education and practice management. 
              Experience the highest standards in aesthetic training and client care.
            </p>
            
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user.roles.includes('CLIENT') && (
                <div className="space-y-2">
                  <h4 className="font-medium text-[#44403c]">Client Services</h4>
                  <div className="space-y-2">
                    <Link href="/book">
                      <LuxuryButton variant="ghost" className="w-full justify-start" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </LuxuryButton>
                    </Link>
                    <Link href="/client/history">
                      <LuxuryButton variant="ghost" className="w-full justify-start" size="sm">
                        <Clock className="h-4 w-4 mr-2" />
                        Treatment History
                      </LuxuryButton>
                    </Link>
                  </div>
                </div>
              )}
              
              {user.roles.includes('STUDENT') && (
                <div className="space-y-2">
                  <h4 className="font-medium text-[#44403c]">Learning</h4>
                  <div className="space-y-2">
                    <Link href="/courses">
                      <LuxuryButton variant="ghost" className="w-full justify-start" size="sm">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse Courses
                      </LuxuryButton>
                    </Link>
                    <Link href="/student/progress">
                      <LuxuryButton variant="ghost" className="w-full justify-start" size="sm">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        My Progress
                      </LuxuryButton>
                    </Link>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <h4 className="font-medium text-[#44403c]">Account</h4>
                <div className="space-y-2">
                  <Link href="/profile">
                    <LuxuryButton variant="ghost" className="w-full justify-start" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </LuxuryButton>
                  </Link>
                  <Link href="/support">
                    <LuxuryButton variant="ghost" className="w-full justify-start" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Support
                    </LuxuryButton>
                  </Link>
                </div>
              </div>
            </div>
          </LuxuryCard>
        </motion.div>
      </main>
    </div>
  )
}
