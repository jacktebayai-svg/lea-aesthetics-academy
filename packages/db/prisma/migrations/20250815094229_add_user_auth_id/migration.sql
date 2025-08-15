/*
  Warnings:

  - A unique constraint covering the columns `[authId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'CLIENT';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "authId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_authId_key" ON "public"."users"("authId");

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
