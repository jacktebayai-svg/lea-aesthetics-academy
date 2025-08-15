-- Comprehensive RLS policy script for tenant isolation
-- Usage: run manually in psql or include in a custom migration step when ready.
-- This provides database-level security as a backup to application-level tenant scoping

-- Enable RLS on all tenant-scoped tables
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Enrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Brand" ENABLE ROW LEVEL SECURITY;

-- Create secure functions for tenant context management
CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_tenant() RETURNS text AS $$
  SELECT current_setting('app.tenant_id', true)
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.set_tenant(tenant_id text) RETURNS void AS $$
BEGIN
  -- Validate tenant ID format (CUID pattern)
  IF NOT (tenant_id ~ '^c[a-z0-9]{24}$') THEN
    RAISE EXCEPTION 'Invalid tenant ID format: %', tenant_id;
  END IF;
  
  PERFORM set_config('app.tenant_id', tenant_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.clear_tenant() RETURNS void AS $$
BEGIN
  PERFORM set_config('app.tenant_id', '', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Core business entity policies
CREATE POLICY tenant_isolation_client ON "Client"
  FOR ALL TO authenticated
  USING ("tenantId" = app.current_tenant())
  WITH CHECK ("tenantId" = app.current_tenant());

CREATE POLICY tenant_isolation_appointment ON "Appointment"
  FOR ALL TO authenticated
  USING ("tenantId" = app.current_tenant())
  WITH CHECK ("tenantId" = app.current_tenant());

CREATE POLICY tenant_isolation_service ON "Service"
  FOR ALL TO authenticated
  USING ("tenantId" = app.current_tenant())
  WITH CHECK ("tenantId" = app.current_tenant());

CREATE POLICY tenant_isolation_location ON "Location"
  FOR ALL TO authenticated
  USING ("tenantId" = app.current_tenant())
  WITH CHECK ("tenantId" = app.current_tenant());

-- Financial data policies (most critical)
CREATE POLICY tenant_isolation_payment ON "Payment"
  FOR ALL TO authenticated
  USING ("tenantId" = app.current_tenant())
  WITH CHECK ("tenantId" = app.current_tenant());

-- Document and template policies
CREATE POLICY tenant_isolation_document ON "Document"
  FOR ALL TO authenticated
  USING ("tenantId" = app.current_tenant())
  WITH CHECK ("tenantId" = app.current_tenant());

CREATE POLICY tenant_isolation_template ON "Template"
  FOR ALL TO authenticated
  USING ("tenantId" = app.current_tenant())
  WITH CHECK ("tenantId" = app.current_tenant());

-- Learning management system policies
CREATE POLICY tenant_isolation_course ON "Course"
  FOR ALL TO authenticated
  USING ("tenantId" = app.current_tenant())
  WITH CHECK ("tenantId" = app.current_tenant());

CREATE POLICY tenant_isolation_enrollment ON "Enrollment"
  FOR ALL TO authenticated
  USING ("tenantId" = app.current_tenant())
  WITH CHECK ("tenantId" = app.current_tenant());

-- Audit and branding policies
CREATE POLICY tenant_isolation_event ON "Event"
  FOR ALL TO authenticated
  USING ("tenantId" = app.current_tenant())
  WITH CHECK ("tenantId" = app.current_tenant());

CREATE POLICY tenant_isolation_brand ON "Brand"
  FOR ALL TO authenticated
  USING ("tenantId" = app.current_tenant())
  WITH CHECK ("tenantId" = app.current_tenant());

-- Grant access to tenant management functions
GRANT USAGE ON SCHEMA app TO authenticated;
GRANT EXECUTE ON FUNCTION app.current_tenant() TO authenticated;
GRANT EXECUTE ON FUNCTION app.set_tenant(text) TO authenticated;
GRANT EXECUTE ON FUNCTION app.clear_tenant() TO authenticated;

-- Create monitoring view for RLS status
CREATE OR REPLACE VIEW app.rls_status AS
SELECT 
    t.table_name,
    t.row_security as rls_enabled,
    app.current_tenant() as current_tenant,
    COUNT(p.policy_name) as policy_count
FROM information_schema.tables t
LEFT JOIN information_schema.policies p ON p.table_name = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_name IN (
    'Client', 'Appointment', 'Service', 'Location', 
    'Payment', 'Document', 'Template', 'Course', 
    'Enrollment', 'Event', 'Brand'
  )
GROUP BY t.table_name, t.row_security
ORDER BY t.table_name;

-- Grant read access to monitoring view
GRANT SELECT ON app.rls_status TO authenticated;

-- Comments for documentation
COMMENT ON SCHEMA app IS 'Application-level security functions and views';
COMMENT ON FUNCTION app.current_tenant() IS 'Get current tenant context for RLS policies';
COMMENT ON FUNCTION app.set_tenant(text) IS 'Set tenant context with validation';
COMMENT ON FUNCTION app.clear_tenant() IS 'Clear tenant context after operations';
COMMENT ON VIEW app.rls_status IS 'Monitor RLS enablement and policy count for tenant tables';

-- Test script for verifying RLS (use with caution in development only)
/*
-- Example usage:
SELECT app.set_tenant('cm1test1234567890123456789');
SELECT COUNT(*) FROM "Appointment"; -- Should only show tenant's appointments
SELECT app.current_tenant(); -- Verify tenant context
SELECT app.clear_tenant();

-- Monitor RLS status:
SELECT * FROM app.rls_status;

-- Check if policies are working:
SELECT tablename, policyname, permissive, roles 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname LIKE 'tenant_isolation_%';
*/

