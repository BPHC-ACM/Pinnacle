-- CreateEnum
CREATE TYPE "AccomplishmentType" AS ENUM ('AWARD', 'CERTIFICATION', 'COMPETITION', 'CONFERENCE', 'TEST_SCORE', 'PATENT', 'PUBLICATION', 'SCHOLARSHIP');

-- CreateTable
CREATE TABLE "Accomplishment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AccomplishmentType" NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "date" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "metadata" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Accomplishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extracurricular" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "role" TEXT,
    "organization" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Extracurricular_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionOfResponsibility" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PositionOfResponsibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "completionDate" TEXT,
    "grade" TEXT,
    "description" TEXT,
    "url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Accomplishment_userId_idx" ON "Accomplishment"("userId");

-- CreateIndex
CREATE INDEX "Accomplishment_type_idx" ON "Accomplishment"("type");

-- CreateIndex
CREATE INDEX "Accomplishment_deletedAt_idx" ON "Accomplishment"("deletedAt");

-- CreateIndex
CREATE INDEX "Extracurricular_userId_idx" ON "Extracurricular"("userId");

-- CreateIndex
CREATE INDEX "Extracurricular_deletedAt_idx" ON "Extracurricular"("deletedAt");

-- CreateIndex
CREATE INDEX "PositionOfResponsibility_userId_idx" ON "PositionOfResponsibility"("userId");

-- CreateIndex
CREATE INDEX "PositionOfResponsibility_deletedAt_idx" ON "PositionOfResponsibility"("deletedAt");

-- CreateIndex
CREATE INDEX "Course_userId_idx" ON "Course"("userId");

-- CreateIndex
CREATE INDEX "Course_deletedAt_idx" ON "Course"("deletedAt");

-- AddForeignKey
ALTER TABLE "Accomplishment" ADD CONSTRAINT "Accomplishment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extracurricular" ADD CONSTRAINT "Extracurricular_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionOfResponsibility" ADD CONSTRAINT "PositionOfResponsibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
