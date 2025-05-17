/*
  Warnings:

  - You are about to drop the column `audienceAge` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `audienceGender` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `audienceLocation` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `clicks` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `contentType` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `impressions` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `newFollowers` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `audience` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `channel` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `clickRate` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `goals` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `openRate` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `sentDate` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Client` table. All the data in the column will be lost.
  - Made the column `revenue` on table `Analytics` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `email` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_organizationId_fkey";

-- DropIndex
DROP INDEX "Analytics_campaignId_date_idx";

-- DropIndex
DROP INDEX "Analytics_clientId_date_idx";

-- AlterTable
ALTER TABLE "Analytics" DROP COLUMN "audienceAge",
DROP COLUMN "audienceGender",
DROP COLUMN "audienceLocation",
DROP COLUMN "clicks",
DROP COLUMN "contentType",
DROP COLUMN "date",
DROP COLUMN "impressions",
DROP COLUMN "newFollowers",
DROP COLUMN "platform",
ADD COLUMN     "follows" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "new_followers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "revenue" SET NOT NULL,
ALTER COLUMN "clientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "audience",
DROP COLUMN "channel",
DROP COLUMN "clickRate",
DROP COLUMN "goals",
DROP COLUMN "openRate",
DROP COLUMN "sentDate",
ALTER COLUMN "status" SET DEFAULT 'draft';

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "industry",
DROP COLUMN "logoUrl",
DROP COLUMN "type",
DROP COLUMN "website",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "type" TEXT NOT NULL DEFAULT 'email',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "projectId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Content_userId_idx" ON "Content"("userId");

-- CreateIndex
CREATE INDEX "Content_scheduledFor_idx" ON "Content"("scheduledFor");

-- CreateIndex
CREATE INDEX "Content_projectId_idx" ON "Content"("projectId");

-- CreateIndex
CREATE INDEX "Analytics_timestamp_idx" ON "Analytics"("timestamp");

-- CreateIndex
CREATE INDEX "Analytics_campaignId_idx" ON "Analytics"("campaignId");

-- CreateIndex
CREATE INDEX "Analytics_clientId_idx" ON "Analytics"("clientId");

-- CreateIndex
CREATE INDEX "Client_organizationId_idx" ON "Client"("organizationId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
