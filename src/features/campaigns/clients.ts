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