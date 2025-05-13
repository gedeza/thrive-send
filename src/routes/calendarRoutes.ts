import express from 'express';
import { CalendarController } from '../controllers/CalendarController';

const router = express.Router();
const calendarController = new CalendarController();

// Create a new calendar item
router.post('/', (req, res) => calendarController.createCalendarItem(req, res));

// Get all calendar items (with optional filtering)
router.get('/', (req, res) => calendarController.getAllCalendarItems(req, res));

// Get a specific calendar item by ID
router.get('/:id', (req, res) => calendarController.getCalendarItem(req, res));

// Update a calendar item
router.put('/:id', (req, res) => calendarController.updateCalendarItem(req, res));

// Delete a calendar item
router.delete('/:id', (req, res) => calendarController.deleteCalendarItem(req, res));

// Publish a calendar item
router.post('/:id/publish', (req, res) => calendarController.publishCalendarItem(req, res));

export default router;