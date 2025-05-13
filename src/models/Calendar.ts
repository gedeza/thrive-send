import { v4 as uuidv4 } from 'uuid';

/**
 * Represents the status of a calendar item
 */
export enum CalendarItemStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

/**
 * Represents the type of content
 */
export enum ContentType {
  BLOG_POST = 'blog_post',
  SOCIAL_MEDIA = 'social_media',
  EMAIL = 'email',
  VIDEO = 'video',
  PODCAST = 'podcast',
  OTHER = 'other'
}

/**
 * Interface for a calendar item
 */
export interface CalendarItem {
  id: string;
  title: string;
  description?: string;
  contentType: ContentType;
  status: CalendarItemStatus;
  scheduledDate: Date;
  publishedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  tags?: string[];
  metadata?: Record<string, any>;
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
      contentType: input.contentType,
      status: input.status || CalendarItemStatus.DRAFT,
      scheduledDate: input.scheduledDate,
      createdAt: now,
      updatedAt: now,
      authorId: input.authorId,
      tags: input.tags || [],
      metadata: input.metadata || {}
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
      updatedAt: new Date()
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
      return item.scheduledDate >= startDate && item.scheduledDate <= endDate;
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
    return this.getAllItems().filter(item => item.contentType === contentType);
  }

  /**
   * Publish a calendar item
   */
  publishItem(id: string): CalendarItem | null {
    const item = this.items.get(id);
    if (!item) return null;

    const updatedItem: CalendarItem = {
      ...item,
      status: CalendarItemStatus.PUBLISHED,
      publishedDate: new Date(),
      updatedAt: new Date()
    };

    this.items.set(id, updatedItem);
    return updatedItem;
  }
}

export default Calendar;