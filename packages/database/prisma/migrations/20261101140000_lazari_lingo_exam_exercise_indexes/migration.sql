-- CreateIndex
CREATE INDEX "Exam_topicId_enabled_idx" ON "lazari_lingo"."Exam"("topicId", "enabled");

-- CreateIndex
CREATE INDEX "Exercise_examId_idx" ON "lazari_lingo"."Exercise"("examId");
