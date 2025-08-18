-- Master Aesthetics Suite - Storage Setup
-- Supabase Storage buckets and policies

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('course-materials', 'course-materials', false, 524288000, ARRAY['video/mp4', 'application/pdf', 'image/jpeg', 'image/png']),
  ('before-after', 'before-after', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('certificates', 'certificates', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Avatar bucket policies (public read, authenticated upload)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
CREATE POLICY "Anyone can upload an avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Documents bucket policies (private)
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'owner')
    )
  );

DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Owner can manage all documents" ON storage.objects;
CREATE POLICY "Owner can manage all documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Course materials bucket policies (private)
DROP POLICY IF EXISTS "Students can view enrolled course materials" ON storage.objects;
CREATE POLICY "Students can view enrolled course materials" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'course-materials' AND (
      EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'owner') OR
      EXISTS (
        SELECT 1 FROM course_enrollments ce
        JOIN students s ON ce.student_id = s.id
        JOIN courses c ON ce.course_id = c.id
        WHERE s.user_id = auth.uid() 
        AND c.slug = (storage.foldername(name))[1]
        AND ce.status IN ('enrolled', 'in_progress', 'completed')
      )
    )
  );

DROP POLICY IF EXISTS "Owner can manage course materials" ON storage.objects;
CREATE POLICY "Owner can manage course materials" ON storage.objects
  FOR ALL USING (
    bucket_id = 'course-materials' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Before/After photos bucket policies (private)
DROP POLICY IF EXISTS "Clients can view own before/after photos" ON storage.objects;
CREATE POLICY "Clients can view own before/after photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'before-after' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'owner')
    )
  );

DROP POLICY IF EXISTS "Owner can manage before/after photos" ON storage.objects;
CREATE POLICY "Owner can manage before/after photos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'before-after' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Certificates bucket policies
DROP POLICY IF EXISTS "Users can view own certificates" ON storage.objects;
CREATE POLICY "Users can view own certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'owner')
    )
  );

DROP POLICY IF EXISTS "Owner can manage certificates" ON storage.objects;
CREATE POLICY "Owner can manage certificates" ON storage.objects
  FOR ALL USING (
    bucket_id = 'certificates' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Update file_uploads table to track storage paths
ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS bucket_id text;
ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS storage_object_id uuid;

-- Create index on storage path
CREATE INDEX IF NOT EXISTS idx_file_uploads_storage_path ON file_uploads(storage_path);
CREATE INDEX IF NOT EXISTS idx_file_uploads_bucket ON file_uploads(bucket_id);

-- Success message
SELECT 'Master Aesthetics Suite storage setup completed successfully!' AS status;
