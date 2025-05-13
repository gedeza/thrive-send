import { NextApiRequest, NextApiResponse } from 'next';
import { CalendarController } from '../../../controllers/CalendarController';

const calendarController = new CalendarController();

/**
 * Next.js API route for operations on a specific calendar item
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return await calendarController.getCalendarItem(req as any, res as any);
    case 'PUT':
      return await calendarController.updateCalendarItem(req as any, res as any);
    case 'DELETE':
      return await calendarController.deleteCalendarItem(req as any, res as any);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}