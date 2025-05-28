-- Drop the existing Analytics table if it exists
DROP TABLE IF EXISTS "Analytics";

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "projectCount" INTEGER NOT NULL DEFAULT 0,
    "activeProjects" INTEGER NOT NULL DEFAULT 0,
    "completedProjects" INTEGER NOT NULL DEFAULT 0,
    "totalBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usedBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contentCount" INTEGER NOT NULL DEFAULT 0,
    "reachCount" INTEGER NOT NULL DEFAULT 0,
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nps" DOUBLE PRECISION,
    "healthScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Analytics_clientId_date_idx" ON "Analytics"("clientId", "date");

-- CreateIndex
CREATE INDEX "Analytics_clientId_healthScore_idx" ON "Analytics"("clientId", "healthScore");

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE; 