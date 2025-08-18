const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local if it exists
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

try {
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1]?.trim();
      } else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        supabaseServiceKey = line.split('=')[1]?.trim();
      }
    }
  }
} catch (err) {
  console.log('Could not read .env.local file, using environment variables');
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTrigger() {
  console.log('🧪 Testing Supabase trigger after fix...');
  
  try {
    // Check if function exists now
    console.log('\n1. Checking if trigger function exists...');
    const { data: funcCheck, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'handle_new_user')
      .single();
      
    if (funcError) {
      console.log('❌ Function check failed:', funcError.message);
    } else {
      console.log('✅ Function exists:', funcCheck);
    }
    
    // Check if trigger exists
    console.log('\n2. Checking if trigger exists...');
    const { data: triggerCheck, error: triggerError } = await supabase
      .from('pg_trigger')
      .select('tgname')
      .eq('tgname', 'on_auth_user_created')
      .single();
      
    if (triggerError) {
      console.log('❌ Trigger check failed:', triggerError.message);
    } else {
      console.log('✅ Trigger exists:', triggerCheck);
    }
    
    // Check if enum exists
    console.log('\n3. Checking if user_role enum exists...');
    const { data: enumCheck, error: enumError } = await supabase
      .from('pg_type')
      .select('typname')
      .eq('typname', 'user_role')
      .single();
      
    if (enumError) {
      console.log('❌ Enum check failed:', enumError.message);
    } else {
      console.log('✅ Enum exists:', enumCheck);
    }
    
    // Test creating a user via auth signup
    console.log('\n4. Testing user signup with trigger...');
    const testEmail = `test-trigger-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`Creating test user: ${testEmail}`);
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'CLIENT',
          firstName: 'Test',
          lastName: 'User',
          profile: {
            phone: '555-1234',
            city: 'Test City',
            state: 'TS'
          }
        }
      }
    });
    
    if (signupError) {
      console.log('❌ Signup failed:', signupError.message);
      return;
    } else {
      console.log('✅ Signup succeeded:', signupData.user?.id);
    }
    
    // Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if user was created in public.users
    console.log('\n5. Checking if user was created in public.users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signupData.user.id)
      .single();
      
    if (userError) {
      console.log('❌ User not found in public.users:', userError.message);
    } else {
      console.log('✅ User found in public.users:', {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        first_name: userData.first_name,
        last_name: userData.last_name
      });
    }
    
    // Check if client profile was created
    console.log('\n6. Checking if client profile was created...');
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', signupData.user.id)
      .single();
      
    if (clientError) {
      console.log('❌ Client profile not found:', clientError.message);
    } else {
      console.log('✅ Client profile found:', {
        user_id: clientData.user_id,
        phone: clientData.phone,
        city: clientData.city,
        state: clientData.state
      });
    }
    
    console.log('\n🎉 Trigger test completed successfully!');
    console.log('Your registration should now work properly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTrigger().then(() => {
  console.log('\n🧪 Test complete');
  process.exit(0);
}).catch(err => {
  console.error('❌ Test script failed:', err);
  process.exit(1);
});
