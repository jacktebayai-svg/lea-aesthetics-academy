# Master Aesthetics Suite - Complete Build Plan
## From Foundation to Production-Ready Platform

---

## 🎯 **EXECUTIVE OVERVIEW**

**Project**: Master Aesthetics Suite - Single-Tenant All-in-One Platform
**Timeline**: 10 weeks (full-time development)  
**Architecture**: Next.js 15 + Supabase single-app architecture
**Target Users**: Aesthetic practitioners who also provide education/training

### **Project Scope**
- ✅ **Practice Management**: Booking, clients, treatments, payments
- ✅ **Learning Management**: Courses, students, assessments, certificates  
- ✅ **Dual-Role Support**: Owner can be both practitioner and educator
- ✅ **Client/Student Portals**: Self-service booking and learning interfaces

---

## 📋 **PHASE-BY-PHASE BUILD PLAN**

## **Phase 1: Database Foundation Setup** 
*Week 1 (Days 1-7)*

### **Objectives**
- Deploy complete Supabase schema
- Establish authentication foundation  
- Set up development environment
- Validate database structure

### **Technical Tasks**

#### **1.1 Supabase Schema Deployment**
```bash
# Deploy existing comprehensive schema
cd apps/platform
supabase login
supabase link --project-ref fljkbvzytsjkwlywbeyg
supabase db push
```

**Files to execute:**
- `apps/platform/supabase/master-aesthetics-suite-setup.sql`
- Comprehensive schema with all tables, RLS policies, functions

#### **1.2 Environment Configuration**
```bash
# Update .env.local with Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email service
RESEND_API_KEY=re_...
```

#### **1.3 Database Validation Scripts**
```javascript
// apps/platform/scripts/validate-database.js
const { createClient } = require('@supabase/supabase-js')

async function validateDatabase() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  
  // Test all table structures
  const tables = ['user_profiles', 'business_settings', 'services', 'clients', 'students', 
                 'appointments', 'courses', 'payments', 'documents']
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1)
    console.log(`✅ Table ${table}: ${error ? 'ERROR' : 'OK'}`)
  }
}
```

### **Deliverables**
- [ ] Supabase database fully deployed
- [ ] All tables and relationships validated
- [ ] Development environment configured
- [ ] Initial business settings created

---

## **Phase 2: Core Authentication & User Management**
*Week 2 (Days 8-14)*

### **Objectives**
- Complete Supabase Auth integration
- Implement role-based access control
- Build user registration/login flows
- Create user profile management

### **Technical Implementation**

#### **2.1 Authentication Setup**
```typescript
// apps/platform/lib/supabase/auth.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function signUp(email: string, password: string, role: 'owner' | 'client' | 'student') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role }
    }
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}
```

#### **2.2 Role-Based Access Control**
```typescript
// apps/platform/lib/auth/middleware.ts
import { NextRequest } from 'next/server'

export function createAuthMiddleware() {
  return async (request: NextRequest) => {
    const token = request.cookies.get('sb-access-token')
    
    if (!token) {
      return Response.redirect(new URL('/auth/signin', request.url))
    }
    
    // Validate user role for protected routes
    const userRole = await getUserRole(token.value)
    const path = request.nextUrl.pathname
    
    if (path.startsWith('/dashboard/owner') && userRole !== 'owner') {
      return Response.redirect(new URL('/unauthorized', request.url))
    }
  }
}
```

#### **2.3 User Registration Forms**
```typescript
// apps/platform/components/auth/RegistrationForm.tsx
export function RegistrationForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'client' as 'owner' | 'client' | 'student',
    firstName: '',
    lastName: '',
    phone: ''
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create auth user
    const { data: authData, error: authError } = await signUp(
      formData.email, 
      formData.password, 
      formData.role
    )
    
    if (authData.user && !authError) {
      // Create profile based on role
      if (formData.role === 'client') {
        await createClientProfile(authData.user.id, formData)
      } else if (formData.role === 'student') {
        await createStudentProfile(authData.user.id, formData)
      }
    }
  }
}
```

### **API Routes to Build**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication  
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Sign out user
- `PUT /api/auth/profile` - Update user profile

### **Pages to Create**
- `/auth/signin` - Login page
- `/auth/signup` - Registration page
- `/auth/forgot-password` - Password reset
- `/profile` - User profile management

### **Deliverables**
- [ ] Complete authentication system
- [ ] Role-based access control
- [ ] User registration/login flows
- [ ] Profile management interface

---

## **Phase 3: Smart Booking Engine**
*Week 3 (Days 15-21)*

### **Objectives**
- Build availability calculation system
- Implement appointment booking flow
- Create service management
- Integrate payment collection

### **Technical Implementation**

#### **3.1 Availability Engine**
```typescript
// apps/platform/lib/booking/availability.ts
interface TimeSlot {
  start: Date
  end: Date
  available: boolean
  service?: Service
}

export class AvailabilityEngine {
  async calculateSlots(serviceId: string, date: Date): Promise<TimeSlot[]> {
    const service = await this.getService(serviceId)
    const businessHours = await this.getBusinessHours(date)
    const existingBookings = await this.getBookingsForDate(date)
    
    const slots: TimeSlot[] = []
    let currentTime = businessHours.start
    
    while (currentTime < businessHours.end) {
      const endTime = new Date(currentTime.getTime() + service.durationMinutes * 60000)
      
      const isAvailable = !this.hasConflict(currentTime, endTime, existingBookings)
      
      slots.push({
        start: new Date(currentTime),
        end: endTime,
        available: isAvailable,
        service
      })
      
      currentTime = new Date(currentTime.getTime() + 15 * 60000) // 15min intervals
    }
    
    return slots
  }
  
  private hasConflict(start: Date, end: Date, bookings: Appointment[]): boolean {
    return bookings.some(booking => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      
      return (start < bookingEnd && end > bookingStart)
    })
  }
}
```

