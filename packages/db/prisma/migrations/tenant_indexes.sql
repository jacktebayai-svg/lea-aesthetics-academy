-- Migration: Add performance indexes for tenant isolation
-- This migration adds indexes to improve query performance for tenant-scoped operations
-- Run after main schema is deployed

-- Appointments table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_tenant_id 
ON appointments(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_tenant_practitioner 
ON appointments(tenant_id, practitioner_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_tenant_start_time 
ON appointments(tenant_id, start_ts);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_tenant_status 
ON appointments(tenant_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_tenant_client 
ON appointments(tenant_id, client_id);

-- Clients table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_tenant_id 
ON clients(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_tenant_email 
ON clients(tenant_id, (personal->>'email'));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_tenant_phone 
ON clients(tenant_id, (personal->>'phone'));

-- Services table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_tenant_id 
ON services(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_tenant_active 
ON services(tenant_id, is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_tenant_category 
ON services(tenant_id, category);

-- Locations table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_tenant_id 
ON locations(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_tenant_active 
ON locations(tenant_id, is_active);

-- Payments table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_tenant_id 
ON payments(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_tenant_appointment 
ON payments(tenant_id, appointment_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_tenant_status 
ON payments(tenant_id, status);

-- Documents table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_tenant_id 
ON documents(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_tenant_client 
ON documents(tenant_id, client_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_tenant_type 
ON documents(tenant_id, type);

-- Templates table indexes  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_tenant_id 
ON templates(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_tenant_type 
ON templates(tenant_id, type);

-- Courses table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_tenant_id 
ON courses(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_tenant_active 
ON courses(tenant_id, is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_tenant_level 
ON courses(tenant_id, level);

-- Enrollments table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_tenant_id 
ON enrollments(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_tenant_course 
ON enrollments(tenant_id, course_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_tenant_user 
ON enrollments(tenant_id, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_tenant_status 
ON enrollments(tenant_id, status);

-- Events table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_tenant_id 
ON events(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_tenant_actor 
ON events(tenant_id, actor_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_tenant_type 
ON events(tenant_id, type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_tenant_occurred 
ON events(tenant_id, occurred_at);

-- User roles table indexes (for tenant-user relationships)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_tenant_id 
ON user_roles(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_tenant_user 
ON user_roles(tenant_id, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_tenant_role 
ON user_roles(tenant_id, role);

-- Brand table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brands_tenant_id 
ON brands(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brands_domain 
ON brands(domain) WHERE domain IS NOT NULL;

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_tenant_practitioner_date 
ON appointments(tenant_id, practitioner_id, start_ts);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_tenant_client_date 
ON appointments(tenant_id, client_id, start_ts);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_tenant_appointment_status 
ON payments(tenant_id, appointment_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_tenant_user_course 
ON enrollments(tenant_id, user_id, course_id);

-- Add comments for documentation
COMMENT ON INDEX idx_appointments_tenant_id IS 'Primary tenant isolation index for appointments';
COMMENT ON INDEX idx_clients_tenant_id IS 'Primary tenant isolation index for clients';
COMMENT ON INDEX idx_services_tenant_id IS 'Primary tenant isolation index for services';
COMMENT ON INDEX idx_courses_tenant_id IS 'Primary tenant isolation index for courses';

-- Performance monitoring query to check index usage
-- Run this after deployment to ensure indexes are being used:
/*
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
  AND attname IN ('tenant_id', 'id')
ORDER BY tablename, attname;
*/
