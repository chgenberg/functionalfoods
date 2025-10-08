-- AlterTable
ALTER TABLE "KnowledgeDocument" ADD COLUMN     "courses" TEXT[] DEFAULT ARRAY[]::TEXT[];
