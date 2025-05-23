import { NextApiRequest, NextApiResponse } from 'next';
import { ContentService } from '@/services/content.service';
import { getAuth } from '@clerk/nextjs/server';

const contentService = new ContentService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, orgId } = getAuth(req);

  if (!userId || !orgId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const stats = await contentService.getContentStats(orgId);
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Content Stats API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 