-- CreateEnum
CREATE TYPE "RecipeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "categories" TEXT[],
    "ingredients" TEXT[],
    "instructions" TEXT[],
    "difficulty" TEXT,
    "prepTime" TEXT,
    "cookTime" TEXT,
    "totalTime" TEXT,
    "servings" INTEGER,
    "nutrition" JSONB,
    "tips" TEXT,
    "tags" TEXT[],
    "status" "RecipeStatus" NOT NULL DEFAULT 'PUBLISHED',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_slug_key" ON "Recipe"("slug");

-- CreateIndex
CREATE INDEX "Recipe_status_idx" ON "Recipe"("status");

-- CreateIndex
CREATE INDEX "Recipe_isPremium_idx" ON "Recipe"("isPremium");

-- CreateIndex
CREATE INDEX "Recipe_isFree_idx" ON "Recipe"("isFree");

-- CreateIndex
CREATE INDEX "Recipe_slug_idx" ON "Recipe"("slug");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
