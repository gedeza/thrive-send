import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      // You can change these values as needed
      clerkId: 'test-clerk-id',
      email: 'testuser@example.com',
      firstName: 'Test',
      lastName: 'User',
    },
  });
  console.log('Test user created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect()); 