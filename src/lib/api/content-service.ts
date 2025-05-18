import { toast } from '@/components/ui/use-toast';

export interface ContentData {
  id?: string;
  title: string;
  contentType: string;
  content: string;
  tags: string[];
  mediaUrls: string[];
  preheaderText: string;
  publishDate?: string;
  status: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentFormData extends Omit<ContentData, 'mediaUrls'> {
  mediaFiles: File[];
}

export async function saveContent(data: ContentFormData): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('contentType', data.contentType);
    formData.append('content', data.content);
    formData.append('tags', JSON.stringify(data.tags));
    formData.append('preheaderText', data.preheaderText);
    formData.append('status', data.status);
    
    if (data.publishDate) {
      formData.append('publishDate', data.publishDate);
    }

    // Upload media files first
    const mediaUrls = await Promise.all(
      data.mediaFiles.map(async (file) => {
        const mediaFormData = new FormData();
        mediaFormData.append('file', file);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: mediaFormData,
        });
        if (!response.ok) {
          throw new Error('Failed to upload media file');
        }
        const { url } = await response.json();
        return url;
      })
    );

    formData.append('mediaUrls', JSON.stringify(mediaUrls));

    const response = await fetch('/api/content', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save content');
    }
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
}

export async function getContent(id: string): Promise<ContentData> {
  try {
    const response = await fetch(`/api/content/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch content');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}

export async function updateContent(id: string, data: ContentFormData): Promise<void> {
  try {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('contentType', data.contentType);
    formData.append('content', data.content);
    formData.append('tags', JSON.stringify(data.tags));
    formData.append('preheaderText', data.preheaderText);
    formData.append('status', data.status);
    
    if (data.publishDate) {
      formData.append('publishDate', data.publishDate);
    }

    // Upload new media files
    const mediaUrls = await Promise.all(
      data.mediaFiles.map(async (file) => {
        const mediaFormData = new FormData();
        mediaFormData.append('file', file);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: mediaFormData,
        });
        if (!response.ok) {
          throw new Error('Failed to upload media file');
        }
        const { url } = await response.json();
        return url;
      })
    );

    formData.append('mediaUrls', JSON.stringify(mediaUrls));

    const response = await fetch(`/api/content/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update content');
    }
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
}

export async function deleteContent(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/content/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete content');
    }
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
}

export async function listContent(params: {
  status?: 'draft' | 'published';
  contentType?: string;
  page?: number;
  limit?: number;
}): Promise<{
  content: ContentData[];
  total: number;
  page: number;
  limit: number;
}> {
  try {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.contentType) queryParams.append('contentType', params.contentType);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/content?${queryParams.toString()}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch content list');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching content list:', error);
    throw error;
  }
} 