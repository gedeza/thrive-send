// /src/features/campaigns/api/organizations.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

// GET /api/organizations: List all organizations (id, name)
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

// ---------------------------

// /src/features/campaigns/api/clients.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

// GET /api/clients: List all clients (id, name)
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
  } catch (_error) {
    console.error("", _error);
    return res.status(500).json({ error: 'Unable to fetch clients' });
  } finally {
    await prisma.$disconnect();
  }
}

// ---------------------------

// /src/features/campaigns/api/projects.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

// GET /api/projects: List all projects (id, name)
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
  } catch (_error) {
    console.error("", _error);
    return res.status(500).json({ error: 'Unable to fetch projects' });
  } finally {
    await prisma.$disconnect();
  }
}