/**
 * Gradual ID Migration Service
 * 
 * Handles the transition from CUIDs to user-friendly short IDs
 * Supports both systems running simultaneously during migration
 */

import { generateId, parseShortId, isValidShortId } from './id-generator';

/**
 * Migration strategy phases:
 * 
 * Phase 1: Add displayId fields (non-breaking)
 * - Add optional displayId fields to key models
 * - Generate display IDs for existing records
 * - New records get both CUID and display ID
 * 
 * Phase 2: UI Migration (gradual)
 * - Update UI components to show display IDs
 * - APIs return both IDs for compatibility
 * - URLs can accept both ID formats
 * 
 * Phase 3: API Migration (careful)
 * - New APIs prefer display IDs
 * - Old APIs still accept CUIDs
 * - Gradual endpoint updates
 * 
 * Phase 4: Full Migration (future)
 * - Remove CUID fields (optional)
 * - Use display IDs as primary keys
 * - Complete system migration
 */

interface EntityWithIds {
  id: string; // Original CUID
  displayId?: string | null; // New short ID
}

interface MigrationOptions {
  batchSize?: number;
  dryRun?: boolean;
  entityTypes?: string[];
  skipExisting?: boolean;
}

export class IdMigrationService {
  /**
   * Generate display ID for an entity
   */
  static generateDisplayId(entityType: string, existingId?: string): string {
    const generators = {
      'User': generateId.user,
      'Organization': generateId.organization, 
      'Client': generateId.client,
      'Campaign': generateId.campaign,
      'CampaignTemplate': generateId.template,
      'Template': generateId.template,
      'Project': generateId.project,
      'MarketplaceListing': generateId.listing,
      'BoostPurchase': generateId.boost,
      'MarketplaceReview': generateId.review,
      'Report': generateId.report,
      'Activity': generateId.activity,
      'Notification': generateId.notification,
      'Comment': generateId.comment,
      'ContentApproval': generateId.approval,
      'Asset': generateId.asset,
      'Audience': generateId.audience,
      'AudienceSegment': generateId.segment,
      'CalendarEvent': generateId.event,
      'Integration': generateId.integration,
      'SocialAccount': generateId.socialAccount,
      'Workflow': generateId.workflow
    };

    const generator = generators[entityType as keyof typeof generators];
    return generator ? generator() : generateId.content();
  }

  /**
   * Resolve ID - works with both CUID and display ID
   */
  static resolveId(id: string): { 
    isCuid: boolean; 
    isDisplayId: boolean; 
    resolvedId: string;
    entityType?: string;
  } {
    const isCuid = id.length > 20 && !id.includes('_');
    const isDisplayId = isValidShortId(id);
    
    let entityType: string | undefined;
    if (isDisplayId) {
      const parsed = parseShortId(id);
      entityType = parsed?.entityType || undefined;
    }

    return {
      isCuid,
      isDisplayId, 
      resolvedId: id,
      entityType
    };
  }

  /**
   * Create migration SQL for adding display ID fields
   */
  static generateMigrationSQL(): string {
    const tables = [
      'User',
      'Organization', 
      'Client',
      'Campaign',
      'CampaignTemplate',
      'Project',
      'MarketplaceListing',
      'BoostPurchase',
      'MarketplaceReview',
      'Report',
      'Activity',
      'Notification',
      'Comment',
      'ContentApproval',
      'Asset',
      'Audience',
      'AudienceSegment',
      'CalendarEvent',
      'Integration',
      'SocialAccount',
      'Workflow'
    ];

    const alterStatements = tables.map(table => 
      `ALTER TABLE "${table}" ADD COLUMN "displayId" VARCHAR(15) UNIQUE;`
    ).join('\n');

    const indexStatements = tables.map(table =>
      `CREATE INDEX "idx_${table}_displayId" ON "${table}"("displayId");`
    ).join('\n');

    return `-- Phase 1: Add display ID fields (non-breaking migration)
-- Generated on: ${new Date().toISOString()}

-- Add displayId columns
${alterStatements}

-- Add indexes for performance
${indexStatements}

-- Add constraints to ensure uniqueness across system
-- (Will be enforced at application level initially)

-- Note: This migration is non-breaking and safe to run in production
-- Existing functionality will continue to work with CUIDs`;
  }

