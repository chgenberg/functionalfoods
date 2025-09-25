-- AlterTable
ALTER TABLE "CourseProduct" ADD COLUMN     "basePrice" DOUBLE PRECISION,
ADD COLUMN     "saleEndsAt" TIMESTAMP(3),
ADD COLUMN     "salePrice" DOUBLE PRECISION,
ADD COLUMN     "saleStartsAt" TIMESTAMP(3);
