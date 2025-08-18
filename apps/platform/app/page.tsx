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
  Play
} from 'lucide-react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/10">
      <LEAHeader />
      
      {/* Hero Section */}
      <section className="lea-section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        <div className="lea-container relative">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="relative inline-flex items-center mb-6">
              <Crown className="h-20 w-20 text-primary lea-text-gradient" />
              <Sparkles className="h-8 w-8 text-accent absolute -top-2 -right-2 animate-pulse" />
            </div>
            
            <h1 className="lea-text-heading mb-6">
              Welcome to{' '}
              <span className="lea-text-gradient">LEA Aesthetics Academy</span>
            </h1>
            
            <p className="lea-text-subheading mb-8 max-w-2xl mx-auto">
              Where luxury meets education. Transform your aesthetic journey with our 
              comprehensive training programs and practice management solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="lea-button-primary group">
                  Begin Your Journey
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link href="/login">
                <Button size="lg" variant="outline" className="lea-button-secondary">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="lea-section bg-secondary/30">
        <div className="lea-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Elevate Your Aesthetic Practice
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions for practitioners and students in the luxury aesthetics industry
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* For Practitioners */}
            <Card className="lea-card group hover:lea-shadow-gold transition-all duration-300">
              <CardHeader>
                <Crown className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle>For Practitioners</CardTitle>
                <CardDescription>
                  Complete practice management and advanced training
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-accent mr-2" />
                    Client management system
                  </li>
                  <li className="flex items-center">
                    <Calendar className="h-4 w-4 text-accent mr-2" />
                    Advanced booking platform
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 text-accent mr-2" />
                    Continuing education courses
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* For Students */}
            <Card className="lea-card group hover:lea-shadow-gold transition-all duration-300">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle>For Students</CardTitle>
                <CardDescription>
                  World-class aesthetic education and certification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-accent mr-2" />
                    Level 2, 3, 4 courses
                  </li>
                  <li className="flex items-center">
                    <Play className="h-4 w-4 text-accent mr-2" />
                    Interactive learning modules
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 text-accent mr-2" />
                    Industry certifications
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* For Clients */}
            <Card className="lea-card group hover:lea-shadow-gold transition-all duration-300">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle>For Clients</CardTitle>
                <CardDescription>
                  Seamless booking and luxury treatment experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-accent mr-2" />
                    Easy online booking
                  </li>
                  <li className="flex items-center">
                    <Calendar className="h-4 w-4 text-accent mr-2" />
                    Treatment history tracking
                  </li>
                  <li className="flex items-center">
                    <Sparkles className="h-4 w-4 text-accent mr-2" />
                    Personalized care plans
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="lea-section">
        <div className="lea-container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the elite community of aesthetic professionals who trust LEA for their success
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="lea-button-primary">
                  Start Free Trial
                </Button>
              </Link>
              
              <Link href="/contact">
                <Button size="lg" variant="outline" className="lea-button-secondary">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
