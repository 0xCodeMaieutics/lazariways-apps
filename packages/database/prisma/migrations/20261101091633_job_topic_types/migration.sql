/*
  Warnings:

  - The values [BAECKEREI,FREIZEIT_PARK,GARTEN_LANDSCHAFTBAU,HOTEL] on the enum `TopicType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "lazari_lingo"."TopicType_new" AS ENUM ('STARTER', 'BAECKER', 'KOCH', 'KELLNER', 'MASSEUR');
ALTER TABLE "lazari_lingo"."Topic" ALTER COLUMN "type" TYPE "lazari_lingo"."TopicType_new" USING ("type"::text::"lazari_lingo"."TopicType_new");
ALTER TYPE "lazari_lingo"."TopicType" RENAME TO "TopicType_old";
ALTER TYPE "lazari_lingo"."TopicType_new" RENAME TO "TopicType";
DROP TYPE "lazari_lingo"."TopicType_old";
COMMIT;
