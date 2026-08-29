-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "lazari_lingo";

-- CreateEnum
CREATE TYPE "lazari_lingo"."UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "lazari_lingo"."TopicType" AS ENUM ('STARTER', 'BAECKEREI', 'FREIZEIT_PARK');

-- CreateEnum
CREATE TYPE "lazari_lingo"."ExerciseType" AS ENUM ('CHOOSE_FROM_AUDIO', 'INPUT_FROM_AUDIO', 'CHOOSE_FROM_TEXT', 'INPUT_FROM_TEXT', 'INPUT_SENTENCE_FROM_TEXT', 'CHOOSE_MATCHING_PATTERNS');

-- CreateTable
CREATE TABLE "lazari_lingo"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "lazari_lingo"."UserRole" NOT NULL DEFAULT 'USER',
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lazari_lingo"."Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lazari_lingo"."Account" (
    "id" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lazari_lingo"."Topic" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "type" "lazari_lingo"."TopicType" NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lazari_lingo"."Exam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enable" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "estimatedTimeInMinutes" INTEGER,
    "minimumCorrectAnswerCount" INTEGER NOT NULL DEFAULT 1,
    "minimumPassedCount" INTEGER NOT NULL DEFAULT 1,
    "waitUntilPassAllowedInSeconds" INTEGER NOT NULL DEFAULT 14400,
    "topicId" TEXT NOT NULL,
    "unlockedId" TEXT,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lazari_lingo"."UserUnlockedExam" (
    "id" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,

    CONSTRAINT "UserUnlockedExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lazari_lingo"."UserExamAggregation" (
    "id" TEXT NOT NULL,
    "attemptedCount" INTEGER NOT NULL DEFAULT 1,
    "passedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPassedAt" TIMESTAMP(3),

    CONSTRAINT "UserExamAggregation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lazari_lingo"."UserExam" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctCount" INTEGER NOT NULL,
    "hasPassed" BOOLEAN NOT NULL,
    "passCounted" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,

    CONSTRAINT "UserExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lazari_lingo"."Exercise" (
    "id" TEXT NOT NULL,
    "type" "lazari_lingo"."ExerciseType" NOT NULL,
    "prompt" TEXT,
    "text" TEXT,
    "audioUrl" TEXT,
    "slowAudioUrl" TEXT,
    "options" TEXT[],
    "correctOptionIndex" INTEGER[],
    "allowsMultipleCorrectOptions" BOOLEAN DEFAULT false,
    "correctInputs" TEXT[],
    "order" INTEGER NOT NULL,
    "examId" TEXT,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "lazari_lingo"."User"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "lazari_lingo"."Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "lazari_lingo"."Session"("token");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "lazari_lingo"."Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_issuer_accountId_key" ON "lazari_lingo"."Account"("issuer", "accountId");

-- CreateIndex
CREATE INDEX "UserUnlockedExam_userId_idx" ON "lazari_lingo"."UserUnlockedExam"("userId");

-- CreateIndex
CREATE INDEX "UserUnlockedExam_examId_idx" ON "lazari_lingo"."UserUnlockedExam"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "UserUnlockedExam_userId_examId_key" ON "lazari_lingo"."UserUnlockedExam"("userId", "examId");

-- CreateIndex
CREATE INDEX "UserExamAggregation_userId_idx" ON "lazari_lingo"."UserExamAggregation"("userId");

-- CreateIndex
CREATE INDEX "UserExamAggregation_examId_idx" ON "lazari_lingo"."UserExamAggregation"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "UserExamAggregation_userId_examId_key" ON "lazari_lingo"."UserExamAggregation"("userId", "examId");

-- CreateIndex
CREATE INDEX "UserExam_userId_examId_idx" ON "lazari_lingo"."UserExam"("userId", "examId");

-- AddForeignKey
ALTER TABLE "lazari_lingo"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "lazari_lingo"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lazari_lingo"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "lazari_lingo"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lazari_lingo"."Exam" ADD CONSTRAINT "Exam_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "lazari_lingo"."Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lazari_lingo"."Exam" ADD CONSTRAINT "Exam_unlockedId_fkey" FOREIGN KEY ("unlockedId") REFERENCES "lazari_lingo"."Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lazari_lingo"."UserUnlockedExam" ADD CONSTRAINT "UserUnlockedExam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "lazari_lingo"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lazari_lingo"."UserUnlockedExam" ADD CONSTRAINT "UserUnlockedExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "lazari_lingo"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lazari_lingo"."UserExamAggregation" ADD CONSTRAINT "UserExamAggregation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "lazari_lingo"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lazari_lingo"."UserExamAggregation" ADD CONSTRAINT "UserExamAggregation_examId_fkey" FOREIGN KEY ("examId") REFERENCES "lazari_lingo"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lazari_lingo"."UserExam" ADD CONSTRAINT "UserExam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "lazari_lingo"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lazari_lingo"."UserExam" ADD CONSTRAINT "UserExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "lazari_lingo"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lazari_lingo"."Exercise" ADD CONSTRAINT "Exercise_examId_fkey" FOREIGN KEY ("examId") REFERENCES "lazari_lingo"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
