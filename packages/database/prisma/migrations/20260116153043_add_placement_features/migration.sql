/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('OA', 'PPT', 'INTERVIEW');

-- AlterEnum
ALTER TYPE "JobStatus" ADD VALUE 'PAUSED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE 'JPT';
ALTER TYPE "UserRole" ADD VALUE 'SPT';

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "interviewEndDate" TIMESTAMP(3),
ADD COLUMN     "interviewInstructions" TEXT,
ADD COLUMN     "interviewStartDate" TIMESTAMP(3),
ADD COLUMN     "interviewVenue" TEXT,
ADD COLUMN     "joiningDate" TIMESTAMP(3),
ADD COLUMN     "oaDate" TIMESTAMP(3),
ADD COLUMN     "oaInstructions" TEXT,
ADD COLUMN     "oaVenue" TEXT,
ADD COLUMN     "offerDate" TIMESTAMP(3),
ADD COLUMN     "pptDate" TIMESTAMP(3),
ADD COLUMN     "pptInstructions" TEXT,
ADD COLUMN     "pptVenue" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "branch" TEXT,
ADD COLUMN     "currentYear" INTEGER,
ADD COLUMN     "isFrozen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentEmail" TEXT,
ADD COLUMN     "parentName" TEXT,
ADD COLUMN     "parentPhone" TEXT,
ADD COLUMN     "parentRelation" TEXT,
ADD COLUMN     "studentId" TEXT;

-- CreateTable
CREATE TABLE "MarkSheet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobEligibility" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "minCgpa" DOUBLE PRECISION,
    "maxActiveBacklogs" INTEGER,
    "maxTotalBacklogs" INTEGER,
    "allowedBranches" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedYears" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "customCriteria" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobEligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" "AttendanceType" NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "markedBy" TEXT,
    "markedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarkSheet_userId_idx" ON "MarkSheet"("userId");

-- CreateIndex
CREATE INDEX "MarkSheet_userId_term_academicYear_idx" ON "MarkSheet"("userId", "term", "academicYear");

-- CreateIndex
CREATE INDEX "JobEligibility_jobId_idx" ON "JobEligibility"("jobId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_jobId_idx" ON "AttendanceRecord"("jobId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_userId_idx" ON "AttendanceRecord"("userId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_eventType_idx" ON "AttendanceRecord"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_jobId_userId_eventType_key" ON "AttendanceRecord"("jobId", "userId", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "User_studentId_key" ON "User"("studentId");

-- CreateIndex
CREATE INDEX "User_studentId_idx" ON "User"("studentId");

-- CreateIndex
CREATE INDEX "User_isFrozen_idx" ON "User"("isFrozen");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkSheet" ADD CONSTRAINT "MarkSheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobEligibility" ADD CONSTRAINT "JobEligibility_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
