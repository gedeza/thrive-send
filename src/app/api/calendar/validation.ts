import { z } from 'zod';

// Schema for social media content
export const SocialMediaContentSchema = z.object({
  platform: z.string().optional(),
  postType: z.string().optional(),
  content: z.string().optional(),
  mediaUrls: z.array(z.string()).default([]),
  scheduledTime: z.string().optional(),
  status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
}).optional();

// Schema for blog post content
export const BlogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
  seoMetadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).default([]),
  }).optional(),
});

// Schema for email campaign content
export const EmailCampaignSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  recipientList: z.string().min(1, "Recipient list is required"),
  scheduleTime: z.string().optional(),
});

// Schema for custom content
export const CustomContentSchema = z.object({
  type: z.string().min(1, "Content type is required"),
  data: z.record(z.string(), z.any()),
});

// Updated calendar event schema to match actual database structure
export const CalendarEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  contentId: z.string().optional(), // Add this field
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  scheduledAt: z.string().optional(), // Add this field that's used in the API
  type: z.enum(["social", "blog", "email", "custom", "article"]),
  status: z.enum(["draft", "scheduled", "published", "sent", "failed"]).default("draft"),
  socialMediaContent: z.object({
    platform: z.string().optional(),
    postType: z.string().optional(),
    content: z.string().optional(),
    mediaUrls: z.array(z.string()).default([]),
    scheduledTime: z.string().optional(),
    status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
  }).optional(),
  blogPost: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    slug: z.string().optional(),
    publishedAt: z.string().optional(),
    status: z.string().optional(),
  }).optional(),
  emailCampaign: z.object({
    subject: z.string().optional(),
    content: z.string().optional(),
    scheduledAt: z.string().optional(),
    status: z.string().optional(),
  }).optional(),
  articleContent: z.object({
    content: z.string(),
    metadata: z.record(z.any()).optional(),
  }).optional(),
  customContent: z.object({
    type: z.string(),
    data: z.record(z.any()),
  }).optional(),
  analytics: z.object({
    views: z.number().optional(),
    engagement: z.object({
      likes: z.number().optional(),
      shares: z.number().optional(),
      comments: z.number().optional(),
    }).optional(),
    clicks: z.number().optional(),
    lastUpdated: z.string().optional(),
  }).optional(),
  organizationId: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Schema for event update
export const CalendarEventUpdateSchema = CalendarEventSchema.partial();

// Schema for event reschedule
export const EventRescheduleSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
});

// Schema for analytics query
export const AnalyticsQuerySchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  type: z.enum(["social", "blog", "email", "custom", "article"]).optional(),
  status: z.enum(["draft", "scheduled", "published", "sent", "failed"]).optional(),
});