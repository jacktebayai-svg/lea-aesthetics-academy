# 🚀 Supabase Setup Guide - COMPLETE

## Prerequisites
- Supabase project created
- Environment variables configured
- All dependencies installed

## Step 1: Run Database Schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/fljkbvzytsjkwlywbeyg
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run** to create all tables and functions

## Step 2: Set Up Row Level Security

1. In the SQL Editor, create a new query
2. Copy and paste the contents of `supabase/rls_policies.sql`
3. Click **Run** to enable RLS and create all security policies

## Step 2.5: Set Up Database Triggers

1. In the SQL Editor, create a new query
2. Copy and paste the contents of `supabase/trigger-functions.sql`
3. Click **Run** to create user registration triggers

## Step 3: Configure Authentication

1. Go to **Authentication** > **Settings**
2. Under **Site URL**, add: `http://localhost:3000` (for development)
3. Under **Redirect URLs**, add: 
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/reset-password`
4. Enable **Email confirmations** if you want email verification

## Step 4: Set Up Storage (Optional)

1. Go to **Storage**
2. Create these buckets:
   - `avatars` (public)
   - `client-photos` (private)
   - `documents` (private)
   - `course-materials` (private)
   - `certificates` (private)

## Step 5: Test the Setup

1. Run the development server:
   ```bash
   cd apps/platform
   pnpm dev
   ```

2. Go to http://localhost:3000
3. Try registering a new user
4. Check that the user profile is created automatically

## Environment Variables Already Set ✅

Your `.env.local` file is already configured with:
- ✅ Supabase URL: `https://fljkbvzytsjkwlywbeyg.supabase.co`
- ✅ Anon Key: Configured
- ✅ Service Role Key: Configured

## Next Steps

Once Supabase is set up, you can:

1. **Test Authentication**:
   - Register as a CLIENT or STUDENT
   - Login and check role-based redirects

2. **Create Admin User**:
   - Register normally, then update role in Supabase dashboard
   - Go to **Table Editor** > **users** > find your user > change role to 'ADMIN'

3. **Add Sample Data**:
   - Create some services in the `services` table
   - Add business profile information
   - Test the booking system

## Troubleshooting

- If authentication fails, check the browser console for errors
- Verify environment variables are correctly set
- Check Supabase logs in the dashboard
- Ensure RLS policies are applied correctly

Your luxury aesthetics platform is ready to launch! 🎨✨
