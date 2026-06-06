-- CreateEnum
CREATE TYPE "DesiredSalary" AS ENUM ('EURO_10_12', 'EURO_12_14', 'EURO_15_PLUS');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "desiredSalary" "DesiredSalary" NOT NULL DEFAULT 'EURO_10_12';

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "desiredSalary" DROP DEFAULT;
