-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "searchText" TEXT;

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "searchText" TEXT;

-- CreateIndex
CREATE INDEX "BlogPost_searchText_idx" ON "BlogPost"("searchText");

-- CreateIndex
CREATE INDEX "Recipe_searchText_idx" ON "Recipe"("searchText");
