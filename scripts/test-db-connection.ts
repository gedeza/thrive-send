#!/usr/bin/env tsx

/**
 * Test Database Connection
 * 
 * Simple script to test database connectivity and create a test client
 */

import { PrismaClient } from '@prisma/client';
import { generateId } from '../src/lib/id-generator';

const prisma = new PrismaClient();

async function testConnection(): Promise<void> {
  console.log('🔄 Testing database connection...');
  
  try {
    // Test basic connectivity
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if we can query the database
    const userCount = await prisma.user.count();
    const orgCount = await prisma.organization.count();
    const clientCount = await prisma.client.count();
    
    console.log('📊 Current database state:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Organizations: ${orgCount}`);
    console.log(`   - Clients: ${clientCount}`);
    
    // Test display ID generation
    const testDisplayId = generateId.client();
    console.log(`🆔 Generated test display ID: ${testDisplayId}`);
    
    console.log('✅ Database connection test completed successfully!');
    console.log('💡 The database is ready for real client creation');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 Database Connection Test');
  console.log('===========================');
  
  await testConnection();
}

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n⏹️ Test interrupted by user');
  await prisma.$disconnect();
  process.exit(0);
});

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  });
}

export { testConnection };