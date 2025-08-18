-- ==========================================
-- SUPABASE STORAGE BUCKET SETUP
-- Create storage buckets with proper access policies
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
CREATE POLICY "Clients can view their own photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'client-photos' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      auth.is_admin()
    )
  );

CREATE POLICY "Admins can upload client photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'client-photos' AND 
    auth.is_admin()
  );

CREATE POLICY "Admins can manage client photos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'client-photos' AND 
    auth.is_admin()
  );

-- Documents bucket policies (private)
CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      auth.is_admin()
    )
  );

CREATE POLICY "Admins can manage all documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents' AND 
    auth.is_admin()
  );

-- Course materials bucket policies (protected)
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
      auth.is_admin()
    )
  );

CREATE POLICY "Admins can manage course materials" ON storage.objects
  FOR ALL USING (
    bucket_id = 'course-materials' AND 
    auth.is_admin()
  );

-- Certificates bucket policies (private)
CREATE POLICY "Users can view their own certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      auth.is_admin()
    )
  );

CREATE POLICY "System can create certificates" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Admins can manage all certificates" ON storage.objects
  FOR ALL USING (
    bucket_id = 'certificates' AND 
    auth.is_admin()
  );
