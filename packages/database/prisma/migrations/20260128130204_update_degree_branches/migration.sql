-- AlterTable
ALTER TABLE "UserDetails" ADD COLUMN     "beBranch" TEXT,
ADD COLUMN     "mscBranch" TEXT,
ALTER COLUMN "branch" DROP NOT NULL;
