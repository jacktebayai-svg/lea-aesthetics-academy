'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, BookOpen, Settings } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">LEA Aesthetics Academy</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.firstName || user.email}!</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="ml-2 text-sm font-medium">Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.roles[0]}</div>
              <CardDescription>
                {user.firstName} {user.lastName}
              </CardDescription>
              <p className="text-xs text-muted-foreground mt-2">
                {user.email}
              </p>
            </CardContent>
          </Card>

          {/* Role-specific Content */}
          {user.roles.includes('CLIENT') && (
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="ml-2 text-sm font-medium">Book Treatment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Available</div>
                <CardDescription>
                  Schedule your next aesthetic treatment
                </CardDescription>
                <Button className="w-full mt-4" onClick={() => router.push('/book')}>
                  Book Now
                </Button>
              </CardContent>
            </Card>
          )}

          {user.roles.includes('STUDENT') && (
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="ml-2 text-sm font-medium">My Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <CardDescription>
                  Enrolled courses and training modules
                </CardDescription>
                <Button className="w-full mt-4" onClick={() => router.push('/courses')}>
                  View Courses
                </Button>
              </CardContent>
            </Card>
          )}

          {user.roles.includes('ADMIN') && (
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="ml-2 text-sm font-medium">Admin Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage</div>
                <CardDescription>
                  System administration and settings
                </CardDescription>
                <Button className="w-full mt-4" onClick={() => router.push('/admin' as any)}>
                  Admin Panel
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Welcome Card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Welcome to LEA Aesthetics Academy</CardTitle>
              <CardDescription>
                Your comprehensive platform for aesthetic training and practice management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <p className="text-sm text-muted-foreground">
                    No recent activity to display
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    {user.roles.includes('CLIENT') && (
                      <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/book')}>
                        Book an Appointment
                      </Button>
                    )}
                    {user.roles.includes('STUDENT') && (
                      <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/courses')}>
                        Browse Courses
                      </Button>
                    )}
                    <Button variant="outline" className="w-full justify-start">
                      Update Profile
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
