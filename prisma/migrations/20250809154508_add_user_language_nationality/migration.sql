-- CreateEnum
CREATE TYPE "Language" AS ENUM ('SV', 'EN', 'ES', 'DE', 'FR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "preferredLanguage" "Language" DEFAULT 'SV';
