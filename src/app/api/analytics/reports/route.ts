import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { name, sections, campaignId } = body;

    if (!name || !sections || !campaignId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        name,
        sections: sections,
        campaignId,
        createdBy: userId,
      },
    });

    return NextResponse.json(report);
  } catch (_error) {
    console.error("", _error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return new NextResponse('Missing campaignId', { status: 400 });
    }

    const reports = await prisma.report.findMany({
      where: {
        campaignId,
        createdBy: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reports);
  } catch (_error) {
    console.error("", _error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return new NextResponse('Missing reportId', { status: 400 });
    }

    await prisma.report.delete({
      where: {
        id: reportId,
        createdBy: userId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (_error) {
    console.error("", _error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 