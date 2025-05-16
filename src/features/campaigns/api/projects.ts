import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await prisma.$connect();
    if (req.method === 'GET') {
      const projects = await prisma.project.findMany({
        select: { id: true, name: true }
      });
      return res.status(200).json(projects);
    } else {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('[projects API] Error:', error);
    return res.status(500).json({ error: 'Unable to fetch projects' });
  } finally {
    await prisma.$disconnect();
  }
}