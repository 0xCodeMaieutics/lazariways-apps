-- CreateTable
CREATE TABLE "lazari_lingo"."ExerciseMatchingPair" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "exerciseId" TEXT NOT NULL,

    CONSTRAINT "ExerciseMatchingPair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseMatchingPair_exerciseId_idx" ON "lazari_lingo"."ExerciseMatchingPair"("exerciseId");

-- AddForeignKey
ALTER TABLE "lazari_lingo"."ExerciseMatchingPair" ADD CONSTRAINT "ExerciseMatchingPair_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "lazari_lingo"."Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
