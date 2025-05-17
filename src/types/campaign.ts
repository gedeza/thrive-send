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