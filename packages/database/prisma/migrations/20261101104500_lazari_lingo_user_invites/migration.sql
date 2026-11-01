-- AlterTable
ALTER TABLE "lazari_lingo"."User" ADD COLUMN     "disabledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "lazari_lingo"."Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "lazari_lingo"."Verification"("identifier");
