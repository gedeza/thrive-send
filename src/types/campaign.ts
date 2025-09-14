import { CampaignStatus } from '@prisma/client';

// Campaign Status Type (using Prisma enum directly)
export type { CampaignStatus };

// Campaign Response Type
export interface CampaignResponse {
  id: string;
  name: string;
  status: CampaignStatus;
  channel: string;
  audience: string;
  sentDate: string | null;
  openRate: number | null;
  createdAt: string;
  clientName: string | null;
  clientId: string | null;
  organizationId: string;
  organizationName: string | null;
  projectId: string | null;
  projectName: string | null;
}

// Campaign Create Input Type
export interface CampaignCreateInput {
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  budget?: number | null;
  goals?: string | null;
  status?: CampaignStatus;
  organizationId: string;
  clientId?: string | null;
  projectId?: string | null;
}

// Campaign Template Types for Onboarding
export interface ContentTemplate {
  id: string;
  type: 'blog' | 'email' | 'social' | 'landing-page';
  title: string;
  content: string;
  platform?: string;
  scheduledFor?: string;
}

export interface EmailTemplate {
  id: string;
  subject: string;
  content: string;
  delayDays: number;
  triggerEvent: string;
}

export interface SocialPostTemplate {
  id: string;
  platform: 'linkedin' | 'facebook' | 'twitter' | 'instagram';
  content: string;
  scheduledFor: string;
  hashtags?: string[];
}

export interface EstimatedResults {
  leads: number;
  consultations: number;
  roi: string;
  timeToResults: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  estimatedResults: EstimatedResults;
  campaignData: Omit<CampaignCreateInput, 'organizationId' | 'clientId' | 'projectId'>;
  contentAssets: ContentTemplate[];
  emailSequences: EmailTemplate[];
  socialPosts: SocialPostTemplate[];
  targetAudience: {
    demographics: string[];
    industries: string[];
    jobTitles: string[];
    locations: string[];
  };
  successMetrics: {
    primary: string;
    secondary: string[];
    kpis: Array<{
      name: string;
      target: number;
      unit: string;
    }>;
  };
} 