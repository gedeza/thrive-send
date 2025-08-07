/**
 * Centralized Template Types System
 * Consolidates all template-related interfaces to eliminate redundancy
 * and ensure type consistency across the application.
 */

// Base template interface - foundation for all template types
export interface BaseTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastUpdated: string;
  authorId: string;
  organizationId: string;
}

// Core template interface - standard template with all common fields
export interface Template extends BaseTemplate {
  type: 'email' | 'social' | 'blog' | 'multi-channel';
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_APPROVAL';
  content?: string;
  tags?: string[];
}

// Campaign-specific template with performance tracking
export interface CampaignTemplate extends Template {
  campaignGoal: 'awareness' | 'engagement' | 'conversion' | 'retention';
  performanceScore?: number;
  usageCount?: number;
  estimatedROI?: number;
  conversionRate?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  isRecommended?: boolean;
}

// Email provider template interface
export interface EmailTemplate {
  id: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables?: Record<string, any>;
}

// Service provider template with enhanced tracking
export interface ServiceProviderTemplate extends BaseTemplate {
  templateType: 'email' | 'social' | 'blog';
  content: string;
  previewImage?: string;
  // Service provider specific fields
  categoryTags?: string[];
  targetAudience?: string[];
  performanceMetrics?: {
    openRate?: number;
    clickRate?: number;
    conversionRate?: number;
    engagementScore?: number;
  };
  aiRecommended?: boolean;
  clientTypes?: string[];
  customizationLevel?: 'basic' | 'intermediate' | 'advanced';
  estimatedUsage?: number;
}

// Template collection for campaign sequences
export interface TemplateCollection {
  id: string;
  name: string;
  description: string;
  templates: CampaignTemplate[];
  estimatedConversion: string;
  duration: string;
  goal: string;
  color: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Template variable system
export interface TemplateVariable {
  id: string;
  name: string;
  type: 'text' | 'image' | 'link' | 'date' | 'number' | 'boolean' | 'conditional';
  defaultValue?: any;
  required: boolean;
  description?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
}

// Report template interface
export interface ReportTemplate extends BaseTemplate {
  type: string;
  category: string;
  metrics: string[];
  charts: string[];
  isPopular: boolean;
  usageCount: number;
  estimatedTime: string;
}

// Scheduling template
export interface SchedulingTemplate extends BaseTemplate {
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek: number[];
  time: string;
  timezone: string;
  platforms: string[];
  autoApproval: boolean;
  clientTypes: string[];
}

// Template for new creation (minimal required fields)
export interface NewTemplate {
  name: string;
  description: string;
  content: string;
  category: 'email' | 'social' | 'blog';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

// Template with enhanced metadata for listings
export interface EnhancedTemplate extends Template {
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  usageCount?: number;
  lastUsedByUser?: string | null;
  engagementRate?: number;
  aiRecommended?: boolean;
  performanceScore?: number;
}

// API response types
export interface TemplateListResponse {
  templates: ServiceProviderTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalTemplates: number;
    typeCounts: Record<string, number>;
    categoryBreakdown: Record<string, number>;
  };
  filters?: {
    availableTypes: string[];
    availableCategories: string[];
    availableTags: string[];
  };
}

export interface TemplateShareResult {
  success: boolean;
  message: string;
  sharedWith?: string[];
  accessLevel?: 'view' | 'edit' | 'admin';
}

// Template statistics and analytics
export interface TemplateStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  recommended?: number;
  avgPerformance?: number;
  totalUsage?: number;
  byType?: Record<string, number>;
  byCategory?: Record<string, number>;
}

// Template search and filter options
export interface TemplateFilters {
  type?: 'email' | 'social' | 'blog' | 'multi-channel' | 'all';
  category?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_APPROVAL' | 'all';
  campaignGoal?: 'awareness' | 'engagement' | 'conversion' | 'retention' | 'all';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  tags?: string[];
  searchQuery?: string;
}

// Template action types
export type TemplateAction = 
  | 'create'
  | 'edit' 
  | 'duplicate'
  | 'delete'
  | 'publish'
  | 'archive'
  | 'share'
  | 'use'
  | 'preview';

// Template permissions
export interface TemplatePermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canShare: boolean;
  canUse: boolean;
  canApprove: boolean;
}

// Template content structure
export interface TemplateContent {
  html: string;
  plainText?: string;
  variables?: TemplateVariable[];
  metadata?: Record<string, any>;
  assets?: {
    images?: string[];
    attachments?: string[];
  };
}

// Template preview configuration
export interface TemplatePreview {
  templateId: string;
  sampleData?: Record<string, any>;
  previewMode: 'desktop' | 'mobile' | 'email' | 'social';
  showVariables?: boolean;
}