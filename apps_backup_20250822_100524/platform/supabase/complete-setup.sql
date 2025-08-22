-- ==========================================
-- LEA AESTHETICS ACADEMY - COMPLETE SUPABASE SETUP
-- This script sets up the entire database schema, triggers, RLS policies, storage, and seed data
-- Safe to run multiple times - includes proper conflict handling
-- ==========================================

-- Enable necessary extensions (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CUSTOM TYPES
-- ==========================================

-- Create user_role enum (with conflict handling)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'CLIENT', 'STUDENT', 'INSTRUCTOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar TEXT,
  role user_role NOT NULL DEFAULT 'CLIENT',
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ,
  last_login_ip TEXT,
  preferences JSONB DEFAULT '{}',
  metadata JSONB,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  preferences JSONB DEFAULT '{}',
  notes TEXT,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  sms_consent BOOLEAN NOT NULL DEFAULT false,
  email_consent BOOLEAN NOT NULL DEFAULT false,
  is_vip BOOLEAN NOT NULL DEFAULT false,
  is_blacklisted BOOLEAN NOT NULL DEFAULT false,
  blacklist_reason TEXT,
  first_visit_date TIMESTAMPTZ,
  last_visit_date TIMESTAMPTZ,
  total_spent INTEGER NOT NULL DEFAULT 0,
  visit_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);

-- Students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_number TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  education_level TEXT,
  previous_experience TEXT,
  goals TEXT,
  specialties TEXT[],
  preferences JSONB DEFAULT '{}',
  notes TEXT,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  sms_consent BOOLEAN NOT NULL DEFAULT false,
  email_consent BOOLEAN NOT NULL DEFAULT false,
  enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  base_price INTEGER NOT NULL DEFAULT 0,
  duration_min INTEGER NOT NULL DEFAULT 60,
  category TEXT,
  subcategory TEXT,
  requirements TEXT[],
  contraindications TEXT[],
  aftercare TEXT[],
  tags TEXT[],
  display_order INTEGER NOT NULL DEFAULT 0,
  is_bookable BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  level TEXT,
  category TEXT,
  duration INTEGER, -- hours
  credits INTEGER DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 0,
  content JSONB,
  cover_image TEXT,
  tags TEXT[],
  passing_score INTEGER DEFAULT 70,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);

-- Modules table (course modules)
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  content JSONB,
  order_num INTEGER NOT NULL DEFAULT 0,
  duration INTEGER, -- minutes
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, slug)
);

-- Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB,
  type TEXT NOT NULL DEFAULT 'text', -- text, video, interactive, assignment
  order_num INTEGER NOT NULL DEFAULT 0,
  duration INTEGER, -- minutes
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(module_id, slug)
);

-- Assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'multiple_choice',
  questions JSONB,
  passing_score INTEGER DEFAULT 70,
  time_limit INTEGER, -- minutes
  max_attempts INTEGER DEFAULT 3,
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_num INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, suspended, cancelled
  progress INTEGER NOT NULL DEFAULT 0, -- percentage
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  certificate_issued_at TIMESTAMPTZ,
  certificate_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- Students indexes  
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_number ON public.students(student_number);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);

-- Modules indexes
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order ON public.modules(course_id, order_num);

-- Lessons indexes
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(module_id, order_num);

-- Enrollments indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);

-- ==========================================
-- TRIGGER FUNCTIONS
-- ==========================================

-- Drop existing functions and triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_email_confirmation();

-- Function to handle new user registration with robust error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role_value user_role;
    user_metadata jsonb;
    profile_data jsonb;
    generated_student_number TEXT;
