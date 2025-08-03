-- Advanced Reporting and Service Provider Enhancement Migration
-- This migration adds the missing models for Week 3 features

-- Scheduled Reports Table
CREATE TABLE "ScheduledReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL, -- 'performance', 'revenue', 'engagement', 'cross-client', 'executive-summary'
    "frequency" TEXT NOT NULL, -- 'once', 'daily', 'weekly', 'monthly', 'quarterly'
    "status" TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'completed', 'failed'
    "recipients" TEXT[], -- Array of email addresses
    "format" TEXT NOT NULL DEFAULT 'pdf', -- 'pdf', 'excel', 'email'
    "nextRun" TIMESTAMP(3),
    "lastRun" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "parameters" JSONB NOT NULL DEFAULT '{}',
    "deliverySettings" JSONB NOT NULL DEFAULT '{}',
    "performance" JSONB DEFAULT '{"totalRuns": 0, "successfulRuns": 0, "avgGenerationTime": 0}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledReport_pkey" PRIMARY KEY ("id")
);

-- Report Execution Log Table
CREATE TABLE "ReportExecution" (
    "id" TEXT NOT NULL,
    "scheduledReportId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "executionTime" INTEGER, -- milliseconds
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "errorMessage" TEXT,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "ReportExecution_pkey" PRIMARY KEY ("id")
);

-- Enhanced Cross-Client Analytics Table (extend existing)
CREATE TABLE "CrossClientAnalyticsDetail" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "reportDate" DATE NOT NULL,
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "socialPlatforms" JSONB DEFAULT '[]',
    "contentTypes" JSONB DEFAULT '[]',
    "topPerformingContent" JSONB DEFAULT '[]',
    "industryBenchmarks" JSONB DEFAULT '{}',
    "performanceVsBenchmark" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrossClientAnalyticsDetail_pkey" PRIMARY KEY ("id")
);

-- Team Member Assignments Table (extend existing ClientAssignment)
CREATE TABLE "TeamMemberInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL, -- 'ADMIN', 'MANAGER', 'CONTENT_CREATOR', 'REVIEWER'
    "organizationId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "clientIds" TEXT[], -- Array of client IDs they can access
    "permissions" JSONB DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'expired', 'rejected'
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMemberInvitation_pkey" PRIMARY KEY ("id")
);

-- Enhanced Marketplace Products (Boost Products)
CREATE TABLE "BoostProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- 'engagement', 'conversion', 'reach', 'premium', 'awareness'
    "category" TEXT NOT NULL, -- 'Government', 'Business', 'Startup', 'Branding', 'Social Impact'
    "price" DECIMAL(10,2) NOT NULL,
    "originalPrice" DECIMAL(10,2),
    "duration" TEXT NOT NULL, -- '14 days', '30 days', etc.
    "features" TEXT[],
    "metrics" JSONB DEFAULT '{}',
    "clientTypes" TEXT[],
    "popularity" TEXT DEFAULT 'new', -- 'bestseller', 'hot', 'trending', 'new'
    "rating" DECIMAL(2,1) DEFAULT 0,
    "reviews" INTEGER DEFAULT 0,
    "estimatedROI" TEXT,
    "isRecommended" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoostProduct_pkey" PRIMARY KEY ("id")
);

-- Boost Purchases Table
CREATE TABLE "BoostPurchase" (
    "id" TEXT NOT NULL,
    "boostProductId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled'
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DECIMAL(10,2) NOT NULL,
    "duration" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "performance" JSONB DEFAULT '{"impressions": 0, "engagements": 0, "conversions": 0, "roi": 0}',
    "paymentMethod" TEXT,
    "billingAddress" JSONB,
    "notes" TEXT,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "BoostPurchase_pkey" PRIMARY KEY ("id")
);

-- Enhanced Service Provider Metrics (extend existing)
CREATE TABLE "ServiceProviderMetricsDetail" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "revenueMetrics" JSONB NOT NULL DEFAULT '{}',
    "clientMetrics" JSONB NOT NULL DEFAULT '{}',
    "performanceMetrics" JSONB NOT NULL DEFAULT '{}',
    "marketplaceMetrics" JSONB NOT NULL DEFAULT '{}',
    "teamMetrics" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceProviderMetricsDetail_pkey" PRIMARY KEY ("id")
);

