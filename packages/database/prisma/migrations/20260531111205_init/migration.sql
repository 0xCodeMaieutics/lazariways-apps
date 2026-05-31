-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "GermanLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1');

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fotoS3Key" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "birthDate" DATE NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "birthCountry" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "instagram" TEXT,
    "taxId" TEXT,
    "university" TEXT,
    "studySubject" TEXT,
    "semesterBreakFrom" DATE,
    "semesterBreakTo" DATE,
    "germanLevel" "GermanLevel",
    "otherLanguages" TEXT,
    "driverLicense" BOOLEAN NOT NULL DEFAULT false,
    "canRideBike" BOOLEAN NOT NULL DEFAULT false,
    "shiftWork" BOOLEAN NOT NULL DEFAULT false,
    "healthRestrictions" TEXT,
    "allergies" TEXT,
    "clothingSize" TEXT,
    "shoeSize" TEXT[],
    "hasBeenInGermanyBefore" BOOLEAN NOT NULL DEFAULT false,
    "previousStayPlace" TEXT,
    "previousStayPeriodFrom" DATE,
    "previousStayPeriodTo" DATE,
    "emergencyContactName" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "workSector" TEXT[],

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_submittedAt_idx" ON "Application"("submittedAt");

-- CreateIndex
CREATE INDEX "Application_lastName_firstName_idx" ON "Application"("lastName", "firstName");
