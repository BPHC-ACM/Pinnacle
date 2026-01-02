/*
  Warnings:

  - You are about to drop the column `field` on the `Education` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `github` on the `Project` table. All the data in the column will be lost.
  - Added the required column `branch` to the `Education` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `proficiency` on the `Language` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('ALL_SECTORS', 'ANALYTICS', 'CONSULTING', 'COMPUTER_SCIENCE_SOFTWARE_IT', 'E_COMMERCE', 'EDUCATION', 'ENGINEERING_TECHNOLOGY', 'FINANCE_BFSI', 'FMCG', 'HEALTHCARE', 'MEDIA_ENTERTAINMENT', 'RESEARCH_DEVELOPMENT', 'TELECOM', 'ENERGY', 'MANUFACTURING_TECHNOLOGY', 'OTHERS');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'NATIVE');

-- AlterTable
ALTER TABLE "Education" DROP COLUMN "field",
ADD COLUMN     "branch" TEXT NOT NULL,
ADD COLUMN     "rollNumber" TEXT;

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "salaryRange" TEXT,
ADD COLUMN     "sector" "Sector";

-- AlterTable
ALTER TABLE "Language" DROP COLUMN "proficiency",
ADD COLUMN     "proficiency" "ProficiencyLevel" NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "description",
DROP COLUMN "github",
ADD COLUMN     "repoUrl" TEXT;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "proficiency" "ProficiencyLevel";
