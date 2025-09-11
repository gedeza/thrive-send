import { toast } from '@/components/ui/use-toast';

// 🚀 B2B2G SERVICE PROVIDER APPROVAL WORKFLOW SERVICE
const SERVICE_PROVIDER_APPROVAL_API_URL = '/api/service-provider/approval-workflows';

export interface ApprovalWorkflowItem {
  id: string;
  contentId: string;
  title: string;
  contentType: 'email' | 'social' | 'blog';
  clientId: string;
  clientName: string;
  status: 'pending_review' | 'approved' | 'needs_revision' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  submittedBy: string;
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  dueDate: string;
  currentStep: string;
  totalSteps: number;
  workflow: {
    id: string;
    name: string;
    steps: Array<{
      id: string;
      name: string;
      assignedTo: string;
      status: 'pending' | 'active' | 'completed' | 'rejected' | 'needs_revision';
    }>;
  };
  content: {
    excerpt: string;
    scheduledFor: string;
    platforms: string[];
  };
  comments: Array<{
    id: string;
    author: string;
    role: string;
    message: string;
    createdAt: string;
    type: 'feedback' | 'approval' | 'rejection' | 'revision_request' | 'comment';
  }>;
  tags: string[];
}

export interface ApprovalWorkflowSummary {
  totalItems: number;
  statusCounts: {
    pending_review: number;
    approved: number;
    needs_revision: number;
    rejected: number;
  };
  priorityCounts: {
    high: number;
    medium: number;
    low: number;
  };
  avgApprovalTime: string;
  overdueItems: number;
}

export interface ApprovalWorkflowResponse {
  approvalItems: ApprovalWorkflowItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: ApprovalWorkflowSummary;
  workflows: Array<{
    id: string;
    name: string;
    description: string;
    steps: number;
    avgDuration: string;
  }>;
}

export interface ApprovalActionResult {
  success: boolean;
  approvalId: string;
  action: string;
  processedAt: string;
  processedBy: string;
  nextStep: string;
  notifications: {
    sent: boolean;
    recipients: string[];
    emailsQueued: number;
  };
}

/**
 * Get approval workflow items with filtering and pagination
 */
