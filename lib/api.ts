/**
 * API client for interacting with backend services
 */

// User related API functions
export async function updateUserProfile(userId: string, data: any) {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function uploadUserAvatar(userId: string, file: File) {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fetch(`/api/users/${userId}/avatar`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

// Analytics related API functions
export async function fetchAnalyticsData(params: { 
  startDate?: string; 
  endDate?: string;
  metrics?: string[];
}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.metrics) queryParams.append('metrics', params.metrics.join(','));
    
    const response = await fetch(`/api/analytics?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
}

// Content related API functions
export async function saveContent(data: any) {
  try {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/content/${data.id}` : '/api/content';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save content');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
}

export async function fetchContentById(id: string) {
  try {
    const response = await fetch(`/api/content/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}

export async function fetchScheduledContent(params?: {
  startDate?: string;
  endDate?: string;
}) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const response = await fetch(`/api/content/scheduled?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch scheduled content');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching scheduled content:', error);
    throw error;
  }
}

export async function updateContentSchedule(contentId: string, scheduleData: {
  publishDate: string;
  status: 'draft' | 'scheduled' | 'published';
}) {
  try {
    const response = await fetch(`/api/content/${contentId}/schedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update content schedule');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating content schedule:', error);
    throw error;
  }
}