import { prisma } from '../src/lib/db';

async function main() {
  try {
    // Try a simple query to test the connection
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('✅ Prisma connection successful:', result);
    
    // List all tables in the database
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📋 Available tables:', tables);
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();