/**
 * API client for interacting with backend services
 */

// Helper to handle API errors more gracefully
async function handleApiResponse(response: Response) {
  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    try {
      const errorBody = await response.json(); // Try to parse JSON error body
      errorMessage += `: ${errorBody.message || JSON.stringify(errorBody)}`;
    } catch (e) {
      // If not JSON, try to get text
      try {
        const textBody = await response.text();
        if (textBody) errorMessage += `: ${textBody}`;
      } catch (e2) {
        // Fallback if no body or body can't be read
        errorMessage += ` - ${response.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

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
    return handleApiResponse(response);
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
    return handleApiResponse(response);
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
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
}

// Content related API functions
export async function saveContent(data: any & { id?: string }) {
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
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
}

export async function fetchContentById(id: string) {
  try {
    const response = await fetch(`/api/content/${id}`);
    return handleApiResponse(response);
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
    return handleApiResponse(response);
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
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error updating content schedule:', error);
    throw error;
  }
}

// Campaign related API functions
/**
 * Creates a new campaign.
 * @param campaignData - The data for the new campaign.
 * @returns The created campaign data from the server.
 */
export async function createCampaign(campaignData: any) {
  try {
    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData),
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}
