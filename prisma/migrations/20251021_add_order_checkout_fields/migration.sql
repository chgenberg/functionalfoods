-- AlterTable
ALTER TABLE "Order" ADD COLUMN "checkoutOrderId" TEXT,
ADD COLUMN "customerEmail" TEXT,
ADD COLUMN "customerName" TEXT,
ADD COLUMN "metadata" JSONB;

-- CreateIndex
CREATE INDEX "Order_checkoutOrderId_idx" ON "Order"("checkoutOrderId");