export async function getApprovalWorkflowItems(params: {
  organizationId: string;
  clientId?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}): Promise<ApprovalWorkflowResponse> {
  try {
    console.log('🔄 Fetching approval workflow items:', params);
    
    const queryParams = new URLSearchParams({
      organizationId: params.organizationId,
      ...(params.clientId && { clientId: params.clientId }),
      ...(params.status && { status: params.status }),
      ...(params.priority && { priority: params.priority }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.limit && { limit: params.limit.toString() }),
    });

    const response = await fetch(`${SERVICE_PROVIDER_APPROVAL_API_URL}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("", _error);
      throw new Error(error.message || 'Failed to fetch approval workflow items');
    }

    const data = await response.json();
    console.log('✅ Approval workflow items fetched:', {
      itemCount: data.approvalItems?.length,
      totalItems: data.summary?.totalItems
    });

    return data;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

/**
 * Process approval action (approve, reject, request revision, etc.)
 */
export async function processApprovalAction(params: {
  action: 'approve' | 'reject' | 'request_revision' | 'submit_for_review';
  approvalId?: string;
  contentId?: string;
  clientId?: string;
  comment?: string;
  organizationId: string;
}): Promise<ApprovalActionResult> {
  try {
    console.log('🔄 Processing approval action:', {
      action: params.action,
      approvalId: params.approvalId,
      contentId: params.contentId
    });
    
    const response = await fetch(SERVICE_PROVIDER_APPROVAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("", _error);
      throw new Error(error.message || 'Failed to process approval action');
    }

    const result = await response.json();
    console.log('✅ Approval action processed successfully:', {
      action: params.action,
      approvalId: result.approvalId,
      nextStep: result.nextStep
    });

    // Show success toast
    const actionMessages = {
      approve: 'Content approved successfully',
      reject: 'Content rejected with feedback',
      request_revision: 'Revision requested',
      submit_for_review: 'Content submitted for review'
    };

    toast({
      title: "Action Completed",
      description: actionMessages[params.action] || 'Action processed successfully',
    });

    return result;
  } catch (_error) {
    console.error("", _error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to process approval action',
      variant: "destructive",
    });
    throw _error;
  }
}

/**
 * Get approval workflow statistics and insights
 */
export async function getApprovalWorkflowStats(params: {
  organizationId: string;
  timeRange?: '7d' | '30d' | '90d';
  clientId?: string;
}): Promise<{
  totalProcessed: number;
  avgApprovalTime: number;
  approvalRate: number;
  bottlenecks: Array<{
    step: string;
    avgTime: number;
    count: number;
  }>;
  clientPerformance: Array<{
    clientId: string;
    clientName: string;
    avgApprovalTime: number;
    approvalRate: number;
    totalItems: number;
  }>;
  trends: Array<{
    date: string;
    approved: number;
    rejected: number;
    pending: number;
  }>;
}> {
  try {
    console.log('📊 Fetching approval workflow statistics:', params);

    // For demo purposes, generate realistic statistics
    const stats = {
      totalProcessed: 127,
      avgApprovalTime: 4.2, // hours
      approvalRate: 78.5, // percentage
      bottlenecks: [
        {
          step: 'legal_review',
          avgTime: 8.5,
          count: 23
        },
        {
          step: 'client_approval',
          avgTime: 6.2,
          count: 34
        },
        {
          step: 'content_review',
          avgTime: 2.1,
          count: 67
        }
      ],
      clientPerformance: [
        {
          clientId: 'demo-client-1',
          clientName: 'City of Springfield',
          avgApprovalTime: 6.8,
          approvalRate: 72.4,
          totalItems: 45
        },
        {
          clientId: 'demo-client-2',
          clientName: 'TechStart Inc.',
          avgApprovalTime: 3.2,
          approvalRate: 89.1,
          totalItems: 38
        },
        {
          clientId: 'demo-client-3',
          clientName: 'Local Coffee Co.',
          avgApprovalTime: 2.8,
          approvalRate: 94.3,
          totalItems: 32
        }
      ],
      trends: generateTrendData(params.timeRange || '30d')
    };

    return stats;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

/**
 * Bulk approve multiple items
 */
export async function bulkApprovalAction(params: {
  action: 'approve' | 'reject' | 'request_revision';
  approvalIds: string[];
  comment?: string;
  organizationId: string;
}): Promise<{
  success: boolean;
  results: Array<{
    approvalId: string;
    success: boolean;
    error?: string;
  }>;
  summary: {
    totalProcessed: number;
    successful: number;
    failed: number;
  };
}> {
  try {
    console.log('🔄 Processing bulk approval action:', {
      action: params.action,
      itemCount: params.approvalIds.length
    });

    // Process each approval individually
    const results = await Promise.allSettled(
      params.approvalIds.map(approvalId =>
        processApprovalAction({
          action: params.action,
          approvalId,
          comment: params.comment,
          organizationId: params.organizationId
        })
      )
    );

    const processedResults = results.map((result, index) => ({
      approvalId: params.approvalIds[index],
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason?.message : undefined
    }));

    const summary = {
      totalProcessed: params.approvalIds.length,
      successful: processedResults.filter(r => r.success).length,
      failed: processedResults.filter(r => !r.success).length
    };

    console.log('✅ Bulk approval action completed:', summary);

    toast({
      title: "Bulk Action Completed",
      description: `${summary.successful} items processed successfully, ${summary.failed} failed`,
    });

    return {
      success: summary.failed === 0,
      results: processedResults,
      summary
    };
  } catch (_error) {
    console.error("", _error);
    toast({
      title: "Error",
      description: 'Failed to process bulk approval action',
      variant: "destructive",
    });
    throw _error;
  }
}

/**
 * Create or update workflow template
 */
export async function saveWorkflowTemplate(params: {
  id?: string;
  name: string;
  description: string;
  steps: Array<{
    id: string;
    name: string;
    assignedTo: string;
    requiredFields?: string[];
    autoAdvance?: boolean;
  }>;
  organizationId: string;
}): Promise<{
  id: string;
  name: string;
  description: string;
  steps: number;
  createdAt: string;
}> {
  try {
    console.log('🔄 Saving workflow template:', params.name);

    // For demo purposes, return success
    const savedTemplate = {
      id: params.id || `workflow-${Date.now()}`,
      name: params.name,
      description: params.description,
      steps: params.steps.length,
      createdAt: new Date().toISOString()
    };

    toast({
      title: "Workflow Template Saved",
      description: `${params.name} has been saved successfully`,
    });

    return savedTemplate;
  } catch (_error) {
    console.error("", _error);
    toast({
      title: "Error",
      description: 'Failed to save workflow template',
      variant: "destructive",
    });
    throw _error;
  }
}

// Helper function to generate trend data
function generateTrendData(timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      approved: Math.round(Math.random() * 8 + 2),
      rejected: Math.round(Math.random() * 3 + 1),
      pending: Math.round(Math.random() * 5 + 2)
    });
  }

  return data;
}