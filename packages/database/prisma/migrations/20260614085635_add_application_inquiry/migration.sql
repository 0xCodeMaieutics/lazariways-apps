-- CreateTable
CREATE TABLE "ApplicationInquiry" (
    "id" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyName" TEXT NOT NULL,
    "contactPersonName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "ApplicationInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApplicationInquiry_applicationId_idx" ON "ApplicationInquiry"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationInquiry_submittedAt_idx" ON "ApplicationInquiry"("submittedAt");

-- AddForeignKey
ALTER TABLE "ApplicationInquiry" ADD CONSTRAINT "ApplicationInquiry_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
