-- Create admin user for Lea
-- Run this in Supabase SQL Editor or via psql

-- Insert auth user (this normally would be done via Supabase Auth, but for dev we can insert directly)
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  encrypted_password,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'Leaaesthetics@mail.com',
  now(),
  crypt('Passwrod123', gen_salt('bf')),
  now(),
  now(),
  '{"first_name": "Lea", "last_name": "Administrator", "role": "admin"}'
) ON CONFLICT (email) DO NOTHING;

-- Create user profile (this is what the app will use)
INSERT INTO user_profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  email_verified,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'Leaaesthetics@mail.com'),
  'Leaaesthetics@mail.com',
  'Lea',
  'Administrator', 
  'owner',
  true,
  true,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  role = 'owner',
  is_active = true,
  email_verified = true,
  updated_at = now();

-- Verify the user was created
SELECT 
  up.email,
  up.first_name,
  up.last_name,
  up.role,
  up.is_active,
  up.email_verified
FROM user_profiles up
WHERE up.email = 'Leaaesthetics@mail.com';
