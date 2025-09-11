import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Simple database connection test
    await prisma.$connect();
    
    // Test basic query
    const userCount = await prisma.user.count();
    const orgCount = await prisma.organization.count();
    
    return NextResponse.json({
      status: 'connected',
      message: 'Database connection successful',
      counts: {
        users: userCount,
        organizations: orgCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    console.error("", _error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}