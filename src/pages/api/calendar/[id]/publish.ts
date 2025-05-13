import { NextApiRequest, NextApiResponse } from 'next';
import { CalendarController } from '../../../../controllers/CalendarController';

const calendarController = new CalendarController();

/**
 * Next.js API route for publishing a calendar item
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST for publishing
  if (req.method === 'POST') {
    return await calendarController.publishCalendarItem(req as any, res as any);
  }
  
  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}