BEGIN
    -- Log the trigger execution
    RAISE LOG 'handle_new_user triggered for user: %', NEW.id;
    
    -- Get user metadata
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    
    -- Extract role from metadata, default to CLIENT
    user_role_value := COALESCE(
        (user_metadata->>'role')::user_role,
        'CLIENT'::user_role
    );
    
    -- Log the role being used
    RAISE LOG 'Using role: % for user: %', user_role_value, NEW.id;
    
    -- Insert into public.users table
    BEGIN
        INSERT INTO public.users (
            id,
            email,
            role,
            first_name,
            last_name,
            email_verified,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            user_role_value,
            COALESCE(user_metadata->>'firstName', split_part(NEW.email, '@', 1)),
            COALESCE(user_metadata->>'lastName', ''),
            NEW.email_confirmed_at IS NOT NULL,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            email_verified = EXCLUDED.email_verified,
            updated_at = NOW();
        
        RAISE LOG 'Successfully inserted/updated user in public.users: %', NEW.id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error inserting into public.users: % - %', SQLERRM, SQLSTATE;
        -- Don't fail the entire trigger, just log the error
        RETURN NEW;
    END;
    
    -- Create role-specific profile
    IF user_role_value = 'CLIENT' THEN
        BEGIN
            -- Extract client-specific data
            profile_data := COALESCE(user_metadata->'profile', '{}'::jsonb);
            
            INSERT INTO public.clients (
                user_id,
                phone,
                date_of_birth,
                address,
                city,
                state,
                zip_code,
                emergency_contact_name,
                emergency_contact_phone,
                medical_history,
                allergies,
                current_medications,
                created_at,
                updated_at
            ) VALUES (
                NEW.id,
                profile_data->>'phone',
                CASE 
                    WHEN profile_data->>'dateOfBirth' IS NOT NULL 
                    THEN (profile_data->>'dateOfBirth')::date 
                    ELSE NULL 
                END,
                profile_data->>'address',
                profile_data->>'city',
                profile_data->>'state',
                profile_data->>'zipCode',
                profile_data->>'emergencyContactName',
                profile_data->>'emergencyContactPhone',
                COALESCE(profile_data->>'medicalHistory', ''),
                COALESCE(profile_data->>'allergies', ''),
                COALESCE(profile_data->>'currentMedications', ''),
                NOW(),
                NOW()
            ) ON CONFLICT (user_id) DO NOTHING;
            
            RAISE LOG 'Successfully created client profile for user: %', NEW.id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Error creating client profile: % - %', SQLERRM, SQLSTATE;
        END;
        
    ELSIF user_role_value = 'STUDENT' THEN
        BEGIN
            -- Generate unique student number
            generated_student_number := 'STU' || TO_CHAR(NOW(), 'YYYY') || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || LPAD((EXTRACT(EPOCH FROM NOW()) % 1000)::TEXT, 3, '0');
            
            -- Extract student-specific data
            profile_data := COALESCE(user_metadata->'profile', '{}'::jsonb);
            
            INSERT INTO public.students (
                user_id,
                student_number,
                phone,
                date_of_birth,
                address,
                city,
                state,
                zip_code,
                emergency_contact_name,
                emergency_contact_phone,
                education_level,
                previous_experience,
                goals,
                enrollment_date,
                created_at,
                updated_at
            ) VALUES (
                NEW.id,
                generated_student_number,
                profile_data->>'phone',
                CASE 
                    WHEN profile_data->>'dateOfBirth' IS NOT NULL 
                    THEN (profile_data->>'dateOfBirth')::date 
                    ELSE NULL 
                END,
                profile_data->>'address',
                profile_data->>'city',
                profile_data->>'state',
                profile_data->>'zipCode',
                profile_data->>'emergencyContactName',
                profile_data->>'emergencyContactPhone',
                COALESCE(profile_data->>'educationLevel', ''),
                COALESCE(profile_data->>'previousExperience', ''),
                COALESCE(profile_data->>'goals', ''),
                NOW(),
                NOW(),
                NOW()
            ) ON CONFLICT (user_id) DO NOTHING;
            
            RAISE LOG 'Successfully created student profile for user: %', NEW.id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Error creating student profile: % - %', SQLERRM, SQLSTATE;
        END;
    END IF;
    
    RAISE LOG 'handle_new_user completed successfully for user: %', NEW.id;
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Unexpected error in handle_new_user: % - %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Function to update user metadata when email is confirmed
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Update email_verified status when email is confirmed
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.users 
    SET email_verified = TRUE, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_email_confirmation();

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- HELPER FUNCTIONS FOR RLS
-- ==========================================

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_client();
DROP FUNCTION IF EXISTS public.is_student();

-- Get current user's role
CREATE FUNCTION public.get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'ADMIN'
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- USERS TABLE POLICIES
-- ==========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.is_admin());

