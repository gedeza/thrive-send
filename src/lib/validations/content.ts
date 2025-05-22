import { z } from 'zod';

export const contentFormSchema = z.object({
  title: z.string()
    .min(3, 'Please enter a title (at least 3 characters)')
    .max(100, 'Title is too long (maximum 100 characters)'),
  type: z.enum(['article', 'blog', 'social', 'email'] as const, {
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
  status: z.enum(['draft', 'scheduled', 'sent', 'failed'] as const).optional().default('draft'),
  scheduledAt: z.string().datetime().optional(),
  slug: z.string().min(1, 'Please enter a slug').optional(),
}).catchall(z.any());

export type ContentFormValues = z.infer<typeof contentFormSchema>; 