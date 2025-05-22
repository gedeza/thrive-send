import { toast } from '@/components/ui/use-toast';
import { ContentFormValues } from '@/lib/validations/content';

const API_URL = '/api/content';

export interface ContentData {
  id: string;
  title: string;
  slug: string;
  type: 'article' | 'blog' | 'social' | 'email';
  content: string;
  excerpt?: string;
  tags: string[];
  media?: any;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  authorId: string;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentFormData {
  id?: string;
  title: string;
  type: 'article' | 'blog' | 'social' | 'email';
  content: string;
  tags: string[];
  media?: any;
  excerpt?: string;
  scheduledAt?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
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
    return savedContent;
  } catch (error) {
    console.error('Error saving content:', error);
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
  status?: string;
}): Promise<{
  content: ContentData[];
  total: number;
  pages: number;
}> {
  try {
    console.log('Listing content with params:', params);
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.type) searchParams.set('type', params.type);
    if (params.status) searchParams.set('status', params.status);

    const response = await fetch(`${API_URL}?${searchParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error Response:', error);
      throw new Error(error.message || 'Failed to fetch content');
    }

    const data = await response.json();
    console.log('Content list response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching content list:', error);
    throw error;
  }
}

export async function createContent(data: ContentFormValues): Promise<ContentData> {
  try {
    console.log('Creating content:', data);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error Response:', error);
      throw new Error(error.message || 'Failed to create content');
    }

    const createdContent = await response.json();
    console.log('Content created:', createdContent);
    return createdContent;
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
} 