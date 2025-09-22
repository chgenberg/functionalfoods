-- AlterTable
ALTER TABLE "CourseWeekMeta" ADD COLUMN     "keyTakeaways" JSONB,
ADD COLUMN     "mainContent" TEXT,
ADD COLUMN     "reflectionQuestions" JSONB,
ADD COLUMN     "weeklyChallenge" TEXT,
ADD COLUMN     "welcomeMessage" TEXT;
