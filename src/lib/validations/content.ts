import { z } from 'zod';

export const contentFormSchema = z.object({
  title: z.string()
    .min(3, 'Please enter a title (at least 3 characters)')
    .max(100, 'Title is too long (maximum 100 characters)'),
  type: z.enum(['ARTICLE', 'BLOG', 'SOCIAL', 'EMAIL'] as const, {
    errorMap: () => ({ message: 'Please select a content type' })
  }),
  content: z.string()
    .min(10, 'Please enter some content (at least 10 characters)')
    .refine((val) => val.trim().length > 0, {
      message: 'Please enter some content'
    }),
  excerpt: z.string()
    .max(200, 'Excerpt is too long (maximum 200 characters)')
    .optional(),
  tags: z.array(z.string())
    .max(5, 'You can add up to 5 tags')
    .default([]),
  media: z.array(z.any()).optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED'] as const).default('DRAFT'),
  scheduledAt: z.string().datetime().optional(),
  slug: z.string().min(1, 'Please enter a slug').optional(),
}).catchall(z.any());

export type ContentFormValues = z.infer<typeof contentFormSchema>; 