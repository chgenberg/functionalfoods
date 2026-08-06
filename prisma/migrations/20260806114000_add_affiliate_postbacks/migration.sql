-- CreateTable
CREATE TABLE "AffiliatePostback" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payload" JSONB,
    "response" TEXT,
    "error" TEXT,
    "statusCode" INTEGER,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliatePostback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AffiliatePostback_orderId_provider_key" ON "AffiliatePostback"("orderId", "provider");

-- CreateIndex
CREATE INDEX "AffiliatePostback_provider_status_idx" ON "AffiliatePostback"("provider", "status");

-- AddForeignKey
ALTER TABLE "AffiliatePostback" ADD CONSTRAINT "AffiliatePostback_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
