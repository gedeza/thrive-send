import { toast } from '@/components/ui/use-toast';

// 🚀 B2B2G SERVICE PROVIDER BULK OPERATIONS SERVICE
const SERVICE_PROVIDER_BULK_OPS_API_URL = '/api/service-provider/bulk-operations';

export interface BulkOperationClient {
  id: string;
  name: string;
  type: string;
  contentCount: number;
}

export interface BulkOperationType {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  affectedItems: string;
}

export interface BulkOperationResult {
  id: string;
  type: string;
  name: string;
  status: 'completed' | 'in_progress' | 'failed' | 'cancelled' | 'paused' | 'scheduled';
  clientsAffected: string[];
  itemsProcessed: number;
  totalItems?: number;
  startedAt: string;
  completedAt?: string;
  executedBy: string;
  progress?: number;
  error?: string;
  results?: {
    successful: number;
    failed: number;
    errors: string[];
  };
}

export interface BulkOperationStats {
  totalOperationsToday: number;
  successRate: number;
  avgExecutionTime: string;
  totalItemsProcessed: number;
  totalClientsAffected: number;
}

export interface BulkOperationData {
  availableClients: BulkOperationClient[];
  bulkOperationTypes: BulkOperationType[];
  recentOperations: BulkOperationResult[];
  operationStats: BulkOperationStats;
}

export interface BulkOperationRequest {
  operationType: 'content-publish' | 'content-schedule' | 'approval-submit' | 'template-apply' | 'analytics-export';
  clientIds: string[];
  itemIds?: string[];
  parameters?: Record<string, any>;
  organizationId: string;
  scheduledFor?: string;
}

export interface BulkOperationResponse {
  success: boolean;
  operationId: string;
  operationType: string;
  status: string;
  clientsAffected: string[];
  itemsToProcess: number;
  estimatedDuration: string;
  startedAt: string;
  scheduledFor?: string;
  parameters?: Record<string, any>;
  progress: {
    percentage: number;
    currentStep: string;
    itemsProcessed: number;
    itemsTotal: number;
  };
  notifications: {
    willNotify: boolean;
    recipients: string[];
    estimatedNotifications: number;
  };
}

/**
 * Get bulk operations data including available clients, operation types, and recent operations
 */
