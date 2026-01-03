/*
  Warnings:

  - The `completionDate` column on the `Course` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `endDate` column on the `Education` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `endDate` column on the `Experience` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `startDate` column on the `Extracurricular` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `endDate` column on the `Extracurricular` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `endDate` column on the `PositionOfResponsibility` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `date` on the `Accomplishment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `date` on the `Certification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `startDate` on the `Education` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `startDate` on the `Experience` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `startDate` on the `PositionOfResponsibility` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Accomplishment" DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Certification" DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "completionDate",
ADD COLUMN     "completionDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Education" DROP COLUMN "startDate",
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endDate",
ADD COLUMN     "endDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "startDate",
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endDate",
ADD COLUMN     "endDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Extracurricular" DROP COLUMN "startDate",
ADD COLUMN     "startDate" TIMESTAMP(3),
DROP COLUMN "endDate",
ADD COLUMN     "endDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PositionOfResponsibility" DROP COLUMN "startDate",
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endDate",
ADD COLUMN     "endDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_createdAt_idx" ON "Announcement"("createdAt");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
