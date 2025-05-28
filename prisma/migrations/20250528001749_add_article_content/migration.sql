/*
  Warnings:

  - You are about to drop the column `contentType` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CalendarEvent` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `CalendarEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `CalendarEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `CalendarEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_userId_fkey";

-- DropIndex
DROP INDEX "CalendarEvent_userId_idx";

-- AlterTable
ALTER TABLE "CalendarEvent" DROP COLUMN "contentType",
DROP COLUMN "date",
DROP COLUMN "time",
DROP COLUMN "userId",
ADD COLUMN     "analytics" JSONB,
ADD COLUMN     "articleContent" JSONB,
ADD COLUMN     "blogPost" JSONB,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "customContent" JSONB,
ADD COLUMN     "emailCampaign" JSONB,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "CalendarEvent_createdBy_idx" ON "CalendarEvent"("createdBy");

-- CreateIndex
CREATE INDEX "CalendarEvent_startTime_idx" ON "CalendarEvent"("startTime");

-- CreateIndex
CREATE INDEX "CalendarEvent_type_idx" ON "CalendarEvent"("type");

-- CreateIndex
CREATE INDEX "CalendarEvent_status_idx" ON "CalendarEvent"("status");

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
