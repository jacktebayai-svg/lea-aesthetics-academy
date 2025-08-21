'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { 
  LuxuryCard, 
  LuxuryButton, 
  LuxuryLoader,
  LuxuryBadge,
  fadeInUp,
  staggerContainer
} from '@/components/ui/luxury-components'
import { LEAHeader } from '@/components/layout/header'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award,
  PlayCircle,
  CheckCircle,
  Calendar,
  Star,
  Crown,
  Sparkles
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  level: string
  category: string
  duration: number
  price: number
  maxStudents: number
  currentEnrollments: number
  outcomes: string[]
  requirements: string[]
  isPublished: boolean
  educator: {
    name: string
    title?: string
    bio?: string
  }
}

export default function CoursesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  const categories = [
    'ALL',
    'FACIAL_AESTHETICS',
    'DERMAL_FILLERS',
    'BOTOX',
    'SKIN_TREATMENTS',
    'ADVANCED_TECHNIQUES'
  ]

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    } else if (user) {
      loadCourses()
    }
  }, [user, isLoading, router])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      const data = await response.json()
      
      // Mock data for development
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Foundation in Facial Aesthetics',
          description: 'Master the fundamentals of facial aesthetics with our comprehensive foundation course. Learn anatomy, consultation techniques, and basic procedures.',
          category: 'Facial Aesthetics',
          level: 'Level 2',
          duration: 40,
          price: 159900,
          maxStudents: 20,
          currentEnrollments: 12,
          outcomes: ['Understand facial anatomy', 'Master consultation skills', 'Learn basic injection techniques', 'Patient safety protocols'],
          requirements: ['Basic medical knowledge'],
          isPublished: true,
          educator: {
            name: 'Dr. Sarah Johnson',
            title: 'MD',
            bio: 'Leading aesthetic practitioner with 15 years experience'
          }
        },
        {
          id: '2',
          title: 'Advanced Dermal Filler Techniques',
          description: 'Advanced training in dermal filler applications, complications management, and artistic enhancement techniques.',
          category: 'Treatments',
          level: 'Level 4',
          duration: 60,
          price: 249900,
          maxStudents: 15,
          currentEnrollments: 8,
          outcomes: ['Advanced injection techniques', 'Complications management', 'Artistic enhancement', 'Business protocols'],
          requirements: ['Level 2 certification', 'Clinical experience'],
          isPublished: true,
          educator: {
            name: 'Prof. Michael Chen',
            title: 'Professor',
            bio: 'International expert in aesthetic medicine'
          }
        }
      ]
      
      setCourses(data.courses || mockCourses)
    } catch (error) {
      console.error('Failed to load courses:', error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollment = async (courseId: string) => {
    window.location.href = `/enroll/${courseId}`
  }

  const filteredCourses = selectedCategory === 'ALL' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory)

  const getLevelColor = (level: string): 'gold' | 'rose' | 'success' | 'warning' | 'info' => {
    switch (level) {
      case 'Level 2': return 'info'
      case 'Level 3': return 'gold'
      case 'Level 4': return 'rose'
      default: return 'info'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'ALL': return 'All Courses'
      case 'FACIAL_AESTHETICS': return 'Facial Aesthetics'
      case 'DERMAL_FILLERS': return 'Dermal Fillers'
      case 'BOTOX': return 'Botox'
      case 'SKIN_TREATMENTS': return 'Skin Treatments'
      case 'ADVANCED_TECHNIQUES': return 'Advanced Techniques'
      default: return category
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen lea-gradient-bg flex items-center justify-center">
        <LuxuryLoader size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
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
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-[#b45309] mr-3" />
            <h1 className="text-4xl font-bold lea-text-gradient">Course Library</h1>
          </div>
          <p className="text-xl text-[#78716c] max-w-3xl mx-auto">
            Master the art of aesthetic medicine with our comprehensive training programs. 
            Learn from industry experts and advance your professional skills.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <LuxuryButton
              key={category}
              variant={selectedCategory === category ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {getCategoryName(category)}
            </LuxuryButton>
          ))}
        </motion.div>

        {/* Courses Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredCourses.map((course) => (
            <motion.div key={course.id} variants={fadeInUp}>
              <LuxuryCard variant="premium" className="h-full flex flex-col">
                {/* Course Header */}
                <div className="relative mb-6">
                  <div className="aspect-video bg-gradient-to-br from-[#fefce8] to-[#fef3c7] rounded-lg flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-[#b45309]" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <LuxuryBadge variant={getLevelColor(course.level)} size="sm">
                      {course.level}
                    </LuxuryBadge>
                  </div>
                </div>

                {/* Course Content */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-[#1c1917] mb-3">{course.title}</h3>
                  <p className="text-[#78716c] mb-4 flex-1">{course.description}</p>
                  
                  {/* Course Meta */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-[#78716c]">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {course.duration} hours
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {course.currentEnrollments}/{course.maxStudents}
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-[#78716c]">by {course.educator.title} {course.educator.name}</span>
                    <div className="flex items-center text-sm text-[#b45309]">
                      <Award className="h-4 w-4 mr-1" />
                      Certificate
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold lea-text-gradient">
                      £{(course.price / 100).toFixed(2)}
                    </div>
                    <LuxuryButton 
                      variant="primary"
                      disabled={course.currentEnrollments >= course.maxStudents}
                      onClick={() => handleEnrollment(course.id)}
                    >
                      {course.currentEnrollments >= course.maxStudents ? 'Course Full' : 'Enroll Now'}
                    </LuxuryButton>
                  </div>
                </div>
              </LuxuryCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <LuxuryCard variant="glass" className="max-w-md mx-auto">
              <BookOpen className="h-16 w-16 text-[#78716c] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#1c1917] mb-2">No Courses Found</h3>
              <p className="text-[#78716c] mb-4">
                No courses match your selected category. Try selecting a different category.
              </p>
              <LuxuryButton variant="ghost" onClick={() => setSelectedCategory('ALL')}>
                View All Courses
              </LuxuryButton>
            </LuxuryCard>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <LuxuryCard variant="premium" className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Crown className="h-8 w-8 text-[#b45309] mr-3" />
              <Sparkles className="h-6 w-6 text-[#ec4899]" />
            </div>
            <h2 className="text-3xl font-bold text-[#1c1917] mb-4">
              Ready to Advance Your Career?
            </h2>
            <p className="text-xl text-[#78716c] mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their practice with our 
              industry-leading aesthetic training programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LuxuryButton variant="primary" size="lg">
                Browse All Courses
              </LuxuryButton>
              <LuxuryButton variant="secondary" size="lg">
                Contact an Advisor
              </LuxuryButton>
            </div>
          </LuxuryCard>
        </motion.div>
      </main>
    </div>
  )
}
