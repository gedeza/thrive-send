import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseIntegration() {
  console.log('🧪 Testing database integration...\n');
  
  try {
    // Test 1: Check boost products
    console.log('1. Testing Boost Products...');
    const boostProducts = await prisma.boostProduct.findMany({
      where: { isActive: true }
    });
    console.log(`   ✅ Found ${boostProducts.length} active boost products`);
    if (boostProducts.length > 0) {
      console.log(`   📦 Sample: ${boostProducts[0].name} - $${boostProducts[0].price}`);
    }

    // Test 2: Check organizations
    console.log('\n2. Testing Organizations...');
    const organizations = await prisma.organization.findMany({
      take: 3
    });
    console.log(`   ✅ Found ${organizations.length} organizations`);

    // Test 3: Check clients 
    console.log('\n3. Testing Clients...');
    const clients = await prisma.client.findMany({
      take: 5,
      include: {
        organization: {
          select: { name: true }
        }
      }
    });
    console.log(`   ✅ Found ${clients.length} clients`);
    if (clients.length > 0) {
      console.log(`   👤 Sample: ${clients[0].name} (${clients[0].type}) - ${clients[0].organization.name}`);
    }

    // Test 4: Check scheduled reports (should be empty initially)
    console.log('\n4. Testing Scheduled Reports...');
    const scheduledReports = await prisma.scheduledReport.findMany();
    console.log(`   ✅ Found ${scheduledReports.length} scheduled reports`);

    // Test 5: Check marketplace revenue (should be empty initially)
    console.log('\n5. Testing Marketplace Revenue...');
    const revenue = await prisma.marketplaceRevenue.findMany();
    console.log(`   ✅ Found ${revenue.length} revenue records`);

    // Test 6: Check boost purchases (should be empty initially)
    console.log('\n6. Testing Boost Purchases...');
    const purchases = await prisma.boostPurchase.findMany();
    console.log(`   ✅ Found ${purchases.length} boost purchases`);

    console.log('\n🎉 Database integration test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Boost Products: ${boostProducts.length} ✅`);
    console.log(`   - Organizations: ${organizations.length} ✅`);
    console.log(`   - Clients: ${clients.length} ✅`);
    console.log(`   - Scheduled Reports: ${scheduledReports.length} (expected 0)`);
    console.log(`   - Revenue Records: ${revenue.length} (expected 0)`);
    console.log(`   - Boost Purchases: ${purchases.length} (expected 0)`);

    console.log('\n🚀 Ready for frontend testing!');
    console.log('   Navigate to: http://localhost:3002');
    console.log('   Test pages: /marketplace, /reports, /service-provider/revenue');

  } catch (error) {
    console.error('❌ Database integration test failed:', error);
    throw error;
  }
}

async function main() {
  await testDatabaseIntegration();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });