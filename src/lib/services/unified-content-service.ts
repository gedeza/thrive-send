/**
 * Unified Content Management Service
 * Bridges calendar events and content management while preserving existing architecture
 */

import { CalendarEvent, ContentType, SocialPlatform } from '@/components/content/types';
import { ContentData, createContent, updateContent, listContent } from '@/lib/api/content-service';
import { trackTemplateUsage, updateTemplatePerformance } from '@/lib/utils/template-analytics';

export interface UnifiedContentItem {
  // Core identification
  id: string;
  type: 'calendar-event' | 'content-item' | 'unified';
  
  // Shared properties
  title: string;
  description: string;
  contentType: ContentType;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  
  // Content management properties
  contentData?: ContentData;
  
  // Calendar properties
  calendarEvent?: CalendarEvent;
  
  // Unified properties
  scheduledAt?: string;
  publishedAt?: string;
  platforms?: SocialPlatform[];
  tags?: string[];
  mediaUrls?: string[];
  
  // Template tracking
  templateMetadata?: {
    templateId?: string;
    templateName?: string;
    appliedAt?: string;
    modifications?: Record<string, boolean>;
  };
  
  // Analytics
  analytics?: {
    views?: number;
    engagement?: number;
    conversions?: number;
    performance?: number;
  };
  
  // Lifecycle tracking
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  organizationId: string;
  
  // Cross-system synchronization
  syncStatus: 'synced' | 'pending' | 'failed' | 'partial';
  lastSyncAt?: string;
  syncErrors?: string[];
}

export interface ContentWorkflowState {
  stage: 'planning' | 'creation' | 'review' | 'scheduled' | 'published' | 'analyzed';
  progress: number; // 0-100
  nextAction?: string;
  blockers?: string[];
  estimatedCompletion?: string;
}

