import { Request, Response } from 'express';
import { CalendarService } from '../services/CalendarService';
import { CalendarItemStatus, ContentType } from '../models/Calendar';

/**
 * Controller for handling calendar-related HTTP requests
 */
export class CalendarController {
  private calendarService: CalendarService;

  constructor() {
    this.calendarService = new CalendarService();
  }

  /**
   * Create a new calendar item
   */
  async createCalendarItem(req: Request, res: Response): Promise<void> {
    try {
      const calendarItem = await this.calendarService.createCalendarItem(req.body);
      res.status(201).json(calendarItem);
    } catch (error) {
      console.error('Error creating calendar item:', error);
      res.status(500).json({ error: 'Failed to create calendar item' });
    }
  }

  /**
   * Get a calendar item by ID
   */
  async getCalendarItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const calendarItem = await this.calendarService.getCalendarItem(id);
      
      if (!calendarItem) {
        res.status(404).json({ error: 'Calendar item not found' });
        return;
      }
      
      res.status(200).json(calendarItem);
    } catch (error) {
      console.error('Error getting calendar item:', error);
      res.status(500).json({ error: 'Failed to get calendar item' });
    }
  }

  /**
   * Update a calendar item
   */
  async updateCalendarItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedItem = await this.calendarService.updateCalendarItem(id, req.body);
      
      if (!updatedItem) {
        res.status(404).json({ error: 'Calendar item not found' });
        return;
      }
      
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating calendar item:', error);
      res.status(500).json({ error: 'Failed to update calendar item' });
    }
  }

  /**
   * Delete a calendar item
   */
  async deleteCalendarItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.calendarService.deleteCalendarItem(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Calendar item not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting calendar item:', error);
      res.status(500).json({ error: 'Failed to delete calendar item' });
    }
  }

  /**
   * Get all calendar items
   */
  async getAllCalendarItems(req: Request, res: Response): Promise<void> {
    try {
      // Handle query parameters for filtering
      const { status, startDate, endDate, authorId, contentType } = req.query;
      
      let items;
      
      if (status) {
        items = await this.calendarService.getCalendarItemsByStatus(status as CalendarItemStatus);
      } else if (startDate && endDate) {
        items = await this.calendarService.getCalendarItemsByDateRange(
          new Date(startDate as string), 
          new Date(endDate as string)
        );
      } else if (authorId) {
        items = await this.calendarService.getCalendarItemsByAuthor(authorId as string);
      } else if (contentType) {
        items = await this.calendarService.getCalendarItemsByContentType(contentType as ContentType);
      } else {
        items = await this.calendarService.getAllCalendarItems();
      }
      
      res.status(200).json(items);
    } catch (error) {
      console.error('Error getting calendar items:', error);
      res.status(500).json({ error: 'Failed to get calendar items' });
    }
  }

  /**
   * Publish a calendar item
   */
  async publishCalendarItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const publishedItem = await this.calendarService.publishCalendarItem(id);
      
      if (!publishedItem) {
        res.status(404).json({ error: 'Calendar item not found' });
        return;
      }
      
      res.status(200).json(publishedItem);
    } catch (error) {
      console.error('Error publishing calendar item:', error);
      res.status(500).json({ error: 'Failed to publish calendar item' });
    }
  }
}

export default CalendarController;