-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewSource" AS ENUM ('IN_APP', 'EMAIL');

-- CreateTable
CREATE TABLE "CourseReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "rating" INTEGER,
    "answers" JSONB NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL DEFAULT 'course-feedback',
    "source" "ReviewSource" NOT NULL DEFAULT 'IN_APP',
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseReview_courseId_idx" ON "CourseReview"("courseId");

-- CreateIndex
CREATE INDEX "CourseReview_status_idx" ON "CourseReview"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CourseReview_userId_courseId_key" ON "CourseReview"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
