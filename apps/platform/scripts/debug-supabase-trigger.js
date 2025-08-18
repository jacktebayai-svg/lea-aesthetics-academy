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

async function debugTrigger() {
  console.log('🔍 Debugging Supabase trigger...');
  
  try {
    // Check if the handle_new_user function exists
    console.log('\n1. Checking if handle_new_user function exists...');
    const { data: functions, error: funcError } = await supabase.rpc('debug_check_function');
    
    if (funcError) {
      console.log('Cannot check function directly, trying alternative approach...');
      
      // Check using SQL query
      const { data: funcData, error: sqlError } = await supabase
        .from('information_schema.routines')
        .select('*')
        .eq('routine_name', 'handle_new_user')
        .eq('routine_schema', 'public');
        
      if (sqlError) {
        console.log('❌ Error checking function:', sqlError.message);
      } else {
        console.log('✅ Function check result:', funcData);
      }
    }
    
    // Check if user_role enum exists
    console.log('\n2. Checking if user_role enum exists...');
    const { data: enumData, error: enumError } = await supabase
      .from('information_schema.user_defined_types')
      .select('*')
      .eq('user_defined_type_name', 'user_role')
      .eq('user_defined_type_schema', 'public');
      
    if (enumError) {
      console.log('❌ Error checking enum:', enumError.message);
    } else {
      console.log('✅ Enum check result:', enumData);
    }
    
    // Check if trigger exists
    console.log('\n3. Checking if trigger exists...');
    const { data: triggerData, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('*')
      .eq('trigger_name', 'on_auth_user_created')
      .eq('trigger_schema', 'auth');
      
    if (triggerError) {
      console.log('❌ Error checking trigger:', triggerError.message);
    } else {
      console.log('✅ Trigger check result:', triggerData);
    }
    
    // Check tables structure
    console.log('\n4. Checking tables structure...');
    const tables = ['users', 'clients', 'students'];
    
    for (const table of tables) {
      console.log(`\nChecking ${table} table structure:`);
      const { data: tableData, error: tableError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', table)
        .eq('table_schema', 'public')
        .order('ordinal_position');
        
      if (tableError) {
        console.log(`❌ Error checking ${table} table:`, tableError.message);
      } else if (tableData && tableData.length > 0) {
        console.log(`✅ ${table} table columns:`, tableData);
      } else {
        console.log(`❌ ${table} table not found or has no columns`);
      }
    }
    
    // Test a simple insert to see what happens
    console.log('\n5. Testing manual trigger simulation...');
    const testUserId = 'test-user-' + Date.now();
    const testEmail = `test-${Date.now()}@example.com`;
    
    console.log('Attempting to create a test user record...');
    
    // First, let's try to call the trigger function directly if it exists
    try {
      const { data: triggerResult, error: triggerTestError } = await supabase.rpc('handle_new_user');
      if (triggerTestError) {
        console.log('❌ Direct trigger call failed:', triggerTestError.message);
      } else {
        console.log('✅ Direct trigger call succeeded:', triggerResult);
      }
    } catch (err) {
      console.log('❌ Cannot call trigger directly:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugTrigger().then(() => {
  console.log('\n🔍 Debug complete');
  process.exit(0);
}).catch(err => {
  console.error('❌ Debug script failed:', err);
  process.exit(1);
});
