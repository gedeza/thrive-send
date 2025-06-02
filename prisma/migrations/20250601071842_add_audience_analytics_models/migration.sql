/*
  Warnings:

  - You are about to drop the column `engagementRate` on the `AudienceAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `growthRate` on the `AudienceAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `metrics` on the `AudienceAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `segmentMetrics` on the `AudienceAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `AudienceAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `Engagement` table. All the data in the column will be lost.
  - You are about to drop the column `sentiment` on the `Engagement` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Engagement` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Engagement` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[demographicsId]` on the table `AudienceAnalytics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[behavioralId]` on the table `AudienceAnalytics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[engagementId]` on the table `AudienceAnalytics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `behavioralId` to the `AudienceAnalytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignId` to the `AudienceAnalytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `demographicsId` to the `AudienceAnalytics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AudienceAnalytics" DROP COLUMN "engagementRate",
DROP COLUMN "growthRate",
DROP COLUMN "metrics",
DROP COLUMN "segmentMetrics",
DROP COLUMN "timestamp",
ADD COLUMN     "behavioralId" TEXT NOT NULL,
ADD COLUMN     "campaignId" TEXT NOT NULL,
ADD COLUMN     "demographicsId" TEXT NOT NULL,
ADD COLUMN     "engagementId" TEXT;

-- AlterTable
ALTER TABLE "Engagement" DROP COLUMN "externalId",
DROP COLUMN "sentiment",
DROP COLUMN "text",
DROP COLUMN "type",
ADD COLUMN     "clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "conversions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastEngagement" TIMESTAMP(3),
ADD COLUMN     "opens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Demographics" (
    "id" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "gender" TEXT,
    "language" TEXT,
    "interests" TEXT[],

    CONSTRAINT "Demographics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Behavioral" (
    "id" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "opens" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "bounceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeOnSite" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Behavioral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AudienceAnalytics_demographicsId_key" ON "AudienceAnalytics"("demographicsId");

-- CreateIndex
CREATE UNIQUE INDEX "AudienceAnalytics_behavioralId_key" ON "AudienceAnalytics"("behavioralId");

-- CreateIndex
CREATE UNIQUE INDEX "AudienceAnalytics_engagementId_key" ON "AudienceAnalytics"("engagementId");

-- CreateIndex
CREATE INDEX "AudienceAnalytics_campaignId_idx" ON "AudienceAnalytics"("campaignId");

-- AddForeignKey
ALTER TABLE "AudienceAnalytics" ADD CONSTRAINT "AudienceAnalytics_demographicsId_fkey" FOREIGN KEY ("demographicsId") REFERENCES "Demographics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceAnalytics" ADD CONSTRAINT "AudienceAnalytics_behavioralId_fkey" FOREIGN KEY ("behavioralId") REFERENCES "Behavioral"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceAnalytics" ADD CONSTRAINT "AudienceAnalytics_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceAnalytics" ADD CONSTRAINT "AudienceAnalytics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
