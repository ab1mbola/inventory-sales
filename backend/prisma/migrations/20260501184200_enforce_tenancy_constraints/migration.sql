-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT IF EXISTS "Customer_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerPayment" DROP CONSTRAINT IF EXISTS "CustomerPayment_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT IF EXISTS "Expense_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT IF EXISTS "Sale_companyId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_companyId_fkey";

-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "Customer_phone_key";

-- DropIndex
DROP INDEX "Product_sku_key";

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "CustomerPayment" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Sale" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "companyId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Category_companyId_name_key" ON "Category"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_companyId_phone_key" ON "Customer"("companyId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Product_companyId_sku_key" ON "Product"("companyId", "sku");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