#### **3.2 Booking Flow Implementation**
```typescript
// apps/platform/app/api/bookings/route.ts
export async function POST(request: Request) {
  const { serviceId, clientId, startTime, depositAmount } = await request.json()
  
  // Validate availability
  const isAvailable = await checkAvailability(serviceId, startTime)
  if (!isAvailable) {
    return Response.json({ error: 'Time slot not available' }, { status: 400 })
  }
  
  // Create appointment
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      service_id: serviceId,
      client_id: clientId,
      start_time: startTime,
      end_time: calculateEndTime(startTime, serviceId),
      status: 'pending_deposit'
    })
    .select()
    .single()
    
  // Create payment intent for deposit
  if (appointment && !error) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount,
      currency: 'gbp',
      metadata: {
        appointmentId: appointment.id,
        type: 'deposit'
      }
    })
    
    return Response.json({ 
      appointment, 
      clientSecret: paymentIntent.client_secret 
    })
  }
}
```

#### **3.3 Service Management**
```typescript
// apps/platform/components/admin/ServiceManager.tsx
export function ServiceManager() {
  const [services, setServices] = useState<Service[]>([])
  
  const createService = async (serviceData: CreateServiceData) => {
    const { data, error } = await supabase
      .from('services')
      .insert({
        name: serviceData.name,
        slug: generateSlug(serviceData.name),
        description: serviceData.description,
        base_price: serviceData.price * 100, // Convert to pence
        duration_minutes: serviceData.duration,
        category: serviceData.category,
        buffer_minutes: {
          before: serviceData.bufferBefore || 0,
          after: serviceData.bufferAfter || 0
        }
      })
      
    if (data && !error) {
      setServices(prev => [...prev, data])
    }
  }
  
  return (
    <div>
      <ServiceForm onSubmit={createService} />
      <ServiceList services={services} />
    </div>
  )
}
```

### **API Routes to Build**
- `GET /api/availability` - Get available time slots
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - List appointments  
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/services` - List services
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service

### **Pages to Create**
- `/book` - Public booking interface
- `/dashboard/appointments` - Appointment management
- `/dashboard/services` - Service management
- `/dashboard/calendar` - Calendar view

### **Deliverables**
- [ ] Smart availability calculation
- [ ] Complete booking flow
- [ ] Service management interface
- [ ] Payment integration for deposits

---

## **Phase 4: Client Portal & Management**
*Week 4 (Days 22-28)*

### **Objectives**
- Build client registration and profiles
- Create appointment history interface
- Implement document access system
- Add client communication features

### **Technical Implementation**

#### **4.1 Client Profile Management**
```typescript
// apps/platform/lib/clients/profile.ts
export async function createClientProfile(userId: string, data: ClientProfileData) {
  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      user_id: userId,
      personal_info: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        emergencyContact: data.emergencyContact
      },
      preferences: data.preferences || {},
      marketing_consent: data.marketingConsent || false,
      sms_consent: data.smsConsent || false
    })
    .select()
    .single()
    
  return { client, error }
}

export async function updateClientProfile(clientId: string, updates: Partial<ClientProfileData>) {
  const { data, error } = await supabase
    .from('clients')
    .update({
      personal_info: updates.personalInfo,
      preferences: updates.preferences,
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId)
    .select()
    .single()
    
  return { data, error }
}
```

#### **4.2 Medical History Management**
```typescript
// apps/platform/components/clients/MedicalHistoryForm.tsx
export function MedicalHistoryForm({ clientId }: { clientId: string }) {
  const [medicalData, setMedicalData] = useState({
    allergies: '',
    medications: '',
    medicalConditions: '',
    previousTreatments: '',
    skinType: '',
    concerns: '',
    contraindications: []
  })
  
  const saveMedicalHistory = async () => {
    const { data, error } = await supabase
      .from('medical_histories')
      .insert({
        client_id: clientId,
        data: medicalData,
        risk_flags: calculateRiskFlags(medicalData),
        version: 1
      })
      
    if (error) {
      toast.error('Failed to save medical history')
    } else {
      toast.success('Medical history saved successfully')
    }
  }
  
  return (
    <form onSubmit={saveMedicalHistory}>
      {/* Medical history form fields */}
    </form>
  )
}
```

#### **4.3 Client Portal Dashboard**
```typescript
// apps/platform/app/(dashboard)/client/page.tsx
export default function ClientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [documents, setDocuments] = useState([])
  
  useEffect(() => {
    if (user) {
      loadClientData()
    }
  }, [user])
  
  const loadClientData = async () => {
    // Load upcoming appointments
    const { data: upcomingAppointments } = await supabase
      .from('appointments')
      .select(`
        *,
        services (name, duration_minutes),
        payments (status, amount)
      `)
      .eq('client_id', user.clientId)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      
    // Load recent documents
    const { data: recentDocuments } = await supabase
      .from('documents')
      .select('*')
      .eq('client_id', user.clientId)
      .order('created_at', { ascending: false })
      .limit(5)
      
    setAppointments(upcomingAppointments || [])
    setDocuments(recentDocuments || [])
  }
  
  return (
    <div className="space-y-6">
      <UpcomingAppointments appointments={appointments} />
      <QuickActions />
      <RecentDocuments documents={documents} />
      <TreatmentHistory />
    </div>
  )
}
```

### **Components to Build**
- `ClientProfileForm` - Profile editing
- `AppointmentHistory` - Past appointments
- `UpcomingAppointments` - Future bookings
- `DocumentLibrary` - Access to consent forms, aftercare
- `QuickBooking` - Rapid appointment booking
- `TreatmentPhotos` - Before/after photo gallery

### **API Routes to Build**
- `GET /api/clients/profile` - Get client profile
- `PUT /api/clients/profile` - Update profile
- `POST /api/clients/medical-history` - Save medical history
- `GET /api/clients/appointments` - Client's appointments
- `GET /api/clients/documents` - Client's documents

### **Pages to Create**
- `/dashboard/client` - Client dashboard
- `/client/profile` - Profile management
- `/client/appointments` - Appointment history
- `/client/documents` - Document library

### **Deliverables**
- [ ] Complete client profile system
- [ ] Medical history management
- [ ] Client portal dashboard
- [ ] Appointment history interface

---

## **Phase 5: Course Management System (LMS)**
*Week 5 (Days 29-35)*

### **Objectives**
- Build course creation and management
- Implement curriculum structure
- Create assessment system
- Add progress tracking

### **Technical Implementation**

#### **5.1 Course Structure**
```typescript
// apps/platform/lib/courses/types.ts
interface Course {
  id: string
  title: string
  slug: string
  description: string
  price: number
  duration_hours: number
  max_students?: number
  curriculum: CourseModule[]
  prerequisites: string[]
  certificate_template: CertificateTemplate
  is_active: boolean
}