-- Admins can delete users
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (public.is_admin());

-- ==========================================
-- CLIENTS TABLE POLICIES
-- ==========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Clients can view own profile" ON public.clients;
DROP POLICY IF EXISTS "Clients can update own profile" ON public.clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;

-- Clients can view their own profile
CREATE POLICY "Clients can view own profile" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

-- Clients can update their own profile
CREATE POLICY "Clients can update own profile" ON public.clients
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all clients
CREATE POLICY "Admins can view all clients" ON public.clients
  FOR SELECT USING (public.is_admin());

-- Admins can manage all clients
CREATE POLICY "Admins can manage all clients" ON public.clients
  FOR ALL USING (public.is_admin());

-- ==========================================
-- STUDENTS TABLE POLICIES
-- ==========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Students can view own profile" ON public.students;
DROP POLICY IF EXISTS "Students can update own profile" ON public.students;
DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
DROP POLICY IF EXISTS "Admins can manage all students" ON public.students;

-- Students can view their own profile
CREATE POLICY "Students can view own profile" ON public.students
  FOR SELECT USING (user_id = auth.uid());

-- Students can update their own profile
CREATE POLICY "Students can update own profile" ON public.students
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all students
CREATE POLICY "Admins can view all students" ON public.students
  FOR SELECT USING (public.is_admin());

-- Admins can manage all students
CREATE POLICY "Admins can manage all students" ON public.students
  FOR ALL USING (public.is_admin());

-- ==========================================
-- SERVICES TABLE POLICIES
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

-- Anyone can view active services
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

-- Admins can manage services
CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (public.is_admin());

-- ==========================================
-- COURSES TABLE POLICIES
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;

-- Anyone can view published courses
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true AND is_active = true);

-- Admins can manage courses
CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (public.is_admin());

-- ==========================================
-- MODULES TABLE POLICIES
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Students can view modules for enrolled courses" ON public.modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;

-- Students can view modules for enrolled courses
CREATE POLICY "Students can view modules for enrolled courses" ON public.modules
  FOR SELECT USING (
    course_id IN (
      SELECT e.course_id 
      FROM public.enrollments e 
      WHERE e.user_id = auth.uid()
    ) OR public.is_admin()
  );

-- Admins can manage modules
CREATE POLICY "Admins can manage modules" ON public.modules
  FOR ALL USING (public.is_admin());

-- ==========================================
-- LESSONS TABLE POLICIES
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Students can view lessons for enrolled courses" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;

-- Students can view lessons for enrolled courses
CREATE POLICY "Students can view lessons for enrolled courses" ON public.lessons
  FOR SELECT USING (
    module_id IN (
      SELECT m.id 
      FROM public.modules m
      JOIN public.enrollments e ON m.course_id = e.course_id
      WHERE e.user_id = auth.uid()
    ) OR public.is_admin()
  );

-- Admins can manage lessons
CREATE POLICY "Admins can manage lessons" ON public.lessons
  FOR ALL USING (public.is_admin());

-- ==========================================
-- ASSESSMENTS TABLE POLICIES
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Students can view assessments for enrolled courses" ON public.assessments;
DROP POLICY IF EXISTS "Admins can manage assessments" ON public.assessments;

