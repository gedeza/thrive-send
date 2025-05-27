export type ContentType = 'article' | 'email' | 'blog' | 'social';
export type EventStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

export interface SocialMediaContent {
  platform: string;
  postType: string;
  content: string;
  mediaUrls?: string[];
  scheduledTime?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
}

export interface BlogPost {
  title: string;
  content: string;
  slug: string;
  author: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  tags?: string[];
  scheduledTime?: string;
}

export interface EmailCampaign {
  subject: string;
  content: string;
  recipientList: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledTime?: string;
}

export interface Analytics {
  views?: number;
  engagement?: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
  clicks?: number;
  lastUpdated: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'social' | 'blog' | 'email' | 'custom';
  status: 'draft' | 'scheduled' | 'published' | 'sent' | 'failed';
  socialMediaContent?: SocialMediaContent;
  blogPost?: BlogPost;
  emailCampaign?: EmailCampaign;
  customContent?: {
    type: string;
    content: any;
  };
  analytics?: Analytics;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  organizationId: string;
} 