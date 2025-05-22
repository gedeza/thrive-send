export type ContentType = 'blog' | 'social' | 'email' | 'article';

export type ContentStatus = 'draft' | 'published' | 'archived';

export interface Content {
  id: string;
  title: string;
  content: string;
  contentType: ContentType;
  status: ContentStatus;
  mediaUrls: string[];
  preheaderText?: string;
  publishDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface CreateContentInput {
  title: string;
  content: string;
  contentType: ContentType;
  status?: ContentStatus;
  mediaUrls?: string[];
  preheaderText?: string;
  publishDate?: Date;
  tags?: string[];
}

export interface UpdateContentInput extends Partial<CreateContentInput> {
  id: string;
}

export interface ContentFilters {
  contentType?: ContentType;
  status?: ContentStatus;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  search?: string;
} 