export async function getBulkOperationsData(params: {
  organizationId: string;
  operation?: string;
}): Promise<BulkOperationData> {
  try {
    console.log('🔄 Fetching bulk operations data:', params);
    
    const queryParams = new URLSearchParams({
      organizationId: params.organizationId,
      ...(params.operation && { operation: params.operation }),
    });

    const response = await fetch(`${SERVICE_PROVIDER_BULK_OPS_API_URL}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Bulk Operations API Error:', error);
      throw new Error(error.message || 'Failed to fetch bulk operations data');
    }

    const data = await response.json();
    console.log('✅ Bulk operations data fetched:', {
      clientCount: data.availableClients?.length,
      operationTypes: data.bulkOperationTypes?.length,
      recentOperations: data.recentOperations?.length
    });

    return data;
  } catch (error) {
    console.error('❌ Error fetching bulk operations data:', error);
    throw error;
  }
}

/**
 * Execute a bulk operation
 */
export async function executeBulkOperation(params: BulkOperationRequest): Promise<BulkOperationResponse> {
  try {
    console.log('🔄 Executing bulk operation:', {
      operationType: params.operationType,
      clientCount: params.clientIds.length,
      itemCount: params.itemIds?.length || 0
    });
    
    const response = await fetch(SERVICE_PROVIDER_BULK_OPS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Bulk Operation Execution Error:', error);
      throw new Error(error.message || 'Failed to execute bulk operation');
    }

    const result = await response.json();
    console.log('✅ Bulk operation initiated successfully:', {
      operationId: result.operationId,
      operationType: result.operationType,
      status: result.status
    });

    // Show success toast
    const operationNames = {
      'content-publish': 'Content Publishing',
      'content-schedule': 'Content Scheduling',
      'approval-submit': 'Approval Submission',
      'template-apply': 'Template Application',
      'analytics-export': 'Analytics Export'
    };

    toast({
      title: "Bulk Operation Started",
      description: `${operationNames[params.operationType]} initiated for ${params.clientIds.length} clients`,
    });

    return result;
  } catch (error) {
    console.error('❌ Error executing bulk operation:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to execute bulk operation',
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Control a bulk operation (cancel, pause, resume, retry)
 */
export async function controlBulkOperation(params: {
  operationId: string;
  action: 'cancel' | 'pause' | 'resume' | 'retry';
  organizationId: string;
}): Promise<{
  success: boolean;
  operationId: string;
  action: string;
  previousStatus: string;
  newStatus: string;
  message: string;
  processedAt: string;
}> {
  try {
    console.log('🔄 Controlling bulk operation:', {
      operationId: params.operationId,
      action: params.action
    });
    
    const response = await fetch(SERVICE_PROVIDER_BULK_OPS_API_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Bulk Operation Control Error:', error);
      throw new Error(error.message || 'Failed to control bulk operation');
    }

    const result = await response.json();
    console.log('✅ Bulk operation controlled successfully:', {
      operationId: result.operationId,
      action: result.action,
      newStatus: result.newStatus
    });

    // Show success toast
    const actionMessages = {
      cancel: 'Operation cancelled successfully',
      pause: 'Operation paused successfully',
      resume: 'Operation resumed successfully',
      retry: 'Operation restarted successfully'
    };

    toast({
      title: "Operation Controlled",
      description: actionMessages[params.action] || 'Operation action completed',
    });

    return result;
  } catch (error) {
    console.error('❌ Error controlling bulk operation:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to control bulk operation',
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Bulk publish content across multiple clients
 */
export async function bulkPublishContent(params: {
  clientIds: string[];
  contentIds: string[];
  publishSettings?: {
    scheduleTime?: string;
    platforms?: string[];
    addTags?: string[];
  };
  organizationId: string;
}): Promise<BulkOperationResponse> {
  return executeBulkOperation({
    operationType: 'content-publish',
    clientIds: params.clientIds,
    itemIds: params.contentIds,
    parameters: {
      publishSettings: params.publishSettings,
      immediate: !params.publishSettings?.scheduleTime
    },
    organizationId: params.organizationId,
    scheduledFor: params.publishSettings?.scheduleTime
  });
}

/**
 * Bulk apply templates to multiple clients
 */
export async function bulkApplyTemplates(params: {
  clientIds: string[];
  templateIds: string[];
  customizations?: Record<string, Record<string, string>>; // clientId -> field customizations
  organizationId: string;
}): Promise<BulkOperationResponse> {
  return executeBulkOperation({
    operationType: 'template-apply',
    clientIds: params.clientIds,
    itemIds: params.templateIds,
    parameters: {
      customizations: params.customizations,
      createContent: true,
      autoSubmitForApproval: false
    },
    organizationId: params.organizationId
  });
}

/**
 * Bulk submit content for approval across multiple clients
 */
export async function bulkSubmitForApproval(params: {
  clientIds: string[];
  contentIds: string[];
  approvalSettings?: {
    priority?: 'high' | 'medium' | 'low';
    dueDate?: string;
    assignTo?: string;
    comment?: string;
  };
  organizationId: string;
}): Promise<BulkOperationResponse> {
  return executeBulkOperation({
    operationType: 'approval-submit',
    clientIds: params.clientIds,
    itemIds: params.contentIds,
    parameters: {
      approvalSettings: params.approvalSettings,
      notifyReviewers: true
    },
    organizationId: params.organizationId
  });
}

/**
 * Bulk schedule content across multiple clients
 */
export async function bulkScheduleContent(params: {
  clientIds: string[];
  contentIds: string[];
  scheduleSettings: {
    publishDate: string;
    platforms: string[];
    timezone?: string;
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      endDate?: string;
    };
  };
  organizationId: string;
}): Promise<BulkOperationResponse> {
  return executeBulkOperation({
    operationType: 'content-schedule',
    clientIds: params.clientIds,
    itemIds: params.contentIds,
    parameters: {
      scheduleSettings: params.scheduleSettings,
      validateApproval: true
    },
    organizationId: params.organizationId
  });
}

/**
 * Bulk export analytics for multiple clients
 */
export async function bulkExportAnalytics(params: {
  clientIds: string[];
  exportSettings: {
    dateRange: {
      start: string;
      end: string;
    };
    metrics: string[];
    format: 'csv' | 'pdf' | 'excel';
    includeCharts?: boolean;
  };
  organizationId: string;
}): Promise<BulkOperationResponse> {
  return executeBulkOperation({
    operationType: 'analytics-export',
    clientIds: params.clientIds,
    parameters: {
      exportSettings: params.exportSettings,
      consolidatedReport: true
    },
    organizationId: params.organizationId
  });
}

/**
 * Get bulk operation status and progress
 */
export async function getBulkOperationStatus(params: {
  operationId: string;
  organizationId: string;
}): Promise<{
  operationId: string;
  status: string;
  progress: {
    percentage: number;
    currentStep: string;
    itemsProcessed: number;
    itemsTotal: number;
    estimatedTimeRemaining: string;
  };
  results?: {
    successful: number;
    failed: number;
    errors: string[];
    clientResults: Array<{
      clientId: string;
      clientName: string;
      status: string;
      itemsProcessed: number;
      errors?: string[];
    }>;
  };
}> {
  try {
    console.log('📊 Getting bulk operation status:', params.operationId);

    // For demo purposes, generate realistic status data
    const mockStatus = {
      operationId: params.operationId,
      status: Math.random() > 0.3 ? 'completed' : 'in_progress',
      progress: {
        percentage: Math.round(Math.random() * 100),
        currentStep: 'Processing client content...',
        itemsProcessed: Math.round(Math.random() * 20),
        itemsTotal: 25,
        estimatedTimeRemaining: '2-4 minutes'
      },
      results: Math.random() > 0.5 ? {
        successful: Math.round(Math.random() * 20),
        failed: Math.round(Math.random() * 3),
        errors: ['Client 2: Template customization failed', 'Client 3: Approval workflow timeout'],
        clientResults: [
          {
            clientId: 'demo-client-1',
            clientName: 'City of Springfield',
            status: 'completed',
            itemsProcessed: 8,
            errors: []
          },
          {
            clientId: 'demo-client-2',
            clientName: 'TechStart Inc.',
            status: 'completed',
            itemsProcessed: 6,
            errors: ['Template customization failed']
          }
        ]
      } : undefined
    };

    return mockStatus;
  } catch (error) {
    console.error('❌ Error getting bulk operation status:', error);
    throw error;
  }
}