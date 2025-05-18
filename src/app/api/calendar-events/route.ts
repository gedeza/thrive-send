import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import type { ContentPiece, Prisma } from '@prisma/client';

// Helper: Format ContentPiece for frontend calendar
function formatEvent(event: any) {
  const e = event as ContentPiece;
  return {
    id: e.id,
    title: e.title,
    description: e.content || '',
    date: e.scheduledFor ? new Date(e.scheduledFor).toISOString().split('T')[0] : '',
    time: e.scheduledFor ? new Date(e.scheduledFor).toISOString().split('T')[1]?.slice(0, 5) : '',
    type: e.contentType || 'SOCIAL_POST',
    status: (e.status || 'DRAFT').toLowerCase(),
    campaignId: e.campaignId || undefined,
    recurrence: (e as any).recurrence || null,
    color: (e as any).color || null,
  };
}

// GET: List all events for the user/org
export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const events = await prisma.contentPiece.findMany({
      where: { authorId: userId, organizationId: orgId },
      orderBy: { scheduledFor: 'asc' },
    });
    return NextResponse.json(events.map(formatEvent));
  } catch (error) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json({ error: err.message, detail: String(err) }, { status: 500 });
  }
}

// POST: Create a new event
export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { title, description, date, time, type, status, campaignId, recurrence, color } = body;
    const scheduledFor = date ? new Date(`${date}T${time || '00:00'}`) : null;
    const data: Prisma.ContentPieceCreateInput = {
      title,
      content: description,
      scheduledFor,
      contentType: type,
      status,
      author: { connect: { id: userId } },
      organization: { connect: { id: orgId } },
      mediaUrls: [],
      ...(campaignId ? { campaign: { connect: { id: campaignId } } } : {}),
      recurrence: recurrence ?? null,
      color: color ?? null,
    } as any;
    const event = await prisma.contentPiece.create({ data });
    return NextResponse.json(formatEvent(event));
  } catch (error) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json({ error: err.message, detail: String(err) }, { status: 500 });
  }
}

// PUT: Update an event
export async function PUT(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const scheduledFor = body.date ? new Date(`${body.date}T${body.time || '00:00'}`) : null;
    const data: Prisma.ContentPieceUpdateInput = {
      title: body.title,
      content: body.description,
      status: body.status,
      scheduledFor,
      contentType: body.type,
      ...(body.campaignId ? { campaign: { connect: { id: body.campaignId } } } : {}),
      recurrence: body.recurrence ?? null,
      color: body.color ?? null,
    } as any;
    const updated = await prisma.contentPiece.update({
      where: { id: body.id },
      data,
    });
    return NextResponse.json(formatEvent(updated));
  } catch (error) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json({ error: err.message, detail: String(err) }, { status: 500 });
  }
}

// DELETE: Delete an event by id (in body)
export async function DELETE(req: NextRequest) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.contentPiece.delete({
      where: { id: body.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    const err = error as Error;
    return NextResponse.json({ error: err.message, detail: String(err) }, { status: 500 });
  }
} 