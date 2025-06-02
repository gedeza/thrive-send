-- CreateTable
CREATE TABLE "CampaignPerformance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "channel" TEXT,
    "metrics" JSONB[],
    "timeSeriesData" JSONB[],

    CONSTRAINT "CampaignPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignPerformance_campaignId_idx" ON "CampaignPerformance"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignPerformance_date_idx" ON "CampaignPerformance"("date");

-- AddForeignKey
ALTER TABLE "CampaignPerformance" ADD CONSTRAINT "CampaignPerformance_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
