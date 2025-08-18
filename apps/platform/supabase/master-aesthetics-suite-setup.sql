-- ==========================================
-- MASTER AESTHETICS SUITE - COMPLETE SUPABASE SETUP
-- Single-tenant database schema aligned with Master Aesthetics Suite specification
-- Safe to run multiple times - includes proper conflict handling
-- ==========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ==========================================
-- CUSTOM TYPES
-- ==========================================

-- Create enums with conflict handling
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'client', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_category AS ENUM ('treatment', 'consultation', 'course', 'workshop');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pending_deposit', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'partial_refund');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enrollment_status AS ENUM ('enrolled', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE template_type AS ENUM ('consent', 'aftercare', 'policy', 'certificate', 'email');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('consent', 'aftercare_guide', 'policy_agreement', 'certificate');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('draft', 'sent', 'signed', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_type AS ENUM ('email', 'sms', 'automated_sequence');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sent', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE recipient_type AS ENUM ('client', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_channel AS ENUM ('email', 'sms');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_status AS ENUM ('pending', 'sent', 'delivered', 'opened', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- CORE TABLES
-- ==========================================

-- Business settings (single row table)
CREATE TABLE IF NOT EXISTS public.business_settings (
  id TEXT PRIMARY KEY DEFAULT 'business_settings',
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address JSONB DEFAULT '{}',
  timezone TEXT NOT NULL DEFAULT 'Europe/London',
  branding JSONB DEFAULT '{}',
  policies JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role NOT NULL,
  profile JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  base_price INTEGER NOT NULL, -- in pence
  duration_minutes INTEGER NOT NULL,
  category service_category NOT NULL,
  buffer_minutes JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  personal_info JSONB NOT NULL DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_spent INTEGER DEFAULT 0,
  last_visit TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  personal_info JSONB NOT NULL DEFAULT '{}',
  certifications JSONB[] DEFAULT ARRAY[]::JSONB[],
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical histories
CREATE TABLE IF NOT EXISTS public.medical_histories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.clients ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  risk_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  version INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.clients ON DELETE CASCADE,
  student_id UUID REFERENCES public.students ON DELETE CASCADE,
  service_id UUID REFERENCES public.services ON DELETE RESTRICT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status appointment_status DEFAULT 'pending_deposit',
  notes TEXT,
  reminders_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT appointment_has_recipient CHECK (
    (client_id IS NOT NULL AND student_id IS NULL) OR 
    (client_id IS NULL AND student_id IS NOT NULL)
  )
);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in pence
  duration_hours INTEGER NOT NULL,
  max_students INTEGER,
  curriculum JSONB DEFAULT '{}',
  prerequisites JSONB DEFAULT '{}',
  certificate_template JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses ON DELETE CASCADE NOT NULL,
  status enrollment_status DEFAULT 'enrolled',
  progress JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  certificate_issued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, course_id)
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments ON DELETE CASCADE,
  course_enrollment_id UUID REFERENCES public.course_enrollments ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- in pence
  deposit_amount INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'GBP',
  status payment_status DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT payment_has_source CHECK (
    (appointment_id IS NOT NULL AND course_enrollment_id IS NULL) OR 
    (appointment_id IS NULL AND course_enrollment_id IS NOT NULL)
  )
);

-- Templates
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type template_type NOT NULL,
  name TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  version TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  mandatory_blocks TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type document_type NOT NULL,
  client_id UUID REFERENCES public.clients ON DELETE CASCADE,
  student_id UUID REFERENCES public.students ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates ON DELETE RESTRICT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  pdf_url TEXT,
  status document_status DEFAULT 'draft',
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT document_has_recipient CHECK (
    (client_id IS NOT NULL AND student_id IS NULL) OR 
    (client_id IS NULL AND student_id IS NOT NULL)
  )
);

-- Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type campaign_type NOT NULL,
  audience_filter JSONB DEFAULT '{}',
  content JSONB DEFAULT '{}',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status campaign_status DEFAULT 'draft',
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns ON DELETE CASCADE,
  recipient_id UUID NOT NULL,
  recipient_type recipient_type NOT NULL,
  channel message_channel NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  status message_status DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- File uploads
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mimetype TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage_path TEXT NOT NULL, -- Supabase Storage path
  uploaded_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_student_id ON public.appointments(student_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_enrollment_id ON public.payments(course_enrollment_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON public.documents(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_clients_personal_info ON public.clients USING GIN(personal_info);
CREATE INDEX IF NOT EXISTS idx_services_settings ON public.services USING GIN(settings);
CREATE INDEX IF NOT EXISTS idx_templates_content ON public.templates USING GIN(content);

-- ==========================================
-- TRIGGER FUNCTIONS
-- ==========================================

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply update triggers to tables that have updated_at
CREATE TRIGGER IF NOT EXISTS update_business_settings_updated_at 
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_services_updated_at 
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_clients_updated_at 
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_students_updated_at 
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_appointments_updated_at 
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_courses_updated_at 
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_course_enrollments_updated_at 
  BEFORE UPDATE ON public.course_enrollments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_templates_updated_at 
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- USER MANAGEMENT TRIGGERS
-- ==========================================

-- Function to handle new user registration with robust error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role_value user_role;
    user_metadata JSONB;
    profile_data JSONB;
BEGIN
    -- Log the trigger execution
    RAISE LOG 'handle_new_user triggered for user: %', NEW.id;
    
    -- Get user metadata
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    
    -- Extract role from metadata, default to CLIENT
    user_role_value := COALESCE(
        (user_metadata->>'role')::user_role,
        'client'::user_role
    );
    
    -- Insert into public.user_profiles table
    INSERT INTO public.user_profiles (
        id,
        email,
        role,
        profile,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        user_role_value,
        COALESCE(user_metadata->'profile', '{}'),
        TRUE,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        profile = EXCLUDED.profile,
        updated_at = NOW();
    
    -- Create role-specific profile
    IF user_role_value = 'client' THEN
        profile_data := COALESCE(user_metadata->'profile', '{}'::jsonb);
        
        INSERT INTO public.clients (
            user_id,
            personal_info,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            jsonb_build_object(
                'firstName', user_metadata->>'firstName',
                'lastName', user_metadata->>'lastName',
                'phone', user_metadata->>'phone'
            ) || COALESCE(profile_data, '{}'),
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO NOTHING;
        
    ELSIF user_role_value = 'student' THEN
        profile_data := COALESCE(user_metadata->'profile', '{}'::jsonb);
        
        INSERT INTO public.students (
            user_id,
            personal_info,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            jsonb_build_object(
                'firstName', user_metadata->>'firstName',
                'lastName', user_metadata->>'lastName',
                'phone', user_metadata->>'phone'
            ) || COALESCE(profile_data, '{}'),
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: % - %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'owner'
    FROM public.user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Owner can view all profiles" ON public.user_profiles
  FOR ALL USING (public.is_owner());

-- RLS for clients
CREATE POLICY "Clients can view own data" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owner can view all clients" ON public.clients
  FOR ALL USING (public.is_owner());

-- RLS for students
CREATE POLICY "Students can view own data" ON public.students
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owner can view all students" ON public.students
  FOR ALL USING (public.is_owner());

-- RLS for services (public read, owner manage)
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Owner can manage services" ON public.services
  FOR ALL USING (public.is_owner());

-- RLS for appointments
CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (
    (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())) OR
    (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()))
  );

CREATE POLICY "Owner can manage all appointments" ON public.appointments
  FOR ALL USING (public.is_owner());

-- RLS for courses (public read, owner manage)
CREATE POLICY "Anyone can view active courses" ON public.courses
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Owner can manage courses" ON public.courses
  FOR ALL USING (public.is_owner());

-- RLS for enrollments
CREATE POLICY "Students can view own enrollments" ON public.course_enrollments
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

CREATE POLICY "Owner can manage all enrollments" ON public.course_enrollments
  FOR ALL USING (public.is_owner());

-- RLS for payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    (appointment_id IN (
      SELECT a.id FROM public.appointments a
      JOIN public.clients c ON a.client_id = c.id
      WHERE c.user_id = auth.uid()
    )) OR
    (course_enrollment_id IN (
      SELECT e.id FROM public.course_enrollments e
      JOIN public.students s ON e.student_id = s.id
      WHERE s.user_id = auth.uid()
    ))
  );

CREATE POLICY "Owner can manage all payments" ON public.payments
  FOR ALL USING (public.is_owner());

-- RLS for business settings (owner only)
CREATE POLICY "Owner can manage business settings" ON public.business_settings
  FOR ALL USING (public.is_owner());

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================

-- Create storage buckets (safe - ON CONFLICT DO NOTHING)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('client-photos', 'client-photos', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', FALSE, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('course-materials', 'course-materials', FALSE, 104857600, ARRAY['application/pdf', 'video/mp4', 'image/jpeg', 'image/png', 'application/zip']),
  ('certificates', 'certificates', FALSE, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ==========================================
-- INITIAL DATA SETUP
-- ==========================================

-- Insert default business settings
INSERT INTO public.business_settings (id, business_name, owner_name, email)
VALUES ('business_settings', 'LEA Aesthetics Academy', 'Business Owner', 'contact@leaaesthetics.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample services
INSERT INTO public.services (name, slug, description, base_price, duration_minutes, category, settings)
VALUES 
  ('Botox Consultation', 'botox-consultation', 'Professional consultation for botox treatments', 5000, 30, 'consultation', '{"requiresConsultation": false}'),
  ('Dermal Filler Treatment', 'dermal-filler', 'Premium dermal filler application', 35000, 60, 'treatment', '{"requiresConsultation": true}'),
  ('Skin Assessment', 'skin-assessment', 'Comprehensive skin analysis and treatment planning', 7500, 45, 'consultation', '{}'),
  ('Level 2 Anatomy Course', 'level-2-anatomy', 'Foundation anatomy course for aesthetics practitioners', 50000, 480, 'course', '{}'),
  ('Level 3 Injectable Training', 'level-3-injectable', 'Advanced injectable techniques training', 150000, 960, 'course', '{"prerequisites": ["level-2-anatomy"]}')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample courses
INSERT INTO public.courses (title, slug, description, price, duration_hours, curriculum)
VALUES 
  ('Level 2 Anatomy & Physiology', 'level-2-anatomy-physiology', 'Foundation course covering human anatomy and physiology for aesthetic practitioners', 50000, 40, '{"modules": ["Basic Anatomy", "Facial Anatomy", "Skin Physiology", "Safety Protocols"]}'),
  ('Level 3 Injectable Treatments', 'level-3-injectable-treatments', 'Advanced training in botox and dermal filler techniques', 150000, 60, '{"modules": ["Product Knowledge", "Injection Techniques", "Complication Management", "Patient Assessment"]}'),
  ('Level 4 Advanced Aesthetics', 'level-4-advanced-aesthetics', 'Master level training for experienced practitioners', 250000, 80, '{"modules": ["Advanced Techniques", "Business Development", "Mentorship Skills", "Research Methods"]}')
ON CONFLICT (slug) DO NOTHING;

-- Insert default templates
INSERT INTO public.templates (type, name, content, version, mandatory_blocks)
VALUES 
  ('consent', 'Standard Treatment Consent', '{"title": "Treatment Consent Form", "sections": ["patient_info", "treatment_details", "risks_benefits", "signature"]}', '1.0', ARRAY['patient_info', 'treatment_details', 'signature']),
  ('aftercare', 'Post-Treatment Care', '{"title": "Aftercare Instructions", "sections": ["immediate_care", "24_hour_care", "follow_up", "emergency_contact"]}', '1.0', ARRAY['immediate_care', 'emergency_contact']),
  ('certificate', 'Course Completion Certificate', '{"title": "Certificate of Completion", "sections": ["student_info", "course_details", "completion_date", "signature"]}', '1.0', ARRAY['student_info', 'course_details', 'completion_date'])
ON CONFLICT DO NOTHING;

-- ==========================================
-- PERMISSIONS
-- ==========================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Verify setup completed successfully
SELECT 
  'Master Aesthetics Suite Supabase setup completed!' as result,
  'All tables, triggers, policies, and initial data configured.' as details,
  NOW() as setup_time;

-- Show table counts for verification
SELECT 
  'user_profiles' as table_name, COUNT(*) as row_count FROM public.user_profiles
UNION ALL
SELECT 'services', COUNT(*) FROM public.services
UNION ALL  
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'templates', COUNT(*) FROM public.templates
UNION ALL
SELECT 'business_settings', COUNT(*) FROM public.business_settings;
