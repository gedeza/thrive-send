export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  organizationId: string;
  createdBy: string;
  contentId?: string;
  socialMediaContent?: {
    platform: string;
    content: string;
    mediaUrls?: string[];
    scheduledTime?: string;
    status: string;
  };
  articleContent?: {
    content: string;
    metadata?: any;
  };
  blogPost?: any;
  emailCampaign?: any;
  analytics?: {
    views?: number;
    clicks?: number;
    engagement?: number;
    lastUpdated: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventCreateInput {
  title: string;
  description?: string;
  type: string;
  status?: string;
  startTime: string;
  endTime: string;
  contentId?: string;
  socialMediaContent?: {
    platform: string;
    content: string;
    mediaUrls?: string[];
    scheduledTime?: string;
    status?: string;
  };
  articleContent?: {
    content: string;
    metadata?: any;
  };
  analytics?: {
    views?: number;
    clicks?: number;
    engagement?: number;
    lastUpdated?: string;
  };
}

export interface CalendarEventUpdateInput extends Partial<CalendarEventCreateInput> {
  id: string;
}