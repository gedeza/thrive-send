// Calendar types for the content module
export type SocialPlatform = 'FACEBOOK' | 'TWITTER' | 'INSTAGRAM' | 'LINKEDIN';

export interface SocialMediaContent {
  platforms: SocialPlatform[];
  mediaUrls: string[];
  crossPost: boolean;
  platformSpecificContent: {
    [key in SocialPlatform]?: {
      text: string;
      mediaUrls: string[];
      scheduledTime?: string;
    };
  };
}

// Content types supported by the calendar
export type ContentType = 'social' | 'blog' | 'email' | 'custom' | 'article';

// Calendar event interface
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  date: string;
  time?: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  socialMediaContent: SocialMediaContent;
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
  organizationId: string;
  createdBy: string;
  tags?: string[];
}

// Calendar view types
export type CalendarView = "month" | "week" | "day" | "list";

// Event drop data for drag and drop
export interface DropData {
  date: string;
  time?: string;
}

// Drag data for drag and drop
export interface DragData {
  event: CalendarEvent;
  sourceDate: string;
  sourceTime?: string;
} 