-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "contentId" TEXT;

-- CreateIndex
CREATE INDEX "CalendarEvent_contentId_idx" ON "CalendarEvent"("contentId");

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;
