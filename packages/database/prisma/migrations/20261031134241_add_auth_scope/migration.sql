-- CreateEnum
CREATE TYPE "AuthScope" AS ENUM ('ADMIN', 'CONTENT');

-- DropIndex
DROP INDEX "TelegramVerification_code_idx";

-- DropIndex
DROP INDEX "TelegramVerification_createdAt_idx";

-- AlterTable
ALTER TABLE "AdminSession" ADD COLUMN     "scope" "AuthScope" NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "TelegramVerification" ADD COLUMN     "scope" "AuthScope" NOT NULL DEFAULT 'ADMIN';

-- CreateIndex
CREATE INDEX "TelegramVerification_scope_code_idx" ON "TelegramVerification"("scope", "code");

-- CreateIndex
CREATE INDEX "TelegramVerification_scope_createdAt_idx" ON "TelegramVerification"("scope", "createdAt");
