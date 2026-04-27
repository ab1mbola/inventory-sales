-- AlterEnum
ALTER TYPE "PaymentType" ADD VALUE 'CREDIT';

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "amountReceived" DECIMAL(10,2),
ADD COLUMN     "changeAmount" DECIMAL(10,2),
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT;
