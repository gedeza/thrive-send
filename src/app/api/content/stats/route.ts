import { NextRequest, NextResponse } from 'next/server';
import { ContentService } from '@/services/content.service';
import { getAuth } from '@clerk/nextjs/server';

const contentService = new ContentService();

export async function GET(req: NextRequest) {
  const { userId, orgId } = getAuth(req);

  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await contentService.getContentStats(orgId);
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Content Stats API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}