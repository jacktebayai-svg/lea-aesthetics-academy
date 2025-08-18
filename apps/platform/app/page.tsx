'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { LEAHeader } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Crown, 
  Sparkles, 
  Star, 
  Users, 
  Calendar, 
  BookOpen, 
  Award,
  ChevronRight,
  Play,
  ArrowRight,
  Heart,
  Shield,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { Route } from 'next'
import { motion } from 'framer-motion'
import {
  LuxuryButton,
  LuxuryCard,
  LuxurySection,
  LuxuryHero,
  FeatureCard,
  LuxuryStats,
  LuxuryCTA,
  LuxuryBadge,
  fadeInUp,
  staggerContainer
} from '@/components/ui/luxury-components'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      setIsInitializing(false)
      
      if (user) {
        // Redirect based on user role
        const primaryRole = user.roles[0]
        switch (primaryRole) {
          case 'ADMIN':
            router.push('/admin/dashboard' as any)
            break
          case 'CLIENT':
            router.push('/client/dashboard' as any)
            break
          case 'STUDENT':
            router.push('/student/dashboard' as any)
            break
          default:
            router.push('/dashboard')
        }
      }
    }
  }, [isLoading, user, router])

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/10 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative mb-6">
            <Crown className="h-16 w-16 text-primary lea-text-gradient mx-auto animate-pulse" />
            <Sparkles className="h-6 w-6 text-accent absolute -top-2 -right-2 animate-spin" />
          </div>
          <h1 className="lea-text-heading mb-4">LEA Aesthetics Academy</h1>
          <p className="lea-text-subheading">Preparing your luxury experience...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mt-6"></div>
        </div>
      </div>
    )
  }

  // Public landing page
  return (
    <div className="min-h-screen lea-gradient-bg">
      <LEAHeader />
      
      {/* Hero Section */}
      <LuxuryHero
        subtitle={<><Crown className="h-5 w-5 mr-2" />Luxury Aesthetic Education</>}
        title={
          <>
            Welcome to{' '}
            <span className="lea-text-gradient">LEA Aesthetics Academy</span>
          </>
        }
        description="Where luxury meets education. Transform your aesthetic journey with our comprehensive training programs and practice management solutions."
        primaryAction={
          <Link href="/register">
            <LuxuryButton size="xl" variant="primary" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Begin Your Journey
            </LuxuryButton>
          </Link>
        }
        secondaryAction={
          <Link href="/login">
            <LuxuryButton size="xl" variant="secondary">
              Sign In
            </LuxuryButton>
          </Link>
        }
      />

      {/* Trust Indicators Section */}
      <LuxurySection background="default" padding="md">
        <div className="lea-container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <LuxuryBadge variant="gold" size="lg" className="mb-6">
                Trusted by Industry Leaders
              </LuxuryBadge>
            </motion.div>
          </motion.div>
          
          <LuxuryStats 
            stats={[
              { value: "500+", label: "Certified Students", description: "Successfully trained" },
              { value: "50+", label: "Expert Practitioners", description: "Actively teaching" },
              { value: "10k+", label: "Treatments Managed", description: "Through our platform" },
              { value: "98%", label: "Satisfaction Rate", description: "Student success" }
            ]}
          />
        </div>
      </LuxurySection>

      {/* Features Section */}
      <LuxurySection background="accent" padding="lg">
        <div className="lea-container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1c1917] mb-6">
                Elevate Your Aesthetic Practice
              </h2>
              <p className="lea-text-subheading max-w-3xl mx-auto">
                Comprehensive solutions for practitioners and students in the luxury aesthetics industry
              </p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <FeatureCard
                icon={<Crown className="h-12 w-12 text-[#b45309]" />}
                title="For Practitioners"
                description="Complete practice management and advanced training programs designed for luxury aesthetic professionals."
                features={[
                  "Advanced client management system",
                  "Smart booking and scheduling platform",
                  "Continuing education courses",
                  "Business analytics and insights",
                  "Treatment protocol libraries"
                ]}
                action={
                  <Link href="/register?type=practitioner">
                    <LuxuryButton variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Get Started
                    </LuxuryButton>
                  </Link>
                }
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <FeatureCard
                icon={<BookOpen className="h-12 w-12 text-[#b45309]" />}
                title="For Students"
                description="World-class aesthetic education with industry-leading certification programs and hands-on training."
                features={[
                  "Level 2, 3, 4 certification courses",
                  "Interactive learning modules",
                  "Virtual reality training",
                  "Industry expert mentorship",
                  "Career placement assistance"
                ]}
                action={
                  <Link href="/register?type=student">
                    <LuxuryButton variant="accent" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      Enroll Now
                    </LuxuryButton>
                  </Link>
                }
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <FeatureCard
                icon={<Heart className="h-12 w-12 text-[#ec4899]" />}
                title="For Clients"
                description="Seamless booking experience and luxury treatment journey with personalized care protocols."
                features={[
                  "Easy online booking system",
                  "Treatment history tracking",
                  "Personalized care plans",
                  "Digital consultation forms",
                  "Secure document management"
                ]}
                action={
                  <Link href="/book">
                    <LuxuryButton variant="secondary" size="sm" rightIcon={<Calendar className="h-4 w-4" />}>
                      Book Treatment
                    </LuxuryButton>
                  </Link>
                }
              />
            </motion.div>
          </motion.div>
        </div>
      </LuxurySection>

      {/* Why Choose LEA Section */}
      <LuxurySection background="default" padding="lg">
        <div className="lea-container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1c1917] mb-6">
                Why Choose <span className="lea-text-gradient">LEA</span>?
              </h2>
              <p className="lea-text-subheading max-w-3xl mx-auto">
                Experience the difference of luxury aesthetic education and practice management
              </p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div variants={fadeInUp} className="text-center">
              <div className="mb-4 mx-auto w-16 h-16 bg-gradient-to-br from-[#fcd34d] to-[#f59e0b] rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#1c1917] mb-2">Industry Leading</h3>
              <p className="text-sm text-[#57534e]">Recognized certification programs meeting the highest industry standards</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="mb-4 mx-auto w-16 h-16 bg-gradient-to-br from-[#ec4899] to-[#f472b6] rounded-full flex items-center justify-center">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#1c1917] mb-2">Expert Faculty</h3>
              <p className="text-sm text-[#57534e]">Learn from world-renowned practitioners with decades of experience</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="mb-4 mx-auto w-16 h-16 bg-gradient-to-br from-[#8b5cf6] to-[#a855f7] rounded-full flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#1c1917] mb-2">Cutting Edge</h3>
              <p className="text-sm text-[#57534e]">Latest techniques and technologies in aesthetic medicine and education</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="mb-4 mx-auto w-16 h-16 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#1c1917] mb-2">Community</h3>
              <p className="text-sm text-[#57534e]">Join an exclusive network of aesthetic professionals worldwide</p>
            </motion.div>
          </motion.div>
        </div>
      </LuxurySection>

      {/* CTA Section */}
      <LuxuryCTA
        title={
          <>
            Ready to Transform Your{' '}
            <span className="lea-text-gradient">Practice</span>?
          </>
        }
        description="Join the elite community of aesthetic professionals who trust LEA for their success. Start your journey today with our comprehensive platform."
        primaryAction={
          <Link href="/register">
            <LuxuryButton size="xl" variant="primary" rightIcon={<Sparkles className="h-5 w-5" />}>
              Start Free Trial
            </LuxuryButton>
          </Link>
        }
        secondaryAction={
          <Link href={'/contact' as Route}>
            <LuxuryButton size="xl" variant="secondary" rightIcon={<Calendar className="h-5 w-5" />}>
              Schedule Demo
            </LuxuryButton>
          </Link>
        }
      />

      {/* Footer */}
      <footer className="bg-foreground/5 border-t border-border py-12">
        <div className="lea-container">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-primary lea-text-gradient mr-3" />
              <span className="text-2xl font-bold lea-text-gradient">LEA Aesthetics Academy</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Elevating standards in luxury aesthetic education and practice management
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 LEA Aesthetics Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
