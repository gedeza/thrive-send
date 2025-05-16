// --- /src/features/campaigns/api/campaigns.ts ---
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma'; // This should match the actual path to your Prisma client

// API Campaign Type aligned with Prisma schema
type CampaignInput = {
  name: string;
  description?: string;
  startDate: string; // ISO date string from frontend
  endDate: string; // ISO date string from frontend
  budget?: number;
  goals?: string;
  status: 'draft' | 'active' | 'completed';
  organizationId: string;
  clientId?: string;
  projectId?: string;
};

// List campaigns or create a new campaign
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check database connection
    await prisma.$connect();
    console.log('Database connection established successfully');

    if (req.method === 'GET') {
      // List all campaigns with related data
      console.log('Fetching campaigns from database...');
      const campaigns = await prisma.campaign.findMany({
        include: {
          organization: { select: { name: true } },
          client: { select: { name: true } },
          project: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      console.log(`Successfully fetched ${campaigns.length} campaigns`);
      return res.status(200).json(campaigns);
    } else if (req.method === 'POST') {
      console.log('Creating new campaign with data:', req.body);
      const campaignData: CampaignInput = req.body;
      
      // Validate required fields
      if (!campaignData.name || !campaignData.startDate || !campaignData.endDate || !campaignData.organizationId) {
        console.warn('Validation failed:', { campaignData });
        return res.status(400).json({ 
          error: 'Missing required fields', 
          details: 'name, startDate, endDate, and organizationId are required' 
        });
      }
      
      // Create the campaign
      const campaign = await prisma.campaign.create({
        data: {
          name: campaignData.name,
          description: campaignData.description || null,
          startDate: new Date(campaignData.startDate),
          endDate: new Date(campaignData.endDate),
          budget: campaignData.budget || null,
          goals: campaignData.goals || null,
          status: campaignData.status || 'draft',
          organization: {
            connect: { id: campaignData.organizationId }
          },
          ...(campaignData.clientId ? { client: { connect: { id: campaignData.clientId } } } : {}),
          ...(campaignData.projectId ? { project: { connect: { id: campaignData.projectId } } } : {})
        },
      });
      
      console.log('Campaign created successfully:', campaign.id);
      return res.status(201).json(campaign);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling campaign request:', error);
    
    // Check for specific Prisma errors
    if ((error as any)?.code) {
      console.error('Prisma error code:', (error as any).code);
    }
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return res.status(500).json({ 
      error: 'Something went wrong with the database operation',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  } finally {
    // Ensure connection is closed properly
    await prisma.$disconnect();
  }
}
