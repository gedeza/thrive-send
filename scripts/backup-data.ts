#!/usr/bin/env tsx

/**
 * Data Backup Script
 * 
 * Creates a JSON backup of all important data in the database
 * before running migrations that might affect data integrity.
 */

import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface BackupData {
  timestamp: string;
  version: string;
  data: {
    users: any[];
    organizations: any[];
    clients: any[];
    projects: any[];
    campaigns: any[];
    content: any[];
    socialAccounts: any[];
    analytics: any[];
  };
  metadata: {
    totalRecords: number;
    backupReason: string;
  };
}

async function createBackup(): Promise<void> {
  console.log('🔄 Starting data backup...');
  
  try {
    const timestamp = new Date().toISOString();
    const backupData: BackupData = {
      timestamp,
      version: '1.0.0',
      data: {
        users: [],
        organizations: [],
        clients: [],
        projects: [],
        campaigns: [],
        content: [],
        socialAccounts: [],
        analytics: []
      },
      metadata: {
        totalRecords: 0,
        backupReason: 'Pre-migration backup for display ID implementation'
      }
    };

    // Backup Users (limited fields for privacy)
    console.log('📋 Backing up users...');
    backupData.data.users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        hasCompletedOnboarding: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Backup Organizations
    console.log('📋 Backing up organizations...');
    backupData.data.organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        website: true,
        primaryColor: true,
        clerkOrganizationId: true,
        settings: true,
        type: true,
        subscriptionTier: true,
        maxClients: true,
        marketplaceEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Backup Clients
    console.log('📋 Backing up clients...');
    backupData.data.clients = await prisma.client.findMany({
      include: {
        socialAccounts: {
          select: {
            id: true,
            platform: true,
            handle: true,
            accountId: true,
            createdAt: true,
            updatedAt: true
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    // Backup Projects
    console.log('📋 Backing up projects...');
    backupData.data.projects = await prisma.project.findMany();

    // Backup Campaigns
    console.log('📋 Backing up campaigns...');
    backupData.data.campaigns = await prisma.campaign.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        budget: true,
        clientId: true,
        organizationId: true,
        projectId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Backup Content
    console.log('📋 Backing up content...');
    backupData.data.content = await prisma.content.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        type: true,
        publishedAt: true,
        scheduledAt: true,
        authorId: true,
        campaignId: true,
        organizationId: true,
        projectId: true,
        platforms: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Backup Social Accounts
    console.log('📋 Backing up social accounts...');
    backupData.data.socialAccounts = await prisma.socialAccount.findMany();

    // Backup Analytics (last 30 days to limit size)
    console.log('📋 Backing up recent analytics...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    backupData.data.analytics = await prisma.analytics.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Calculate total records
    const totalRecords = Object.values(backupData.data).reduce((sum, arr) => sum + arr.length, 0);
    backupData.metadata.totalRecords = totalRecords;

    // Write backup to file
    const backupFileName = `database_backup_${timestamp.replace(/[:.]/g, '-')}.json`;
    const backupFilePath = join(process.cwd(), 'backups', backupFileName);
    
    writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
    
    console.log('✅ Backup completed successfully!');
    console.log(`📁 File: ${backupFilePath}`);
    console.log(`📊 Total records: ${totalRecords}`);
    console.log('📋 Backup includes:');
    console.log(`   - Users: ${backupData.data.users.length}`);
    console.log(`   - Organizations: ${backupData.data.organizations.length}`);
    console.log(`   - Clients: ${backupData.data.clients.length}`);
    console.log(`   - Projects: ${backupData.data.projects.length}`);
    console.log(`   - Campaigns: ${backupData.data.campaigns.length}`);
    console.log(`   - Content: ${backupData.data.content.length}`);
    console.log(`   - Social Accounts: ${backupData.data.socialAccounts.length}`);
    console.log(`   - Analytics (30d): ${backupData.data.analytics.length}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 Database Backup Utility');
  console.log('==========================');
  
  await createBackup();
}

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n⏹️ Backup interrupted by user');
  await prisma.$disconnect();
  process.exit(0);
});

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Backup script failed:', error);
    process.exit(1);
  });
}

export { createBackup };