import { z } from 'zod';
import { CampaignStatus, CampaignGoalType, ScheduleFrequency } from '@prisma/client';

// Schema for filtering campaigns in GET
export const CampaignsQuerySchema = z.object({
  organizationId: z.string().optional(),
  userId: z.string().optional(),
  status: z.nativeEnum(CampaignStatus).optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
});

// Schema for campaign creation (POST)
export const CampaignCreateSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().nullable().optional(),
  startDate: z.string().min(1, 'Start Date is required'),
  endDate: z.string().min(1, 'End Date is required'),
  budget: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.number().positive().nullable().optional()
  ),
  goalType: z.nativeEnum(CampaignGoalType).default(CampaignGoalType.ENGAGEMENT),
  customGoal: z.string().nullable().optional(),
  status: z.nativeEnum(CampaignStatus).default(CampaignStatus.draft),
  organizationId: z.string().optional(),
  clientId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  scheduleFrequency: z.nativeEnum(ScheduleFrequency).default(ScheduleFrequency.ONCE),
  timezone: z.string().default('UTC'),
});