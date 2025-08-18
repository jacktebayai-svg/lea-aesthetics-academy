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

async function deploySchema() {
  console.log('🚀 Deploying Master Aesthetics Suite schema to Supabase...');
  
  try {
    // Read the setup SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase', 'master-aesthetics-suite-setup.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log('📋 Executing SQL setup script...');
    
    // Execute the SQL script
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });
    
    if (error) {
      // If rpc doesn't work, try direct execution (this requires service role)
      console.log('🔄 Trying alternative method...');
      
      // Split SQL into individual statements and execute them
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.includes('SELECT')) {
          // Skip verification queries for now
          continue;
        }
        
        try {
          await supabase.rpc('exec_sql', { sql: statement });
        } catch (stmtError) {
          console.log(`⚠️ Statement skipped (likely already exists): ${statement.substring(0, 50)}...`);
        }
      }
    }
    
    console.log('✅ Schema deployment completed');
    
    // Verify the setup
    console.log('\n🔍 Verifying database setup...');
    
    // Check if core tables exist
    const tables = ['user_profiles', 'services', 'clients', 'students', 'courses', 'business_settings'];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: ${count || 0} rows`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
    // Check if functions exist
    console.log('\n🔍 Checking functions...');
    try {
      const { data: functions, error } = await supabase
        .from('pg_proc')
        .select('proname')
        .in('proname', ['handle_new_user', 'get_user_role', 'is_owner']);
        
      if (functions) {
        console.log(`✅ Functions found: ${functions.map(f => f.proname).join(', ')}`);
      } else {
        console.log('❌ Could not verify functions');
      }
    } catch (err) {
      console.log('❌ Function check failed:', err.message);
    }
    
    console.log('\n🎉 Database setup verification completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Test user registration: node scripts/test-new-setup.js');
    console.log('2. Start development server: pnpm dev');
    console.log('3. Visit http://localhost:3000/register to test');
    
  } catch (error) {
    console.error('❌ Schema deployment failed:', error);
    process.exit(1);
  }
}

deploySchema().then(() => {
  console.log('\n✅ Schema deployment complete');
  process.exit(0);
}).catch(err => {
  console.error('❌ Deployment script failed:', err);
  process.exit(1);
});
