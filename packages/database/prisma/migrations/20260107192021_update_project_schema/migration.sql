/*
  Warnings:

  - You are about to drop the column `highlights` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `repoUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `technologies` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Project` table. All the data in the column will be lost.
  - Added the required column `description` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domain` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "highlights",
DROP COLUMN "name",
DROP COLUMN "repoUrl",
DROP COLUMN "technologies",
DROP COLUMN "url",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "domain" TEXT NOT NULL,
ADD COLUMN     "outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "referenceUrl" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "tools" TEXT[] DEFAULT ARRAY[]::TEXT[];
