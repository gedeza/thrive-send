#!/usr/bin/env tsx

/**
 * Test API Directly
 * 
 * Bypasses authentication to test if the API returns real clients
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testApiDirectly(): Promise<void> {
  console.log('🔍 Testing client API directly...');
  
  try {
    // Get the organization ID we know has clients
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: 'org_2xhH7xfnNAWnpvKl5gNd4ZGRP5t' }
    });

    if (!org) {
      console.error('❌ Organization not found');
      return;
    }

    console.log(`🏢 Found organization: ${org.name} (${org.id})`);

    // Query clients directly from database (simplified)
    const userClients = await prisma.client.findMany({
      where: {
        organizationId: org.id,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`🔍 Direct database query found ${userClients.length} clients:`);
    userClients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.name}`);
      console.log(`   ID: ${client.id}`);
      console.log(`   Display ID: ${client.displayId || 'None'}`);
      console.log(`   Status: ${client.status}`);
      console.log(`   Email: ${client.email}`);
      console.log(`   Created: ${client.createdAt}`);
      console.log('');
    });

    if (userClients.length === 0) {
      console.log('⚠️  No clients found with the query parameters.');
      console.log('   This might explain why the UI is empty.');
    } else {
      console.log('✅ Clients found! The issue is likely in the API authentication or frontend.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 Direct API Test');
  console.log('==================');
  
  await testApiDirectly();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ API test failed:', error);
    process.exit(1);
  });
}