-- Add Foreign Key Constraints
ALTER TABLE "ScheduledReport" ADD CONSTRAINT "ScheduledReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduledReport" ADD CONSTRAINT "ScheduledReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReportExecution" ADD CONSTRAINT "ReportExecution_scheduledReportId_fkey" FOREIGN KEY ("scheduledReportId") REFERENCES "ScheduledReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrossClientAnalyticsDetail" ADD CONSTRAINT "CrossClientAnalyticsDetail_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrossClientAnalyticsDetail" ADD CONSTRAINT "CrossClientAnalyticsDetail_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeamMemberInvitation" ADD CONSTRAINT "TeamMemberInvitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMemberInvitation" ADD CONSTRAINT "TeamMemberInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BoostProduct" ADD CONSTRAINT "BoostProduct_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BoostPurchase" ADD CONSTRAINT "BoostPurchase_boostProductId_fkey" FOREIGN KEY ("boostProductId") REFERENCES "BoostProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BoostPurchase" ADD CONSTRAINT "BoostPurchase_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BoostPurchase" ADD CONSTRAINT "BoostPurchase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BoostPurchase" ADD CONSTRAINT "BoostPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ServiceProviderMetricsDetail" ADD CONSTRAINT "ServiceProviderMetricsDetail_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add Indexes for Performance
CREATE INDEX "ScheduledReport_organizationId_idx" ON "ScheduledReport"("organizationId");
CREATE INDEX "ScheduledReport_createdById_idx" ON "ScheduledReport"("createdById");
CREATE INDEX "ScheduledReport_nextRun_idx" ON "ScheduledReport"("nextRun");
CREATE INDEX "ScheduledReport_status_idx" ON "ScheduledReport"("status");

CREATE INDEX "ReportExecution_scheduledReportId_idx" ON "ReportExecution"("scheduledReportId");
CREATE INDEX "ReportExecution_status_idx" ON "ReportExecution"("status");
CREATE INDEX "ReportExecution_startedAt_idx" ON "ReportExecution"("startedAt");

CREATE INDEX "CrossClientAnalyticsDetail_organizationId_idx" ON "CrossClientAnalyticsDetail"("organizationId");
CREATE INDEX "CrossClientAnalyticsDetail_clientId_idx" ON "CrossClientAnalyticsDetail"("clientId");
CREATE INDEX "CrossClientAnalyticsDetail_reportDate_idx" ON "CrossClientAnalyticsDetail"("reportDate");

CREATE INDEX "TeamMemberInvitation_organizationId_idx" ON "TeamMemberInvitation"("organizationId");
CREATE INDEX "TeamMemberInvitation_email_idx" ON "TeamMemberInvitation"("email");
CREATE INDEX "TeamMemberInvitation_status_idx" ON "TeamMemberInvitation"("status");
CREATE INDEX "TeamMemberInvitation_token_idx" ON "TeamMemberInvitation"("token");

CREATE INDEX "BoostProduct_category_idx" ON "BoostProduct"("category");
CREATE INDEX "BoostProduct_type_idx" ON "BoostProduct"("type");
CREATE INDEX "BoostProduct_isActive_idx" ON "BoostProduct"("isActive");

CREATE INDEX "BoostPurchase_clientId_idx" ON "BoostPurchase"("clientId");
CREATE INDEX "BoostPurchase_organizationId_idx" ON "BoostPurchase"("organizationId");
CREATE INDEX "BoostPurchase_status_idx" ON "BoostPurchase"("status");
CREATE INDEX "BoostPurchase_purchaseDate_idx" ON "BoostPurchase"("purchaseDate");

CREATE INDEX "ServiceProviderMetricsDetail_organizationId_idx" ON "ServiceProviderMetricsDetail"("organizationId");
CREATE INDEX "ServiceProviderMetricsDetail_date_idx" ON "ServiceProviderMetricsDetail"("date");

-- Add Unique Constraints
CREATE UNIQUE INDEX "ScheduledReport_token_idx" ON "TeamMemberInvitation"("token");
CREATE UNIQUE INDEX "CrossClientAnalyticsDetail_org_client_date_idx" ON "CrossClientAnalyticsDetail"("organizationId", "clientId", "reportDate");
CREATE UNIQUE INDEX "ServiceProviderMetricsDetail_org_date_idx" ON "ServiceProviderMetricsDetail"("organizationId", "date");