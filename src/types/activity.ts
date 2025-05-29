import { z } from 'zod';

// Base activity type discriminator
export type ActivityType = 
  | 'campaign' 
  | 'email' 
  | 'user' 
  | 'system'
  | 'profile'
  | 'content'
  | 'social'
  | 'settings';

// Base activity interface
export interface BaseActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    image?: string;
  };
}

// Campaign activity
export interface CampaignActivity extends BaseActivity {
  type: 'campaign';
  campaignId?: string;
  status?: 'draft' | 'scheduled' | 'published' | 'failed';
}

// Email activity
export interface EmailActivity extends BaseActivity {
  type: 'email';
  emailId?: string;
  recipientCount?: number;
  status?: 'sent' | 'failed' | 'scheduled';
}

// User activity
export interface UserActivity extends BaseActivity {
  type: 'user';
  action: 'joined' | 'left' | 'updated';
  userId?: string;
}

// System activity
export interface SystemActivity extends BaseActivity {
  type: 'system';
  severity: 'info' | 'warning' | 'error';
}

// Profile activity
export interface ProfileActivity extends BaseActivity {
  type: 'profile';
  action: 'PROFILE_UPDATE' | 'SETTINGS_UPDATE';
  metadata?: Record<string, any>;
}

// Content activity
export interface ContentActivity extends BaseActivity {
  type: 'content';
  action: 'CONTENT_CREATE' | 'CONTENT_UPDATE';
  contentId?: string;
  metadata?: {
    title?: string;
    type?: string;
  };
}

// Social activity
export interface SocialActivity extends BaseActivity {
  type: 'social';
  action: 'SOCIAL_POST';
  platform?: string;
  metadata?: {
    platform?: string;
    postId?: string;
  };
}

// Union type of all activities
export type Activity = 
  | CampaignActivity 
  | EmailActivity 
  | UserActivity 
  | SystemActivity 
  | ProfileActivity 
  | ContentActivity 
  | SocialActivity;

// Zod schema for activity validation
export const activitySchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('campaign'),
    title: z.string(),
    description: z.string(),
    timestamp: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().optional(),
    }).optional(),
    campaignId: z.string().optional(),
    status: z.enum(['draft', 'scheduled', 'published', 'failed']).optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('email'),
    title: z.string(),
    description: z.string(),
    timestamp: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().optional(),
    }).optional(),
    emailId: z.string().optional(),
    recipientCount: z.number().optional(),
    status: z.enum(['sent', 'failed', 'scheduled']).optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('user'),
    title: z.string(),
    description: z.string(),
    timestamp: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().optional(),
    }).optional(),
    action: z.enum(['joined', 'left', 'updated']),
    userId: z.string().optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('system'),
    title: z.string(),
    description: z.string(),
    timestamp: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().optional(),
    }).optional(),
    severity: z.enum(['info', 'warning', 'error']),
  }),
  z.object({
    id: z.string(),
    type: z.literal('profile'),
    title: z.string(),
    description: z.string(),
    timestamp: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().optional(),
    }).optional(),
    action: z.enum(['PROFILE_UPDATE', 'SETTINGS_UPDATE']),
    metadata: z.record(z.any()).optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('content'),
    title: z.string(),
    description: z.string(),
    timestamp: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().optional(),
    }).optional(),
    action: z.enum(['CONTENT_CREATE', 'CONTENT_UPDATE']),
    contentId: z.string().optional(),
    metadata: z.object({
      title: z.string().optional(),
      type: z.string().optional(),
    }).optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('social'),
    title: z.string(),
    description: z.string(),
    timestamp: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().optional(),
    }).optional(),
    action: z.literal('SOCIAL_POST'),
    platform: z.string().optional(),
    metadata: z.object({
      platform: z.string().optional(),
      postId: z.string().optional(),
    }).optional(),
  }),
]); 