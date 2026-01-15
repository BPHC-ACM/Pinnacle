/*
  Warnings:

  - Added the required column `placementCycleId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlacementCycleType" AS ENUM ('PLACEMENT', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "placementCycleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "description" DROP DEFAULT;

-- CreateTable
CREATE TABLE "PlacementCycle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PlacementCycleType" NOT NULL,
    "academicYear" TEXT NOT NULL,
    "status" "CycleStatus" NOT NULL DEFAULT 'UPCOMING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlacementCycleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlacementCycleToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "PlacementCycle_status_idx" ON "PlacementCycle"("status");

-- CreateIndex
CREATE INDEX "_PlacementCycleToUser_B_index" ON "_PlacementCycleToUser"("B");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_placementCycleId_fkey" FOREIGN KEY ("placementCycleId") REFERENCES "PlacementCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlacementCycleToUser" ADD CONSTRAINT "_PlacementCycleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "PlacementCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlacementCycleToUser" ADD CONSTRAINT "_PlacementCycleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
