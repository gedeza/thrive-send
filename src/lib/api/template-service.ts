import { toast } from '@/components/ui/use-toast';
import { db as prisma } from '@/lib/db';

// 🚀 B2B2G SERVICE PROVIDER TEMPLATE MANAGEMENT
const SERVICE_PROVIDER_TEMPLATE_API_URL = '/api/service-provider/templates';

export interface ServiceProviderTemplate {
  id: string;
  name: string;
  description: string;
  templateType: 'email' | 'social' | 'blog';
  content: string;
  previewImage?: string;
  createdAt: string;
  updatedAt: string;
  
  // 🎯 SERVICE PROVIDER FIELDS
  serviceProviderId: string;
  createdByUserId: string;
  isShared: boolean;
  
  // 📊 SHARING METRICS
  sharedWithClients: string[];
  totalUsage: number;
  clientUsage: Record<string, number>;
  
  // 🎨 CUSTOMIZATION OPTIONS
  customizableFields: Array<{
    field: string;
    label: string;
    type: 'text' | 'textarea' | 'color' | 'url' | 'date' | 'time';
  }>;
  
  // 📈 PERFORMANCE TRACKING
  averageEngagement: number;
  bestPerformingClient: string | null;
  tags: string[];
  category: string;
}

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
    totalUsage: number;
    averageEngagement: number;
  };
  shareableClients: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

export interface TemplateShareResult {
  success: boolean;
  templateId: string;
  operation: 'share' | 'unshare';
  results: Array<{
    clientId: string;
    clientName: string;
    status: 'shared' | 'unshared';
    sharedAt?: string;
    unsharedAt?: string;
    permissions?: {
      canView: boolean;
      canUse: boolean;
      canCustomize: boolean;
      canCopy: boolean;
    };
    cleanupActions?: {
      activeUsageRemoved: boolean;
      scheduledContentUpdated: boolean;
      notificationSent: boolean;
    };
  }>;
  summary: {
    totalClients: number;
    successfulShares?: number;
    failedShares?: number;
    successfulUnshares?: number;
    failedUnshares?: number;
    previouslyShared?: number;
    activeUsageAffected?: number;
  };
  notifications?: {
    clientsNotified: boolean;
    notificationsSent: number;
    emailsQueued: number;
  };
  warnings?: string[];
}

/**
 * Get service provider templates with client filtering and search
 */
