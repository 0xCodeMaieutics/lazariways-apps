-- CreateEnum
CREATE TYPE "LearningAppUserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "LearningAppTopicType" AS ENUM ('STARTER', 'BAECKEREI', 'FREIZEIT_PARK');

-- CreateEnum
CREATE TYPE "LearningAppExerciseType" AS ENUM ('CHOOSE_FROM_AUDIO', 'INPUT_FROM_AUDIO', 'CHOOSE_FROM_TEXT', 'INPUT_FROM_TEXT', 'INPUT_SENTENCE_FROM_TEXT', 'CHOOSE_MATCHING_PATTERNS');

-- CreateTable
CREATE TABLE "LearningAppUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "LearningAppUserRole" NOT NULL DEFAULT 'USER',
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningAppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningAppSession" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LearningAppSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningAppAccount" (
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

    CONSTRAINT "LearningAppAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningAppTopic" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "type" "LearningAppTopicType" NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "LearningAppTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningAppExam" (
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

    CONSTRAINT "LearningAppExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningAppUserUnlockedExam" (
    "id" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,

    CONSTRAINT "LearningAppUserUnlockedExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningAppUserExamAggregation" (
    "id" TEXT NOT NULL,
    "attemptedCount" INTEGER NOT NULL DEFAULT 1,
    "passedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPassedAt" TIMESTAMP(3),

    CONSTRAINT "LearningAppUserExamAggregation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningAppUserExam" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctCount" INTEGER NOT NULL,
    "hasPassed" BOOLEAN NOT NULL,
    "passCounted" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,

    CONSTRAINT "LearningAppUserExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningAppExercise" (
    "id" TEXT NOT NULL,
    "type" "LearningAppExerciseType" NOT NULL,
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

    CONSTRAINT "LearningAppExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningAppUser_email_key" ON "LearningAppUser"("email");

-- CreateIndex
CREATE INDEX "LearningAppSession_userId_idx" ON "LearningAppSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningAppSession_token_key" ON "LearningAppSession"("token");

-- CreateIndex
CREATE INDEX "LearningAppAccount_userId_idx" ON "LearningAppAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningAppAccount_issuer_accountId_key" ON "LearningAppAccount"("issuer", "accountId");

-- CreateIndex
CREATE INDEX "LearningAppUserUnlockedExam_userId_idx" ON "LearningAppUserUnlockedExam"("userId");

-- CreateIndex
CREATE INDEX "LearningAppUserUnlockedExam_examId_idx" ON "LearningAppUserUnlockedExam"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningAppUserUnlockedExam_userId_examId_key" ON "LearningAppUserUnlockedExam"("userId", "examId");

-- CreateIndex
CREATE INDEX "LearningAppUserExamAggregation_userId_idx" ON "LearningAppUserExamAggregation"("userId");

-- CreateIndex
CREATE INDEX "LearningAppUserExamAggregation_examId_idx" ON "LearningAppUserExamAggregation"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningAppUserExamAggregation_userId_examId_key" ON "LearningAppUserExamAggregation"("userId", "examId");

-- CreateIndex
CREATE INDEX "LearningAppUserExam_userId_examId_idx" ON "LearningAppUserExam"("userId", "examId");

-- AddForeignKey
ALTER TABLE "LearningAppSession" ADD CONSTRAINT "LearningAppSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "LearningAppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAppAccount" ADD CONSTRAINT "LearningAppAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "LearningAppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAppExam" ADD CONSTRAINT "LearningAppExam_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "LearningAppTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAppExam" ADD CONSTRAINT "LearningAppExam_unlockedId_fkey" FOREIGN KEY ("unlockedId") REFERENCES "LearningAppExam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAppUserUnlockedExam" ADD CONSTRAINT "LearningAppUserUnlockedExam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "LearningAppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAppUserUnlockedExam" ADD CONSTRAINT "LearningAppUserUnlockedExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "LearningAppExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAppUserExamAggregation" ADD CONSTRAINT "LearningAppUserExamAggregation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "LearningAppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAppUserExamAggregation" ADD CONSTRAINT "LearningAppUserExamAggregation_examId_fkey" FOREIGN KEY ("examId") REFERENCES "LearningAppExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAppUserExam" ADD CONSTRAINT "LearningAppUserExam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "LearningAppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAppUserExam" ADD CONSTRAINT "LearningAppUserExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "LearningAppExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAppExercise" ADD CONSTRAINT "LearningAppExercise_examId_fkey" FOREIGN KEY ("examId") REFERENCES "LearningAppExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
