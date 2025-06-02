/**
 * API module for interacting with backend services
 */

/**
 * Fetches analytics data based on provided filters
 */
export async function fetchAnalyticsData(filters: any = {}) {
  // Implementation would go here in a real app
  return {
    emailsSent: 0,
    openRate: 0,
    clickRate: 0,
    unsubscribeRate: 0,
    campaigns: [],
    timeSeriesData: []
  };
}

/**
 * Updates a user profile
 */
export async function updateUserProfile(userId: string, data: any) {
  // Implementation would go here in a real app
  return { success: true };
}

/**
 * Uploads a user avatar
 */
export async function uploadUserAvatar(userId: string, file: File) {
  // Implementation would go here in a real app
  return { success: true, avatar: '/path/to/new-avatar.jpg' };
}

/**
 * Fetches scheduled content with optional filters
 */
export async function fetchScheduledContent(filters: any = {}) {
  // Implementation would go here in a real app
  return [];
}

/**
 * Updates content schedule
 */
export async function updateContentSchedule(contentId: string, data: any) {
  // Implementation would go here in a real app
  return { success: true };
}

/**
 * Saves content (creates or updates)
 */
export async function saveContent(data: any) {
  // POST to /api/content
  const res = await fetch('/api/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    throw new Error(`Save content failed: ${res.status}`);
  }
  return await res.json();
}

/**
 * Fetches content by ID
 */
export async function fetchContentById(contentId: string) {
  // Implementation would go here in a real app
  return {
    id: contentId,
    title: 'Sample Content',
    content: '<p>Content here</p>',
    type: 'newsletter',
    scheduledDate: new Date().toISOString(),
    status: 'draft'
  };
}

/**
 * Uploads media files for ContentForm and editor
 */
export async function uploadMedia(file: File): Promise<{ url: string, filename: string }> {
  const form = new FormData();
  form.append('file', file);
  
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: form,
  });
  
  if (!res.ok) {
    throw new Error(`Media upload failed: ${res.status}`);
  }
  
  return await res.json();
}

import { handleApiError } from './apiErrorHandler';
import { CampaignStatus, CampaignGoalType, ScheduleFrequency } from '@prisma/client';

export interface CampaignData {
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  budget: number | null;
  goalType: CampaignGoalType;
  customGoal: string | null;
  status: CampaignStatus;
  organizationId?: string;
  clientId?: string | null;
  projectId?: string | null;
  scheduleFrequency: ScheduleFrequency;
  timezone: string;
}

export async function createCampaign(data: CampaignData): Promise<Response> {
  try {
    console.log('Sending campaign data to API:', data);
    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.log('Campaign creation failed with status:', response.status);
    }

    return response;
  } catch (error) {
    console.error('API error in createCampaign:', error);
    throw handleApiError(error);
  }
}
