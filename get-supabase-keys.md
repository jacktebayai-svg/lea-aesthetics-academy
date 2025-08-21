# How to Get Your Supabase API Keys

Your database is now successfully set up! To complete the configuration, you need to get the API keys from your Supabase dashboard:

## Steps to Get API Keys:

1. **Go to Supabase Dashboard**: Visit [https://app.supabase.com](https://app.supabase.com)

2. **Select Your Project**: Look for project `bawjmrlsoopzqzdcniwy` or "Master Aesthetics Suite"

3. **Get API Keys**: Go to Settings → API

4. **Copy the following keys**:
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

5. **Update your environment file** at `apps/platform/.env.local`:
   ```bash
   # Replace these placeholder values with your actual keys:
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
   ```

6. **JWT Secret** (optional): Also in Settings → API, copy the JWT Secret if you need it

## Current Database Status:
✅ Database connected and configured
✅ All tables created (16 tables)
✅ Row Level Security policies enabled
✅ Sample data inserted:
   - 5 sample services
   - 3 sample courses  
   - Business settings for LEA Aesthetics Academy

## Next Steps After Getting Keys:
1. Update the `.env.local` file with real API keys
2. Run `pnpm dev` to start the application
3. Test the authentication and database connection

Your database URL is already correctly configured:
`postgresql://postgres:Jan03uary!@db.bawjmrlsoopzqzdcniwy.supabase.co:5432/postgres`
