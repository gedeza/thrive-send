-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CampaignStatus" ADD VALUE 'SCHEDULED';
ALTER TYPE "CampaignStatus" ADD VALUE 'SENT';
ALTER TYPE "CampaignStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "audience" TEXT,
ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'Email',
ADD COLUMN     "clickRate" TEXT,
ADD COLUMN     "openRate" TEXT,
ADD COLUMN     "sentDate" TIMESTAMP(3),
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Campaign_organizationId_idx" ON "Campaign"("organizationId");

-- CreateIndex
CREATE INDEX "Campaign_clientId_idx" ON "Campaign"("clientId");

-- CreateIndex
CREATE INDEX "Campaign_projectId_idx" ON "Campaign"("projectId");
