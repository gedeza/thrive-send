import { z } from 'zod';

export const profileFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  role: z.string()
    .max(100, 'Role must be less than 100 characters')
    .optional(),
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  website: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  socialLinks: z.object({
    twitter: z.string()
      .regex(/^[A-Za-z0-9_]{1,15}$/, 'Invalid Twitter handle')
      .optional()
      .or(z.literal('')),
    linkedin: z.string()
      .url('Please enter a valid LinkedIn URL')
      .optional()
      .or(z.literal('')),
    github: z.string()
      .regex(/^[A-Za-z0-9-]{1,39}$/, 'Invalid GitHub username')
      .optional()
      .or(z.literal('')),
  }).optional(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>; 