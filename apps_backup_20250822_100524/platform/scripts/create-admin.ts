import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin account for Lea...');

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'Leaaesthetics@mail.com',
      password: 'Passwrod123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Lea',
        last_name: 'Administrator',
        role: 'owner'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return;
    }

    console.log('✅ Auth user created:', authUser.user.email);

    // Create user profile in database
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        email: 'Leaaesthetics@mail.com',
        first_name: 'Lea',
        last_name: 'Administrator',
        role: 'owner',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError);
      return;
    }

    console.log('✅ User profile created:', profile.email);

    console.log('🎉 Admin account created successfully!');
    console.log('');
    console.log('📋 Login Details:');
    console.log('   Email: Leaaesthetics@mail.com');
    console.log('   Password: Passwrod123');
    console.log('   Role: Owner/Admin');
    console.log('');
    console.log('🔗 Access at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createAdminUser();
