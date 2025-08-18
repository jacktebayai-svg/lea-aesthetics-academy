-- Master Aesthetics Suite - Row Level Security Policies
-- Single-tenant architecture with role-based access control

-- Enable RLS on all tables
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val 
  FROM user_profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role_val, 'client'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is owner
CREATE OR REPLACE FUNCTION is_owner()
RETURNS boolean AS $$
BEGIN
  RETURN get_user_role() = 'owner';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Business Settings Policies (owner only)
DROP POLICY IF EXISTS "Owner can manage business settings" ON business_settings;
CREATE POLICY "Owner can manage business settings" ON business_settings
  FOR ALL USING (is_owner());

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Owner can manage all profiles" ON user_profiles;
CREATE POLICY "Owner can manage all profiles" ON user_profiles
  FOR ALL USING (is_owner());

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Services Policies
DROP POLICY IF EXISTS "Anyone can view active services" ON services;
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Owner can manage services" ON services;
CREATE POLICY "Owner can manage services" ON services
  FOR ALL USING (is_owner());

-- Clients Policies
DROP POLICY IF EXISTS "Clients can view own data" ON clients;
CREATE POLICY "Clients can view own data" ON clients
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Clients can update own data" ON clients;
CREATE POLICY "Clients can update own data" ON clients
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owner can manage all clients" ON clients;
CREATE POLICY "Owner can manage all clients" ON clients
  FOR ALL USING (is_owner());

DROP POLICY IF EXISTS "Users can create client profile" ON clients;
CREATE POLICY "Users can create client profile" ON clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Students Policies
DROP POLICY IF EXISTS "Students can view own data" ON students;
CREATE POLICY "Students can view own data" ON students
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Students can update own data" ON students;
CREATE POLICY "Students can update own data" ON students
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owner can manage all students" ON students;
CREATE POLICY "Owner can manage all students" ON students
  FOR ALL USING (is_owner());

DROP POLICY IF EXISTS "Users can create student profile" ON students;
CREATE POLICY "Users can create student profile" ON students
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Medical Histories Policies
DROP POLICY IF EXISTS "Clients can view own medical history" ON medical_histories;
CREATE POLICY "Clients can view own medical history" ON medical_histories
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owner can manage all medical histories" ON medical_histories;
CREATE POLICY "Owner can manage all medical histories" ON medical_histories
  FOR ALL USING (is_owner());

-- Appointments Policies
DROP POLICY IF EXISTS "Clients can view own appointments" ON appointments;
CREATE POLICY "Clients can view own appointments" ON appointments
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can view own appointments" ON appointments;
CREATE POLICY "Students can view own appointments" ON appointments
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Clients can create own appointments" ON appointments;
CREATE POLICY "Clients can create own appointments" ON appointments
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can create own appointments" ON appointments;
CREATE POLICY "Students can create own appointments" ON appointments
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owner can manage all appointments" ON appointments;
CREATE POLICY "Owner can manage all appointments" ON appointments
  FOR ALL USING (is_owner());

-- Courses Policies
DROP POLICY IF EXISTS "Anyone can view active courses" ON courses;
CREATE POLICY "Anyone can view active courses" ON courses
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Owner can manage courses" ON courses;
CREATE POLICY "Owner can manage courses" ON courses
  FOR ALL USING (is_owner());

-- Course Enrollments Policies
DROP POLICY IF EXISTS "Students can view own enrollments" ON course_enrollments;
CREATE POLICY "Students can view own enrollments" ON course_enrollments
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can enroll themselves" ON course_enrollments;
CREATE POLICY "Students can enroll themselves" ON course_enrollments
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can update own enrollments" ON course_enrollments;
CREATE POLICY "Students can update own enrollments" ON course_enrollments
  FOR UPDATE USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owner can manage all enrollments" ON course_enrollments;
CREATE POLICY "Owner can manage all enrollments" ON course_enrollments
  FOR ALL USING (is_owner());

-- Payments Policies
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    (appointment_id IN (
      SELECT a.id FROM appointments a
      JOIN clients c ON a.client_id = c.id
      WHERE c.user_id = auth.uid()
    )) OR
    (appointment_id IN (
      SELECT a.id FROM appointments a
      JOIN students s ON a.student_id = s.id
      WHERE s.user_id = auth.uid()
    )) OR
    (course_enrollment_id IN (
      SELECT ce.id FROM course_enrollments ce
      JOIN students s ON ce.student_id = s.id
      WHERE s.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Owner can manage all payments" ON payments;
CREATE POLICY "Owner can manage all payments" ON payments
  FOR ALL USING (is_owner());

-- Templates Policies
DROP POLICY IF EXISTS "Owner can manage templates" ON templates;
CREATE POLICY "Owner can manage templates" ON templates
  FOR ALL USING (is_owner());

-- Documents Policies
DROP POLICY IF EXISTS "Clients can view own documents" ON documents;
CREATE POLICY "Clients can view own documents" ON documents
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can view own documents" ON documents;
CREATE POLICY "Students can view own documents" ON documents
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can sign own documents" ON documents;
CREATE POLICY "Users can sign own documents" ON documents
  FOR UPDATE USING (
    (client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )) OR
    (student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Owner can manage all documents" ON documents;
CREATE POLICY "Owner can manage all documents" ON documents
  FOR ALL USING (is_owner());

-- Campaigns Policies (owner only)
DROP POLICY IF EXISTS "Owner can manage campaigns" ON campaigns;
CREATE POLICY "Owner can manage campaigns" ON campaigns
  FOR ALL USING (is_owner());

-- Messages Policies
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    (recipient_type = 'client' AND recipient_id::uuid IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )) OR
    (recipient_type = 'student' AND recipient_id::uuid IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Owner can manage all messages" ON messages;
CREATE POLICY "Owner can manage all messages" ON messages
  FOR ALL USING (is_owner());

-- Audit Logs Policies (owner only)
DROP POLICY IF EXISTS "Owner can view audit logs" ON audit_logs;
CREATE POLICY "Owner can view audit logs" ON audit_logs
  FOR SELECT USING (is_owner());

-- File Uploads Policies
DROP POLICY IF EXISTS "Users can view own uploads" ON file_uploads;
CREATE POLICY "Users can view own uploads" ON file_uploads
  FOR SELECT USING (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Users can upload files" ON file_uploads;
CREATE POLICY "Users can upload files" ON file_uploads
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Owner can manage all files" ON file_uploads;
CREATE POLICY "Owner can manage all files" ON file_uploads
  FOR ALL USING (is_owner());

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role, profile)
  VALUES (
    NEW.id,
    NEW.email,
    'client', -- Default role, can be changed by owner
    json_build_object(
      'first_name', COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      'last_name', COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      'phone', COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Success message
SELECT 'Master Aesthetics Suite RLS policies deployed successfully!' AS status;
