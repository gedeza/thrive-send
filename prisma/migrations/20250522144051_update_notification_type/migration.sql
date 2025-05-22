/*
  Warnings:

  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CONTENT_SUBMITTED', 'REVIEW_ASSIGNED', 'FEEDBACK_PROVIDED', 'STATUS_CHANGED', 'APPROVAL_REJECTED', 'CONTENT_PUBLISHED');

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");
