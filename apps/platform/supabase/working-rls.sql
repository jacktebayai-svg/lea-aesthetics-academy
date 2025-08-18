-- ==========================================
-- ROW LEVEL SECURITY POLICIES - SIMPLIFIED
-- Safe to run multiple times
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Get current user's role
CREATE OR REPLACE FUNCTION auth.get_user_role()
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
CREATE OR REPLACE FUNCTION auth.is_admin()
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
  FOR SELECT USING (auth.is_admin());

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (auth.is_admin());

-- Admins can delete users
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (auth.is_admin());

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
  FOR SELECT USING (auth.is_admin());

-- Admins can manage all clients
CREATE POLICY "Admins can manage all clients" ON public.clients
  FOR ALL USING (auth.is_admin());

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
  FOR SELECT USING (auth.is_admin());

-- Admins can manage all students
CREATE POLICY "Admins can manage all students" ON public.students
  FOR ALL USING (auth.is_admin());
