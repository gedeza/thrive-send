-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "settings" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "aiFeatures" JSONB DEFAULT '{"enabled": false, "usage": 0, "limit": 0}';
