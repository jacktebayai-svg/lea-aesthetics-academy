# Supabase Setup for LEA Aesthetics Academy

This directory contains the complete database setup for the LEA Aesthetics Academy platform using Supabase.

## Files

- **`complete-setup.sql`** - The main SQL script that sets up everything you need
- **`README.md`** - This file with setup instructions

## How to Use

### 1. Run the Complete Setup

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Go to **SQL Editor**
4. Copy the entire content of `complete-setup.sql`
5. Paste it into the SQL editor and run it

### 2. What This Script Does

The complete setup script will:

✅ **Create all necessary tables:**
- `users` (extends Supabase auth.users)
- `clients` (client profiles)
- `students` (student profiles) 
- `services` (aesthetic services)
- `courses` (educational courses)
- `modules` (course modules)
- `lessons` (individual lessons)
- `assessments` (quizzes/tests)
- `enrollments` (student course enrollments)

✅ **Set up database triggers:**
- Automatic user profile creation when users sign up
- Email confirmation handling
- Robust error handling and logging

✅ **Configure Row Level Security (RLS):**
- Users can only access their own data
- Admins can access all data
- Students can only access courses they're enrolled in
- Proper security policies for all tables

✅ **Create storage buckets:**
- `avatars` (public) - User profile pictures
- `client-photos` (private) - Client treatment photos
- `documents` (private) - User documents
- `course-materials` (protected) - Course content
- `certificates` (private) - Achievement certificates

✅ **Set up storage policies:**
- Secure file access based on user roles
- Students can only access materials for enrolled courses
- Users can only access their own files

### 3. After Running the Script

The script will show verification messages at the end to confirm everything was created successfully.

### 4. Test Your Setup

After running the setup script, you can test it using:

```bash
cd /home/yelovelo/Desktop/lea-aesthetics-academy/apps/platform
node scripts/test-supabase-after-fix.js
```

This will verify that:
- The trigger function exists
- User registration works correctly
- Profile creation works for both clients and students

### 5. Start Your Application

Once the setup is complete, you can start your Next.js application:

```bash
npm run dev
```

Then test registration at: `http://localhost:3001/register`

## Important Notes

- **Safe to run multiple times** - The script includes proper conflict handling
- **No data loss** - Uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING` patterns
- **Comprehensive logging** - All trigger actions are logged for debugging
- **Error resilient** - Trigger errors won't fail user registration

## Troubleshooting

If you encounter any issues:

1. Check the Supabase Dashboard logs for any error messages
2. Verify your environment variables are set correctly in `.env.local`
3. Run the test script to verify everything is working
4. Check the browser console for any client-side errors

## Database Schema

The database follows a clean architecture with:

- **Single source of truth** - `auth.users` for authentication
- **Extended profiles** - `public.users` with additional fields
- **Role-based access** - CLIENT, STUDENT, ADMIN, INSTRUCTOR roles
- **Multi-entity support** - Separate tables for clients and students
- **Educational features** - Full course/module/lesson structure
- **File storage** - Organized bucket structure for different content types
