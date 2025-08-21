# Master Aesthetics Suite - Supabase Setup Instructions

## 🚀 Critical: Complete Database Setup Required

Your Supabase database is **not set up yet** - this is why authentication and API routes are failing.

## Step 1: Deploy Database Schema

1. **Go to your Supabase Dashboard**:
   ```
   https://supabase.com/dashboard/project/fljkbvzytsjkwlywbeyg
   ```

2. **Navigate to SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Execute Setup Script**:
   - Open `supabase/master-aesthetics-suite-setup.sql` in this project
   - Copy the ENTIRE file content (it's comprehensive and handles conflicts safely)
   - Paste it into the Supabase SQL Editor
   - Click "Run" to execute

4. **Verify Success**:
   - You should see success messages at the bottom
   - Check that it shows table counts for verification

## Step 2: Verify Database Setup

Run the verification script:
```bash
node scripts/test-master-aesthetics-setup.js
```

## Step 3: Create Owner Account

1. **Register as Owner**:
   - Go to http://localhost:3000/register
   - Register with role "OWNER" (you'll need to modify the registration form)
   - Or register normally and update role in Supabase dashboard

2. **Update Role in Supabase Dashboard**:
   - Go to "Table Editor" > "user_profiles"
   - Find your user record
   - Change `role` from 'client' to 'owner'

## Current Issues Fixed by This Setup

✅ **Database Tables**: Creates all Master Aesthetics Suite tables
✅ **Authentication**: Proper Supabase Auth integration with triggers
✅ **Single-Tenant**: Business settings and owner model
✅ **Row Level Security**: Comprehensive RLS policies
✅ **Storage**: File upload buckets with proper policies
✅ **Initial Data**: Sample services, courses, and templates

## What This Enables

After running this setup, you'll have:

- ✅ Working user registration and authentication
- ✅ Complete database schema aligned with Master Aesthetics Suite
- ✅ Sample data to test booking and course systems
- ✅ Proper security policies for single-tenant operation
- ✅ File storage buckets for all content types

## Next Steps After Setup

1. **Test Registration**: Verify user signup works
2. **Architecture Decision**: Choose Prisma vs Pure Supabase approach
3. **Update API Routes**: Migrate from Prisma to Supabase direct queries
4. **Build Booking Engine**: Implement availability and appointment logic
5. **Complete Payment Integration**: Finish Stripe workflows

## Important Notes

- **Safe to run multiple times**: Uses IF NOT EXISTS and ON CONFLICT patterns
- **No data loss**: Preserves existing data if any
- **Comprehensive**: Includes all tables from Master Aesthetics Suite spec
- **Production ready**: Includes proper indexes, constraints, and security

## Manual Alternative

If you prefer to run the setup manually in Supabase Dashboard:

1. Go to SQL Editor
2. Create a new query
3. Copy-paste the entire `supabase/master-aesthetics-suite-setup.sql` file
4. Execute it
5. Check the output for any errors

The script is designed to be safe and won't break existing data.
