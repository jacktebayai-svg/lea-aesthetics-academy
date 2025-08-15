/*
  Warnings:

  - You are about to drop the column `order` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the `Appointment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Campaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EsignSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Template` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tenant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[invoiceNumber]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,tenantId,role,locationId]` on the table `user_roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `practitioners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planDetails` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `user_roles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."user_roles" DROP CONSTRAINT "user_roles_tenantId_fkey";

-- AlterTable
ALTER TABLE "public"."courses" DROP COLUMN "order",
ADD COLUMN     "accreditation" JSONB,
ADD COLUMN     "certificateTemplate" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "credits" INTEGER,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "passingScore" INTEGER NOT NULL DEFAULT 70,
ADD COLUMN     "price" INTEGER,
ADD COLUMN     "promotional" JSONB,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "subcategory" TEXT,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "public"."files" ADD COLUMN     "category" TEXT,
ADD COLUMN     "cdnUrl" TEXT,
ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "entityType" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "s3Region" TEXT NOT NULL DEFAULT 'eu-west-2';

-- AlterTable
ALTER TABLE "public"."invoices" ADD COLUMN     "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "discountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hostedInvoiceUrl" TEXT,
ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "invoicePdf" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "nextPaymentAttempt" TIMESTAMP(3),
ADD COLUMN     "taxCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."practitioners" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "bookingBuffer" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "images" JSONB,
ADD COLUMN     "isAcceptingNew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxDailyBookings" INTEGER,
ADD COLUMN     "qualifications" JSONB,
ADD COLUMN     "registrationNum" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."refresh_tokens" ADD COLUMN     "family" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "public"."subscriptions" ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "planDetails" JSONB NOT NULL,
ADD COLUMN     "trialEnd" TIMESTAMP(3),
ADD COLUMN     "trialStart" TIMESTAMP(3),
ALTER COLUMN "plan" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."user_roles" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "permissions" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "lastLoginIp" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferences" JSONB NOT NULL DEFAULT '{}';

-- DropTable
DROP TABLE "public"."Appointment";

-- DropTable
DROP TABLE "public"."Brand";

-- DropTable
DROP TABLE "public"."Campaign";

-- DropTable
DROP TABLE "public"."Client";

-- DropTable
DROP TABLE "public"."Document";

-- DropTable
DROP TABLE "public"."EsignSession";

-- DropTable
DROP TABLE "public"."Event";

-- DropTable
DROP TABLE "public"."Location";

-- DropTable
DROP TABLE "public"."MedicalHistory";

-- DropTable
DROP TABLE "public"."Message";

-- DropTable
DROP TABLE "public"."Payment";

-- DropTable
DROP TABLE "public"."Service";

-- DropTable
DROP TABLE "public"."Template";

-- DropTable
DROP TABLE "public"."Tenant";

-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "domain" TEXT,
    "subdomain" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB,
    "onboardedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."brands" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "subdomain" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "theme" JSONB NOT NULL,
    "seo" JSONB,
    "socialLinks" JSONB,
    "customCss" TEXT,
    "customJs" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."locations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'clinic',
    "timezone" TEXT NOT NULL,
    "address" JSONB NOT NULL,
    "coordinates" JSONB,
    "phone" TEXT,
    "email" TEXT,
    "businessHours" JSONB NOT NULL,
    "holidays" JSONB,
    "settings" JSONB NOT NULL,
    "amenities" TEXT[],
    "images" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "basePrice" INTEGER NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "buffers" JSONB,
    "requirements" JSONB,
    "contraindications" JSONB,
    "aftercare" JSONB,
    "images" JSONB,
    "tags" TEXT[],
    "metadata" JSONB,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isBookable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."practitioner_services" (
    "id" TEXT NOT NULL,
    "practitionerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "customPrice" INTEGER,
    "customDuration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practitioner_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "externalId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "address" JSONB,
    "emergencyContact" JSONB,
    "preferences" JSONB,
    "tags" TEXT[],
    "source" TEXT,
    "referredBy" TEXT,
    "notes" TEXT,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "smsConsent" BOOLEAN NOT NULL DEFAULT false,
    "emailConsent" BOOLEAN NOT NULL DEFAULT false,
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistReason" TEXT,
    "firstVisitDate" TIMESTAMP(3),
    "lastVisitDate" TIMESTAMP(3),
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_histories" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "allergies" JSONB,
    "medications" JSONB,
    "conditions" JSONB,
    "previousTreatments" JSONB,
    "skinType" TEXT,
    "pregnancyStatus" TEXT,
    "smokingStatus" TEXT,
    "alcoholUse" TEXT,
    "supplements" JSONB,
    "familyHistory" JSONB,
    "notes" TEXT,
    "riskFlags" JSONB,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "medical_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "practitionerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "startTs" TIMESTAMP(3) NOT NULL,
    "endTs" TIMESTAMP(3) NOT NULL,
    "status" "public"."AppointmentStatus" NOT NULL,
    "confirmationCode" TEXT,
    "roomId" TEXT,
    "equipmentIds" TEXT[],
    "notes" TEXT,
    "internalNotes" TEXT,
    "remindersSent" JSONB,
    "checkedInAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,
    "noShowReason" TEXT,
    "policyVersion" INTEGER NOT NULL,
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointment_holds" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "startTs" TIMESTAMP(3) NOT NULL,
    "endTs" TIMESTAMP(3) NOT NULL,
    "serviceId" TEXT NOT NULL,
    "practitionerId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "convertedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_holds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "clientId" TEXT,
    "type" TEXT NOT NULL,
    "stripePiId" TEXT,
    "stripeChargeId" TEXT,
    "stripeRefundId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "status" "public"."PaymentStatus" NOT NULL,
    "depositCents" INTEGER NOT NULL DEFAULT 0,
    "refundedCents" INTEGER NOT NULL DEFAULT 0,
    "processingFee" INTEGER NOT NULL DEFAULT 0,
    "netAmount" INTEGER NOT NULL DEFAULT 0,
    "paymentMethod" TEXT,
    "last4" TEXT,
    "cardBrand" TEXT,
    "receiptUrl" TEXT,
    "failureReason" TEXT,
    "failureCode" TEXT,
    "refundReason" TEXT,
    "metadata" JSONB,
    "idempotencyKey" TEXT,
    "processedAt" TIMESTAMP(3),
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "mandatoryBlocks" TEXT[],
    "placeholders" TEXT[],
    "validationRules" JSONB,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT,
    "appointmentId" TEXT,
    "clientId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "version" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "signatureData" JSONB,
    "expiresAt" TIMESTAMP(3),
    "stampHash" TEXT,
    "s3Key" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."esign_sessions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'internal',
    "envelopeId" TEXT,
    "status" TEXT NOT NULL,
    "envelope" JSONB NOT NULL,
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "voidedAt" TIMESTAMP(3),
    "voidReason" TEXT,
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "lastReminderAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "esign_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "payload" JSONB NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaigns" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "audience" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "scheduleTs" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "stats" JSONB,
    "abTestVariants" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "campaignId" TEXT,
    "channel" TEXT NOT NULL,
    "toRef" TEXT NOT NULL,
    "clientId" TEXT,
    "templateId" TEXT,
    "subject" TEXT,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT,
    "providerMsgId" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "error" TEXT,
    "errorCode" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "trigger" TEXT,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "variables" TEXT[],
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."automations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" JSONB NOT NULL,
    "conditions" JSONB,
    "actions" JSONB NOT NULL,
    "schedule" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."search_indexes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "indexName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "searchableText" TEXT NOT NULL,
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_indexes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_generations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "validation" JSONB,
    "guardrails" JSONB,
    "tokenCount" INTEGER,
    "latencyMs" INTEGER,
    "cost" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "ai_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."availability_rules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "practitionerId" TEXT,
    "locationId" TEXT,
    "type" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "recurrence" JSONB,
    "timeSlots" JSONB NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "availability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_constraints" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "schedule" JSONB,
    "requirements" JSONB,
    "maintenanceSchedule" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_constraints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tenant_policies" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "rules" JSONB NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "tenant_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "public"."tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "public"."tenants"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "public"."tenants"("subdomain");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "public"."tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "public"."tenants"("status");

-- CreateIndex
CREATE UNIQUE INDEX "brands_domain_key" ON "public"."brands"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "brands_subdomain_key" ON "public"."brands"("subdomain");

-- CreateIndex
CREATE INDEX "brands_tenantId_idx" ON "public"."brands"("tenantId");

-- CreateIndex
CREATE INDEX "brands_domain_idx" ON "public"."brands"("domain");

-- CreateIndex
CREATE INDEX "brands_subdomain_idx" ON "public"."brands"("subdomain");

-- CreateIndex
CREATE INDEX "locations_tenantId_idx" ON "public"."locations"("tenantId");

-- CreateIndex
CREATE INDEX "locations_tenantId_isActive_idx" ON "public"."locations"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "locations_tenantId_slug_key" ON "public"."locations"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "services_tenantId_idx" ON "public"."services"("tenantId");

-- CreateIndex
CREATE INDEX "services_tenantId_category_idx" ON "public"."services"("tenantId", "category");

-- CreateIndex
CREATE INDEX "services_tenantId_isActive_isBookable_idx" ON "public"."services"("tenantId", "isActive", "isBookable");

-- CreateIndex
CREATE UNIQUE INDEX "services_tenantId_slug_key" ON "public"."services"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "practitioner_services_practitionerId_serviceId_key" ON "public"."practitioner_services"("practitionerId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_userId_key" ON "public"."clients"("userId");

-- CreateIndex
CREATE INDEX "clients_tenantId_idx" ON "public"."clients"("tenantId");

-- CreateIndex
CREATE INDEX "clients_tenantId_email_idx" ON "public"."clients"("tenantId", "email");

-- CreateIndex
CREATE INDEX "clients_tenantId_phone_idx" ON "public"."clients"("tenantId", "phone");

-- CreateIndex
CREATE INDEX "clients_tenantId_isBlacklisted_idx" ON "public"."clients"("tenantId", "isBlacklisted");

-- CreateIndex
CREATE UNIQUE INDEX "clients_tenantId_email_key" ON "public"."clients"("tenantId", "email");

-- CreateIndex
CREATE INDEX "medical_histories_clientId_isActive_idx" ON "public"."medical_histories"("clientId", "isActive");

-- CreateIndex
CREATE INDEX "medical_histories_clientId_version_idx" ON "public"."medical_histories"("clientId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_confirmationCode_key" ON "public"."appointments"("confirmationCode");

-- CreateIndex
CREATE INDEX "appointments_tenantId_idx" ON "public"."appointments"("tenantId");

-- CreateIndex
CREATE INDEX "appointments_tenantId_status_idx" ON "public"."appointments"("tenantId", "status");

-- CreateIndex
CREATE INDEX "appointments_tenantId_startTs_idx" ON "public"."appointments"("tenantId", "startTs");

-- CreateIndex
CREATE INDEX "appointments_tenantId_clientId_idx" ON "public"."appointments"("tenantId", "clientId");

-- CreateIndex
CREATE INDEX "appointments_tenantId_practitionerId_idx" ON "public"."appointments"("tenantId", "practitionerId");

-- CreateIndex
CREATE INDEX "appointments_confirmationCode_idx" ON "public"."appointments"("confirmationCode");

-- CreateIndex
CREATE INDEX "appointment_holds_tenantId_expiresAt_idx" ON "public"."appointment_holds"("tenantId", "expiresAt");

-- CreateIndex
CREATE INDEX "appointment_holds_sessionId_idx" ON "public"."appointment_holds"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripePiId_key" ON "public"."payments"("stripePiId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeChargeId_key" ON "public"."payments"("stripeChargeId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeRefundId_key" ON "public"."payments"("stripeRefundId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotencyKey_key" ON "public"."payments"("idempotencyKey");

-- CreateIndex
CREATE INDEX "payments_tenantId_idx" ON "public"."payments"("tenantId");

-- CreateIndex
CREATE INDEX "payments_tenantId_status_idx" ON "public"."payments"("tenantId", "status");

-- CreateIndex
CREATE INDEX "payments_tenantId_appointmentId_idx" ON "public"."payments"("tenantId", "appointmentId");

-- CreateIndex
CREATE INDEX "payments_stripePiId_idx" ON "public"."payments"("stripePiId");

-- CreateIndex
CREATE INDEX "templates_tenantId_type_idx" ON "public"."templates"("tenantId", "type");

-- CreateIndex
CREATE INDEX "templates_type_jurisdiction_effectiveFrom_idx" ON "public"."templates"("type", "jurisdiction", "effectiveFrom");

-- CreateIndex
CREATE INDEX "documents_tenantId_idx" ON "public"."documents"("tenantId");

-- CreateIndex
CREATE INDEX "documents_tenantId_type_idx" ON "public"."documents"("tenantId", "type");

-- CreateIndex
CREATE INDEX "documents_tenantId_clientId_idx" ON "public"."documents"("tenantId", "clientId");

-- CreateIndex
CREATE INDEX "documents_tenantId_appointmentId_idx" ON "public"."documents"("tenantId", "appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "esign_sessions_envelopeId_key" ON "public"."esign_sessions"("envelopeId");

-- CreateIndex
CREATE INDEX "esign_sessions_documentId_idx" ON "public"."esign_sessions"("documentId");

-- CreateIndex
CREATE INDEX "esign_sessions_clientId_idx" ON "public"."esign_sessions"("clientId");

-- CreateIndex
CREATE INDEX "esign_sessions_status_idx" ON "public"."esign_sessions"("status");

-- CreateIndex
CREATE INDEX "events_tenantId_type_idx" ON "public"."events"("tenantId", "type");

-- CreateIndex
CREATE INDEX "events_tenantId_occurredAt_idx" ON "public"."events"("tenantId", "occurredAt");

-- CreateIndex
CREATE INDEX "events_tenantId_entityType_entityId_idx" ON "public"."events"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_entityType_entityId_idx" ON "public"."audit_logs"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_userId_idx" ON "public"."audit_logs"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_createdAt_idx" ON "public"."audit_logs"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "campaigns_tenantId_idx" ON "public"."campaigns"("tenantId");

-- CreateIndex
CREATE INDEX "campaigns_tenantId_status_idx" ON "public"."campaigns"("tenantId", "status");

-- CreateIndex
CREATE INDEX "messages_tenantId_idx" ON "public"."messages"("tenantId");

-- CreateIndex
CREATE INDEX "messages_tenantId_status_idx" ON "public"."messages"("tenantId", "status");

-- CreateIndex
CREATE INDEX "messages_tenantId_channel_idx" ON "public"."messages"("tenantId", "channel");

-- CreateIndex
CREATE INDEX "messages_campaignId_idx" ON "public"."messages"("campaignId");

-- CreateIndex
CREATE INDEX "notification_templates_tenantId_channel_idx" ON "public"."notification_templates"("tenantId", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_tenantId_slug_key" ON "public"."notification_templates"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "automations_tenantId_idx" ON "public"."automations"("tenantId");

-- CreateIndex
CREATE INDEX "automations_tenantId_isActive_idx" ON "public"."automations"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "search_indexes_tenantId_indexName_idx" ON "public"."search_indexes"("tenantId", "indexName");

-- CreateIndex
CREATE INDEX "search_indexes_tenantId_entityType_idx" ON "public"."search_indexes"("tenantId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "search_indexes_tenantId_entityType_entityId_key" ON "public"."search_indexes"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "ai_generations_tenantId_type_idx" ON "public"."ai_generations"("tenantId", "type");

-- CreateIndex
CREATE INDEX "ai_generations_tenantId_status_idx" ON "public"."ai_generations"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ai_generations_tenantId_createdAt_idx" ON "public"."ai_generations"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "availability_rules_tenantId_idx" ON "public"."availability_rules"("tenantId");

-- CreateIndex
CREATE INDEX "availability_rules_tenantId_practitionerId_idx" ON "public"."availability_rules"("tenantId", "practitionerId");

-- CreateIndex
CREATE INDEX "availability_rules_tenantId_locationId_idx" ON "public"."availability_rules"("tenantId", "locationId");

-- CreateIndex
CREATE INDEX "availability_rules_tenantId_type_isActive_idx" ON "public"."availability_rules"("tenantId", "type", "isActive");

-- CreateIndex
CREATE INDEX "resource_constraints_tenantId_locationId_idx" ON "public"."resource_constraints"("tenantId", "locationId");

-- CreateIndex
CREATE INDEX "resource_constraints_tenantId_type_idx" ON "public"."resource_constraints"("tenantId", "type");

-- CreateIndex
CREATE INDEX "tenant_policies_tenantId_type_idx" ON "public"."tenant_policies"("tenantId", "type");

-- CreateIndex
CREATE INDEX "tenant_policies_tenantId_isActive_isDefault_idx" ON "public"."tenant_policies"("tenantId", "isActive", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_policies_tenantId_type_version_key" ON "public"."tenant_policies"("tenantId", "type", "version");

-- CreateIndex
CREATE INDEX "courses_tenantId_idx" ON "public"."courses"("tenantId");

-- CreateIndex
CREATE INDEX "courses_slug_idx" ON "public"."courses"("slug");

-- CreateIndex
CREATE INDEX "courses_level_category_idx" ON "public"."courses"("level", "category");

-- CreateIndex
CREATE INDEX "courses_isPublished_isActive_idx" ON "public"."courses"("isPublished", "isActive");

-- CreateIndex
CREATE INDEX "files_tenantId_idx" ON "public"."files"("tenantId");

-- CreateIndex
CREATE INDEX "files_entityType_entityId_idx" ON "public"."files"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "public"."invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_tenantId_idx" ON "public"."invoices"("tenantId");

-- CreateIndex
CREATE INDEX "invoices_subscriptionId_idx" ON "public"."invoices"("subscriptionId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "public"."invoices"("status");

-- CreateIndex
CREATE INDEX "practitioners_tenantId_idx" ON "public"."practitioners"("tenantId");

-- CreateIndex
CREATE INDEX "practitioners_tenantId_isActive_idx" ON "public"."practitioners"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "public"."refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_family_idx" ON "public"."refresh_tokens"("family");

-- CreateIndex
CREATE INDEX "subscriptions_tenantId_idx" ON "public"."subscriptions"("tenantId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "public"."subscriptions"("status");

-- CreateIndex
CREATE INDEX "user_roles_tenantId_userId_idx" ON "public"."user_roles"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "user_roles_tenantId_role_idx" ON "public"."user_roles"("tenantId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_tenantId_role_locationId_key" ON "public"."user_roles"("userId", "tenantId", "role", "locationId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_authId_idx" ON "public"."users"("authId");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "public"."users"("isActive");

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."brands" ADD CONSTRAINT "brands_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."locations" ADD CONSTRAINT "locations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."services" ADD CONSTRAINT "services_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."practitioners" ADD CONSTRAINT "practitioners_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."practitioner_services" ADD CONSTRAINT "practitioner_services_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "public"."practitioners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."practitioner_services" ADD CONSTRAINT "practitioner_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_histories" ADD CONSTRAINT "medical_histories_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "public"."practitioners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment_holds" ADD CONSTRAINT "appointment_holds_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment_holds" ADD CONSTRAINT "appointment_holds_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."templates" ADD CONSTRAINT "templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."esign_sessions" ADD CONSTRAINT "esign_sessions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."esign_sessions" ADD CONSTRAINT "esign_sessions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaigns" ADD CONSTRAINT "campaigns_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_templates" ADD CONSTRAINT "notification_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."automations" ADD CONSTRAINT "automations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."search_indexes" ADD CONSTRAINT "search_indexes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_generations" ADD CONSTRAINT "ai_generations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_rules" ADD CONSTRAINT "availability_rules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_rules" ADD CONSTRAINT "availability_rules_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "public"."practitioners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_rules" ADD CONSTRAINT "availability_rules_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_constraints" ADD CONSTRAINT "resource_constraints_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_constraints" ADD CONSTRAINT "resource_constraints_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tenant_policies" ADD CONSTRAINT "tenant_policies_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
