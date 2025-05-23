import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Replace these values with your actual Clerk user ID and email
  const clerkId = 'user_2xCfWWtekyWSMVmLALqnr6z0Nfo';
  const email = 'nnyandu@gmail.com';

  try {
    const user = await prisma.user.upsert({
      where: { clerkId },
      create: {
        clerkId,
        email,
        firstName: 'Test',
        lastName: 'User',
      },
      update: {
        email,
        firstName: 'Test',
        lastName: 'User',
      },
    });

    console.log('Created/Updated user:', user);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 