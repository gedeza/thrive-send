/*
  Warnings:

  - You are about to drop the column `schedule` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ReportExport` table. All the data in the column will be lost.
  - You are about to drop the column `permissions` on the `ReportShare` table. All the data in the column will be lost.
  - Added the required column `campaignId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sections` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Made the column `url` on table `ReportExport` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_organizationId_fkey";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "schedule",
DROP COLUMN "status",
DROP COLUMN "template",
DROP COLUMN "type",
ADD COLUMN     "campaignId" TEXT NOT NULL,
ADD COLUMN     "sections" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "ReportExport" DROP COLUMN "status",
ALTER COLUMN "url" SET NOT NULL;

-- AlterTable
ALTER TABLE "ReportShare" DROP COLUMN "permissions";

-- CreateIndex
CREATE INDEX "Report_campaignId_idx" ON "Report"("campaignId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