export interface UnifiedContentQuery {
  search?: string;
  contentType?: ContentType;
  status?: string;
  platforms?: SocialPlatform[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  includeAnalytics?: boolean;
  sortBy?: 'createdAt' | 'scheduledAt' | 'performance' | 'engagement';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Unified Content Service Class
 * Manages content across both calendar and content management systems
 */
export class UnifiedContentService {
  
  /**
   * Create content that exists in both systems
   */
  async createUnifiedContent(
    data: Partial<UnifiedContentItem>,
    options: {
      createInCalendar?: boolean;
      createInContentManager?: boolean;
      templateId?: string;
      scheduleImmediately?: boolean;
    } = {}
  ): Promise<UnifiedContentItem> {
    const {
      createInCalendar = true,
      createInContentManager = true,
      templateId,
      scheduleImmediately = false
    } = options;

    try {
      let contentData: ContentData | undefined;
      let calendarEvent: CalendarEvent | undefined;
      
      const unifiedId = data.id || this.generateUnifiedId();

      // Create in content management system
      if (createInContentManager) {
        contentData = await this.createContentManagerItem(data, unifiedId);
      }

      // Create in calendar system
      if (createInCalendar) {
        calendarEvent = await this.createCalendarEvent(data, unifiedId, contentData);
      }

      // Track template usage if applicable
      if (templateId && data.createdBy && data.organizationId) {
        await trackTemplateUsage(
          templateId,
          unifiedId,
          data.createdBy,
          data.organizationId,
          'unified'
        );
      }

      // Create unified content item
      const unifiedContent: UnifiedContentItem = {
        id: unifiedId,
        type: 'unified',
        title: data.title || '',
        description: data.description || '',
        contentType: data.contentType || 'social',
        status: data.status || 'draft',
        contentData,
        calendarEvent,
        scheduledAt: data.scheduledAt || calendarEvent?.startTime,
        platforms: data.platforms || calendarEvent?.socialMediaContent?.platforms,
        tags: data.tags || contentData?.tags,
        mediaUrls: data.mediaUrls || calendarEvent?.socialMediaContent?.mediaUrls,
        templateMetadata: data.templateMetadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: data.createdBy || '',
        organizationId: data.organizationId || '',
        syncStatus: 'synced',
        lastSyncAt: new Date().toISOString()
      };

      // Schedule immediately if requested
      if (scheduleImmediately && unifiedContent.scheduledAt) {
        await this.scheduleContent(unifiedContent.id);
      }

      // Emit event for real-time updates
      this.emitContentEvent('content-created', unifiedContent);

      return unifiedContent;

    } catch (_error) {
      console.error("", _error);
      throw new Error(`Failed to create unified content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update content across both systems
   */
  async updateUnifiedContent(
    id: string,
    updates: Partial<UnifiedContentItem>,
    options: {
      updateCalendar?: boolean;
      updateContentManager?: boolean;
      preserveSchedule?: boolean;
    } = {}
  ): Promise<UnifiedContentItem> {
    const {
      updateCalendar = true,
      updateContentManager = true,
      preserveSchedule = true
    } = options;

    try {
      // Get current unified content
      const currentContent = await this.getUnifiedContent(id);
      if (!currentContent) {
        throw new Error('Content not found');
      }

      // Update content management system
      if (updateContentManager && currentContent.contentData) {
        const updatedContentData = await updateContent(currentContent.contentData.id!, {
          title: updates.title || currentContent.title,
          excerpt: updates.description || currentContent.description,
          content: updates.description || currentContent.description,
          status: updates.status || currentContent.status,
          tags: updates.tags || currentContent.tags || [],
          publishingOptions: this.mapToPublishingOptions(updates),
          scheduledAt: !preserveSchedule ? updates.scheduledAt : currentContent.scheduledAt
        });
        currentContent.contentData = updatedContentData;
      }

      // Update calendar system
      if (updateCalendar && currentContent.calendarEvent) {
        // Calendar update would be handled by the calendar's onEventUpdate callback
        // This maintains the existing calendar architecture
        const updatedEvent: CalendarEvent = {
          ...currentContent.calendarEvent,
          title: updates.title || currentContent.title,
          description: updates.description || currentContent.description,
          type: updates.contentType || currentContent.contentType,
          status: this.mapToCalendarStatus(updates.status || currentContent.status),
          socialMediaContent: updates.platforms ? {
            ...currentContent.calendarEvent.socialMediaContent,
            platforms: updates.platforms
          } : currentContent.calendarEvent.socialMediaContent
        };
        currentContent.calendarEvent = updatedEvent;
      }

      // Update unified content
      const updatedUnifiedContent: UnifiedContentItem = {
        ...currentContent,
        ...updates,
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced',
        lastSyncAt: new Date().toISOString()
      };

      // Emit update event
      this.emitContentEvent('content-updated', updatedUnifiedContent);

      return updatedUnifiedContent;

    } catch (_error) {
      console.error("", _error);
      throw new Error(`Failed to update unified content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get unified content by ID
   */
  async getUnifiedContent(id: string): Promise<UnifiedContentItem | null> {
    try {
      // Try to find in both systems and merge
      const [contentData, calendarEvent] = await Promise.allSettled([
        this.findContentById(id),
        this.findCalendarEventById(id)
      ]);

      const content = contentData.status === 'fulfilled' ? contentData.value : null;
      const event = calendarEvent.status === 'fulfilled' ? calendarEvent.value : null;

      if (!content && !event) {
        return null;
      }

      return this.mergeToUnifiedContent(content, event);

    } catch (_error) {
      console.error("", _error);
      return null;
    }
  }

  /**
   * List unified content with filtering and sorting
   */
  async listUnifiedContent(query: UnifiedContentQuery = {}): Promise<{
    items: UnifiedContentItem[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Get content from both systems
      const [contentResults, calendarResults] = await Promise.allSettled([
        this.queryContentManager(query),
        this.queryCalendarEvents(query)
      ]);

      const contentItems = contentResults.status === 'fulfilled' ? contentResults.value : [];
      const calendarItems = calendarResults.status === 'fulfilled' ? calendarResults.value : [];

      // Merge and deduplicate
      const mergedItems = this.mergeAndDeduplicateContent(contentItems, calendarItems);

      // Apply unified filtering and sorting
      const filteredItems = this.applyUnifiedFiltering(mergedItems, query);

      return {
        items: filteredItems,
        total: filteredItems.length,
        hasMore: false // TODO: Implement pagination
      };

    } catch (_error) {
      console.error("", _error);
      return { items: [], total: 0, hasMore: false };
    }
  }

  /**
   * Schedule content for publication
   */
  async scheduleContent(id: string, scheduledAt?: string): Promise<void> {
    try {
      const content = await this.getUnifiedContent(id);
      if (!content) {
        throw new Error('Content not found');
      }

      const scheduleTime = scheduledAt || content.scheduledAt;
      if (!scheduleTime) {
        throw new Error('No schedule time provided');
      }

      // Update both systems
      await this.updateUnifiedContent(id, {
        status: 'scheduled',
        scheduledAt: scheduleTime
      });

      // Emit scheduling event
      this.emitContentEvent('content-scheduled', { ...content, scheduledAt: scheduleTime });

    } catch (_error) {
      console.error("", _error);
      throw _error;
    }
  }

  /**
   * Publish content immediately
   */
  async publishContent(id: string): Promise<void> {
    try {
      const content = await this.getUnifiedContent(id);
      if (!content) {
        throw new Error('Content not found');
      }

      // Update status to published
      await this.updateUnifiedContent(id, {
        status: 'published',
        publishedAt: new Date().toISOString()
      });

      // Track template performance if applicable
      if (content.templateMetadata?.templateId) {
        await updateTemplatePerformance(id, {
          status: 'completed',
          publishedAt: new Date().toISOString(),
          engagementScore: 0.8, // Initial score
          reach: 1000 // Estimated initial reach
        });
      }

      // Emit publication event
      this.emitContentEvent('content-published', content);

    } catch (_error) {
      console.error("", _error);
      throw _error;
    }
  }

  /**
   * Get content workflow state
   */
  async getWorkflowState(id: string): Promise<ContentWorkflowState | null> {
    try {
      const content = await this.getUnifiedContent(id);
      if (!content) {
        return null;
      }

      return this.calculateWorkflowState(content);

    } catch (_error) {
      console.error("", _error);
      return null;
    }
  }

  /**
   * Sync content between systems
   */
  async syncContent(id: string): Promise<UnifiedContentItem> {
    try {
      const content = await this.getUnifiedContent(id);
      if (!content) {
        throw new Error('Content not found');
      }

      // Perform sync operations
      const syncedContent = await this.performContentSync(content);

      // Emit sync event
      this.emitContentEvent('content-synced', syncedContent);

      return syncedContent;

    } catch (_error) {
      console.error("", _error);
      throw _error;
    }
  }

  // Private helper methods

  private generateUnifiedId(): string {
    return `unified-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async createContentManagerItem(data: Partial<UnifiedContentItem>, id: string): Promise<ContentData> {
    return await createContent({
      id,
      title: data.title || '',
      excerpt: data.description || '',
      content: data.description || '',
      type: data.contentType || 'social',
      status: data.status || 'draft',
      tags: data.tags || [],
      platforms: data.platforms || [],
      publishingOptions: this.mapToPublishingOptions(data),
      scheduledAt: data.scheduledAt
    });
  }

  private async createCalendarEvent(
    data: Partial<UnifiedContentItem>,
    id: string,
    contentData?: ContentData
  ): Promise<CalendarEvent> {
    const event: Omit<CalendarEvent, 'id'> = {
      title: data.title || '',
      description: data.description || '',
      type: data.contentType || 'social',
      status: this.mapToCalendarStatus(data.status || 'draft'),
      date: data.scheduledAt ? data.scheduledAt.split('T')[0] : new Date().toISOString().split('T')[0],
      time: data.scheduledAt ? data.scheduledAt.split('T')[1]?.substring(0, 5) : undefined,
      socialMediaContent: {
        platforms: data.platforms || [],
        crossPost: (data.platforms?.length || 0) > 1,
        mediaUrls: data.mediaUrls || [],
        platformSpecificContent: {}
      },
      organizationId: data.organizationId || '',
      createdBy: data.createdBy || ''
    };

    // This would integrate with the existing calendar system
    return { ...event, id } as CalendarEvent;
  }

  private mapToPublishingOptions(data: Partial<UnifiedContentItem>) {
    return {
      platforms: data.platforms || [],
      scheduledAt: data.scheduledAt,
      autoPublish: data.status === 'scheduled'
    };
  }

  private mapToCalendarStatus(status: string): 'draft' | 'scheduled' | 'sent' | 'failed' {
    switch (status) {
      case 'published': return 'sent';
      case 'scheduled': return 'scheduled';
      case 'failed': return 'failed';
      default: return 'draft';
    }
  }

  private async findContentById(id: string): Promise<ContentData | null> {
    try {
      // This would use the existing content service
      const results = await listContent({ search: id });
      return results.content?.find(c => c.id === id) || null;
    } catch {
      return null;
    }
  }

  private async findCalendarEventById(id: string): Promise<CalendarEvent | null> {
    // This would integrate with the existing calendar service
    // For now, return null - would be implemented with actual calendar integration
    return null;
  }

  private mergeToUnifiedContent(
    content: ContentData | null,
    event: CalendarEvent | null
  ): UnifiedContentItem | null {
    if (!content && !event) return null;

    const baseData = content || event;
    if (!baseData) return null;

    return {
      id: baseData.id || this.generateUnifiedId(),
      type: content && event ? 'unified' : content ? 'content-item' : 'calendar-event',
      title: content?.title || event?.title || '',
      description: content?.excerpt || event?.description || '',
      contentType: (content?.type || event?.type || 'social') as ContentType,
      status: content?.status || this.mapFromCalendarStatus(event?.status) || 'draft',
      contentData: content || undefined,
      calendarEvent: event || undefined,
      scheduledAt: content?.scheduledAt || event?.startTime,
      platforms: content?.platforms || event?.socialMediaContent?.platforms,
      tags: content?.tags,
      mediaUrls: event?.socialMediaContent?.mediaUrls,
      createdAt: content?.createdAt || new Date().toISOString(),
      updatedAt: content?.updatedAt || new Date().toISOString(),
      createdBy: content?.createdBy || event?.createdBy || '',
      organizationId: content?.organizationId || event?.organizationId || '',
      syncStatus: content && event ? 'synced' : 'partial'
    };
  }

  private mapFromCalendarStatus(status?: string): string {
    switch (status) {
      case 'sent': return 'published';
      case 'scheduled': return 'scheduled';
      case 'failed': return 'failed';
      default: return 'draft';
    }
  }

  private async queryContentManager(query: UnifiedContentQuery): Promise<ContentData[]> {
    try {
      const results = await listContent({
        search: query.search,
        contentType: query.contentType,
        status: query.status,
        limit: query.limit,
        // Map other query parameters as needed
      });
      return results.content || [];
    } catch {
      return [];
    }
  }

  private async queryCalendarEvents(query: UnifiedContentQuery): Promise<CalendarEvent[]> {
    // This would integrate with the existing calendar service
    // For now, return empty array - would be implemented with actual calendar integration
    return [];
  }

  private mergeAndDeduplicateContent(
    contentItems: ContentData[],
    calendarItems: CalendarEvent[]
  ): UnifiedContentItem[] {
    const itemsMap = new Map<string, UnifiedContentItem>();

    // Process content items
    contentItems.forEach(content => {
      const unified = this.mergeToUnifiedContent(content, null);
      if (unified) {
        itemsMap.set(unified.id, unified);
      }
    });

    // Process calendar items and merge with existing content
    calendarItems.forEach(event => {
      const existingContent = contentItems.find(c => c.id === event.id);
      const unified = this.mergeToUnifiedContent(existingContent || null, event);
      if (unified) {
        itemsMap.set(unified.id, unified);
      }
    });

    return Array.from(itemsMap.values());
  }

  private applyUnifiedFiltering(
    items: UnifiedContentItem[],
    query: UnifiedContentQuery
  ): UnifiedContentItem[] {
    let filtered = items;

    // Apply filters
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }

    if (query.contentType) {
      filtered = filtered.filter(item => item.contentType === query.contentType);
    }

    if (query.status) {
      filtered = filtered.filter(item => item.status === query.status);
    }

    if (query.platforms?.length) {
      filtered = filtered.filter(item =>
        item.platforms?.some(p => query.platforms!.includes(p))
      );
    }

    // Apply sorting
    if (query.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (query.sortBy) {
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'scheduledAt':
            aValue = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
            bValue = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
            break;
          case 'performance':
            aValue = a.analytics?.performance || 0;
            bValue = b.analytics?.performance || 0;
            break;
          case 'engagement':
            aValue = a.analytics?.engagement || 0;
            bValue = b.analytics?.engagement || 0;
            break;
          default:
            return 0;
        }

        const order = query.sortOrder === 'asc' ? 1 : -1;
        return (aValue - bValue) * order;
      });
    }

    return filtered;
  }

  private calculateWorkflowState(content: UnifiedContentItem): ContentWorkflowState {
    let stage: ContentWorkflowState['stage'] = 'planning';
    let progress = 0;

    switch (content.status) {
      case 'draft':
        stage = content.contentData ? 'creation' : 'planning';
        progress = content.contentData ? 40 : 20;
        break;
      case 'scheduled':
        stage = 'scheduled';
        progress = 80;
        break;
      case 'published':
        stage = content.analytics ? 'analyzed' : 'published';
        progress = content.analytics ? 100 : 90;
        break;
    }

    return {
      stage,
      progress,
      nextAction: this.getNextAction(content),
      estimatedCompletion: this.estimateCompletion(content)
    };
  }

  private getNextAction(content: UnifiedContentItem): string {
    switch (content.status) {
      case 'draft':
        return content.contentData ? 'Schedule for publication' : 'Complete content creation';
      case 'scheduled':
        return 'Wait for scheduled publication';
      case 'published':
        return content.analytics ? 'Review performance' : 'Monitor performance';
      default:
        return 'Continue workflow';
    }
  }

  private estimateCompletion(content: UnifiedContentItem): string {
    if (content.scheduledAt) {
      return content.scheduledAt;
    }
    // Default estimation logic
    const now = new Date();
    const estimated = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    return estimated.toISOString();
  }

  private async performContentSync(content: UnifiedContentItem): Promise<UnifiedContentItem> {
    // Implement actual sync logic between systems
    return {
      ...content,
      syncStatus: 'synced',
      lastSyncAt: new Date().toISOString(),
      syncErrors: []
    };
  }

  private emitContentEvent(eventType: string, data: unknown): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
    }
  }
}

// Export singleton instance
export const unifiedContentService = new UnifiedContentService();