import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await prisma.$connect();
    if (req.method === 'GET') {
      const clients = await prisma.client.findMany({
        select: { id: true, name: true }
      });
      return res.status(200).json(clients);
    } else {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('[clients API] Error:', error);
    return res.status(500).json({ error: 'Unable to fetch clients' });
  } finally {
    await prisma.$disconnect();
  }
}