-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "instructions" DROP NOT NULL,
ALTER COLUMN "instructions" SET DATA TYPE TEXT;
