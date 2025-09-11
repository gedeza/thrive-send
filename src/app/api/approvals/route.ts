import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ContentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const approvals = await prisma.contentApproval.findMany({
      where: {
        ...(status && status !== 'ALL' ? { status: status as ContentStatus } : {}),
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        assignee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(approvals);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 