export async function getServiceProviderTemplates(params: {
  organizationId: string;
  clientId?: string;
  templateType?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}): Promise<TemplateListResponse> {
  try {
    console.log('🎨 Fetching service provider templates:', params);
    
    const queryParams = new URLSearchParams({
      organizationId: params.organizationId,
      ...(params.clientId && { clientId: params.clientId }),
      ...(params.templateType && { templateType: params.templateType }),
      ...(params.search && { search: params.search }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    });

    const response = await fetch(`${SERVICE_PROVIDER_TEMPLATE_API_URL}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Service Provider Template API Error:', error);
      throw new Error(error.message || 'Failed to fetch templates');
    }

    const data = await response.json();
    console.log('✅ Service provider templates fetched:', data.templates?.length, 'templates');

    return data;
  } catch (error) {
    console.error('❌ Error fetching service provider templates:', error);
    throw error;
  }
}

/**
 * Create a new service provider template
 */
export async function createServiceProviderTemplate(data: {
  name: string;
  description: string;
  templateType: 'email' | 'social' | 'blog';
  content: string;
  customizableFields?: Array<{
    field: string;
    label: string;
    type: 'text' | 'textarea' | 'color' | 'url' | 'date' | 'time';
  }>;
  tags?: string[];
  category?: string;
  shareWithClients?: string[];
  serviceProviderId: string;
}): Promise<ServiceProviderTemplate> {
  try {
    console.log('🎨 Creating service provider template:', data.name);
    
    const response = await fetch(SERVICE_PROVIDER_TEMPLATE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Template Creation Error:', error);
      throw new Error(error.message || 'Failed to create template');
    }

    const createdTemplate = await response.json();
    console.log('✅ Template created successfully:', createdTemplate.id);

    // Show success toast
    toast({
      title: "Template Created",
      description: `${createdTemplate.name} has been created successfully`,
    });

    return createdTemplate;
  } catch (error) {
    console.error('❌ Error creating template:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to create template',
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Share template with specific clients
 */
export async function shareTemplateWithClients(params: {
  templateId: string;
  clientIds: string[];
  serviceProviderId: string;
}): Promise<TemplateShareResult> {
  try {
    console.log('🎨 Sharing template with clients:', {
      templateId: params.templateId,
      clientCount: params.clientIds.length
    });
    
    const response = await fetch('/api/service-provider/templates/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...params,
        shareType: 'share'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Template Sharing Error:', error);
      throw new Error(error.message || 'Failed to share template');
    }

    const shareResult = await response.json();
    console.log('✅ Template shared successfully:', shareResult.summary);

    // Show success toast
    toast({
      title: "Template Shared",
      description: `Template shared with ${shareResult.summary.successfulShares} clients`,
    });

    return shareResult;
  } catch (error) {
    console.error('❌ Error sharing template:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to share template',
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Unshare template from specific clients
 */
export async function unshareTemplateFromClients(params: {
  templateId: string;
  clientIds: string[];
  serviceProviderId: string;
}): Promise<TemplateShareResult> {
  try {
    console.log('🚫 Unsharing template from clients:', {
      templateId: params.templateId,
      clientCount: params.clientIds.length
    });
    
    const response = await fetch('/api/service-provider/templates/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        ...params,
        shareType: 'unshare'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Template Unsharing Error:', error);
      throw new Error(error.message || 'Failed to unshare template');
    }

    const unshareResult = await response.json();
    console.log('✅ Template unshared successfully:', unshareResult.summary);

    // Show success toast
    toast({
      title: "Template Unshared",
      description: `Template removed from ${unshareResult.summary.successfulUnshares} clients`,
    });

    return unshareResult;
  } catch (error) {
    console.error('❌ Error unsharing template:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to unshare template',
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Get template sharing status and details
 */
export async function getTemplateSharingStatus(params: {
  templateId: string;
  serviceProviderId: string;
}): Promise<{
  templateId: string;
  serviceProviderId: string;
  isShared: boolean;
  totalClientsWithAccess: number;
  sharedWith: Array<{
    clientId: string;
    clientName: string;
    clientType: string;
    sharedAt: string;
    permissions: {
      canView: boolean;
      canUse: boolean;
      canCustomize: boolean;
      canCopy: boolean;
    };
    usage: {
      timesUsed: number;
      lastUsedAt: string;
      averageEngagement: number;
    };
  }>;
  availableClients: Array<{
    clientId: string;
    clientName: string;
    clientType: string;
    isEligible: boolean;
    eligibilityReason: string;
  }>;
  overallPerformance: {
    totalUsage: number;
    averageEngagement: number;
    bestPerformingClient: string;
    mostRecentUsage: string;
  };
}> {
  try {
    console.log('🔍 Fetching template sharing status:', params.templateId);
    
    const queryParams = new URLSearchParams({
      templateId: params.templateId,
      serviceProviderId: params.serviceProviderId,
    });

    const response = await fetch(`/api/service-provider/templates/share?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Template Sharing Status Error:', error);
      throw new Error(error.message || 'Failed to fetch sharing status');
    }

    const statusData = await response.json();
    console.log('✅ Template sharing status fetched:', {
      isShared: statusData.isShared,
      sharedWithCount: statusData.sharedWith.length
    });

    return statusData;
  } catch (error) {
    console.error('❌ Error fetching template sharing status:', error);
    throw error;
  }
}

/**
 * Apply template to create content for a specific client
 */
export async function applyTemplateToClient(params: {
  templateId: string;
  clientId: string;
  customizations: Record<string, string>;
  serviceProviderId: string;
}): Promise<{
  success: boolean;
  contentId: string;
  appliedTemplate: ServiceProviderTemplate;
  customizedContent: string;
  clientName: string;
}> {
  try {
    console.log('🎨 Applying template to client:', {
      templateId: params.templateId,
      clientId: params.clientId,
      customizationCount: Object.keys(params.customizations).length
    });

    // First, get the template
    const templates = await getServiceProviderTemplates({
      organizationId: params.serviceProviderId
    });
    
    const template = templates.templates.find(t => t.id === params.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Apply customizations to template content
    let customizedContent = template.content;
    Object.entries(params.customizations).forEach(([field, value]) => {
      const placeholder = `{{${field}}}`;
      customizedContent = customizedContent.replace(new RegExp(placeholder, 'g'), value);
    });

    // Create content using the customized template
    const contentData = {
      title: params.customizations.TITLE || template.name,
      content: customizedContent,
      type: template.templateType,
      contentType: template.templateType,
      status: 'draft',
      tags: [...template.tags, 'from-template'],
      clientId: params.clientId,
      serviceProviderId: params.serviceProviderId,
      templateId: params.templateId,
    };

    // Use existing content service to create the content
    const { saveContent } = await import('./content-service');
    const createdContent = await saveContent(contentData);

    console.log('✅ Template applied successfully:', {
      contentId: createdContent.id,
      templateId: params.templateId,
      clientId: params.clientId
    });

    // Show success toast
    toast({
      title: "Template Applied",
      description: `Content created from template for client`,
    });

    return {
      success: true,
      contentId: createdContent.id,
      appliedTemplate: template,
      customizedContent,
      clientName: getClientName(params.clientId)
    };

  } catch (error) {
    console.error('❌ Error applying template:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to apply template',
      variant: "destructive",
    });
    throw error;
  }
}

// PRODUCTION: Helper function to get real client names from database
async function getClientName(clientId: string): Promise<string> {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { name: true }
    });
    return client?.name || `Client ${clientId}`;
  } catch (error) {
    console.warn(`Failed to fetch client name for ${clientId}:`, error);
    return `Client ${clientId}`;
  }
}