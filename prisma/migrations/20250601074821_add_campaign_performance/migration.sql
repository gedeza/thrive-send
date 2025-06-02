/*
  Warnings:

  - You are about to drop the `CampaignPerformance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CampaignPerformance" DROP CONSTRAINT "CampaignPerformance_campaignId_fkey";

-- DropTable
DROP TABLE "CampaignPerformance";