interface CourseModule {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
  assessment?: Assessment
}

interface Lesson {
  id: string
  title: string
  content_type: 'video' | 'text' | 'pdf' | 'interactive'
  content_url?: string
  content_text?: string
  duration_minutes: number
  order: number
}
```

#### **5.2 Course Builder Interface**
```typescript
// apps/platform/components/admin/CourseBuilder.tsx
export function CourseBuilder() {
  const [course, setCourse] = useState<Course | null>(null)
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null)
  
  const addModule = async (moduleData: Omit<CourseModule, 'id' | 'lessons'>) => {
    const newModule: CourseModule = {
      ...moduleData,
      id: generateId(),
      lessons: []
    }
    
    setCourse(prev => prev ? {
      ...prev,
      curriculum: [...prev.curriculum, newModule]
    } : null)
  }
  
  const addLesson = async (moduleId: string, lessonData: Omit<Lesson, 'id'>) => {
    const newLesson: Lesson = {
      ...lessonData,
      id: generateId()
    }
    
    setCourse(prev => prev ? {
      ...prev,
      curriculum: prev.curriculum.map(module => 
        module.id === moduleId 
          ? { ...module, lessons: [...module.lessons, newLesson] }
          : module
      )
    } : null)
  }
  
  const saveCourse = async () => {
    const { data, error } = await supabase
      .from('courses')
      .upsert({
        id: course?.id,
        title: course?.title,
        slug: course?.slug,
        description: course?.description,
        price: course?.price,
        duration_hours: course?.duration_hours,
        curriculum: course?.curriculum,
        certificate_template: course?.certificate_template
      })
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <CourseSettings course={course} onChange={setCourse} />
      <ModuleBuilder 
        modules={course?.curriculum || []} 
        onAddModule={addModule}
        onAddLesson={addLesson} 
      />
      <CoursePreview course={course} />
    </div>
  )
}
```

#### **5.3 Student Enrollment System**
```typescript
// apps/platform/lib/courses/enrollment.ts
export async function enrollStudent(studentId: string, courseId: string) {
  // Check prerequisites
  const course = await getCourse(courseId)
  const hasPrerequisites = await checkPrerequisites(studentId, course.prerequisites)
  
  if (!hasPrerequisites) {
    throw new Error('Prerequisites not met')
  }
  
  // Create enrollment
  const { data: enrollment, error } = await supabase
    .from('course_enrollments')
    .insert({
      student_id: studentId,
      course_id: courseId,
      status: 'enrolled',
      progress: {
        completed_modules: [],
        completed_lessons: [],
        assessment_scores: {},
        overall_progress: 0
      }
    })
    .select()
    .single()
    
  if (error) throw error
  
  // Process payment
  if (course.price > 0) {
    const payment = await createCoursePayment(enrollment.id, course.price)
    return { enrollment, payment }
  }
  
  return { enrollment }
}
```

#### **5.4 Progress Tracking**
```typescript
// apps/platform/lib/courses/progress.ts
export async function updateLessonProgress(
  enrollmentId: string, 
  lessonId: string, 
  completed: boolean
) {
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('progress, course_id')
    .eq('id', enrollmentId)
    .single()
    
  if (!enrollment) return
  
  const updatedProgress = {
    ...enrollment.progress,
    completed_lessons: completed 
      ? [...(enrollment.progress.completed_lessons || []), lessonId]
      : (enrollment.progress.completed_lessons || []).filter(id => id !== lessonId)
  }
  
  // Calculate overall progress
  const course = await getCourse(enrollment.course_id)
  const totalLessons = course.curriculum.reduce((acc, module) => acc + module.lessons.length, 0)
  const completedLessons = updatedProgress.completed_lessons.length
  updatedProgress.overall_progress = Math.round((completedLessons / totalLessons) * 100)
  
  // Update enrollment progress
  await supabase
    .from('course_enrollments')
    .update({ progress: updatedProgress })
    .eq('id', enrollmentId)
    
  return updatedProgress
}
```

### **Components to Build**
- `CourseBuilder` - Course creation interface
- `ModuleEditor` - Module content management
- `LessonEditor` - Individual lesson editing
- `AssessmentBuilder` - Quiz/test creation
- `EnrollmentManager` - Student enrollment handling
- `ProgressTracker` - Progress visualization

### **API Routes to Build**
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `POST /api/courses/:id/enroll` - Enroll student
- `GET /api/enrollments` - Student enrollments
- `PUT /api/enrollments/:id/progress` - Update progress

### **Deliverables**
- [ ] Complete course creation system
- [ ] Student enrollment workflow
- [ ] Progress tracking mechanism
- [ ] Assessment and grading system

---

## **Phase 6: Student Portal**
*Week 6 (Days 36-42)*

### **Objectives**
- Build student learning interface
- Create course progress visualization
- Implement video streaming
- Add assignment submission system

### **Technical Implementation**

#### **6.1 Student Dashboard**
```typescript
// apps/platform/app/(dashboard)/student/page.tsx
export default function StudentDashboard() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [currentCourse, setCurrentCourse] = useState(null)
  
  useEffect(() => {
    loadStudentData()
  }, [user])
  
  const loadStudentData = async () => {
    const { data } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        courses (
          id,
          title,
          description,
          curriculum,
          duration_hours
        )
      `)
      .eq('student_id', user.studentId)
      .order('created_at', { ascending: false })
      
    setEnrollments(data || [])
    
    // Set current course (most recent enrollment)
    if (data && data.length > 0) {
      setCurrentCourse(data[0])
    }
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CurrentCourse enrollment={currentCourse} />
        <RecentActivity />
      </div>
      <div>
        <ProgressOverview enrollments={enrollments} />
        <UpcomingDeadlines />
        <Achievements />
      </div>
    </div>
  )
}
```

#### **6.2 Course Learning Interface**
```typescript
// apps/platform/components/student/CoursePlayer.tsx
export function CoursePlayer({ enrollment }: { enrollment: CourseEnrollment }) {
  const [currentLesson, setCurrentLesson] = useState(null)
  const [progress, setProgress] = useState(enrollment.progress)
  
  const markLessonComplete = async (lessonId: string) => {
    const updatedProgress = await updateLessonProgress(
      enrollment.id, 
      lessonId, 
      true
    )
    
    setProgress(updatedProgress)
    
    // Auto-advance to next lesson
    const nextLesson = findNextLesson(enrollment.courses.curriculum, lessonId)
    if (nextLesson) {
      setCurrentLesson(nextLesson)
    }
  }
  
  const renderLessonContent = (lesson: Lesson) => {
    switch (lesson.content_type) {
      case 'video':
        return (
          <VideoPlayer 
            src={lesson.content_url}
            onComplete={() => markLessonComplete(lesson.id)}
          />
        )
      case 'text':
        return (
          <TextContent 
            content={lesson.content_text}
            onComplete={() => markLessonComplete(lesson.id)}
          />
        )
      case 'pdf':
        return (
          <PDFViewer 
            src={lesson.content_url}
            onComplete={() => markLessonComplete(lesson.id)}
          />
        )
      default:
        return <div>Unsupported content type</div>
    }
  }
  
  return (
    <div className="flex h-screen">
      <div className="w-1/3 bg-gray-50 p-4">
        <CourseNavigation 
          course={enrollment.courses}
          progress={progress}
          currentLesson={currentLesson}
          onLessonSelect={setCurrentLesson}
        />
      </div>
      <div className="flex-1 p-6">
        {currentLesson && (
          <div>
            <LessonHeader lesson={currentLesson} />
            {renderLessonContent(currentLesson)}
            <LessonControls 
              lesson={currentLesson}
              onComplete={() => markLessonComplete(currentLesson.id)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
```

#### **6.3 Assessment System**
```typescript
// apps/platform/components/student/AssessmentTaker.tsx
export function AssessmentTaker({ assessment }: { assessment: Assessment }) {
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(assessment.time_limit * 60)
  
  const submitAssessment = async () => {
    const score = calculateScore(assessment.questions, answers)
    const passed = score >= assessment.passing_score
    
    const { data, error } = await supabase
      .from('assessment_attempts')
      .insert({
        student_id: user.studentId,
        assessment_id: assessment.id,
        answers: answers,
        score: score,
        passed: passed,
        time_taken: assessment.time_limit * 60 - timeRemaining,
        submitted_at: new Date().toISOString()
      })
      
    if (!error) {
      router.push(`/assessment/${assessment.id}/results`)
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <AssessmentHeader 
        assessment={assessment}
        currentQuestion={currentQuestion}
        timeRemaining={timeRemaining}
      />
      <QuestionDisplay 
        question={assessment.questions[currentQuestion]}
        answer={answers[currentQuestion]}
        onAnswerChange={(answer) => setAnswers(prev => ({
          ...prev,
          [currentQuestion]: answer
        }))}
      />
      <AssessmentControls 
        canGoBack={currentQuestion > 0}
        canGoNext={currentQuestion < assessment.questions.length - 1}
        canSubmit={currentQuestion === assessment.questions.length - 1}
        onBack={() => setCurrentQuestion(prev => prev - 1)}
        onNext={() => setCurrentQuestion(prev => prev + 1)}
        onSubmit={submitAssessment}
      />
    </div>
  )
}
```

### **Components to Build**
- `StudentDashboard` - Main student interface
- `CoursePlayer` - Learning content player
- `ProgressChart` - Visual progress tracking
- `AssessmentTaker` - Quiz/exam interface
- `CertificateViewer` - Certificate display
- `CourseNavigation` - Course content navigation

### **Pages to Create**
- `/dashboard/student` - Student dashboard
- `/courses/:id/learn` - Course learning interface
- `/assessment/:id` - Assessment taking
- `/certificates` - Certificate collection

### **Deliverables**
- [ ] Student learning interface
- [ ] Progress visualization
- [ ] Assessment taking system
- [ ] Certificate generation

---

## **Phase 7: Business Owner Dashboard**
*Week 7 (Days 43-49)*

### **Objectives**
- Build comprehensive admin interface
- Create analytics and reporting
- Implement business settings management
- Add revenue tracking

### **Technical Implementation**

#### **7.1 Owner Dashboard Overview**
```typescript
// apps/platform/app/(dashboard)/owner/page.tsx
export default function OwnerDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  
  useEffect(() => {
    loadDashboardData()
  }, [])
  
  const loadDashboardData = async () => {
    // Revenue analytics
    const { data: revenue } = await supabase
      .from('payments')
      .select('amount, paid_at')
      .eq('status', 'succeeded')
      .gte('paid_at', startOfMonth(new Date()))
      
    // Booking analytics
    const { data: bookings } = await supabase
      .from('appointments')
      .select('*')
      .gte('created_at', startOfMonth(new Date()))
      
    // Course analytics
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('*, courses(price)')
      .gte('created_at', startOfMonth(new Date()))
      
    setAnalytics({
      revenue: {
        total: revenue?.reduce((sum, p) => sum + p.amount, 0) || 0,
        bookings: revenue?.filter(p => p.appointment_id).length || 0,
        courses: revenue?.filter(p => p.course_enrollment_id).length || 0
      },
      bookings: {
        total: bookings?.length || 0,
        confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
        pending: bookings?.filter(b => b.status === 'pending_deposit').length || 0
      },
      courses: {
        enrollments: enrollments?.length || 0,
        revenue: enrollments?.reduce((sum, e) => sum + (e.courses?.price || 0), 0) || 0
      }
    })
  }
  
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <MetricsGrid analytics={analytics} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <BookingChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentBookings />
        <RecentEnrollments />
        <PendingTasks />
      </div>
    </div>
  )
}
```

#### **7.2 Revenue Analytics**
```typescript
// apps/platform/components/admin/RevenueAnalytics.tsx
export function RevenueAnalytics() {
  const [period, setPeriod] = useState('month')
  const [revenueData, setRevenueData] = useState([])
  
  useEffect(() => {
    loadRevenueData()
  }, [period])
  
  const loadRevenueData = async () => {
    const startDate = getStartDate(period)
    
    const { data } = await supabase
      .from('payments')
      .select(`
        amount,
        paid_at,
        appointments (
          services (name, category)
        ),
        course_enrollments (
          courses (title)
        )
      `)
      .eq('status', 'succeeded')
      .gte('paid_at', startDate.toISOString())
      .order('paid_at', { ascending: true })
      
    // Process data for charts
    const processedData = processRevenueData(data || [])
    setRevenueData(processedData)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Revenue Analytics</h2>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>
      
      <RevenueMetrics data={revenueData} />
      <RevenueChart data={revenueData} />
      <RevenueBreakdown data={revenueData} />
    </div>
  )
}
```

#### **7.3 Business Settings Management**
```typescript
// apps/platform/components/admin/BusinessSettings.tsx
export function BusinessSettings() {
  const [settings, setSettings] = useState(null)
  
  const updateSettings = async (updates: Partial<BusinessSettings>) => {
    const { data, error } = await supabase
      .from('business_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'business_settings')
      .select()
      .single()
      
    if (!error) {
      setSettings(data)
      toast.success('Settings updated successfully')
    }
  }
  
  return (
    <div className="space-y-8">
      <BusinessProfileSection 
        settings={settings}
        onUpdate={updateSettings}
      />
      <BusinessHoursSection 
        settings={settings}
        onUpdate={updateSettings}
      />
      <PaymentSettingsSection 
        settings={settings}
        onUpdate={updateSettings}
      />
      <NotificationSettingsSection 
        settings={settings}
        onUpdate={updateSettings}
      />
    </div>
  )
}
```

### **Components to Build**
- `OwnerDashboard` - Main admin interface
- `RevenueAnalytics` - Financial reporting
- `BookingManagement` - Appointment oversight
- `ClientManagement` - Client database
- `CourseManagement` - LMS administration
- `BusinessSettings` - Configuration panel

### **Pages to Create**
- `/dashboard/owner` - Owner dashboard
- `/dashboard/analytics` - Detailed analytics
- `/dashboard/clients` - Client management
- `/dashboard/bookings` - Appointment management
- `/dashboard/courses` - Course administration
- `/dashboard/settings` - Business settings

### **Deliverables**
- [ ] Comprehensive admin dashboard
- [ ] Revenue and booking analytics
- [ ] Business configuration system
- [ ] Client and course management

---

## **Phase 8: Payment & Document Systems**
*Week 8 (Days 50-56)*

### **Objectives**
- Complete Stripe payment integration
- Build document generation system
- Implement e-signature workflow
- Add compliance features

### **Technical Implementation**

#### **8.1 Advanced Payment Processing**
```typescript
// apps/platform/lib/payments/stripe.ts
export class StripePaymentProcessor {
  private stripe: Stripe
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  }
  
  async createDepositPayment(appointmentId: string, amount: number) {
    const appointment = await this.getAppointment(appointmentId)
    
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount, // in pence
      currency: 'gbp',
      payment_method_types: ['card'],
      metadata: {
        type: 'appointment_deposit',
        appointment_id: appointmentId,
        client_id: appointment.client_id
      }
    })
    
    // Save payment record
    await supabase
      .from('payments')
      .insert({
        appointment_id: appointmentId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount,
        deposit_amount: amount,
        currency: 'GBP',
        status: 'pending'
      })
      
    return paymentIntent
  }
  
  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent)
        break
    }
  }
  
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    // Update payment status
    await supabase
      .from('payments')
      .update({ 
        status: 'succeeded',
        paid_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
      
    // Update appointment status
    if (paymentIntent.metadata.type === 'appointment_deposit') {
      await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', paymentIntent.metadata.appointment_id)
        
      // Send confirmation email
      await this.sendBookingConfirmation(paymentIntent.metadata.appointment_id)
    }
  }
}
```

#### **8.2 Document Generation System**
```typescript
// apps/platform/lib/documents/generator.ts
export class DocumentGenerator {
  async generateConsentForm(clientId: string, serviceId: string) {
    const client = await this.getClient(clientId)
    const service = await this.getService(serviceId)
    const template = await this.getConsentTemplate(service.category)
    
    // Merge client data with template
    const mergedContent = this.mergeTemplate(template.content, {
      clientName: `${client.personal_info.firstName} ${client.personal_info.lastName}`,
      serviceName: service.name,
      practitionerName: await this.getPractitionerName(),
      date: new Date().toLocaleDateString('en-GB'),
      businessName: await this.getBusinessName()
    })
    
    // Generate PDF
    const pdf = await this.generatePDF(mergedContent, template.styling)
    
    // Save document record
    const { data: document } = await supabase
      .from('documents')
      .insert({
        type: 'consent',
        client_id: clientId,
        template_id: template.id,
        content: mergedContent,
        pdf_url: pdf.url,
        status: 'draft',
        expires_at: addDays(new Date(), 30).toISOString()
      })
      .select()
      .single()
      
    return document
  }
  
  async generateCertificate(enrollmentId: string) {
    const enrollment = await this.getEnrollment(enrollmentId)
    const template = enrollment.courses.certificate_template
    
    const certificateData = {
      studentName: `${enrollment.students.personal_info.firstName} ${enrollment.students.personal_info.lastName}`,
      courseName: enrollment.courses.title,
      completionDate: enrollment.completed_at,
      certificateNumber: this.generateCertificateNumber(enrollmentId),
      issuerName: await this.getBusinessName()
    }
    
    const certificate = await this.generatePDF(
      this.mergeTemplate(template.content, certificateData),
      template.styling
    )
    
    return certificate
  }
}
```

#### **8.3 E-Signature Workflow**
```typescript
// apps/platform/components/documents/ESignature.tsx
export function ESignature({ documentId }: { documentId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  
  const handleSignDocument = async () => {
    if (!signature) return
    
    // Save signature
    const { data: signatureRecord } = await supabase
      .from('document_signatures')
      .insert({
        document_id: documentId,
        user_id: user.id,
        signature_data: signature,
        signed_at: new Date().toISOString(),
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
      })
      .select()
      .single()
      
    // Update document status
    await supabase
      .from('documents')
      .update({ 
        status: 'signed',
        signed_at: new Date().toISOString()
      })
      .eq('id', documentId)
      
    // Generate final PDF with signature
    const finalPDF = await generateSignedPDF(documentId, signature)
    
    toast.success('Document signed successfully')
  }
  
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 p-4">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="border w-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
        />
      </div>
      <div className="flex justify-between">
        <button onClick={clearSignature}>Clear</button>
        <button 
          onClick={handleSignDocument}
          disabled={!signature}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Sign Document
        </button>
      </div>
    </div>
  )
}
```

### **API Routes to Build**
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook handler
- `POST /api/documents/generate` - Generate documents
- `POST /api/documents/:id/sign` - Sign document
- `GET /api/documents/:id/download` - Download signed document

### **Deliverables**
- [ ] Complete payment processing system
- [ ] Document generation engine
- [ ] E-signature workflow
- [ ] Compliance and audit trail

---

## **Phase 9: Communication & Automation**
*Week 9 (Days 57-63)*

### **Objectives**
- Implement email/SMS notifications
- Build automated workflow system
- Create marketing campaign tools
- Add client communication features

### **Technical Implementation**

#### **9.1 Notification System**
```typescript
// apps/platform/lib/notifications/email.ts
export class EmailNotificationService {
  private resend = new Resend(process.env.RESEND_API_KEY!)
  
  async sendBookingConfirmation(appointmentId: string) {
    const appointment = await this.getAppointmentDetails(appointmentId)
    
    await this.resend.emails.send({
      from: 'LEA Aesthetics <noreply@leaaesthetics.com>',
      to: appointment.client.email,
      subject: 'Booking Confirmation - LEA Aesthetics',
      html: await this.renderTemplate('booking-confirmation', {
        clientName: appointment.client.name,
        serviceName: appointment.service.name,
        appointmentDate: format(appointment.start_time, 'EEEE, MMMM do, yyyy'),
        appointmentTime: format(appointment.start_time, 'h:mm a'),
        practitionerName: 'Lea',
        totalAmount: formatCurrency(appointment.service.price),
        depositPaid: formatCurrency(appointment.payment.amount)
      })
    })
  }
  
  async sendAppointmentReminder(appointmentId: string) {
    const appointment = await this.getAppointmentDetails(appointmentId)
    
    await this.resend.emails.send({
      from: 'LEA Aesthetics <noreply@leaaesthetics.com>',
      to: appointment.client.email,
      subject: 'Appointment Reminder - Tomorrow at LEA Aesthetics',
      html: await this.renderTemplate('appointment-reminder', {
        clientName: appointment.client.name,
        serviceName: appointment.service.name,
        appointmentDate: format(appointment.start_time, 'EEEE, MMMM do'),
        appointmentTime: format(appointment.start_time, 'h:mm a'),
        preparationInstructions: appointment.service.preparation_notes
      })
    })
  }
  
  async sendCourseWelcome(enrollmentId: string) {
    const enrollment = await this.getEnrollmentDetails(enrollmentId)
    
    await this.resend.emails.send({
      from: 'LEA Academy <academy@leaaesthetics.com>',
      to: enrollment.student.email,
      subject: `Welcome to ${enrollment.course.title}`,
      html: await this.renderTemplate('course-welcome', {
        studentName: enrollment.student.name,
        courseTitle: enrollment.course.title,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student`,
        supportEmail: 'support@leaaesthetics.com'
      })
    })
  }
}
```

#### **9.2 Automated Workflow Engine**
```typescript
// apps/platform/lib/automation/workflows.ts
export class WorkflowEngine {
  async processBookingWorkflow(appointmentId: string) {
    const appointment = await this.getAppointment(appointmentId)
    
    // Schedule workflow tasks
    const workflows = [
      { delay: 0, action: 'send_booking_confirmation' },
      { delay: hours(48), action: 'send_preparation_reminder' },
      { delay: hours(24), action: 'send_appointment_reminder' },
      { delay: hours(2), action: 'send_checkin_reminder' },
      { delay: hours(24, appointment.end_time), action: 'send_aftercare_instructions' },
      { delay: days(7, appointment.end_time), action: 'send_follow_up_survey' },
      { delay: days(30, appointment.end_time), action: 'send_rebooking_offer' }
    ]
    
    for (const workflow of workflows) {
      await this.scheduleTask({
        appointment_id: appointmentId,
        action: workflow.action,
        execute_at: addMilliseconds(new Date(), workflow.delay)
      })
    }
  }
  
