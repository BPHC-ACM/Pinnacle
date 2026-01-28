/*
  Warnings:

  - You are about to drop the column `parentEmail` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `parentName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `parentPhone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `parentRelation` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "parentEmail",
DROP COLUMN "parentName",
DROP COLUMN "parentPhone",
DROP COLUMN "parentRelation";
