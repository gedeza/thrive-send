import { z } from 'zod';

// Schema for filtering campaigns in GET
export const CampaignsQuerySchema = z.object({
  organizationId: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
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
  goals: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
  organizationId: z.string().min(1, 'Organization is required'),
  clientId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
});