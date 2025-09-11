import { toast } from '@/components/ui/use-toast';
import { ContentFormValues } from '@/lib/validations/content';

// 🚀 B2B2G SERVICE PROVIDER API ENDPOINTS
const API_URL = '/api/content';
const SERVICE_PROVIDER_API_URL = '/api/service-provider/content';

// 🎯 SERVICE PROVIDER CONTEXT DETECTION
function useServiceProviderAPI(data?: any): boolean {
  // Use service provider API if:
  // 1. Data contains service provider fields
  // 2. Client context is available
  return !!(
    data?.serviceProviderId || 
    data?.clientId || 
    data?.clientName ||
    (typeof window !== 'undefined' && window.location.pathname.includes('service-provider'))
  );
}

// 🔧 URL BUILDER FOR SERVICE PROVIDER OPERATIONS
function buildServiceProviderURL(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(SERVICE_PROVIDER_API_URL + endpoint, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }
  return url.toString();
}

export interface ContentData {
  id: string;
  title: string;
  slug?: string;
  type: 'ARTICLE' | 'BLOG' | 'SOCIAL' | 'EMAIL';
  contentType?: 'blog' | 'email' | 'social'; // Service provider format
  content: string;
  excerpt?: string;
  tags: string[];
  platforms?: string[];
  media?: any;
  mediaItems?: Array<{
    id: string;
    type: string;
    url: string;
    title: string;
    description?: string;
    altText?: string;
    caption?: string;
    metadata?: any;
  }>;
  publishingOptions?: {
    crossPost: boolean;
    autoOptimize: boolean;
    trackAnalytics: boolean;
  };
  status: 'DRAFT' | 'IN_REVIEW' | 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED' | 'draft' | 'published' | 'scheduled';
  authorId?: string;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // 🎯 SERVICE PROVIDER FIELDS
  clientId?: string;
  clientName?: string;
  serviceProviderId?: string;
  createdByUserId?: string;
  
  // Performance metrics
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  engagementRate?: number;
  performanceScore?: number;
}

export interface ContentFormData {
  id?: string;
  title: string;
  type: 'ARTICLE' | 'BLOG' | 'SOCIAL' | 'EMAIL';
  contentType?: 'blog' | 'email' | 'social'; // Service provider format
  content: string;
  tags: string[];
  media?: any;
  excerpt?: string;
  scheduledAt?: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED' | 'draft' | 'published' | 'scheduled';
  contentListId?: string;
  
  // 🎯 SERVICE PROVIDER FIELDS
  clientId?: string;
  clientName?: string;
  serviceProviderId?: string;
  createdByUserId?: string;
}

