// --- /src/features/campaigns/api/campaigns.ts ---
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma'; // This should match the actual path to your Prisma client

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
  try {
    if (req.method === 'GET') {
      // List all campaigns
      console.log('Attempting to fetch campaigns from database...');
      const campaigns = await prisma.campaign.findMany();
      console.log(`Successfully fetched ${campaigns.length} campaigns`);
      return res.status(200).json(campaigns);
    } else if (req.method === 'POST') {
      // Create a new campaign
      const { name, description, startDate, endDate } = req.body;
      
      // Validate required fields
      if (!name || !startDate || !endDate) {
        return res.status(400).json({ 
          error: 'Missing required fields', 
          details: 'name, startDate, and endDate are required' 
        });
      }
      
      const campaign = await prisma.campaign.create({
        data: {
          name,
          description: description || null, // Handle potentially undefined description
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: 'draft',
        },
      });
      return res.status(201).json(campaign);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling campaign request:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return res.status(500).json({ 
      error: 'Something went wrong',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}
