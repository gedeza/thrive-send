import { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory events for demonstration
const FAKE_EVENTS = [
  {
    id: "1",
    title: "Weekly Team Sync",
    description: "Weekly sync for all team members",
    startDate: "2025-05-28T10:00:00Z",
    endDate: "2025-05-28T11:00:00Z",
    type: "meeting",
    status: "scheduled",
    location: "Zoom",
    attendees: ["alice@example.com", "bob@example.com"]
  },
  {
    id: "2",
    title: "Marketing Review",
    description: "Quarterly marketing plan review",
    startDate: "2025-05-29T14:00:00Z",
    endDate: "2025-05-29T15:00:00Z",
    type: "meeting",
    status: "scheduled",
    location: "Conference Room A",
    attendees: ["carol@example.com"]
  }
];

// Handler for /api/calendar/events
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return the fake events
    return res.status(200).json(FAKE_EVENTS);
  }

  // Method not allowed
  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}