import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await prisma.$connect();
    if (req.method === 'GET') {
      const organizations = await prisma.organization.findMany({
        select: { id: true, name: true }
      });
      return res.status(200).json(organizations);
    } else {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (_error) {
    console.error("", _error);
    return res.status(500).json({ error: 'Unable to fetch organizations' });
  } finally {
    await prisma.$disconnect();
  }
}