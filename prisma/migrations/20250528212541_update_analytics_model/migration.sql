/*
  Warnings:

  - You are about to drop the column `date` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `healthScore` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `nps` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `CampaignTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `CampaignTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `CampaignTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `previewImage` on the `CampaignTemplate` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `CampaignTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `CampaignTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CampaignTemplate" DROP CONSTRAINT "CampaignTemplate_authorId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignTemplate" DROP CONSTRAINT "CampaignTemplate_organizationId_fkey";

-- DropIndex
DROP INDEX "Analytics_clientId_date_idx";

-- DropIndex
DROP INDEX "Analytics_clientId_healthScore_idx";

-- DropIndex
DROP INDEX "CampaignTemplate_authorId_idx";

-- AlterTable
ALTER TABLE "Analytics" DROP COLUMN "date",
DROP COLUMN "healthScore",
DROP COLUMN "nps",
ADD COLUMN     "campaignId" TEXT;

-- AlterTable
ALTER TABLE "CampaignTemplate" DROP COLUMN "authorId",
DROP COLUMN "category",
DROP COLUMN "lastUpdated",
DROP COLUMN "previewImage",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Analytics_clientId_idx" ON "Analytics"("clientId");

-- CreateIndex
CREATE INDEX "Analytics_campaignId_idx" ON "Analytics"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignTemplate_userId_idx" ON "CampaignTemplate"("userId");

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTemplate" ADD CONSTRAINT "CampaignTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTemplate" ADD CONSTRAINT "CampaignTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
