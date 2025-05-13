import { NextApiRequest, NextApiResponse } from 'next';
import { CalendarController } from '../../../controllers/CalendarController';

const calendarController = new CalendarController();

/**
 * Next.js API route for calendar operations
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return await calendarController.getAllCalendarItems(req as any, res as any);
    case 'POST':
      return await calendarController.createCalendarItem(req as any, res as any);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}