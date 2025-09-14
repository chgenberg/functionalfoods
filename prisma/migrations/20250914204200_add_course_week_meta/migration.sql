-- CreateTable
CREATE TABLE "CourseWeekMeta" (
    "id" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "weekTitle" TEXT,
    "weekSubtitle" TEXT,
    "heroImage" TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseWeekMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseWeekMeta_course_idx" ON "CourseWeekMeta"("course");

-- CreateIndex
CREATE UNIQUE INDEX "CourseWeekMeta_course_weekNumber_key" ON "CourseWeekMeta"("course", "weekNumber");
