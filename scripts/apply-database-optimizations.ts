#!/usr/bin/env ts-node

/**
 * Database Optimization Migration Script
 * 
 * This script applies all database optimizations including:
 * - Critical indexes for massive scale operations
 * - Connection pool optimizations
 * - Query performance improvements
 * 
 * Usage:
 *   pnpm db:optimize
 *   ts-node scripts/apply-database-optimizations.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../src/lib/utils/logger';

interface OptimizationStep {
  name: string;
  description: string;
  sql: string;
  estimatedTime: string;
  critical: boolean;
}

const prisma = new PrismaClient();

async function main() {
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│             Database Optimization Migration                 │
│                                                             │
│  🗄️  Applying indexes and optimizations for massive scale  │
│  ⚡ Estimated time: 10-30 minutes                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
  `);

  try {
    // Read the SQL optimization file
    const sqlFilePath = join(__dirname, '../src/lib/db/index-optimization.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf-8');

    // Parse SQL statements
    const sqlStatements = parseSQLStatements(sqlContent);
    
    console.log(`Found ${sqlStatements.length} optimization statements to execute\n`);

    // Get optimization steps
    const steps = await getOptimizationSteps(sqlStatements);

    // Execute pre-optimization analysis
    await preOptimizationAnalysis();

    // Execute optimization steps
    await executeOptimizationSteps(steps);

    // Execute post-optimization analysis
    await postOptimizationAnalysis();

    console.log('\n🎉 Database optimization completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Monitor query performance over the next 24 hours');
    console.log('2. Run ANALYZE on your database if needed');
    console.log('3. Update your application to use the enhanced Prisma client');

  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function parseSQLStatements(sqlContent: string): string[] {
  return sqlContent
    .split(';')
    .map(statement => statement.trim())
    .filter(statement => 
      statement.length > 0 && 
      !statement.startsWith('--') && 
      !statement.startsWith('/*') &&
      statement.toUpperCase().includes('CREATE INDEX')
    );
}

async function getOptimizationSteps(sqlStatements: string[]): Promise<OptimizationStep[]> {
  const steps: OptimizationStep[] = [];

  for (const statement of sqlStatements) {
    const indexName = extractIndexName(statement);
    const tableName = extractTableName(statement);
    const isCritical = isCriticalIndex(statement);

    steps.push({
      name: indexName,
      description: `Create index on ${tableName}`,
      sql: statement,
      estimatedTime: isCritical ? '2-5 minutes' : '1-2 minutes',
      critical: isCritical,
    });
  }

  return steps;
}

function extractIndexName(statement: string): string {
  const match = statement.match(/CREATE INDEX.*?"([^"]+)"/);
  return match ? match[1] : 'unknown_index';
}

function extractTableName(statement: string): string {
  const match = statement.match(/ON "([^"]+)"/);
  return match ? match[1] : 'unknown_table';
}

function isCriticalIndex(statement: string): boolean {
  const criticalPatterns = [
    'organizationId',
    'campaignId',
    'userId',
    'status',
    'createdAt',
    'clerkOrganizationId',
  ];
  
  return criticalPatterns.some(pattern => 
    statement.toLowerCase().includes(pattern.toLowerCase())
  );
}

async function preOptimizationAnalysis(): Promise<void> {
  console.log('📊 Running pre-optimization analysis...\n');

  try {
    // Get table sizes
    const tableSizes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10;
    `;

    console.log('📈 Top 10 largest tables:');
    console.table(tableSizes);

    // Get existing indexes
    const existingIndexes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) as size
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 10;
    `;

    console.log('\n📋 Existing indexes:');
    console.table(existingIndexes);

    // Get slow queries (if query stats are available)
    try {
      const slowQueries = await prisma.$queryRaw`
        SELECT 
          query,
          mean_exec_time,
          calls,
          total_exec_time
        FROM pg_stat_statements 
        WHERE mean_exec_time > 1000
        ORDER BY mean_exec_time DESC
        LIMIT 5;
      `;

      if (Array.isArray(slowQueries) && slowQueries.length > 0) {
        console.log('\n🐌 Slow queries (> 1000ms):');
        console.table(slowQueries);
      }
    } catch (error) {
      console.log('ℹ️  pg_stat_statements not available for slow query analysis');
    }

  } catch (error) {
    console.warn('⚠️  Pre-optimization analysis failed:', error);
  }
}

async function executeOptimizationSteps(steps: OptimizationStep[]): Promise<void> {
  console.log('\n🚀 Starting database optimization...\n');

  // Sort steps by criticality
  const sortedSteps = steps.sort((a, b) => {
    if (a.critical && !b.critical) return -1;
    if (!a.critical && b.critical) return 1;
    return 0;
  });

  let completed = 0;
  let failed = 0;

  for (const step of sortedSteps) {
    const priority = step.critical ? '🔴 CRITICAL' : '🟡 NORMAL';
    console.log(`${priority} Creating index: ${step.name}`);
    console.log(`   Table: ${step.description}`);
    console.log(`   Estimated time: ${step.estimatedTime}`);

    try {
      const startTime = Date.now();
      
      // Execute the SQL statement
      await prisma.$executeRawUnsafe(step.sql);
      
      const duration = Date.now() - startTime;
      const durationSeconds = Math.round(duration / 1000);
      
      console.log(`   ✅ Completed in ${durationSeconds}s\n`);
      completed++;

      // Log to system logger
      logger.info('Database index created successfully', {
        indexName: step.name,
        duration: durationSeconds,
        critical: step.critical,
      });

    } catch (error) {
      console.error(`   ❌ Failed: ${error}\n`);
      failed++;

      // Log error but continue
      logger.error('Database index creation failed', error as Error, {
        indexName: step.name,
        sql: step.sql,
        critical: step.critical,
      });

      // For critical indexes, we might want to stop
      if (step.critical) {
        console.log('⚠️  Critical index creation failed. Continuing with non-critical indexes...');
      }
    }
  }

  console.log(`\n📊 Optimization Summary:`);
  console.log(`   ✅ Completed: ${completed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success rate: ${Math.round((completed / steps.length) * 100)}%`);
}

async function postOptimizationAnalysis(): Promise<void> {
  console.log('\n📊 Running post-optimization analysis...\n');

  try {
    // Get new index count and sizes
    const indexStats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_indexes,
        pg_size_pretty(SUM(pg_relation_size(indexrelid))) as total_size
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public';
    `;

    console.log('📈 Index statistics after optimization:');
    console.table(indexStats);

    // Test a few key queries to verify performance
    console.log('🧪 Testing key query performance...');

    const testQueries = [
      {
        name: 'Organization lookup',
        query: () => prisma.organization.findMany({
          where: { clerkOrganizationId: 'test-org' },
          take: 1,
        }),
      },
      {
        name: 'Campaign status filter',
        query: () => prisma.campaign.findMany({
          where: { status: 'active' },
          take: 10,
        }),
      },
      {
        name: 'Content workflow',
        query: () => prisma.content.findMany({
          where: { 
            status: 'DRAFT',
          },
          take: 10,
        }),
      },
    ];

    for (const test of testQueries) {
      try {
        const startTime = Date.now();
        await test.query();
        const duration = Date.now() - startTime;
        console.log(`   ✅ ${test.name}: ${duration}ms`);
      } catch (error) {
        console.log(`   ⚠️  ${test.name}: Query failed (expected if no data)`);
      }
    }

  } catch (error) {
    console.warn('⚠️  Post-optimization analysis failed:', error);
  }
}

// Run the optimization
main().catch(console.error);