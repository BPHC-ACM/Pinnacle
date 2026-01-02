/*
  Warnings:

  - Added the required column `verificationDoc` to the `PositionOfResponsibility` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PositionOfResponsibility" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationDoc" TEXT NOT NULL;