  async processCourseWorkflow(enrollmentId: string) {
    const enrollment = await this.getEnrollment(enrollmentId)
    
    const workflows = [
      { delay: 0, action: 'send_course_welcome' },
      { delay: days(1), action: 'check_first_lesson_progress' },
      { delay: days(7), action: 'send_progress_reminder' },
      { delay: days(14), action: 'send_motivation_message' },
      { delay: days(30), action: 'check_completion_status' }
    ]
    
    for (const workflow of workflows) {
      await this.scheduleTask({
        enrollment_id: enrollmentId,
        action: workflow.action,
        execute_at: addMilliseconds(new Date(), workflow.delay)
      })
    }
  }
  
  async executeScheduledTasks() {
    const { data: tasks } = await supabase
      .from('scheduled_tasks')
      .select('*')
      .lte('execute_at', new Date().toISOString())
      .eq('status', 'pending')
      
    for (const task of tasks || []) {
      try {
        await this.executeTask(task)
        
        await supabase
          .from('scheduled_tasks')
          .update({ 
            status: 'completed',
            executed_at: new Date().toISOString()
          })
          .eq('id', task.id)
      } catch (error) {
        await supabase
          .from('scheduled_tasks')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('id', task.id)
      }
    }
  }
}
```

#### **9.3 Marketing Campaign System**
```typescript
// apps/platform/components/admin/CampaignBuilder.tsx
export function CampaignBuilder() {
  const [campaign, setCampaign] = useState<Campaign>({
    name: '',
    type: 'email',
    audience_filter: {},
    content: {},
    scheduled_for: null
  })
  
  const createCampaign = async () => {
    // Create campaign
    const { data: newCampaign } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single()
      
    if (newCampaign) {
      // Generate recipient list
      const recipients = await generateRecipientList(campaign.audience_filter)
      
      // Create message records
      const messages = recipients.map(recipient => ({
        campaign_id: newCampaign.id,
        recipient_id: recipient.id,
        recipient_type: recipient.type,
        channel: campaign.type,
        content: personalizeContent(campaign.content, recipient),
        status: 'pending'
      }))
      
      await supabase
        .from('messages')
        .insert(messages)
        
      // Schedule sending if not immediate
      if (campaign.scheduled_for) {
        await scheduleTask({
          action: 'send_campaign',
          campaign_id: newCampaign.id,
          execute_at: campaign.scheduled_for
        })
      } else {
        await sendCampaign(newCampaign.id)
      }
    }
  }
  
  return (
    <div className="space-y-6">
      <CampaignSettings campaign={campaign} onChange={setCampaign} />
      <AudienceSelector 
        filter={campaign.audience_filter}
        onChange={(filter) => setCampaign(prev => ({ ...prev, audience_filter: filter }))}
      />
      <ContentEditor 
        content={campaign.content}
        onChange={(content) => setCampaign(prev => ({ ...prev, content }))}
      />
      <CampaignPreview campaign={campaign} />
      <div className="flex justify-end">
        <button 
          onClick={createCampaign}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          {campaign.scheduled_for ? 'Schedule Campaign' : 'Send Now'}
        </button>
      </div>
    </div>
  )
}
```

### **Components to Build**
- `NotificationCenter` - Manage notifications
- `EmailTemplateEditor` - Design email templates
- `WorkflowBuilder` - Create automation sequences
- `CampaignManager` - Marketing campaign tools
- `MessageHistory` - Communication tracking

### **API Routes to Build**
- `POST /api/notifications/send` - Send notifications
- `POST /api/campaigns` - Create campaigns
- `POST /api/campaigns/:id/send` - Send campaign
- `GET /api/messages` - Message history
- `POST /api/workflows/trigger` - Trigger workflow

### **Deliverables**
- [ ] Complete notification system
- [ ] Automated workflow engine
- [ ] Marketing campaign tools
- [ ] Client communication tracking

---

## **Phase 10: Testing & Production Deployment**
*Week 10 (Days 64-70)*

### **Objectives**
- Comprehensive testing suite
- Performance optimization
- Security audit and hardening
- Production deployment

### **Technical Implementation**

#### **10.1 Testing Suite**
```typescript
// apps/platform/tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Booking Flow', () => {
  test('Complete booking process', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/book')
    
    // Select service
    await page.click('[data-testid="service-botox"]')
    await expect(page.locator('text=Botox Treatment')).toBeVisible()
    
    // Select time slot
    await page.click('[data-testid="time-slot-14:00"]')
    
    // Fill client details
    await page.fill('[data-testid="client-firstName"]', 'John')
    await page.fill('[data-testid="client-lastName"]', 'Doe')
    await page.fill('[data-testid="client-email"]', 'john@example.com')
    await page.fill('[data-testid="client-phone"]', '07123456789')
    
    // Complete medical history
    await page.click('[data-testid="no-allergies"]')
    await page.click('[data-testid="no-medications"]')
    
    // Proceed to payment
    await page.click('[data-testid="proceed-payment"]')
    
    // Fill payment details (test mode)
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')
    
    // Complete payment
    await page.click('[data-testid="complete-payment"]')
    
    // Verify success
    await expect(page.locator('text=Booking Confirmed')).toBeVisible()
    await expect(page.locator('[data-testid="appointment-id"]')).toBeVisible()
  })
  
  test('Course enrollment process', async ({ page }) => {
    // Login as student
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email"]', 'student@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="signin-button"]')
    
    // Navigate to courses
    await page.goto('/courses')
    await page.click('[data-testid="course-level-2"]')
    
    // Enroll in course
    await page.click('[data-testid="enroll-button"]')
    
    // Complete payment
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')
    await page.click('[data-testid="complete-enrollment"]')
    
    // Verify enrollment
    await expect(page.locator('text=Successfully Enrolled')).toBeVisible()
    await expect(page.locator('[data-testid="course-dashboard"]')).toBeVisible()
  })
})
```

#### **10.2 Performance Optimization**
```typescript
// apps/platform/lib/performance/optimization.ts
export const performanceConfig = {
  // Next.js optimizations
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Image optimization
  images: {
    domains: ['supabase.co', 'stripe.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Caching strategy
  revalidate: {
    services: 3600, // 1 hour
    courses: 1800,  // 30 minutes
    appointments: 60, // 1 minute
  },
  
  // Bundle optimization
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    }
    return config
  }
}

