import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

// Extracts id param in App Router
type Params = { params: { id: string } };

// GET /api/content-calendar/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const item = await prisma.contentItem.findFirst({ where: { id: params.id, authorId: userId } });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

// PUT /api/content-calendar/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updated = await prisma.contentItem.updateMany({
    where: { id: params.id, authorId: userId },
    data: {
      title: body.title,
      body: body.body,
      status: body.status,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
    }
  });
  if (updated.count === 0) return NextResponse.json({ error: 'Update failed or forbidden' }, { status: 403 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/content-calendar/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete the content piece
    await prisma.contentPiece.delete({
      where: {
        id: params.id,
        authorId: userId,
        organizationId: orgId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting content calendar event:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}