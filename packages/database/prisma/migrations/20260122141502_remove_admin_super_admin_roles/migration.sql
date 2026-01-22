/*
  Warnings:

  - The values [ADMIN,SUPER_ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `interviewEndDate` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `interviewStartDate` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `joiningDate` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `offerDate` on the `Job` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('USER', 'JPT', 'SPT');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TABLE "AdminRole" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "interviewEndDate",
DROP COLUMN "interviewStartDate",
DROP COLUMN "joiningDate",
DROP COLUMN "offerDate",
ADD COLUMN     "interviewDate" TIMESTAMP(3),
ADD COLUMN     "selectionStatus" TEXT DEFAULT 'PENDING';