export async function saveContent(data: ContentFormData): Promise<ContentData> {
  try {
    console.log('🚀 Saving content with service provider context detection:', data);

    // 🎯 CHOOSE API BASED ON CONTEXT
    const useServiceProvider = useServiceProviderAPI(data);
    
    const requestBody = {
      ...data,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      // Normalize content type for service provider API
      contentType: data.contentType || data.type?.toLowerCase(),
    };
    
    console.log(`📡 Using ${useServiceProvider ? 'SERVICE PROVIDER' : 'LEGACY'} API for save:`, requestBody);

    // 🎯 USE APPROPRIATE API ENDPOINT
    const apiEndpoint = useServiceProvider ? SERVICE_PROVIDER_API_URL : '/api/content';
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("", _error);
      throw new Error(error.message || 'Failed to save content');
    }

    const savedContent = await response.json();
    console.log('✅ Content saved successfully:', savedContent);

    // If content list ID is provided, associate content with the list
    if (data.contentListId && savedContent.id) {
      try {
        await associateContentWithList(savedContent.id, data.contentListId);
      } catch (associationError) {
        console.error('Failed to associate content with list:', associationError);
        // Don't fail the content creation if association fails
      }
    }

    // Calendar event creation is now handled by the API
    console.log('📅 Calendar event creation handled by API for consistency');

    return savedContent;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

/**
 * Associate a content item with a content list
 */
export async function associateContentWithList(contentId: string, contentListId: string): Promise<void> {
  try {
    console.log('Associating content with list:', { contentId, contentListId });
    const response = await fetch(`/api/content-lists/${contentListId}/contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ contentId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to associate content with list');
    }

    console.log('Content associated with list successfully');
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

export async function getContent(id: string): Promise<ContentData> {
  try {
    console.log('Fetching content:', id);
    const response = await fetch(`/api/content/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch content');
    }
    const content = await response.json();
    console.log('Content fetched:', content);
    return content;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

export async function updateContent(id: string, data: Partial<ContentFormValues>): Promise<ContentData> {
  try {
    console.log('Updating content:', { id, data });
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update content');
    }

    const updatedContent = await response.json();
    console.log('Content updated:', updatedContent);
    return updatedContent;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

export async function deleteContent(id: string): Promise<void> {
  try {
    console.log('Deleting content:', id);
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete content');
    }
    console.log('Content deleted successfully');
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

export async function listContent(params: {
  page?: number;
  limit?: number;
  type?: string;
  contentType?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  // 🎯 SERVICE PROVIDER PARAMETERS
  organizationId?: string;
  clientId?: string;
}): Promise<{
  content: ContentData[];
  total: number;
  pages: number;
  pagination?: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  summary?: any;
}> {
  try {
    // 🎯 DETECT SERVICE PROVIDER CONTEXT
    const useServiceProvider = useServiceProviderAPI(params) || 
      !!(params.organizationId || params.clientId);
    
    console.log(`📋 Using ${useServiceProvider ? 'SERVICE PROVIDER' : 'LEGACY'} API for content listing`);

    if (useServiceProvider) {
      // 🚀 USE SERVICE PROVIDER API
      const serviceProviderParams = {
        page: params.page?.toString(),
        limit: params.limit?.toString(),
        contentType: params.contentType || params.type,
        status: params.status,
        search: params.search,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc',
        organizationId: params.organizationId,
        clientId: params.clientId,
      };

      // Remove undefined values
      Object.keys(serviceProviderParams).forEach(key => {
        if (serviceProviderParams[key as keyof typeof serviceProviderParams] === undefined) {
          delete serviceProviderParams[key as keyof typeof serviceProviderParams];
        }
      });

      const apiUrl = buildServiceProviderURL('', serviceProviderParams);
      console.log('🔗 Service Provider API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("", _error);
        throw new Error(error.message || 'Failed to fetch service provider content');
      }

      const data = await response.json();
      console.log('✅ Service Provider API response:', data.content?.length, 'items');

      return {
        content: data.content || [],
        total: data.pagination?.total || 0,
        pages: data.pagination?.totalPages || 0,
        pagination: data.pagination,
        summary: data.summary,
      };
    } else {
      // 🔄 FALLBACK TO LEGACY API
      console.log('📋 Using legacy simple content API for listing');
      
      const response = await fetch('/api/simple-content', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("", _error);
        throw new Error(error.message || 'Failed to fetch content');
      }

      const data = await response.json();
      console.log('✅ Legacy content API response:', data.content?.length, 'items');
      
      const content = data.content || [];
      
      // Apply client-side filtering for compatibility
      let filteredContent = content;
      
      if (params.type || params.contentType) {
        const typeFilter = (params.type || params.contentType)?.toUpperCase();
        filteredContent = filteredContent.filter((item: any) => item.type === typeFilter);
      }
      
      if (params.status) {
        filteredContent = filteredContent.filter((item: any) => item.status === params.status?.toUpperCase());
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredContent = filteredContent.filter((item: any) => 
          item.title.toLowerCase().includes(searchLower) ||
          item.content.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 12;
      const total = filteredContent.length;
      const pages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginatedContent = filteredContent.slice(start, start + limit);

      return {
        content: paginatedContent.map((item: any) => ({
          ...item,
          tags: item.tags || [],
          platforms: item.platforms || [],
          excerpt: item.content?.substring(0, 100),
          publishingOptions: undefined,
          mediaItems: []
        })),
        total,
        pages,
        pagination: {
          total,
          pages,
          page,
          limit
        }
      };
    }
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

export async function createContent(data: ContentFormValues): Promise<ContentData> {
  try {
    console.log('🚀 Creating content with service provider context detection:', data);
    
    // 🎯 DETECT SERVICE PROVIDER CONTEXT
    const useServiceProvider = useServiceProviderAPI(data);
    
    // Ensure media is properly serialized
    const processedData = {
      ...data,
      media: data.media ? JSON.stringify(data.media) : undefined,
      // Normalize content type for service provider API
      contentType: data.contentType || data.type?.toLowerCase(),
    };
    
    console.log(`📡 Using ${useServiceProvider ? 'SERVICE PROVIDER' : 'LEGACY'} API for create:`, processedData);
    
    // 🎯 USE APPROPRIATE API ENDPOINT
    const apiEndpoint = useServiceProvider ? SERVICE_PROVIDER_API_URL : API_URL;
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(processedData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("", _error);
      throw new Error(error.message || 'Failed to create content');
    }

    const createdContent = await response.json();
    console.log('✅ Content created successfully:', createdContent);

    // Force refresh of content list
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('content-created'));
    }

    return createdContent;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

/**
 * Create a calendar event from content data
 * @deprecated - Calendar events are now handled automatically by the content API
 * This function is kept for backward compatibility but should not be used
 */
export async function createCalendarEventFromContent(content: ContentData): Promise<any> {
  console.warn('createCalendarEventFromContent is deprecated - calendar events are now handled by the content API');
  return Promise.resolve({ id: 'deprecated', message: 'Calendar events handled by content API' });
}

/**
 * Sync existing content to calendar events with retry mechanism
 */
export async function syncContentToCalendar(retryCount = 0): Promise<{ synced: number; errors: number }> {
  try {
    console.log('Starting content to calendar sync with relationship tracking...');
    
    let synced = 0;
    let errors = 0;
    const statusesToSync = ['PUBLISHED', 'APPROVED'];
    
    for (const status of statusesToSync) {
      try {
        const response = await fetch(`${API_URL}?limit=100&status=${status}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          console.error(`Failed to fetch ${status} content:`, response.status, response.statusText);
          errors++;
          continue;
        }

        const data = await response.json();
        const contentList = data.content || [];
        
        console.log(`Found ${contentList.length} content items with status ${status}`);

        for (const content of contentList) {
          try {
            // Check if calendar event already exists for this content using contentId
            const calendarResponse = await fetch(`/api/calendar/events?contentId=${content.id}`, {
              credentials: 'include',
            });

            if (calendarResponse.ok) {
              const { events } = await calendarResponse.json();
              
              if (events.length === 0) {
                console.log(`Creating calendar event for content: ${content.title} (ID: ${content.id})`);
                await createCalendarEventFromContent(content);
                synced++;
              } else {
                console.log(`Calendar event already exists for content: ${content.title} (ID: ${content.id})`);
              }
            }
          } catch (_error) {
            console.error("", _error);
            errors++;
          }
        }
      } catch (_error) {
        console.error("", _error);
        errors++;
      }
    }

    console.log(`Sync completed: ${synced} synced, ${errors} errors`);
    return { synced, errors };
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

// 🚀 NEW SERVICE PROVIDER FUNCTIONS

/**
 * Get service provider content analytics
 */
export async function getServiceProviderContentAnalytics(params: {
  organizationId: string;
  clientId?: string;
  timeRange?: '7d' | '30d' | '90d';
}): Promise<any> {
  try {
    console.log('📊 Fetching service provider content analytics:', params);
    
    const analyticsParams = {
      organizationId: params.organizationId,
      ...(params.clientId && { clientId: params.clientId }),
      ...(params.timeRange && { timeRange: params.timeRange }),
    };

    const apiUrl = buildServiceProviderURL('/analytics', analyticsParams);
    console.log('🔗 Analytics API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("", _error);
      throw new Error(error.message || 'Failed to fetch content analytics');
    }

    const analytics = await response.json();
    console.log('✅ Service Provider analytics response:', analytics);

    return analytics;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

/**
 * Get content library for a specific client
 */
export async function getClientContentLibrary(params: {
  organizationId: string;
  clientId: string;
  page?: number;
  limit?: number;
  status?: string;
  contentType?: string;
}): Promise<{
  content: ContentData[];
  total: number;
  pages: number;
  pagination?: any;
  summary?: any;
}> {
  try {
    console.log('📚 Fetching client content library:', params);
    
    return await listContent({
      organizationId: params.organizationId,
      clientId: params.clientId,
      page: params.page,
      limit: params.limit,
      status: params.status,
      contentType: params.contentType,
    });
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

/**
 * Get cross-client content performance comparison
 */
export async function getCrossClientContentPerformance(organizationId: string): Promise<any> {
  try {
    console.log('🔄 Fetching cross-client content performance:', organizationId);
    
    const analytics = await getServiceProviderContentAnalytics({
      organizationId,
      timeRange: '30d',
    });

    return {
      overview: analytics.data?.overview,
      clientPerformance: analytics.data?.clientPerformance,
      crossClient: analytics.data?.crossClient,
      contentTypeBreakdown: analytics.data?.contentTypeBreakdown,
    };
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}