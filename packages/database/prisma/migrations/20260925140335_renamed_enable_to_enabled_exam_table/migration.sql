/*
  Warnings:

  - You are about to drop the column `enable` on the `Exam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lazari_lingo"."Exam" DROP COLUMN "enable",
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false;
