-- Migration: Add AI Template Features
-- This migration adds comprehensive AI functionality to the template system
-- Created: 2025-01-22

-- First, enhance the existing Template model with AI fields
ALTER TABLE "Template" 
ADD COLUMN "type" VARCHAR(20) DEFAULT 'email',
ADD COLUMN "aiGenerated" BOOLEAN DEFAULT false,
ADD COLUMN "aiRecommended" BOOLEAN DEFAULT false,
ADD COLUMN "performanceScore" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN "usageCount" INTEGER DEFAULT 0,
ADD COLUMN "lastUsed" TIMESTAMP(3),
ADD COLUMN "lastOptimized" TIMESTAMP(3),
ADD COLUMN "originalTemplateId" TEXT,
ADD COLUMN "optimizationFocus" VARCHAR(50);

-- Add indexes for AI features
CREATE INDEX "Template_aiGenerated_idx" ON "Template"("aiGenerated");
CREATE INDEX "Template_aiRecommended_idx" ON "Template"("aiRecommended");
CREATE INDEX "Template_performanceScore_idx" ON "Template"("performanceScore");
CREATE INDEX "Template_type_idx" ON "Template"("type");
CREATE INDEX "Template_lastUsed_idx" ON "Template"("lastUsed");

-- Create TemplateUsage table for tracking template usage patterns
CREATE TABLE "TemplateUsage" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "templateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "context" VARCHAR(50) NOT NULL, -- 'content-creation', 'calendar', 'campaign', 'project'
    "action" VARCHAR(30) NOT NULL, -- 'view', 'select', 'duplicate', 'edit', 'publish'
    "source" VARCHAR(100), -- Where the template was accessed from
    "metadata" JSONB, -- Additional context data
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateUsage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplateUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplateUsage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for TemplateUsage
CREATE INDEX "TemplateUsage_templateId_idx" ON "TemplateUsage"("templateId");
CREATE INDEX "TemplateUsage_userId_idx" ON "TemplateUsage"("userId");
CREATE INDEX "TemplateUsage_organizationId_idx" ON "TemplateUsage"("organizationId");
CREATE INDEX "TemplateUsage_context_idx" ON "TemplateUsage"("context");
CREATE INDEX "TemplateUsage_timestamp_idx" ON "TemplateUsage"("timestamp");
CREATE INDEX "TemplateUsage_user_template_idx" ON "TemplateUsage"("userId", "templateId");

-- Create UserTemplatePreference table for AI learning
CREATE TABLE "UserTemplatePreference" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "lastInteraction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contexts" TEXT[], -- Array of contexts where template was used
    "preferenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0, -- AI-calculated preference score
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTemplatePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserTemplatePreference_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique constraint and indexes for UserTemplatePreference
CREATE UNIQUE INDEX "UserTemplatePreference_userId_templateId_key" ON "UserTemplatePreference"("userId", "templateId");
CREATE INDEX "UserTemplatePreference_userId_idx" ON "UserTemplatePreference"("userId");
CREATE INDEX "UserTemplatePreference_templateId_idx" ON "UserTemplatePreference"("templateId");
CREATE INDEX "UserTemplatePreference_preferenceScore_idx" ON "UserTemplatePreference"("preferenceScore");
CREATE INDEX "UserTemplatePreference_lastInteraction_idx" ON "UserTemplatePreference"("lastInteraction");

-- Create AIUsage table for tracking AI service usage and billing
CREATE TABLE "AIUsage" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "feature" VARCHAR(50) NOT NULL, -- 'template_generation', 'suggestions', 'optimization'
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0, -- Cost in dollars
    "requestData" JSONB, -- Request parameters for debugging/analytics
    "responseData" JSONB, -- Response data for caching/analytics
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AIUsage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for AIUsage
CREATE INDEX "AIUsage_userId_idx" ON "AIUsage"("userId");
CREATE INDEX "AIUsage_organizationId_idx" ON "AIUsage"("organizationId");
CREATE INDEX "AIUsage_feature_idx" ON "AIUsage"("feature");
CREATE INDEX "AIUsage_createdAt_idx" ON "AIUsage"("createdAt");
CREATE INDEX "AIUsage_success_idx" ON "AIUsage"("success");
CREATE INDEX "AIUsage_cost_idx" ON "AIUsage"("cost");

-- Create TemplateOptimization table for AI optimization tracking
CREATE TABLE "TemplateOptimization" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "templateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "goals" TEXT[], -- Array of optimization goals
    "suggestions" JSONB NOT NULL, -- AI optimization suggestions
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "estimatedImprovement" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "appliedSuggestions" TEXT[], -- Which suggestions were applied
    "actualImprovement" DOUBLE PRECISION, -- Measured improvement after changes
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateOptimization_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplateOptimization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplateOptimization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for TemplateOptimization
CREATE INDEX "TemplateOptimization_templateId_idx" ON "TemplateOptimization"("templateId");
CREATE INDEX "TemplateOptimization_userId_idx" ON "TemplateOptimization"("userId");
CREATE INDEX "TemplateOptimization_organizationId_idx" ON "TemplateOptimization"("organizationId");
CREATE INDEX "TemplateOptimization_confidenceScore_idx" ON "TemplateOptimization"("confidenceScore");
CREATE INDEX "TemplateOptimization_estimatedImprovement_idx" ON "TemplateOptimization"("estimatedImprovement");
CREATE INDEX "TemplateOptimization_createdAt_idx" ON "TemplateOptimization"("createdAt");

