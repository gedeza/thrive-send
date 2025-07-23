// Calendar types for content management

export type CalendarView = 'month' | 'week' | 'day' | 'list';

export type ContentType = 'email' | 'social' | 'blog' | 'custom' | 'article';

export type ContentStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

export type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'pinterest';

export interface SocialMediaContent {
  platforms: SocialPlatform[];
  crossPost: boolean;
  mediaUrls: string[];
  platformSpecificContent: Record<string, any>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  status: ContentStatus;
  date: string; // ISO date string
  time?: string; // HH:MM format
  duration?: number; // minutes
  socialMediaContent?: SocialMediaContent;
  organizationId?: string;
  createdBy?: string;
}