  /**
   * Generate display IDs for existing records (to run after migration)
   */
  static generatePopulationScript(): string {
    return `-- Phase 1.5: Populate display IDs for existing records
-- Run this after the schema migration

-- This would be implemented as a Node.js script that:
-- 1. Reads existing records in batches
-- 2. Generates appropriate display IDs
-- 3. Updates records with new display IDs
-- 4. Handles conflicts gracefully
-- 5. Provides progress reporting

-- Example implementation in TypeScript:
/*
import { prisma } from '@/lib/prisma';
import { IdMigrationService } from '@/lib/id-migration';

async function populateDisplayIds() {
  const tables = ['User', 'Client', 'Campaign', 'Project'];
  
  for (const table of tables) {
    console.log(\`Processing \${table}...\`);
    
    // Get records without display IDs
    const records = await prisma[table.toLowerCase()].findMany({
      where: { displayId: null },
      select: { id: true }
    });
    
    // Generate display IDs in batches
    for (let i = 0; i < records.length; i += 100) {
      const batch = records.slice(i, i + 100);
      
      await Promise.all(batch.map(async (record) => {
        const displayId = IdMigrationService.generateDisplayId(table);
        
        await prisma[table.toLowerCase()].update({
          where: { id: record.id },
          data: { displayId }
        });
      }));
      
      console.log(\`Processed \${i + batch.length}/\${records.length} \${table} records\`);
    }
  }
}
*/`;
  }
}

/**
 * Helper function to safely extract display ID from entity
 */
export function getDisplayId(entity: EntityWithIds): string {
  return entity.displayId || entity.id;
}

/**
 * Helper function to get the user-facing ID
 */
export function getUserFriendlyId(entity: EntityWithIds): string {
  // Prefer display ID, fall back to CUID
  if (entity.displayId) {
    return entity.displayId;
  }
  
  // If CUID is very long, show truncated version
  if (entity.id.length > 15) {
    return `${entity.id.slice(0, 8)}...`;
  }
  
  return entity.id;
}

/**
 * Migration phases documentation
 */
export const MIGRATION_PHASES = {
  PHASE_1: {
    name: 'Schema Addition',
    description: 'Add displayId fields to key models',
    status: 'ready',
    breakingChanges: false,
    steps: [
      'Run database migration to add displayId columns',
      'Add unique constraints and indexes',
      'Update Prisma schema with new fields'
    ]
  },
  
  PHASE_2: {
    name: 'Data Population', 
    description: 'Generate display IDs for existing records',
    status: 'pending',
    breakingChanges: false,
    steps: [
      'Run data population script',
      'Generate display IDs for all existing entities',
      'Verify uniqueness and integrity'
    ]
  },
  
  PHASE_3: {
    name: 'UI Migration',
    description: 'Update UI to show friendly IDs',
    status: 'pending', 
    breakingChanges: false,
    steps: [
      'Update client list to show CLI_ IDs',
      'Update campaign pages to show CAM_ IDs',
      'Update template pages to show TMP_ IDs',
      'Update URLs to accept both ID formats'
    ]
  },
  
  PHASE_4: {
    name: 'API Migration',
    description: 'Update APIs to prefer display IDs',
    status: 'pending',
    breakingChanges: 'minor',
    steps: [
      'Update API responses to include both IDs',
      'Make APIs accept both ID formats',
      'Gradually prefer display IDs in new endpoints'
    ]
  },
  
  PHASE_5: {
    name: 'Full Migration (Optional)',
    description: 'Complete transition to display IDs',
    status: 'future',
    breakingChanges: true,
    steps: [
      'Remove CUID fields (optional)',
      'Use display IDs as primary keys',
      'Update all references and foreign keys'
    ]
  }
};

/**
 * Current migration status tracker
 */
export const migrationStatus = {
  currentPhase: 'PHASE_1',
  
  isComplete: (phase: keyof typeof MIGRATION_PHASES): boolean => {
    // This would check actual system state
    return false; 
  },
  
  getNextSteps: (): string[] => {
    return MIGRATION_PHASES.PHASE_1.steps;
  }
};

export default IdMigrationService;