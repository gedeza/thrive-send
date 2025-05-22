import { MediaFile } from '@/components/content/MediaUploader';

export type ContentType = 'blog' | 'email' | 'social';

export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface Content {
  id: string;
  title: string;
  slug: string;
  type: ContentType;
  status: ContentStatus;
  content: string;
  excerpt?: string;
  media: MediaFile[];
  tags: string[];
  authorId: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContentInput {
  title: string;
  type: ContentType;
  content: string;
  excerpt?: string;
  media: MediaFile[];
  tags: string[];
  scheduledAt?: Date;
}

export interface UpdateContentInput extends Partial<CreateContentInput> {
  id: string;
  status?: ContentStatus;
} 