'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-provider'
import { 
  LuxuryButton,
  LuxuryCard,
  LuxuryAvatar,
  fadeInUp
} from '@/components/ui/luxury-components'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { 
  User, 
  LogOut, 
  Settings, 
  Calendar, 
  BookOpen, 
  Menu,
  Crown,
  Sparkles,
  ChevronDown
} from 'lucide-react'

export function LEAHeader() {
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 lea-backdrop">
      <div className="lea-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Crown className="h-8 w-8 text-primary lea-text-gradient" />
              <Sparkles className="h-3 w-3 text-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold lea-text-gradient">LEA</h1>
              <p className="text-xs text-muted-foreground -mt-1">Aesthetics Academy</p>
            </div>
          </Link>

          {/* Navigation */}
          {user ? (
            <div className="flex items-center space-x-4">
              {/* Quick Actions based on role */}
              {user.roles.includes('CLIENT') && (
                <Link href="/book">
                  <LuxuryButton variant="ghost" size="sm" className="hidden md:flex" leftIcon={<Calendar className="h-4 w-4" />}>
                    Book Treatment
                  </LuxuryButton>
                </Link>
              )}
              
              {user.roles.includes('STUDENT') && (
                <Link href="/courses">
                  <LuxuryButton variant="ghost" size="sm" className="hidden md:flex" leftIcon={<BookOpen className="h-4 w-4" />}>
                    My Courses
                  </LuxuryButton>
                </Link>
              )}

              {user.roles.includes('ADMIN') && (
                <Link href="/admin/dashboard">
                  <LuxuryButton variant="ghost" size="sm" className="hidden md:flex" leftIcon={<Settings className="h-4 w-4" />}>
                    Admin
                  </LuxuryButton>
                </Link>
              )}

              {/* User Menu */}
              <div className="relative">
                <LuxuryButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  leftIcon={<LuxuryAvatar fallback={user.firstName?.[0] || user.email[0]} size="sm" />}
                  rightIcon={<ChevronDown className="h-4 w-4" />}
                >
                  <span className="ml-2 hidden md:block">
                    {user.firstName || user.email.split('@')[0]}
                  </span>
                </LuxuryButton>
                
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 z-50"
                    >
                      <LuxuryCard className="w-64 p-4">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-[#e7e5e4]">
                          <LuxuryAvatar fallback={user.firstName?.[0] || user.email[0]} size="md" />
                          <div className="flex-1">
                            <p className="font-semibold text-[#1c1917]">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-[#78716c]">{user.email}</p>
                            <p className="text-xs font-medium text-[#b45309]">{user.roles[0]}</p>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="space-y-2">
                          <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}>
                            <LuxuryButton variant="ghost" className="w-full justify-start" size="sm" leftIcon={<User className="h-4 w-4" />}>
                              Dashboard
                            </LuxuryButton>
                          </Link>
                          
                          <Link href="/profile" onClick={() => setUserMenuOpen(false)}>
                            <LuxuryButton variant="ghost" className="w-full justify-start" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
                              Profile Settings
                            </LuxuryButton>
                          </Link>
                          
                          <div className="pt-2 border-t border-[#e7e5e4]">
                            <LuxuryButton 
                              onClick={handleLogout}
                              variant="ghost" 
                              className="w-full justify-start text-red-600 hover:bg-red-50" 
                              size="sm" 
                              leftIcon={<LogOut className="h-4 w-4" />}
                            >
                              Sign Out
                            </LuxuryButton>
                          </div>
                        </div>
                      </LuxuryCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <LuxuryButton variant="ghost" size="sm">
                  Sign In
                </LuxuryButton>
              </Link>
              <Link href="/register">
                <LuxuryButton variant="primary" size="sm">
                  Get Started
                </LuxuryButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
