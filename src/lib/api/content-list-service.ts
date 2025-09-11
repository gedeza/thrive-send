import { toast } from '@/components/ui/use-toast';

const API_URL = '/api/content-lists';

export interface ContentListData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  organizationId: string;
}

export interface ContentListFormData {
  id?: string;
  name: string;
  description?: string;
}

export async function createContentList(data: ContentListFormData): Promise<ContentListData> {
  try {
    console.log('Creating content list:', data);
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
      console.error("", _error);
      throw new Error(error.message || 'Failed to create content list');
    }

    const contentList = await response.json();
    console.log('Content list created successfully:', contentList);
    return contentList;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

export async function getContentList(id: string): Promise<ContentListData> {
  try {
    console.log('Fetching content list:', id);
    const response = await fetch(`${API_URL}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch content list');
    }
    
    const contentList = await response.json();
    console.log('Content list fetched:', contentList);
    return contentList;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

export async function updateContentList(id: string, data: Partial<ContentListFormData>): Promise<ContentListData> {
  try {
    console.log('Updating content list:', { id, data });
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
      throw new Error(error.message || 'Failed to update content list');
    }

    const updatedContentList = await response.json();
    console.log('Content list updated:', updatedContentList);
    return updatedContentList;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

export async function deleteContentList(id: string): Promise<void> {
  try {
    console.log('Deleting content list:', id);
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete content list');
    }
    
    console.log('Content list deleted successfully');
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

export async function listContentLists(): Promise<{
  lists: ContentListData[];
  total: number;
}> {
  try {
    console.log('Listing content lists');
    const response = await fetch(API_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("", _error);
      throw new Error(error.message || 'Failed to fetch content lists');
    }

    const data = await response.json();
    console.log('Content lists response:', data);
    return data;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

export async function getContentListContents(listId: string): Promise<{
  contents: any[];
  totalCount: number;
}> {
  try {
    console.log('Fetching contents for list:', listId);
    const response = await fetch(`${API_URL}/${listId}/contents`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch content list contents');
    }
    
    const data = await response.json();
    console.log('Content list contents fetched:', data);
    return data;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

export async function addContentToList(listId: string, contentId: string): Promise<void> {
  try {
    console.log('Adding content to list:', { listId, contentId });
    const response = await fetch(`${API_URL}/${listId}/contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ contentId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add content to list');
    }
    
    console.log('Content added to list successfully');
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

export async function removeContentFromList(listId: string, contentId: string): Promise<void> {
  try {
    console.log('Removing content from list:', { listId, contentId });
    const response = await fetch(`${API_URL}/${listId}/contents?contentId=${contentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove content from list');
    }
    
    console.log('Content removed from list successfully');
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

export async function getListsForContent(contentId: string): Promise<{
  lists: ContentListData[];
  totalCount: number;
}> {
  try {
    console.log('Fetching lists for content:', contentId);
    const response = await fetch(`/api/content/${contentId}/lists`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch content lists');
    }
    
    const data = await response.json();
    console.log('Content lists fetched:', data);
    return data;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}