/*
  Warnings:

  - You are about to drop the `trial` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "descriptionDocument" TEXT;

-- DropTable
DROP TABLE "trial";

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
