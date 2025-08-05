-- Migration: Add Recommendation Network Schema
-- Date: 2025-01-05
-- Description: Adds tables and indexes for newsletter recommendation network system

-- Newsletter table (extending existing or creating if needed)
CREATE TABLE IF NOT EXISTS "Newsletter" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "clientId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetAudience" JSONB DEFAULT '{}',
    "subscriberCount" INTEGER DEFAULT 0,
    "averageOpenRate" DOUBLE PRECISION DEFAULT 0.0,
    "isActiveForRecommendations" BOOLEAN DEFAULT true,
    "recommendationWeight" DOUBLE PRECISION DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

-- NewsletterRecommendation table
CREATE TABLE IF NOT EXISTS "NewsletterRecommendation" (
    "id" TEXT NOT NULL,
    "fromNewsletterId" TEXT NOT NULL,
    "toNewsletterId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "type" TEXT NOT NULL DEFAULT 'ONE_WAY',
    "priority" INTEGER NOT NULL DEFAULT 5,
    "targetAudienceOverlap" DOUBLE PRECISION DEFAULT 0.0,
    "estimatedReach" INTEGER DEFAULT 0,
    "endDate" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterRecommendation_pkey" PRIMARY KEY ("id")
);

-- RecommendationPerformance table
CREATE TABLE IF NOT EXISTS "RecommendationPerformance" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'DAILY',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "impressions" INTEGER DEFAULT 0,
    "clicks" INTEGER DEFAULT 0,
    "conversions" INTEGER DEFAULT 0,
    "revenue" DOUBLE PRECISION DEFAULT 0.0,
    "ctr" DOUBLE PRECISION DEFAULT 0.0,
    "conversionRate" DOUBLE PRECISION DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationPerformance_pkey" PRIMARY KEY ("id")
);

-- RecommendationSettings table
CREATE TABLE IF NOT EXISTS "RecommendationSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "isNetworkActive" BOOLEAN DEFAULT true,
    "autoAcceptRecommendations" BOOLEAN DEFAULT false,
    "maxRecommendationsPerNewsletter" INTEGER DEFAULT 10,
    "minAudienceOverlap" DOUBLE PRECISION DEFAULT 10.0,
    "revSharePercentage" DOUBLE PRECISION DEFAULT 0.0,
    "qualityThreshold" DOUBLE PRECISION DEFAULT 3.0,
    "preferredCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedOrganizations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationSettings_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "Newsletter" 
ADD CONSTRAINT "Newsletter_clientId_fkey" 
FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Newsletter" 
ADD CONSTRAINT "Newsletter_organizationId_fkey" 
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NewsletterRecommendation" 
ADD CONSTRAINT "NewsletterRecommendation_fromNewsletterId_fkey" 
FOREIGN KEY ("fromNewsletterId") REFERENCES "Newsletter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NewsletterRecommendation" 
ADD CONSTRAINT "NewsletterRecommendation_toNewsletterId_fkey" 
FOREIGN KEY ("toNewsletterId") REFERENCES "Newsletter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecommendationPerformance" 
ADD CONSTRAINT "RecommendationPerformance_recommendationId_fkey" 
FOREIGN KEY ("recommendationId") REFERENCES "NewsletterRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecommendationSettings" 
ADD CONSTRAINT "RecommendationSettings_organizationId_fkey" 
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraints
ALTER TABLE "NewsletterRecommendation" 
ADD CONSTRAINT "NewsletterRecommendation_unique_pair" 
UNIQUE ("fromNewsletterId", "toNewsletterId");

ALTER TABLE "RecommendationPerformance" 
ADD CONSTRAINT "RecommendationPerformance_unique_period" 
UNIQUE ("recommendationId", "period", "periodStart");

ALTER TABLE "RecommendationSettings" 
ADD CONSTRAINT "RecommendationSettings_organizationId_unique" 
UNIQUE ("organizationId");

-- Add check constraints
ALTER TABLE "NewsletterRecommendation" 
ADD CONSTRAINT "NewsletterRecommendation_priority_check" 
CHECK ("priority" >= 1 AND "priority" <= 10);

ALTER TABLE "NewsletterRecommendation" 
ADD CONSTRAINT "NewsletterRecommendation_no_self_recommendation" 
CHECK ("fromNewsletterId" != "toNewsletterId");

ALTER TABLE "NewsletterRecommendation" 
ADD CONSTRAINT "NewsletterRecommendation_status_check" 
CHECK ("status" IN ('ACTIVE', 'PAUSED', 'ENDED', 'PENDING_APPROVAL', 'REJECTED'));

ALTER TABLE "NewsletterRecommendation" 
ADD CONSTRAINT "NewsletterRecommendation_type_check" 
CHECK ("type" IN ('ONE_WAY', 'MUTUAL', 'SPONSORED'));

ALTER TABLE "RecommendationPerformance" 
ADD CONSTRAINT "RecommendationPerformance_period_check" 
CHECK ("period" IN ('DAILY', 'WEEKLY', 'MONTHLY'));

