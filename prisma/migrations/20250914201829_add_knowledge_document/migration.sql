-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "headerImage" TEXT,
    "relatedImages" JSONB,
    "keyTakeaways" JSONB,
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "course" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "weekNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeDocument_slug_key" ON "KnowledgeDocument"("slug");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_course_idx" ON "KnowledgeDocument"("course");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_order_idx" ON "KnowledgeDocument"("order");
