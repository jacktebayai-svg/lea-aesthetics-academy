'use client'

import { useState, useEffect } from 'react'
import { Clock, Users, Award, BookOpen, Star, CheckCircle } from 'lucide-react'

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
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const categories = ['all', 'Anatomy', 'Safety', 'Treatments', 'Business']
  const levels = ['all', 'Level 2', 'Level 3', 'Level 4']

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/public/courses')
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Failed to load courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollment = async (courseId: string) => {
    // For now, redirect to enrollment form
    window.location.href = `/enroll/${courseId}`
  }

  const filteredCourses = courses.filter(course => {
    if (selectedCategory !== 'all' && course.category !== selectedCategory) {
      return false
    }
    if (selectedLevel !== 'all' && course.level !== selectedLevel) {
      return false
    }
    return course.isPublished
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Professional Aesthetics Training</h1>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Advance your career with industry-recognized certifications and expert-led training programs
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-2" />
                <span>Certified Programs</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>Expert Instructors</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Industry Recognition</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Course Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {course.level}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        {course.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        £{(course.price / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-3">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

                  {/* Course Details */}
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration} hours
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.currentEnrollments}/{course.maxStudents}
                    </span>
                  </div>

                  {/* Instructor */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">Instructor:</span>{' '}
                      {course.educator.title} {course.educator.name}
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">What you'll learn:</h4>
                    <ul className="space-y-1">
                      {course.outcomes.slice(0, 3).map((outcome, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <CheckCircle className="w-3 h-3 mt-0.5 mr-2 text-green-500 flex-shrink-0" />
                          {outcome}
                        </li>
                      ))}
                      {course.outcomes.length > 3 && (
                        <li className="text-sm text-gray-500">
                          +{course.outcomes.length - 3} more outcomes
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Prerequisites */}
                  {course.requirements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Prerequisites:</h4>
                      <div className="flex flex-wrap gap-1">
                        {course.requirements.map((req, index) => (
                          <span key={index} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enrollment Button */}
                  <button
                    onClick={() => handleEnrollment(course.id)}
                    disabled={course.currentEnrollments >= course.maxStudents}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {course.currentEnrollments >= course.maxStudents 
                      ? 'Course Full' 
                      : 'Enroll Now'
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later for new courses.
            </p>
          </div>
        )}

        {/* Why Choose Us Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Training?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Industry Certified</h3>
              <p className="text-gray-600 text-sm">
                All our courses are industry-recognized and provide professional certifications
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Expert Instructors</h3>
              <p className="text-gray-600 text-sm">
                Learn from practicing professionals with years of experience
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Practical Learning</h3>
              <p className="text-gray-600 text-sm">
                Hands-on training with real-world applications and case studies
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
