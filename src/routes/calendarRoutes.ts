import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ContentType, CalendarItemStatus } from '../models/Calendar';

const router = express.Router();

// In-memory storage for calendar items
let calendarItems: any[] = [];

// GET all calendar items
router.get('/', (req, res) => {
  res.json(calendarItems);
});

// POST new calendar item
router.post('/', (req, res) => {
  const { title, description, type, status, date, time, socialMediaContent } = req.body;

  // Validate required fields
  if (!title || !type || !status || !date || !time) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['title', 'type', 'status', 'date', 'time']
    });
  }

  const newItem = {
    id: uuidv4(),
    title,
    description,
    type,
    status,
    date,
    time,
    socialMediaContent: socialMediaContent || {
      platforms: [],
      mediaUrls: [],
      crossPost: false,
      platformSpecificContent: {}
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  calendarItems.push(newItem);
  res.status(201).json(newItem);
});

// PUT update calendar item
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, type, status, date, time, socialMediaContent } = req.body;

  const itemIndex = calendarItems.findIndex(item => item.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Calendar item not found' });
  }

  const updatedItem = {
    ...calendarItems[itemIndex],
    ...(title && { title }),
    ...(description && { description }),
    ...(type && { type }),
    ...(status && { status }),
    ...(date && { date }),
    ...(time && { time }),
    ...(socialMediaContent && { socialMediaContent }),
    updatedAt: new Date().toISOString()
  };

  calendarItems[itemIndex] = updatedItem;
  res.json(updatedItem);
});

// DELETE calendar item
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const itemIndex = calendarItems.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Calendar item not found' });
  }

  // Remove the item from the array
  calendarItems = calendarItems.filter(item => item.id !== id);
  res.status(204).send();
});

export default router; 