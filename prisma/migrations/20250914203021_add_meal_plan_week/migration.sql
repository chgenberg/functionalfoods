-- CreateTable
CREATE TABLE "MealPlanWeek" (
    "id" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "title" TEXT,
    "days" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlanWeek_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealPlanWeek_course_idx" ON "MealPlanWeek"("course");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanWeek_course_weekNumber_key" ON "MealPlanWeek"("course", "weekNumber");
