import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCalendar() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Create test user
    console.log('\nCreating test user...');
    const user = await prisma.user.create({
      data: {
        clerkId: 'test_user_123',
        email: 'test@example.com',
        name: 'Test User',
      },
    });
    console.log('✅ Test user created:', user);

    // Create test organization
    console.log('\nCreating test organization...');
    const org = await prisma.organization.create({
      data: {
        name: 'Test Org',
        slug: 'test-org',
        primaryColor: '#000000',
      },
    });
    console.log('✅ Test organization created:', org);

    // Create test calendar event
    console.log('\nCreating test calendar event...');
    const event = await prisma.calendarEvent.create({
      data: {
        title: 'Test Event',
        description: 'This is a test event',
        status: 'draft',
        type: 'email',
        createdBy: user.id,
        organizationId: org.id,
        startTime: new Date('2024-03-20T10:00:00Z'),
        endTime: new Date('2024-03-20T11:00:00Z'),
      },
    });
    console.log('✅ Test calendar event created:', event);

    // Query the created event
    console.log('\nQuerying created event...');
    const queriedEvent = await prisma.calendarEvent.findUnique({
      where: { id: event.id },
    });
    console.log('✅ Event queried successfully:', queriedEvent);

    // Clean up test data
    console.log('\nCleaning up test data...');
    await prisma.calendarEvent.delete({ where: { id: event.id } });
    await prisma.organization.delete({ where: { id: org.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('✅ Test data cleaned up successfully');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCalendar(); 