-- Create TemplatePerformanceMetrics table for tracking actual performance
CREATE TABLE "TemplatePerformanceMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "templateId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "context" VARCHAR(50) NOT NULL, -- 'content-creation', 'calendar', 'campaign', 'project'
    "period" VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION DEFAULT 0.0,
    "conversionRate" DOUBLE PRECISION DEFAULT 0.0,
    "clickThroughRate" DOUBLE PRECISION DEFAULT 0.0,
    "openRate" DOUBLE PRECISION DEFAULT 0.0, -- For email templates
    "shareRate" DOUBLE PRECISION DEFAULT 0.0, -- For social templates
    "completionRate" DOUBLE PRECISION DEFAULT 0.0, -- For blog/article templates
    "averageTimeSpent" INTEGER DEFAULT 0, -- In seconds
    "userSatisfactionScore" DOUBLE PRECISION DEFAULT 0.0, -- 1-5 rating
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplatePerformanceMetrics_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplatePerformanceMetrics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique constraint and indexes for TemplatePerformanceMetrics
CREATE UNIQUE INDEX "TemplatePerformanceMetrics_template_period_key" ON "TemplatePerformanceMetrics"("templateId", "context", "period", "periodStart");
CREATE INDEX "TemplatePerformanceMetrics_templateId_idx" ON "TemplatePerformanceMetrics"("templateId");
CREATE INDEX "TemplatePerformanceMetrics_organizationId_idx" ON "TemplatePerformanceMetrics"("organizationId");
CREATE INDEX "TemplatePerformanceMetrics_context_idx" ON "TemplatePerformanceMetrics"("context");
CREATE INDEX "TemplatePerformanceMetrics_period_idx" ON "TemplatePerformanceMetrics"("period");
CREATE INDEX "TemplatePerformanceMetrics_periodStart_idx" ON "TemplatePerformanceMetrics"("periodStart");
CREATE INDEX "TemplatePerformanceMetrics_engagementRate_idx" ON "TemplatePerformanceMetrics"("engagementRate");
CREATE INDEX "TemplatePerformanceMetrics_conversionRate_idx" ON "TemplatePerformanceMetrics"("conversionRate");

-- Create TemplateCollection table for grouped templates
CREATE TABLE "TemplateCollection" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "category" VARCHAR(50), -- 'email-sequence', 'campaign-bundle', 'project-kit'
    "tags" TEXT[], -- Array of tags for categorization
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "estimatedROI" DOUBLE PRECISION,
    "estimatedConversionRate" DOUBLE PRECISION,
    "duration" VARCHAR(50), -- e.g., '7 days', '2 weeks'
    "difficulty" VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateCollection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplateCollection_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for TemplateCollection
CREATE INDEX "TemplateCollection_organizationId_idx" ON "TemplateCollection"("organizationId");
CREATE INDEX "TemplateCollection_creatorId_idx" ON "TemplateCollection"("creatorId");
CREATE INDEX "TemplateCollection_category_idx" ON "TemplateCollection"("category");
CREATE INDEX "TemplateCollection_isPublic_idx" ON "TemplateCollection"("isPublic");
CREATE INDEX "TemplateCollection_usageCount_idx" ON "TemplateCollection"("usageCount");
CREATE INDEX "TemplateCollection_averageRating_idx" ON "TemplateCollection"("averageRating");

-- Create TemplateCollectionItem table for many-to-many relationship
CREATE TABLE "TemplateCollectionItem" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "collectionId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0, -- Order within collection
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT, -- Description of template's role in collection
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateCollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "TemplateCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplateCollectionItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique constraint and indexes for TemplateCollectionItem
CREATE UNIQUE INDEX "TemplateCollectionItem_collection_template_key" ON "TemplateCollectionItem"("collectionId", "templateId");
CREATE INDEX "TemplateCollectionItem_collectionId_idx" ON "TemplateCollectionItem"("collectionId");
CREATE INDEX "TemplateCollectionItem_templateId_idx" ON "TemplateCollectionItem"("templateId");
CREATE INDEX "TemplateCollectionItem_position_idx" ON "TemplateCollectionItem"("position");

-- Create TemplateApprovalWorkflow table for team collaboration
CREATE TABLE "TemplateApprovalWorkflow" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "templateId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL, -- User who requested approval
    "approverId" TEXT, -- User assigned to approve
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_changes'
    "priority" VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    "requestMessage" TEXT,
    "approvalMessage" TEXT,
    "changesRequested" TEXT[],
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateApprovalWorkflow_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplateApprovalWorkflow_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplateApprovalWorkflow_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TemplateApprovalWorkflow_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexes for TemplateApprovalWorkflow
CREATE INDEX "TemplateApprovalWorkflow_templateId_idx" ON "TemplateApprovalWorkflow"("templateId");
CREATE INDEX "TemplateApprovalWorkflow_organizationId_idx" ON "TemplateApprovalWorkflow"("organizationId");
CREATE INDEX "TemplateApprovalWorkflow_requesterId_idx" ON "TemplateApprovalWorkflow"("requesterId");
CREATE INDEX "TemplateApprovalWorkflow_approverId_idx" ON "TemplateApprovalWorkflow"("approverId");
CREATE INDEX "TemplateApprovalWorkflow_status_idx" ON "TemplateApprovalWorkflow"("status");
CREATE INDEX "TemplateApprovalWorkflow_priority_idx" ON "TemplateApprovalWorkflow"("priority");
CREATE INDEX "TemplateApprovalWorkflow_createdAt_idx" ON "TemplateApprovalWorkflow"("createdAt");

-- Add triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_template_updated_at BEFORE UPDATE ON "Template"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_template_preference_updated_at BEFORE UPDATE ON "UserTemplatePreference"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_optimization_updated_at BEFORE UPDATE ON "TemplateOptimization"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_performance_metrics_updated_at BEFORE UPDATE ON "TemplatePerformanceMetrics"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_collection_updated_at BEFORE UPDATE ON "TemplateCollection"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_approval_workflow_updated_at BEFORE UPDATE ON "TemplateApprovalWorkflow"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common AI queries
CREATE VIEW "TemplateAIInsights" AS
SELECT 
    t."id",
    t."name",
    t."type",
    t."category",
    t."performanceScore",
    t."usageCount",
    t."aiGenerated",
    t."aiRecommended",
    COALESCE(AVG(tpm."engagementRate"), 0) as "avgEngagementRate",
    COALESCE(AVG(tpm."conversionRate"), 0) as "avgConversionRate",
    COUNT(tu."id") as "totalUsageEvents",
    COUNT(DISTINCT tu."userId") as "uniqueUsers",
    MAX(tu."timestamp") as "lastUsedAt"
FROM "Template" t
LEFT JOIN "TemplatePerformanceMetrics" tpm ON t."id" = tpm."templateId"
LEFT JOIN "TemplateUsage" tu ON t."id" = tu."templateId"
GROUP BY t."id", t."name", t."type", t."category", t."performanceScore", t."usageCount", t."aiGenerated", t."aiRecommended";

-- Create view for user template recommendations
CREATE VIEW "UserTemplateRecommendations" AS
SELECT 
    utp."userId",
    t."id" as "templateId",
    t."name",
    t."type",
    t."category",
    t."performanceScore",
    utp."preferenceScore",
    utp."interactionCount",
    utp."lastInteraction",
    CASE 
        WHEN t."aiRecommended" = true THEN utp."preferenceScore" * 1.2
        WHEN t."performanceScore" > 0.8 THEN utp."preferenceScore" * 1.1
        ELSE utp."preferenceScore"
    END as "recommendationScore"
FROM "UserTemplatePreference" utp
JOIN "Template" t ON utp."templateId" = t."id"
WHERE t."status" = 'PUBLISHED';

-- Add comments for documentation
COMMENT ON TABLE "TemplateUsage" IS 'Tracks every interaction with templates for AI learning and analytics';
COMMENT ON TABLE "UserTemplatePreference" IS 'Stores user preference scores calculated by AI for personalized recommendations';
COMMENT ON TABLE "AIUsage" IS 'Tracks AI service usage for billing and rate limiting';
COMMENT ON TABLE "TemplateOptimization" IS 'Stores AI optimization suggestions and their effectiveness';
COMMENT ON TABLE "TemplatePerformanceMetrics" IS 'Aggregated performance data for templates across different contexts';
COMMENT ON TABLE "TemplateCollection" IS 'Groups of templates for strategic workflows (e.g., email sequences, campaign bundles)';
COMMENT ON TABLE "TemplateCollectionItem" IS 'Many-to-many relationship between collections and templates';
COMMENT ON TABLE "TemplateApprovalWorkflow" IS 'Approval workflow for template publishing in team environments';

COMMENT ON COLUMN "Template"."performanceScore" IS 'AI-calculated performance score between 0.0 and 1.0';
COMMENT ON COLUMN "Template"."aiGenerated" IS 'True if template was created by AI generation';
COMMENT ON COLUMN "Template"."aiRecommended" IS 'True if AI recommends this template for high performance';
COMMENT ON COLUMN "TemplateUsage"."context" IS 'Where template was used: content-creation, calendar, campaign, project';
COMMENT ON COLUMN "UserTemplatePreference"."preferenceScore" IS 'AI-calculated preference score based on user behavior';
COMMENT ON COLUMN "AIUsage"."cost" IS 'Cost in USD for this AI operation';

-- Create sample data for testing (optional - remove in production)
-- INSERT INTO "TemplateCollection" ("id", "name", "description", "organizationId", "creatorId", "category", "estimatedROI", "duration")
-- VALUES ('sample-collection-1', 'Welcome Email Series', '5-part welcome sequence for new subscribers', 'sample-org', 'sample-user', 'email-sequence', 2.5, '7 days');