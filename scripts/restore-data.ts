#!/usr/bin/env tsx

/**
 * Data Restore Script
 * 
 * Restores data from a JSON backup file created by backup-data.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
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

async function restoreData(backupFilePath: string): Promise<void> {
  console.log('🔄 Starting data restore...');
  console.log(`📁 Reading backup from: ${backupFilePath}`);
  
  try {
    // Read backup file
    const backupContent = readFileSync(backupFilePath, 'utf-8');
    const backup: BackupData = JSON.parse(backupContent);
    
    console.log(`📊 Backup from: ${backup.timestamp}`);
    console.log(`📋 Total records in backup: ${backup.metadata.totalRecords}`);
    console.log(`💾 Backup reason: ${backup.metadata.backupReason}`);
    
    // Restore Users
    if (backup.data.users.length > 0) {
      console.log(`📤 Restoring ${backup.data.users.length} users...`);
      for (const user of backup.data.users) {
        // Remove displayId from user data since it didn't exist in backup
        const { displayId, ...userData } = user;
        await prisma.user.upsert({
          where: { id: user.id },
          update: userData,
          create: userData
        });
      }
    }

    // Restore Organizations
    if (backup.data.organizations.length > 0) {
      console.log(`📤 Restoring ${backup.data.organizations.length} organizations...`);
      for (const org of backup.data.organizations) {
        // Remove displayId from org data since it didn't exist in backup
        const { displayId, ...orgData } = org;
        await prisma.organization.upsert({
          where: { id: org.id },
          update: orgData,
          create: orgData
        });
      }
    }

    // Restore Clients
    if (backup.data.clients.length > 0) {
      console.log(`📤 Restoring ${backup.data.clients.length} clients...`);
      for (const client of backup.data.clients) {
        // Remove nested data that will be restored separately and displayId
        const { socialAccounts, projects, displayId, ...clientData } = client;
        
        await prisma.client.upsert({
          where: { id: client.id },
          update: clientData,
          create: clientData
        });
      }
    }

    // Restore Projects
    if (backup.data.projects.length > 0) {
      console.log(`📤 Restoring ${backup.data.projects.length} projects...`);
      for (const project of backup.data.projects) {
        // Remove displayId from project data since it didn't exist in backup
        const { displayId, ...projectData } = project;
        await prisma.project.upsert({
          where: { id: project.id },
          update: projectData,
          create: projectData
        });
      }
    }

    // Restore Campaigns
    if (backup.data.campaigns.length > 0) {
      console.log(`📤 Restoring ${backup.data.campaigns.length} campaigns...`);
      for (const campaign of backup.data.campaigns) {
        // Remove displayId from campaign data since it didn't exist in backup
        const { displayId, ...campaignData } = campaign;
        await prisma.campaign.upsert({
          where: { id: campaign.id },
          update: campaignData,
          create: campaignData
        });
      }
    }

    // Restore Content
    if (backup.data.content.length > 0) {
      console.log(`📤 Restoring ${backup.data.content.length} content items...`);
      for (const content of backup.data.content) {
        // Remove displayId from content data since it didn't exist in backup
        const { displayId, ...contentData } = content;
        await prisma.content.upsert({
          where: { id: content.id },
          update: contentData,
          create: contentData
        });
      }
    }

    // Restore Social Accounts
    if (backup.data.socialAccounts.length > 0) {
      console.log(`📤 Restoring ${backup.data.socialAccounts.length} social accounts...`);
      for (const account of backup.data.socialAccounts) {
        await prisma.socialAccount.upsert({
          where: { id: account.id },
          update: account,
          create: account
        });
      }
    }

    // Restore Analytics
    if (backup.data.analytics.length > 0) {
      console.log(`📤 Restoring ${backup.data.analytics.length} analytics records...`);
      for (const analytics of backup.data.analytics) {
        await prisma.analytics.upsert({
          where: { id: analytics.id },
          update: analytics,
          create: analytics
        });
      }
    }

    console.log('✅ Data restore completed successfully!');
    console.log(`📊 Restored ${backup.metadata.totalRecords} total records`);
    
  } catch (error) {
    console.error('❌ Data restore failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 Database Restore Utility');
  console.log('============================');
  
  // Find the most recent backup file
  const backupPattern = /database_backup_(.+)\.json$/;
  const fs = require('fs');
  const backupsDir = join(process.cwd(), 'backups');
  
  if (!fs.existsSync(backupsDir)) {
    console.error('❌ Backups directory not found');
    process.exit(1);
  }
  
  const backupFiles = fs.readdirSync(backupsDir)
    .filter((file: string) => backupPattern.test(file))
    .sort()
    .reverse(); // Most recent first
  
  if (backupFiles.length === 0) {
    console.error('❌ No backup files found');
    process.exit(1);
  }
  
  const latestBackup = backupFiles[0];
  const backupFilePath = join(backupsDir, latestBackup);
  
  console.log(`📁 Using latest backup: ${latestBackup}`);
  
  await restoreData(backupFilePath);
}

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n⏹️ Restore interrupted by user');
  await prisma.$disconnect();
  process.exit(0);
});

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Restore script failed:', error);
    process.exit(1);
  });
}

export { restoreData };