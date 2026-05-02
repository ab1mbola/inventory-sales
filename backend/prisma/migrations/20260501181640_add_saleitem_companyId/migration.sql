-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN "companyId" TEXT;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "SaleItem_companyId_idx" ON "SaleItem"("companyId");
