-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "content_de" TEXT,
ADD COLUMN     "content_en" TEXT,
ADD COLUMN     "content_es" TEXT,
ADD COLUMN     "content_fr" TEXT,
ADD COLUMN     "excerpt_de" TEXT,
ADD COLUMN     "excerpt_en" TEXT,
ADD COLUMN     "excerpt_es" TEXT,
ADD COLUMN     "excerpt_fr" TEXT,
ADD COLUMN     "title_de" TEXT,
ADD COLUMN     "title_en" TEXT,
ADD COLUMN     "title_es" TEXT,
ADD COLUMN     "title_fr" TEXT;

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "excerpt_de" TEXT,
ADD COLUMN     "excerpt_en" TEXT,
ADD COLUMN     "excerpt_es" TEXT,
ADD COLUMN     "excerpt_fr" TEXT,
ADD COLUMN     "instructions_de" TEXT,
ADD COLUMN     "instructions_en" TEXT,
ADD COLUMN     "instructions_es" TEXT,
ADD COLUMN     "instructions_fr" TEXT,
ADD COLUMN     "title_de" TEXT,
ADD COLUMN     "title_en" TEXT,
ADD COLUMN     "title_es" TEXT,
ADD COLUMN     "title_fr" TEXT;
