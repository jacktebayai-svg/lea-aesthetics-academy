-- Preliminary RLS policy script (not yet applied via Prisma Migrate)
-- Usage: run manually in psql or include in a custom migration step when ready.

-- Enable RLS on critical tables
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;

-- Create a function to expose app.tenant_id setting
CREATE OR REPLACE FUNCTION app.current_tenant() RETURNS text AS $$
  SELECT current_setting('app.tenant_id', true)
$$ LANGUAGE sql STABLE;

-- Policies to restrict rows to current tenant
CREATE POLICY tenant_isolation_client ON "Client"
  USING (tenantId = app.current_tenant());
CREATE POLICY tenant_isolation_appointment ON "Appointment"
  USING (tenantId = app.current_tenant());
CREATE POLICY tenant_isolation_payment ON "Payment"
  USING (tenantId = app.current_tenant());
CREATE POLICY tenant_isolation_document ON "Document"
  USING (tenantId = app.current_tenant());
CREATE POLICY tenant_isolation_event ON "Event"
  USING (tenantId = app.current_tenant());

-- Optionally force all connections to have app.tenant_id set (deferred)
-- ALTER DATABASE irwell_hospitality SET app.tenant_id TO '';

