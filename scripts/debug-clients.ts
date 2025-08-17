#!/usr/bin/env tsx

/**
 * Debug Clients Script
 * 
 * Investigates why clients might not be showing in the UI
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugClients(): Promise<void> {
  console.log('🔍 Debugging client visibility issues...');
  
  try {
    // Get all clients with detailed info
    const allClients = await prisma.client.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            clerkOrganizationId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📋 All clients in database:');
    console.log('===========================');
    
    allClients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.name}`);
      console.log(`   ID: ${client.id}`);
      console.log(`   Display ID: ${client.displayId || 'None'}`);
      console.log(`   Status: ${client.status}`);
      console.log(`   Email: ${client.email}`);
      console.log(`   Organization: ${client.organization.name} (${client.organization.id})`);
      console.log(`   Clerk Org ID: ${client.organization.clerkOrganizationId || 'None'}`);
      console.log(`   Created: ${client.createdAt}`);
      console.log('');
    });

    // Check for active clients specifically
    const activeClients = await prisma.client.findMany({
      where: { status: 'ACTIVE' }
    });

    console.log(`🔍 Analysis:`);
    console.log(`   Total clients: ${allClients.length}`);
    console.log(`   Active clients: ${activeClients.length}`);
    console.log(`   Inactive clients: ${allClients.length - activeClients.length}`);

    // Check organizations
    const organizations = await prisma.organization.findMany();
    console.log(`\n🏢 Organizations in database:`);
    organizations.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name}`);
      console.log(`   ID: ${org.id}`);
      console.log(`   Clerk ID: ${org.clerkOrganizationId || 'None'}`);
      console.log('');
    });

    // Look for specific eThekwini client
    const ethekwiniClients = allClients.filter(c => 
      c.name.toLowerCase().includes('ethekwini') || 
      c.name.toLowerCase().includes('municipality')
    );

    if (ethekwiniClients.length > 0) {
      console.log(`🎯 Found eThekwini Municipality clients:`);
      ethekwiniClients.forEach((client, index) => {
        console.log(`${index + 1}. ${client.name}`);
        console.log(`   ID: ${client.id}`);
        console.log(`   Display ID: ${client.displayId || 'None'}`);
        console.log(`   Status: ${client.status}`);
        console.log(`   Organization: ${client.organizationId}`);
        console.log('');
      });
    } else {
      console.log(`⚠️  No eThekwini Municipality clients found in database`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 Client Debug Utility');
  console.log('=======================');
  
  await debugClients();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Debug script failed:', error);
    process.exit(1);
  });
}