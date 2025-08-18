const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
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

async function testSetup() {
  console.log('🧪 Testing Master Aesthetics Suite Supabase setup...');
  
  try {
    // Test 1: Check core tables exist
    console.log('\n1. Checking core tables...');
    const tables = [
      'business_settings', 
      'user_profiles', 
      'services', 
      'clients', 
      'students', 
      'courses',
      'appointments',
      'payments',
      'templates',
      'documents',
      'campaigns',
      'messages',
      'audit_logs',
      'file_uploads'
    ];
    
    let tablesExist = 0;
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: ${count || 0} rows`);
          tablesExist++;
        }
      } catch (err) {
        console.log(`❌ Table ${table}: Not found or accessible`);
      }
    }
    
    if (tablesExist < tables.length) {
      console.log(`\n⚠️ Warning: Only ${tablesExist}/${tables.length} tables found. Please run the setup SQL script.`);
      return;
    }
    
    // Test 2: Check sample data
    console.log('\n2. Checking sample data...');
    
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('name, slug, price')
      .limit(3);
    
    if (servicesError) {
      console.log('❌ Services check failed:', servicesError.message);
    } else {
      console.log('✅ Sample services found:', services.length);
      services.forEach(s => console.log(`   - ${s.name} (£${s.price/100})`));
    }
    
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('title, slug, price')
      .limit(3);
    
    if (coursesError) {
      console.log('❌ Courses check failed:', coursesError.message);
    } else {
      console.log('✅ Sample courses found:', courses.length);
      courses.forEach(c => console.log(`   - ${c.title} (£${c.price/100})`));
    }
    
    // Test 3: Test authentication flow
    console.log('\n3. Testing user registration...');
    const testEmail = `test-setup-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`Creating test user: ${testEmail}`);
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'client',
          firstName: 'Test',
          lastName: 'User',
          phone: '07123456789'
        }
      }
    });
    
    if (signupError) {
      console.log('❌ Signup failed:', signupError.message);
    } else {
      console.log('✅ User signup successful:', signupData.user?.id);
      
      // Wait for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if user_profiles entry was created
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', signupData.user.id)
        .single();
      
      if (profileError) {
        console.log('❌ User profile not created:', profileError.message);
      } else {
        console.log('✅ User profile created:', {
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.role
        });
      }
      
      // Check if client profile was created
      const { data: clientProfile, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', signupData.user.id)
        .single();
      
      if (clientError) {
        console.log('❌ Client profile not created:', clientError.message);
      } else {
        console.log('✅ Client profile created:', {
          user_id: clientProfile.user_id,
          personal_info: clientProfile.personal_info
        });
      }
    }
    
    // Test 4: Check business settings
    console.log('\n4. Checking business settings...');
    const { data: businessSettings, error: businessError } = await supabase
      .from('business_settings')
      .select('*')
      .single();
    
    if (businessError) {
      console.log('❌ Business settings not found:', businessError.message);
    } else {
      console.log('✅ Business settings configured:', {
        business_name: businessSettings.business_name,
        owner_name: businessSettings.owner_name,
        email: businessSettings.email
      });
    }
    
    console.log('\n🎉 Master Aesthetics Suite setup verification completed!');
    
    if (tablesExist === tables.length) {
      console.log('\n✅ Database is properly configured and ready for development');
      console.log('\n📋 You can now:');
      console.log('1. Start the development server: pnpm dev');
      console.log('2. Test user registration at: http://localhost:3000/register');
      console.log('3. Begin implementing the booking system');
      console.log('4. Move to the next todo: Resolve Prisma vs Supabase architecture');
    } else {
      console.log('\n❌ Database setup incomplete. Please run the setup SQL script first.');
      console.log('📋 Instructions: See SUPABASE_SETUP_INSTRUCTIONS.md');
    }
    
  } catch (error) {
    console.error('❌ Setup test failed:', error);
  }
}

testSetup().then(() => {
  console.log('\n🧪 Test complete');
  process.exit(0);
}).catch(err => {
  console.error('❌ Test script failed:', err);
  process.exit(1);
});