-- Students can view assessments for enrolled courses
CREATE POLICY "Students can view assessments for enrolled courses" ON public.assessments
  FOR SELECT USING (
    (module_id IN (
      SELECT m.id 
      FROM public.modules m
      JOIN public.enrollments e ON m.course_id = e.course_id
      WHERE e.user_id = auth.uid()
    ) OR 
    course_id IN (
      SELECT e.course_id 
      FROM public.enrollments e 
      WHERE e.user_id = auth.uid()
    )) OR public.is_admin()
  );

-- Admins can manage assessments
CREATE POLICY "Admins can manage assessments" ON public.assessments
  FOR ALL USING (public.is_admin());

-- ==========================================
-- ENROLLMENTS TABLE POLICIES
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON public.enrollments;

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments" ON public.enrollments
  FOR SELECT USING (user_id = auth.uid());

-- Admins can manage enrollments
CREATE POLICY "Admins can manage enrollments" ON public.enrollments
  FOR ALL USING (public.is_admin());

-- ==========================================
-- STORAGE BUCKET SETUP
-- ==========================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('client-photos', 'client-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('course-materials', 'course-materials', false, 104857600, ARRAY['application/pdf', 'video/mp4', 'image/jpeg', 'image/png', 'application/zip']),
  ('certificates', 'certificates', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STORAGE POLICIES
-- ==========================================

-- Avatars bucket policies (public)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Client photos bucket policies (private)
DROP POLICY IF EXISTS "Clients can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload client photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage client photos" ON storage.objects;

CREATE POLICY "Clients can view their own photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'client-photos' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      public.is_admin()
    )
  );

CREATE POLICY "Admins can upload client photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'client-photos' AND 
    public.is_admin()
  );

CREATE POLICY "Admins can manage client photos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'client-photos' AND 
    public.is_admin()
  );

-- Documents bucket policies (private)
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all documents" ON storage.objects;

CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      public.is_admin()
    )
  );

CREATE POLICY "Admins can manage all documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents' AND 
    public.is_admin()
  );

-- Course materials bucket policies (protected)
DROP POLICY IF EXISTS "Students can view course materials for enrolled courses" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage course materials" ON storage.objects;

CREATE POLICY "Students can view course materials for enrolled courses" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'course-materials' AND
    (
      -- Students can access materials for courses they're enrolled in
      (storage.foldername(name))[1] IN (
        SELECT c.id::text 
        FROM public.courses c
        JOIN public.enrollments e ON c.id = e.course_id
        WHERE e.user_id = auth.uid()
      ) OR
      -- Admins can access all materials
      public.is_admin()
    )
  );

CREATE POLICY "Admins can manage course materials" ON storage.objects
  FOR ALL USING (
    bucket_id = 'course-materials' AND 
    public.is_admin()
  );

-- Certificates bucket policies (private)
DROP POLICY IF EXISTS "Users can view their own certificates" ON storage.objects;
DROP POLICY IF EXISTS "System can create certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all certificates" ON storage.objects;

CREATE POLICY "Users can view their own certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      public.is_admin()
    )
  );

CREATE POLICY "System can create certificates" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Admins can manage all certificates" ON storage.objects
  FOR ALL USING (
    bucket_id = 'certificates' AND 
    public.is_admin()
  );

-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.clients TO anon, authenticated;
GRANT ALL ON public.students TO anon, authenticated;
GRANT ALL ON public.services TO anon, authenticated;
GRANT ALL ON public.courses TO anon, authenticated;
GRANT ALL ON public.modules TO anon, authenticated;
GRANT ALL ON public.lessons TO anon, authenticated;
GRANT ALL ON public.assessments TO anon, authenticated;
GRANT ALL ON public.enrollments TO anon, authenticated;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Test the function exists
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

-- Test the trigger exists  
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Test the enum exists
SELECT typname FROM pg_type WHERE typname = 'user_role';

-- Show success message
SELECT 'Complete Supabase setup completed successfully!' as result,
       'Schema, triggers, RLS policies, and storage buckets are all configured.' as details;
