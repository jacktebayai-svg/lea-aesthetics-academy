/**
 * Master Aesthetics Suite - Migration Script
 * 
 * This script helps migrate data from the current multi-tenant schema to the new
 * single-tenant schema aligned with Master Aesthetics Suite specification.
 */

import { PrismaClient as OldPrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// Create a connection to the current database
const oldPrisma = new OldPrismaClient();

async function main() {
  console.log('Starting migration to single-tenant schema...');

  try {
    // 1. Backup the current database
    console.log('Creating database backup...');
    await execAsync('npx prisma db dump --schema=./prisma/schema.prisma');
    console.log('✅ Database backup created');

    // 2. Rename current schema.prisma to schema.prisma.bak
    console.log('Backing up current schema...');
    fs.renameSync(
      path.join(__dirname, 'schema.prisma'),
      path.join(__dirname, 'schema.prisma.bak')
    );
    console.log('✅ Current schema backed up to schema.prisma.bak');

    // 3. Rename schema-new.prisma to schema.prisma
    console.log('Installing new schema...');
    fs.renameSync(
      path.join(__dirname, 'schema-new.prisma'),
      path.join(__dirname, 'schema.prisma')
    );
    console.log('✅ New schema installed');

    // 4. Generate new Prisma client
    console.log('Generating new Prisma client...');
    await execAsync('npx prisma generate');
    console.log('✅ New Prisma client generated');

    // 5. Create a new migration
    console.log('Creating database migration...');
    await execAsync('npx prisma migrate dev --name single_tenant_migration --create-only');
    console.log('✅ Migration created');

    // Import the generated migration for customization
    console.log('\n⚠️ IMPORTANT NEXT STEPS ⚠️');
    console.log('1. Review the migration file in prisma/migrations/..._single_tenant_migration/');
    console.log('2. Add data migration SQL to preserve existing data');
    console.log('3. Run the migration with: npx prisma migrate dev');
    console.log('\nFor data preservation, add the following SQL to your migration:');
    console.log(`
-- Business Settings Migration
INSERT INTO business_settings (id, business_name, owner_name, email)
VALUES ('business_settings', 'LEA Aesthetics Academy', 'Business Owner', 'contact@example.com')
ON CONFLICT (id) DO NOTHING;

-- User Migration
INSERT INTO user_profiles (id, email, role, is_active, created_at, updated_at)
SELECT id, email, 
  CASE 
    WHEN array_position(roles, 'ADMIN') IS NOT NULL THEN 'owner'
    WHEN array_position(roles, 'CLIENT') IS NOT NULL THEN 'client'
    WHEN array_position(roles, 'STUDENT') IS NOT NULL THEN 'student'
    ELSE 'client'
  END as role,
  is_active, created_at, updated_at
FROM app_users
ON CONFLICT (id) DO NOTHING;

-- Client Migration
INSERT INTO clients (id, user_id, personal_info, created_at, updated_at)
SELECT 
  cp.id, 
  cp.user_id, 
  jsonb_build_object(
    'firstName', u.first_name,
    'lastName', u.last_name,
    'dateOfBirth', cp.date_of_birth,
    'gender', cp.gender,
    'address', cp.address,
    'emergencyContact', cp.emergency_contact
  ),
  cp.created_at,
  cp.updated_at
FROM client_profiles cp
JOIN app_users u ON cp.user_id = u.id
ON CONFLICT (user_id) DO NOTHING;

-- Student Migration
-- Add other migrations as needed
    `);

  } catch (error) {
    console.error('Migration failed:', error);
    console.log('Rolling back changes...');
    
    // Roll back changes if anything fails
    if (!fs.existsSync(path.join(__dirname, 'schema.prisma.bak'))) {
      fs.renameSync(
        path.join(__dirname, 'schema.prisma.bak'),
        path.join(__dirname, 'schema.prisma')
      );
      console.log('✅ Schema rolled back to original');
    }
    
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await oldPrisma.$disconnect();
  });
