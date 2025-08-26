-- CreateTable
CREATE TABLE "MealProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseType" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "mealIndex" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealProgress_userId_idx" ON "MealProgress"("userId");

-- CreateIndex
CREATE INDEX "MealProgress_courseType_idx" ON "MealProgress"("courseType");

-- CreateIndex
CREATE INDEX "MealProgress_weekNumber_idx" ON "MealProgress"("weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MealProgress_userId_courseType_weekNumber_dayNumber_mealInd_key" ON "MealProgress"("userId", "courseType", "weekNumber", "dayNumber", "mealIndex");

-- AddForeignKey
ALTER TABLE "MealProgress" ADD CONSTRAINT "MealProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
