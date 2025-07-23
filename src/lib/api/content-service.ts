import { toast } from '@/components/ui/use-toast';
import { ContentFormValues } from '@/lib/validations/content';

const API_URL = '/api/content';

export interface ContentData {
  id: string;
  title: string;
  slug: string;
  type: 'ARTICLE' | 'BLOG' | 'SOCIAL' | 'EMAIL';
  content: string;
  excerpt?: string;
  tags: string[];
  platforms?: string[];
  media?: any;
  mediaItems?: Array<{
    id: string;
    type: string;
    url: string;
    title: string;
    description?: string;
    altText?: string;
    caption?: string;
    metadata?: any;
  }>;
  publishingOptions?: {
    crossPost: boolean;
    autoOptimize: boolean;
    trackAnalytics: boolean;
  };
  status: 'DRAFT' | 'IN_REVIEW' | 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';
  authorId: string;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentFormData {
  id?: string;
  title: string;
  type: 'ARTICLE' | 'BLOG' | 'SOCIAL' | 'EMAIL';
  content: string;
  tags: string[];
  media?: any;
  excerpt?: string;
  scheduledAt?: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';
  contentListId?: string;
}

export async function saveContent(data: ContentFormData): Promise<ContentData> {
  try {
    console.log('Saving content:', data);

    const requestBody = {
      ...data,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };
    console.log('Request body:', requestBody);

    const response = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error Response:', error);
      throw new Error(error.message || 'Failed to save content');
    }

    const savedContent = await response.json();
    console.log('Content saved successfully:', savedContent);

    // If content list ID is provided, associate content with the list
    if (data.contentListId && savedContent.id) {
      try {
        await associateContentWithList(savedContent.id, data.contentListId);
      } catch (associationError) {
        console.error('Failed to associate content with list:', associationError);
        // Don't fail the content creation if association fails
      }
    }

    // Calendar event creation is now handled by the API
    // This provides better error handling and consistency
    console.log('Calendar event creation handled by API for consistency');

    return savedContent;
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
}

/**
 * Associate a content item with a content list
 */
export async function associateContentWithList(contentId: string, contentListId: string): Promise<void> {
  try {
    console.log('Associating content with list:', { contentId, contentListId });
    const response = await fetch(`/api/content-lists/${contentListId}/contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ contentId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to associate content with list');
    }

    console.log('Content associated with list successfully');
  } catch (error) {
    console.error('Error associating content with list:', error);
    throw error;
  }
}

export async function getContent(id: string): Promise<ContentData> {
  try {
    console.log('Fetching content:', id);
    const response = await fetch(`/api/content/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch content');
    }
    const content = await response.json();
    console.log('Content fetched:', content);
    return content;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}

export async function updateContent(id: string, data: Partial<ContentFormValues>): Promise<ContentData> {
  try {
    console.log('Updating content:', { id, data });
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update content');
    }

    const updatedContent = await response.json();
    console.log('Content updated:', updatedContent);
    return updatedContent;
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
}

export async function deleteContent(id: string): Promise<void> {
  try {
    console.log('Deleting content:', id);
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete content');
    }
    console.log('Content deleted successfully');
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
}

export async function listContent(params: {
  page?: number;
  limit?: number;
  type?: string;
  contentType?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<{
  content: ContentData[];
  total: number;
  pages: number;
  pagination?: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}> {
  try {
    console.log('📋 Using simple content API for listing');
    
    // Use our simple, working API
    const response = await fetch('/api/simple-content', {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Simple API Error:', error);
      throw new Error(error.message || 'Failed to fetch content');
    }

    const data = await response.json();
    console.log('✅ Simple content API response:', data.content?.length, 'items');
    
    const content = data.content || [];
    
    // Apply client-side filtering for compatibility
    let filteredContent = content;
    
    if (params.type || params.contentType) {
      const typeFilter = (params.type || params.contentType)?.toUpperCase();
      filteredContent = filteredContent.filter((item: any) => item.type === typeFilter);
    }
    
    if (params.status) {
      filteredContent = filteredContent.filter((item: any) => item.status === params.status?.toUpperCase());
    }
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredContent = filteredContent.filter((item: any) => 
        item.title.toLowerCase().includes(searchLower) ||
        item.content.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 12;
    const total = filteredContent.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedContent = filteredContent.slice(start, start + limit);

    return {
      content: paginatedContent.map((item: any) => ({
        ...item,
        tags: item.tags || [],
        platforms: item.platforms || [],
        excerpt: item.content?.substring(0, 100),
        publishingOptions: undefined,
        mediaItems: []
      })),
      total,
      pages,
      pagination: {
        total,
        pages,
        page,
        limit
      }
    };
  } catch (error) {
    console.error('Error fetching content list:', error);
    throw error;
  }
}

export async function createContent(data: ContentFormValues): Promise<ContentData> {
  try {
    console.log('Creating content with media:', data);
    
    // Ensure media is properly serialized
    const processedData = {
      ...data,
      media: data.media ? JSON.stringify(data.media) : undefined,
    };
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(processedData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error Response:', error);
      throw new Error(error.message || 'Failed to create content');
    }

    const createdContent = await response.json();
    console.log('Content created successfully:', createdContent);

    // Force refresh of content list
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('content-created'));
    }

    return createdContent;
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
}

/**
 * Create a calendar event from content data
 * @deprecated - Calendar events are now handled automatically by the content API
 * This function is kept for backward compatibility but should not be used
 */
export async function createCalendarEventFromContent(content: ContentData): Promise<any> {
  console.warn('createCalendarEventFromContent is deprecated - calendar events are now handled by the content API');
  return Promise.resolve({ id: 'deprecated', message: 'Calendar events handled by content API' });
}

/**
 * Sync existing content to calendar events with retry mechanism
 */
export async function syncContentToCalendar(retryCount = 0): Promise<{ synced: number; errors: number }> {
  try {
    console.log('Starting content to calendar sync with relationship tracking...');
    
    let synced = 0;
    let errors = 0;
    const statusesToSync = ['PUBLISHED', 'APPROVED'];
    
    for (const status of statusesToSync) {
      try {
        const response = await fetch(`${API_URL}?limit=100&status=${status}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          console.error(`Failed to fetch ${status} content:`, response.status, response.statusText);
          errors++;
          continue;
        }

        const data = await response.json();
        const contentList = data.content || [];
        
        console.log(`Found ${contentList.length} content items with status ${status}`);

        for (const content of contentList) {
          try {
            // Check if calendar event already exists for this content using contentId
            const calendarResponse = await fetch(`/api/calendar/events?contentId=${content.id}`, {
              credentials: 'include',
            });

            if (calendarResponse.ok) {
              const { events } = await calendarResponse.json();
              
              if (events.length === 0) {
                console.log(`Creating calendar event for content: ${content.title} (ID: ${content.id})`);
                await createCalendarEventFromContent(content);
                synced++;
              } else {
                console.log(`Calendar event already exists for content: ${content.title} (ID: ${content.id})`);
              }
            }
          } catch (error) {
            console.error(`Failed to sync content ${content.id} to calendar:`, error);
            errors++;
          }
        }
      } catch (error) {
        console.error(`Failed to fetch content with status ${status}:`, error);
        errors++;
      }
    }

    console.log(`Sync completed: ${synced} synced, ${errors} errors`);
    return { synced, errors };
  } catch (error) {
    console.error('Error during content to calendar sync:', error);
    throw error;
  }
}