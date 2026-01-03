-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deviceTokens" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
