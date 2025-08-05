// Calendar types for content management

export type CalendarView = 'month' | 'week' | 'day' | 'list';

export type ContentType = 'email' | 'social' | 'blog' | 'custom' | 'article';

export type ContentStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

export type SocialPlatform = 'FACEBOOK' | 'TWITTER' | 'INSTAGRAM' | 'LINKEDIN' | 'YOUTUBE' | 'TIKTOK' | 'PINTEREST' | 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'pinterest';

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
  
  // TDD-required fields
  startTime?: string; // ISO datetime string
  endTime?: string; // ISO datetime string
  timezone?: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
    count?: number;
  };
  tags?: string[];
  preview?: {
    thumbnail?: string;
    description?: string;
  };
  analytics?: {
    impressions?: number;
    clicks?: number;
    engagements?: number;
    reach?: number;
    shares?: number;
    likes?: number;
    comments?: number;
    conversions?: number;
    ctr?: number;
    cpm?: number;
    cost?: number;
    roi?: number;
    lastUpdated?: string;
  };
  templateMetadata?: {
    templateId?: string;
    originalTitle?: string;
    originalDescription?: string;
    originalTime?: string;
    originalPlatforms?: SocialPlatform[];
  };
}