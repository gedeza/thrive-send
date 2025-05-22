import { v4 as uuidv4 } from 'uuid';

/**
 * Represents the status of a calendar item
 */
export type CalendarItemStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

/**
 * Represents the type of content
 */
export type ContentType = 'blog' | 'social' | 'email' | 'other';

/**
 * Interface for a calendar item
 */
export interface CalendarItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  status: CalendarItemStatus;
  date: string;
  time: string;
  scheduledDate?: string;
  scheduledTime?: string;
  socialMediaContent?: SocialMediaContent;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for creating a new calendar item
 */
export interface CreateCalendarItemInput {
  title: string;
  description?: string;
  contentType: ContentType;
  status?: CalendarItemStatus;
  scheduledDate: Date;
  authorId: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Interface for updating a calendar item
 */
export interface UpdateCalendarItemInput {
  title?: string;
  description?: string;
  contentType?: ContentType;
  status?: CalendarItemStatus;
  scheduledDate?: Date;
  publishedDate?: Date;
  authorId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Interface for social media content
 */
export interface SocialMediaContent {
  platforms: string[];
  mediaUrls: string[];
  crossPost: boolean;
  platformSpecificContent: {
    [key: string]: {
      text: string;
      mediaUrls: string[];
      scheduledTime?: string;
    };
  };
}

/**
 * Calendar class to manage content calendar items
 */
export class Calendar {
  private items: Map<string, CalendarItem> = new Map();

  /**
   * Create a new calendar item
   */
  createItem(input: CreateCalendarItemInput): CalendarItem {
    const now = new Date();
    const newItem: CalendarItem = {
      id: uuidv4(),
      title: input.title,
      description: input.description,
      type: input.contentType,
      status: input.status || 'draft',
      date: now.toISOString().split('T')[0],
      time: now.toISOString().split('T')[1],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    this.items.set(newItem.id, newItem);
    return newItem;
  }

  /**
   * Get a calendar item by ID
   */
  getItem(id: string): CalendarItem | undefined {
    return this.items.get(id);
  }

  /**
   * Update a calendar item
   */
  updateItem(id: string, input: UpdateCalendarItemInput): CalendarItem | null {
    const item = this.items.get(id);
    if (!item) return null;

    const updatedItem: CalendarItem = {
      ...item,
      ...input,
      updatedAt: new Date().toISOString()
    };

    this.items.set(id, updatedItem);
    return updatedItem;
  }

  /**
   * Delete a calendar item
   */
  deleteItem(id: string): boolean {
    return this.items.delete(id);
  }

  /**
   * Get all calendar items
   */
  getAllItems(): CalendarItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Get items by status
   */
  getItemsByStatus(status: CalendarItemStatus): CalendarItem[] {
    return this.getAllItems().filter(item => item.status === status);
  }

  /**
   * Get items by date range
   */
  getItemsByDateRange(startDate: Date, endDate: Date): CalendarItem[] {
    return this.getAllItems().filter(item => {
      const scheduledDate = item.scheduledDate ? new Date(item.scheduledDate) : null;
      return scheduledDate && scheduledDate >= startDate && scheduledDate <= endDate;
    });
  }

  /**
   * Get items by author
   */
  getItemsByAuthor(authorId: string): CalendarItem[] {
    return this.getAllItems().filter(item => item.authorId === authorId);
  }

  /**
   * Get items by content type
   */
  getItemsByContentType(contentType: ContentType): CalendarItem[] {
    return this.getAllItems().filter(item => item.type === contentType);
  }

  /**
   * Publish a calendar item
   */
  publishItem(id: string): CalendarItem | null {
    const item = this.items.get(id);
    if (!item) return null;

    const updatedItem: CalendarItem = {
      ...item,
      status: 'sent',
      updatedAt: new Date().toISOString()
    };

    this.items.set(id, updatedItem);
    return updatedItem;
  }
}

export default Calendar;