#!/usr/bin/env tsx

/**
 * Display ID Population Script
 * 
 * Generates user-friendly display IDs for existing records
 * Run this after the schema migration to populate displayId fields
 * 
 * Usage: npx tsx scripts/populate-display-ids.ts
 */

import { PrismaClient } from '@prisma/client';
import { IdMigrationService } from '../src/lib/id-migration';
import { generateId } from '../src/lib/id-generator';

const prisma = new PrismaClient();

interface PopulationStats {
  processed: number;
  errors: number;
  skipped: number;
  total: number;
}

interface EntityConfig {
  name: string;
  table: string;
  generator: () => string;
  batchSize: number;
}

// Configuration for each entity type
const ENTITIES: EntityConfig[] = [
  {
    name: 'Users',
    table: 'user',
    generator: generateId.user,
    batchSize: 100
  },
  {
    name: 'Organizations', 
    table: 'organization',
    generator: generateId.organization,
    batchSize: 50
  },
  {
    name: 'Clients',
    table: 'client', 
    generator: generateId.client,
    batchSize: 100
  },
  {
    name: 'Campaigns',
    table: 'campaign',
    generator: generateId.campaign,
    batchSize: 100
  },
  {
    name: 'Campaign Templates',
    table: 'campaignTemplate',
    generator: generateId.template,
    batchSize: 100
  },
  {
    name: 'Projects',
    table: 'project',
    generator: generateId.project,
    batchSize: 100
  },
  {
    name: 'Content',
    table: 'content',
    generator: generateId.content,
    batchSize: 100
  },
  {
    name: 'Reports',
    table: 'report',
    generator: generateId.report,
    batchSize: 50
  },
  {
    name: 'Assets',
    table: 'asset',
    generator: generateId.asset,
    batchSize: 100
  },
  {
    name: 'Audiences',
    table: 'audience',
    generator: generateId.audience,
    batchSize: 50
  }
];

async function populateEntityDisplayIds(config: EntityConfig): Promise<PopulationStats> {
  const stats: PopulationStats = { processed: 0, errors: 0, skipped: 0, total: 0 };
  
  try {
    console.log(`\n📋 Processing ${config.name}...`);
    
    // Get total count
    const totalCount = await (prisma as any)[config.table].count({
      where: { displayId: null }
    });
    
    stats.total = totalCount;
    
    if (totalCount === 0) {
      console.log(`✅ No records need display IDs for ${config.name}`);
      return stats;
    }
    
    console.log(`📊 Found ${totalCount} records without display IDs`);
    
    // Process in batches
    let processed = 0;
    while (processed < totalCount) {
      const batch = await (prisma as any)[config.table].findMany({
        where: { displayId: null },
        select: { id: true },
        take: config.batchSize,
        skip: processed
      });
      
      if (batch.length === 0) break;
      
      // Generate and update display IDs for this batch
      const updatePromises = batch.map(async (record: any) => {
        try {
          const displayId = config.generator();
          
          // Check for conflicts (very rare but possible)
          const existing = await (prisma as any)[config.table].findUnique({
            where: { displayId },
            select: { id: true }
          });
          
          if (existing) {
            console.warn(`⚠️  Display ID conflict: ${displayId} already exists`);
            stats.skipped++;
            return;
          }
          
          await (prisma as any)[config.table].update({
            where: { id: record.id },
            data: { displayId }
          });
          
          stats.processed++;
        } catch (error) {
          console.error(`❌ Error updating record ${record.id}:`, error);
          stats.errors++;
        }
      });
      
      await Promise.all(updatePromises);
      processed += batch.length;
      
      // Progress update
      const progress = Math.round((processed / totalCount) * 100);
      console.log(`   Progress: ${processed}/${totalCount} (${progress}%)`);
    }
    
    console.log(`✅ Completed ${config.name}: ${stats.processed} processed, ${stats.errors} errors, ${stats.skipped} skipped`);
    
  } catch (error) {
    console.error(`❌ Failed to process ${config.name}:`, error);
    stats.errors++;
  }
  
  return stats;
}

async function validateDisplayIds(): Promise<boolean> {
  console.log('\n🔍 Validating display ID uniqueness...');
  
  let allValid = true;
  
  for (const config of ENTITIES) {
    try {
      // Check for duplicates
      const duplicates = await prisma.$queryRaw`
        SELECT "displayId", COUNT(*) as count 
        FROM "${config.table}" 
        WHERE "displayId" IS NOT NULL 
        GROUP BY "displayId" 
        HAVING COUNT(*) > 1
      ` as any[];
      
      if (duplicates.length > 0) {
        console.error(`❌ Found ${duplicates.length} duplicate display IDs in ${config.name}`);
        duplicates.forEach((dup: any) => {
          console.error(`   Duplicate: ${dup.displayId} (${dup.count} occurrences)`);
        });
        allValid = false;
      } else {
        console.log(`✅ ${config.name}: All display IDs are unique`);
      }
    } catch (error) {
      console.error(`❌ Error validating ${config.name}:`, error);
      allValid = false;
    }
  }
  
  return allValid;
}

async function generateSummaryReport(): Promise<void> {
  console.log('\n📊 Display ID Summary Report');
  console.log('================================');
  
  for (const config of ENTITIES) {
    try {
      const totalRecords = await (prisma as any)[config.table].count();
      const withDisplayIds = await (prisma as any)[config.table].count({
        where: { displayId: { not: null } }
      });
      
      const percentage = totalRecords > 0 ? Math.round((withDisplayIds / totalRecords) * 100) : 0;
      
      console.log(`${config.name.padEnd(20)}: ${withDisplayIds}/${totalRecords} (${percentage}%)`);
    } catch (error) {
      console.error(`Error getting stats for ${config.name}:`, error);
    }
  }
}

async function main() {
  console.log('🚀 Starting Display ID Population');
  console.log('================================');
  console.log('This script will generate user-friendly display IDs for existing records');
  console.log('The process is safe and non-destructive\n');
  
  const startTime = Date.now();
  let totalStats: PopulationStats = { processed: 0, errors: 0, skipped: 0, total: 0 };
  
  try {
    // Process each entity type
    for (const config of ENTITIES) {
      const stats = await populateEntityDisplayIds(config);
      totalStats.processed += stats.processed;
      totalStats.errors += stats.errors;
      totalStats.skipped += stats.skipped;
      totalStats.total += stats.total;
    }
    
    // Validate results
    const isValid = await validateDisplayIds();
    
    // Generate summary report
    await generateSummaryReport();
    
    // Final summary
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log('\n✅ Population Complete!');
    console.log('========================');
    console.log(`Total processed: ${totalStats.processed}`);
    console.log(`Total errors: ${totalStats.errors}`);
    console.log(`Total skipped: ${totalStats.skipped}`);
    console.log(`Duration: ${duration}s`);
    console.log(`Validation: ${isValid ? 'PASSED' : 'FAILED'}`);
    
    if (totalStats.errors === 0 && isValid) {
      console.log('\n🎉 All display IDs generated successfully!');
      console.log('Your system is now ready for Phase 3: UI Migration');
    } else {
      console.log('\n⚠️  Some issues were encountered. Please review the logs above.');
    }
    
  } catch (error) {
    console.error('❌ Population failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n⏹️  Population interrupted by user');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

export { populateEntityDisplayIds, validateDisplayIds };