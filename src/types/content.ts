export type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'linkedin';

export type ContentType = "email" | "social" | "blog" | "other";

export type EventStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

export interface PlatformSpecificContent {
  text: string;
  mediaUrls: string[];
  scheduledTime?: string;
}

export interface SocialMediaContent {
  platforms: SocialPlatform[];
  text: string;
  mediaUrls: string[];
  platformSpecificContent?: Record<SocialPlatform, PlatformSpecificContent>;
}

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  scheduledDate?: string;
  type: ContentType;
  status: EventStatus;
  campaignId?: string;
  socialMediaContent?: SocialMediaContent;
  analytics?: {
    views?: number;
    engagement?: {
      likes?: number;
      shares?: number;
      comments?: number;
    };
    clicks?: number;
    lastUpdated?: string;
  };
  preview?: {
    thumbnail?: string;
    platformPreviews?: {
      [key in SocialPlatform]?: {
        previewUrl?: string;
        status?: 'pending' | 'approved' | 'rejected';
        rejectionReason?: string;
      };
    };
  };
} 