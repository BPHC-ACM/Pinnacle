/*
  Warnings:

  - You are about to drop the column `parentMobileNumber` on the `UserDetails` table. All the data in the column will be lost.
  - You are about to drop the column `parentName` on the `UserDetails` table. All the data in the column will be lost.
  - Added the required column `city` to the `UserDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherJobPosition` to the `UserDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherJobSector` to the `UserDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherMobileNumber` to the `UserDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherName` to the `UserDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherJobPosition` to the `UserDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherJobSector` to the `UserDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherMobileNumber` to the `UserDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherName` to the `UserDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pinCode` to the `UserDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserDetails" DROP COLUMN "parentMobileNumber",
DROP COLUMN "parentName",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "fatherJobPosition" TEXT NOT NULL,
ADD COLUMN     "fatherJobSector" TEXT NOT NULL,
ADD COLUMN     "fatherMobileNumber" TEXT NOT NULL,
ADD COLUMN     "fatherName" TEXT NOT NULL,
ADD COLUMN     "motherJobPosition" TEXT NOT NULL,
ADD COLUMN     "motherJobSector" TEXT NOT NULL,
ADD COLUMN     "motherMobileNumber" TEXT NOT NULL,
ADD COLUMN     "motherName" TEXT NOT NULL,
ADD COLUMN     "pinCode" TEXT NOT NULL;