ALTER TABLE "RecommendationPerformance" 
ADD CONSTRAINT "RecommendationPerformance_clicks_check" 
CHECK ("clicks" <= "impressions");

ALTER TABLE "RecommendationPerformance" 
ADD CONSTRAINT "RecommendationPerformance_conversions_check" 
CHECK ("conversions" <= "clicks");

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS "Newsletter_organizationId_idx" ON "Newsletter"("organizationId");
CREATE INDEX IF NOT EXISTS "Newsletter_clientId_idx" ON "Newsletter"("clientId");
CREATE INDEX IF NOT EXISTS "Newsletter_categories_idx" ON "Newsletter" USING GIN("categories");
CREATE INDEX IF NOT EXISTS "Newsletter_isActiveForRecommendations_idx" ON "Newsletter"("isActiveForRecommendations");
CREATE INDEX IF NOT EXISTS "Newsletter_subscriberCount_idx" ON "Newsletter"("subscriberCount");

CREATE INDEX IF NOT EXISTS "NewsletterRecommendation_fromNewsletterId_idx" ON "NewsletterRecommendation"("fromNewsletterId");
CREATE INDEX IF NOT EXISTS "NewsletterRecommendation_toNewsletterId_idx" ON "NewsletterRecommendation"("toNewsletterId");
CREATE INDEX IF NOT EXISTS "NewsletterRecommendation_status_idx" ON "NewsletterRecommendation"("status");
CREATE INDEX IF NOT EXISTS "NewsletterRecommendation_type_idx" ON "NewsletterRecommendation"("type");
CREATE INDEX IF NOT EXISTS "NewsletterRecommendation_priority_idx" ON "NewsletterRecommendation"("priority");
CREATE INDEX IF NOT EXISTS "NewsletterRecommendation_createdAt_idx" ON "NewsletterRecommendation"("createdAt");

CREATE INDEX IF NOT EXISTS "RecommendationPerformance_recommendationId_idx" ON "RecommendationPerformance"("recommendationId");
CREATE INDEX IF NOT EXISTS "RecommendationPerformance_period_idx" ON "RecommendationPerformance"("period");
CREATE INDEX IF NOT EXISTS "RecommendationPerformance_periodStart_idx" ON "RecommendationPerformance"("periodStart");

CREATE INDEX IF NOT EXISTS "RecommendationSettings_organizationId_idx" ON "RecommendationSettings"("organizationId");

-- Create views for common queries
CREATE OR REPLACE VIEW "ActiveRecommendations" AS
SELECT 
    nr.*,
    nf.title AS "fromNewsletterTitle",
    nf.subscriberCount AS "fromSubscriberCount",
    nt.title AS "toNewsletterTitle",
    nt.subscriberCount AS "toSubscriberCount"
FROM "NewsletterRecommendation" nr
JOIN "Newsletter" nf ON nr."fromNewsletterId" = nf.id
JOIN "Newsletter" nt ON nr."toNewsletterId" = nt.id
WHERE nr.status = 'ACTIVE'
AND nf."isActiveForRecommendations" = true
AND nt."isActiveForRecommendations" = true;

CREATE OR REPLACE VIEW "RecommendationMetrics" AS
SELECT 
    nr.id,
    nr."fromNewsletterId",
    nr."toNewsletterId",
    nr.status,
    nr.type,
    COALESCE(SUM(rp.impressions), 0) AS "totalImpressions",
    COALESCE(SUM(rp.clicks), 0) AS "totalClicks",
    COALESCE(SUM(rp.conversions), 0) AS "totalConversions",
    COALESCE(SUM(rp.revenue), 0) AS "totalRevenue",
    CASE 
        WHEN SUM(rp.impressions) > 0 THEN 
            ROUND((SUM(rp.clicks)::DECIMAL / SUM(rp.impressions) * 100), 2)
        ELSE 0 
    END AS "avgCTR",
    CASE 
        WHEN SUM(rp.clicks) > 0 THEN 
            ROUND((SUM(rp.conversions)::DECIMAL / SUM(rp.clicks) * 100), 2)
        ELSE 0 
    END AS "avgConversionRate"
FROM "NewsletterRecommendation" nr
LEFT JOIN "RecommendationPerformance" rp ON nr.id = rp."recommendationId"
GROUP BY nr.id, nr."fromNewsletterId", nr."toNewsletterId", nr.status, nr.type;

-- Insert default settings for existing organizations
INSERT INTO "RecommendationSettings" ("id", "organizationId", "isNetworkActive", "autoAcceptRecommendations")
SELECT 
    'rec_settings_' || o.id,
    o.id,
    true,
    false
FROM "Organization" o
WHERE NOT EXISTS (
    SELECT 1 FROM "RecommendationSettings" rs WHERE rs."organizationId" = o.id
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Recommendation Network schema migration completed successfully!';
    RAISE NOTICE 'Created tables: Newsletter, NewsletterRecommendation, RecommendationPerformance, RecommendationSettings';
    RAISE NOTICE 'Added indexes, constraints, and views for optimal performance';
    RAISE NOTICE 'Initialized default settings for existing organizations';
END $$;