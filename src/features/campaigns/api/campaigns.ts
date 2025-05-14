// --- /src/features/campaigns/api/campaigns.ts ---
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma'; // Adjust import based on your project structure

// Basic Campaign Type
type Campaign = {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
};

// List campaigns or create a new campaign
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // List all campaigns
    const campaigns = await prisma.campaign.findMany();
    res.status(200).json(campaigns);
  } else if (req.method === 'POST') {
    // Create a new campaign
    const { name, description, startDate, endDate } = req.body;
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'draft',
      },
    });
    res.status(201).json(campaign);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}