-- AlterTable
ALTER TABLE "Accomplishment" ADD COLUMN     "verificationDoc" TEXT;

-- AlterTable
ALTER TABLE "Certification" ADD COLUMN     "verificationDoc" TEXT;

-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "verificationDoc" TEXT;

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "verificationDoc" TEXT;

-- AlterTable
ALTER TABLE "PositionOfResponsibility" ALTER COLUMN "verificationDoc" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "verificationDoc" TEXT;
