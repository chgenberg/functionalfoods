-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "communityDescription" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "downloads" JSONB,
ADD COLUMN     "enableCommunity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "introVideoUrl" TEXT,
ADD COLUMN     "materials" JSONB,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "objectives" TEXT[],
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "targetAudience" TEXT,
ADD COLUMN     "weeks" JSONB,
ADD COLUMN     "welcomeMessage" TEXT;
