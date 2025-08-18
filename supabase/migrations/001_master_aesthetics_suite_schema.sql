-- Master Aesthetics Suite - Complete Database Schema
-- Single-tenant architecture aligned with Master Build Manual
-- Safe to run multiple times with IF NOT EXISTS patterns

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
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

-- Business settings (single row table for single-tenant)
CREATE TABLE IF NOT EXISTS business_settings (
  id text PRIMARY KEY DEFAULT 'business_settings',
  business_name text NOT NULL,
  owner_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address jsonb DEFAULT '{}',
  timezone text NOT NULL DEFAULT 'Europe/London',
  branding jsonb DEFAULT '{}',
  policies jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  role user_role NOT NULL,
  profile jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  base_price integer NOT NULL, -- in pence
  duration_minutes integer NOT NULL,
  category service_category NOT NULL,
  buffer_minutes jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  personal_info jsonb NOT NULL DEFAULT '{}',
  preferences jsonb DEFAULT '{}',
  tags text[] DEFAULT ARRAY[]::text[],
  total_spent integer DEFAULT 0,
  last_visit timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  personal_info jsonb NOT NULL DEFAULT '{}',
  certifications jsonb[] DEFAULT ARRAY[]::jsonb[],
  progress jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Medical histories
CREATE TABLE IF NOT EXISTS medical_histories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id uuid REFERENCES clients ON DELETE CASCADE NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  risk_flags text[] DEFAULT ARRAY[]::text[],
  version integer NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id uuid REFERENCES clients ON DELETE CASCADE,
  student_id uuid REFERENCES students ON DELETE CASCADE,
  service_id uuid REFERENCES services ON DELETE RESTRICT NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status appointment_status DEFAULT 'pending_deposit',
  notes text,
  reminders_sent integer DEFAULT 0,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  
  CONSTRAINT appointment_has_recipient CHECK (
    (client_id IS NOT NULL AND student_id IS NULL) OR 
    (client_id IS NULL AND student_id IS NOT NULL)
  )
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price integer NOT NULL, -- in pence
  duration_hours integer NOT NULL,
  max_students integer,
  curriculum jsonb DEFAULT '{}',
  prerequisites jsonb DEFAULT '{}',
  certificate_template jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid REFERENCES students ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses ON DELETE CASCADE NOT NULL,
  status enrollment_status DEFAULT 'enrolled',
  progress jsonb DEFAULT '{}',
  completed_at timestamptz,
  certificate_issued boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  
  UNIQUE(student_id, course_id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id uuid REFERENCES appointments ON DELETE CASCADE,
  course_enrollment_id uuid REFERENCES course_enrollments ON DELETE CASCADE,
  stripe_payment_intent_id text,
  amount integer NOT NULL, -- in pence
  deposit_amount integer DEFAULT 0,
  currency text DEFAULT 'GBP',
  status payment_status DEFAULT 'pending',
  paid_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW(),
  
  CONSTRAINT payment_has_source CHECK (
    (appointment_id IS NOT NULL AND course_enrollment_id IS NULL) OR 
    (appointment_id IS NULL AND course_enrollment_id IS NOT NULL)
  )
);

-- Templates
CREATE TABLE IF NOT EXISTS templates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  type template_type NOT NULL,
  name text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  version text NOT NULL,
  is_active boolean DEFAULT true,
  mandatory_blocks text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  type document_type NOT NULL,
  client_id uuid REFERENCES clients ON DELETE CASCADE,
  student_id uuid REFERENCES students ON DELETE CASCADE,
  template_id uuid REFERENCES templates ON DELETE RESTRICT NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  pdf_url text,
  status document_status DEFAULT 'draft',
  signed_at timestamptz,
  expires_at timestamptz,
  hash text,
  created_at timestamptz DEFAULT NOW(),
  
  CONSTRAINT document_has_recipient CHECK (
    (client_id IS NOT NULL AND student_id IS NULL) OR 
    (client_id IS NULL AND student_id IS NOT NULL)
  )
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  type campaign_type NOT NULL,
  audience_filter jsonb DEFAULT '{}',
  content jsonb DEFAULT '{}',
  scheduled_for timestamptz,
  sent_at timestamptz,
  status campaign_status DEFAULT 'draft',
  stats jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id uuid REFERENCES campaigns ON DELETE CASCADE,
  recipient_id uuid NOT NULL,
  recipient_type recipient_type NOT NULL,
  channel message_channel NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  status message_status DEFAULT 'pending',
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  action text NOT NULL,
  resource text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT NOW()
);

-- File uploads
CREATE TABLE IF NOT EXISTS file_uploads (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  filename text NOT NULL,
  original_name text NOT NULL,
  mimetype text NOT NULL,
  size integer NOT NULL,
  storage_path text NOT NULL, -- Supabase Storage path
  uploaded_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_student_id ON appointments(student_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_enrollment_id ON payments(course_enrollment_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON documents(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_clients_personal_info ON clients USING gin(personal_info);
CREATE INDEX IF NOT EXISTS idx_services_settings ON services USING gin(settings);
CREATE INDEX IF NOT EXISTS idx_templates_content ON templates USING gin(content);

-- Updated at triggers function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_business_settings_updated_at ON business_settings;
    CREATE TRIGGER update_business_settings_updated_at 
      BEFORE UPDATE ON business_settings
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
    CREATE TRIGGER update_user_profiles_updated_at 
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_services_updated_at ON services;
    CREATE TRIGGER update_services_updated_at 
      BEFORE UPDATE ON services
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
    CREATE TRIGGER update_clients_updated_at 
      BEFORE UPDATE ON clients
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_students_updated_at ON students;
    CREATE TRIGGER update_students_updated_at 
      BEFORE UPDATE ON students
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
    CREATE TRIGGER update_appointments_updated_at 
      BEFORE UPDATE ON appointments
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
    CREATE TRIGGER update_courses_updated_at 
      BEFORE UPDATE ON courses
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON course_enrollments;
    CREATE TRIGGER update_course_enrollments_updated_at 
      BEFORE UPDATE ON course_enrollments
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
    CREATE TRIGGER update_templates_updated_at 
      BEFORE UPDATE ON templates
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- Verification query to confirm setup
SELECT 
    'business_settings' as table_name, COUNT(*) as row_count 
FROM business_settings
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL  
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'templates', COUNT(*) FROM templates
ORDER BY table_name;

-- Success message
SELECT 'Master Aesthetics Suite database schema deployed successfully!' AS status;
