/*
  Warnings:

  - You are about to drop the column `highlights` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `highlights` on the `PositionOfResponsibility` table. All the data in the column will be lost.
  - You are about to drop the column `outcomes` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "highlights";

-- AlterTable
ALTER TABLE "PositionOfResponsibility" DROP COLUMN "highlights";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "outcomes";
