-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "enrolledSince" DATE,
ADD COLUMN     "expectedStudyEnd" DATE,
ADD COLUMN     "standardStudyPeriodYears" DOUBLE PRECISION,
ADD COLUMN     "studiesContinueAfterSemesterBreak" BOOLEAN;
