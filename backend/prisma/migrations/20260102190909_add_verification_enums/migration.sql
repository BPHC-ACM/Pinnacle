/*
  Warnings:

  - You are about to drop the column `isVerified` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Education` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `PositionOfResponsibility` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('DRAFT', 'SUBMITTED_FOR_REVIEW', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "Accomplishment" ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Certification" DROP COLUMN "isVerified",
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Education" DROP COLUMN "isVerified",
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "isVerified",
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "PositionOfResponsibility" DROP COLUMN "isVerified",
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "isVerified",
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "isVerified",
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isVerified",
ADD COLUMN     "profileStatus" "ProfileStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';
