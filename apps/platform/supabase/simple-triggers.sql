-- ==========================================
-- SIMPLE TRIGGER FUNCTIONS - NO CONFLICTS
-- Works with TEXT role field, no custom types
-- ==========================================

-- Drop ALL existing functions and triggers to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_email_confirmation();

-- Function to handle new user registration
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  generated_student_number TEXT;
BEGIN
  -- Get the role from user metadata (set during registration)
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role', 
    'CLIENT'
  );

  -- Ensure role is valid
  IF user_role NOT IN ('ADMIN', 'CLIENT', 'STUDENT') THEN
    user_role := 'CLIENT';
  END IF;

  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    phone,
    role,
    email_verified,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    user_role,
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();

  -- Create role-specific profile
  IF user_role = 'CLIENT' THEN
    INSERT INTO public.clients (
      id,
      user_id,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      emergency_contact,
      preferences,
      created_at,
      updated_at
    ) VALUES (
      uuid_generate_v4(),
      NEW.id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      CASE 
        WHEN NEW.raw_user_meta_data->'clientData'->>'dateOfBirth' IS NOT NULL 
        THEN (NEW.raw_user_meta_data->'clientData'->>'dateOfBirth')::date
        ELSE NULL
      END,
      CASE 
        WHEN NEW.raw_user_meta_data->'clientData'->'emergencyContact' IS NOT NULL 
        THEN NEW.raw_user_meta_data->'clientData'->'emergencyContact'
        ELSE NULL
      END,
      COALESCE(NEW.raw_user_meta_data->'clientData'->'preferences', '{}'),
      NOW(),
      NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

  ELSIF user_role = 'STUDENT' THEN
    -- Generate unique student number
    generated_student_number := 'STU' || TO_CHAR(NOW(), 'YYYY') || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || LPAD((EXTRACT(EPOCH FROM NOW()) % 1000)::TEXT, 3, '0');
    
    INSERT INTO public.students (
      id,
      user_id,
      student_number,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      emergency_contact,
      qualifications,
      goals,
      preferences,
      enrollment_date,
      created_at,
      updated_at
    ) VALUES (
      uuid_generate_v4(),
      NEW.id,
      generated_student_number,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      CASE 
        WHEN NEW.raw_user_meta_data->'studentData'->>'dateOfBirth' IS NOT NULL 
        THEN (NEW.raw_user_meta_data->'studentData'->>'dateOfBirth')::date
        ELSE NULL
      END,
      CASE 
        WHEN NEW.raw_user_meta_data->'studentData'->'emergencyContact' IS NOT NULL 
        THEN NEW.raw_user_meta_data->'studentData'->'emergencyContact'
        ELSE NULL
      END,
      NEW.raw_user_meta_data->'studentData'->'qualifications',
      NEW.raw_user_meta_data->'studentData'->>'goals',
      COALESCE(NEW.raw_user_meta_data->'studentData'->'preferences', '{}'),
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user metadata when email is confirmed
CREATE FUNCTION public.handle_email_confirmation()
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
