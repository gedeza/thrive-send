-- Service Provider Dashboard Enhancements
-- Adds support for B2B2G service provider multi-client management

-- Add service provider specific fields to Organization
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "type" VARCHAR(50) DEFAULT 'service_provider';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "subscription_tier" VARCHAR(50) DEFAULT 'basic';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "max_clients" INTEGER DEFAULT 10;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "marketplace_enabled" BOOLEAN DEFAULT true;

-- Add client-specific service provider relationship tracking
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "service_provider_id" VARCHAR(255);
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "onboarded_at" TIMESTAMP;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "contract_start_date" TIMESTAMP;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "contract_end_date" TIMESTAMP;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "monthly_budget" DECIMAL(10,2);

-- Update service_provider_id to reference organizationId for existing clients
UPDATE "Client" SET "service_provider_id" = "organizationId" WHERE "service_provider_id" IS NULL;

-- Add enhanced team member roles for service providers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ServiceProviderRole') THEN
        CREATE TYPE "ServiceProviderRole" AS ENUM (
            'OWNER',
            'ADMIN', 
            'MANAGER',
            'CONTENT_CREATOR',
            'REVIEWER',
            'APPROVER',
            'PUBLISHER',
            'ANALYST',
            'CLIENT_MANAGER'
        );
    END IF;
END $$;

ALTER TABLE "OrganizationMember" ADD COLUMN IF NOT EXISTS "service_provider_role" "ServiceProviderRole" DEFAULT 'CONTENT_CREATOR';

-- Client assignments for team members
CREATE TABLE IF NOT EXISTS "ClientAssignment" (
    "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "organization_member_id" VARCHAR(255) NOT NULL,
    "client_id" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'CONTRIBUTOR',
    "permissions" JSONB DEFAULT '[]',
    "assigned_at" TIMESTAMP DEFAULT NOW(),
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("organization_member_id") REFERENCES "OrganizationMember"("id") ON DELETE CASCADE,
    FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE,
    UNIQUE("organization_member_id", "client_id")
);

-- Service Provider Dashboard metrics aggregation table
CREATE TABLE IF NOT EXISTS "ServiceProviderMetrics" (
    "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "organization_id" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "total_clients" INTEGER DEFAULT 0,
    "active_clients" INTEGER DEFAULT 0,
    "total_campaigns" INTEGER DEFAULT 0,
    "active_campaigns" INTEGER DEFAULT 0,
    "total_content" INTEGER DEFAULT 0,
    "published_content" INTEGER DEFAULT 0,
    "total_revenue" DECIMAL(10,2) DEFAULT 0,
    "marketplace_revenue" DECIMAL(10,2) DEFAULT 0,
    "team_utilization" DECIMAL(5,2) DEFAULT 0,
    "avg_client_satisfaction" DECIMAL(3,2) DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE,
    UNIQUE("organization_id", "date")
);

-- Client performance rankings
CREATE TABLE IF NOT EXISTS "ClientPerformanceRanking" (
    "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "organization_id" VARCHAR(255) NOT NULL,
    "client_id" VARCHAR(255) NOT NULL,
    "ranking_date" DATE NOT NULL,
    "performance_score" DECIMAL(5,2) DEFAULT 0,
    "engagement_rate" DECIMAL(5,2) DEFAULT 0,
    "growth_rate" DECIMAL(5,2) DEFAULT 0,
    "content_velocity" INTEGER DEFAULT 0,
    "budget_efficiency" DECIMAL(5,2) DEFAULT 0,
    "ranking_position" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE,
    FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE CASCADE,
    UNIQUE("organization_id", "client_id", "ranking_date")
);

-- Enhanced activity tracking for service providers
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "client_id" VARCHAR(255);
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "service_provider_context" JSONB;

-- Cross-client analytics support
CREATE TABLE IF NOT EXISTS "CrossClientAnalytics" (
    "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "organization_id" VARCHAR(255) NOT NULL,
    "metric_type" VARCHAR(100) NOT NULL,
    "metric_value" DECIMAL(15,2) NOT NULL,
    "comparison_period" VARCHAR(50) NOT NULL,
    "client_breakdown" JSONB DEFAULT '{}',
    "trend_data" JSONB DEFAULT '[]',
    "date_range_start" TIMESTAMP NOT NULL,
    "date_range_end" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE
);

-- Marketplace revenue tracking for service providers
CREATE TABLE IF NOT EXISTS "MarketplaceRevenue" (
    "id" VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "organization_id" VARCHAR(255) NOT NULL,
    "client_id" VARCHAR(255),
    "revenue_type" VARCHAR(50) NOT NULL, -- 'commission', 'boost', 'content', 'subscription'
    "amount" DECIMAL(10,2) NOT NULL,
    "commission_rate" DECIMAL(5,2) DEFAULT 0,
    "transaction_date" TIMESTAMP NOT NULL,
    "description" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE,
    FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE SET NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_client_service_provider" ON "Client"("service_provider_id");
CREATE INDEX IF NOT EXISTS "idx_client_assignments_member" ON "ClientAssignment"("organization_member_id");
CREATE INDEX IF NOT EXISTS "idx_client_assignments_client" ON "ClientAssignment"("client_id");
CREATE INDEX IF NOT EXISTS "idx_service_provider_metrics_org_date" ON "ServiceProviderMetrics"("organization_id", "date");
CREATE INDEX IF NOT EXISTS "idx_client_performance_org_date" ON "ClientPerformanceRanking"("organization_id", "ranking_date");
CREATE INDEX IF NOT EXISTS "idx_cross_client_analytics_org" ON "CrossClientAnalytics"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_marketplace_revenue_org" ON "MarketplaceRevenue"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_activity_client" ON "Activity"("client_id");

-- Add comments for documentation
COMMENT ON TABLE "ClientAssignment" IS 'Maps team members to specific clients with roles and permissions';
COMMENT ON TABLE "ServiceProviderMetrics" IS 'Aggregated daily metrics for service provider dashboard';
COMMENT ON TABLE "ClientPerformanceRanking" IS 'Performance rankings of clients for service provider comparison';
COMMENT ON TABLE "CrossClientAnalytics" IS 'Cross-client analytics data for service provider insights';
COMMENT ON TABLE "MarketplaceRevenue" IS 'Revenue tracking from marketplace activities';

COMMENT ON COLUMN "Organization"."type" IS 'Organization type: service_provider, enterprise, etc.';
COMMENT ON COLUMN "Organization"."max_clients" IS 'Maximum number of clients allowed for this service provider';
COMMENT ON COLUMN "Client"."service_provider_id" IS 'References the organization (service provider) managing this client';
COMMENT ON COLUMN "OrganizationMember"."service_provider_role" IS 'Role within the service provider organization';