// Database query optimization
export const optimizedQueries = {
  getAppointmentsWithDetails: () => supabase
    .from('appointments')
    .select(`
      *,
      clients!inner (
        personal_info
      ),
      services!inner (
        name,
        duration_minutes,
        base_price
      ),
      payments (
        status,
        amount
      )
    `)
    .order('start_time', { ascending: true }),
    
  getCourseWithProgress: (enrollmentId: string) => supabase
    .from('course_enrollments')
    .select(`
      *,
      courses!inner (
        title,
        curriculum,
        duration_hours
      ),
      students!inner (
        personal_info
      )
    `)
    .eq('id', enrollmentId)
    .single()
}
```

#### **10.3 Security Hardening**
```typescript
// apps/platform/lib/security/config.ts
export const securityConfig = {
  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-eval'", 'stripe.com'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'supabase.co'],
    'connect-src': ["'self'", 'api.stripe.com', 'supabase.co'],
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Input validation
  validation: {
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
    phone: z.string().regex(/^(\+44|0)[1-9]\d{8,9}$/),
    amount: z.number().positive().max(100000), // Max £1000
  }
}

// Audit logging
export async function logSecurityEvent(event: SecurityEvent) {
  await supabase
    .from('audit_logs')
    .insert({
      user_id: event.userId,
      action: event.action,
      resource: event.resource,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      risk_level: event.riskLevel,
      created_at: new Date().toISOString()
    })
}
```

#### **10.4 Production Deployment**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run tests
        run: pnpm test
        
      - name: Run E2E tests
        run: pnpm test:e2e
        
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build application
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### **Final Deliverables**
- [ ] Complete test suite (unit, integration, E2E)
- [ ] Performance optimization implemented
- [ ] Security audit completed
- [ ] Production deployment pipeline
- [ ] Monitoring and alerting setup
- [ ] Documentation and user guides

---

## 🚀 **IMPLEMENTATION TIMELINE**

### **Week 1**: Database Foundation
- Deploy Supabase schema
- Configure authentication
- Set up development environment

### **Week 2**: User Management
- Complete auth system
- Role-based access control
- User registration flows

### **Week 3**: Booking Engine
- Availability calculation
- Appointment management
- Payment integration

### **Week 4**: Client Portal
- Client profiles and medical history
- Appointment history
- Document access

### **Week 5**: Course System
- Course creation and management
- Student enrollment
- Progress tracking

### **Week 6**: Student Portal
- Learning interface
- Progress visualization
- Assessment system

### **Week 7**: Owner Dashboard
- Admin interface
- Analytics and reporting
- Business settings

### **Week 8**: Payments & Documents
- Complete Stripe integration
- Document generation
- E-signature workflow

### **Week 9**: Communication
- Email/SMS notifications
- Automated workflows
- Marketing campaigns

### **Week 10**: Production
- Testing and optimization
- Security hardening
- Production deployment

---

## 📊 **SUCCESS METRICS**

### **Technical Metrics**
- [ ] 99.9% uptime
- [ ] <2s page load times
- [ ] <500ms API response times
- [ ] 100% test coverage on critical paths
- [ ] A+ security rating

### **Business Metrics**
- [ ] 70%+ booking conversion rate
- [ ] 80%+ course completion rate
- [ ] 95%+ payment success rate
- [ ] 4.8/5 user satisfaction
- [ ] <2% support ticket rate

### **User Experience Metrics**
- [ ] <3 clicks to book appointment
- [ ] <2 minutes registration time
- [ ] Mobile-responsive design (100% mobile score)
- [ ] WCAG 2.2 AA accessibility compliance
- [ ] 90%+ Net Promoter Score

---

## 💰 **RESOURCE REQUIREMENTS**

### **Development Team**
- 1-2 Full-stack developers
- 1 UI/UX designer (part-time)
- 1 DevOps engineer (part-time)

### **Infrastructure Costs** (Monthly)
- Vercel Pro: £20
- Supabase Pro: £25
- Stripe fees: 1.4% + 20p per transaction
- Domain and SSL: £10
- **Total**: ~£55/month + transaction fees

### **Third-party Services**
- Resend (email): £20/month for 100k emails
- Twilio (SMS): Pay-per-use (~£0.05 per SMS)
- Vercel Analytics: Included in Pro plan

---

## 🎯 **NEXT ACTIONS**

### **Immediate (This Week)**
1. **Deploy Supabase Schema** - Execute existing setup script
2. **Configure Environment** - Set up all environment variables
3. **Test Authentication** - Verify Supabase auth integration
4. **Validate Database** - Run database validation scripts

### **Short-term (Next 2 Weeks)**
1. **Complete Phase 1** - Database foundation
2. **Start Phase 2** - Authentication and user management
3. **Set up CI/CD Pipeline** - Automated testing and deployment
4. **Design System Finalization** - Complete UI component library

### **Medium-term (Month 1)**
1. **Complete Core Features** - Booking and client management
2. **Alpha Testing** - Internal testing with real data
3. **Performance Optimization** - Initial optimization pass
4. **Security Audit** - First security review

---

This comprehensive build plan provides a clear roadmap from the current state to a fully production-ready Master Aesthetics Suite platform. The plan leverages existing assets while systematically building out all required functionality according to the single-tenant specification.

*Ready to begin Phase 1 implementation immediately.*
