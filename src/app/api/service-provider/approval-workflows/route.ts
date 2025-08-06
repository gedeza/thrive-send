import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // DEVELOPMENT MODE: Allow testing without authentication
    // TODO: Remove this in production
    if (!userId) {
      console.log('🚧 DEV MODE: Service Provider Approval Workflows - No auth required');
    }

    // 🚀 SERVICE PROVIDER APPROVAL WORKFLOWS - Demo Implementation
    const demoApprovalItems = [
      {
        id: 'approval-1',
        contentId: 'content-1',
        title: 'City Council Meeting Announcement',
        contentType: 'social',
        clientId: 'demo-client-1',
        clientName: 'City of Springfield',
        status: 'pending_review',
        priority: 'high',
        submittedBy: userId,
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        currentStep: 'content_review',
        totalSteps: 4,
        workflow: {
          id: 'workflow-gov',
          name: 'Government Content Workflow',
          steps: [
            { id: 'content_review', name: 'Content Review', assignedTo: 'content-reviewer', status: 'active' },
            { id: 'legal_review', name: 'Legal Review', assignedTo: 'legal-team', status: 'pending' },
            { id: 'final_approval', name: 'Final Approval', assignedTo: 'content-approver', status: 'pending' },
            { id: 'publish', name: 'Publish', assignedTo: 'publisher', status: 'pending' }
          ]
        },
        content: {
          excerpt: 'Join us for the monthly city council meeting on Thursday...',
          scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          platforms: ['facebook', 'twitter', 'website']
        },
        comments: [
          {
            id: 'comment-1',
            author: 'Sarah Johnson',
            role: 'Content Manager',
            message: 'Content looks good, but please verify the meeting time.',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            type: 'feedback'
          }
        ],
        tags: ['government', 'announcement', 'meeting']
      },
      {
        id: 'approval-2',
        contentId: 'content-2',
        title: 'Product Launch Campaign - Phase 1',
        contentType: 'email',
        clientId: 'demo-client-2',
        clientName: 'TechStart Inc.',
        status: 'approved',
        priority: 'medium',
        submittedBy: userId,
        submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        approvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        currentStep: 'publish',
        totalSteps: 3,
        workflow: {
          id: 'workflow-business',
          name: 'Business Content Workflow',
          steps: [
            { id: 'content_review', name: 'Content Review', assignedTo: 'content-reviewer', status: 'completed' },
            { id: 'client_approval', name: 'Client Approval', assignedTo: 'client-contact', status: 'completed' },
            { id: 'publish', name: 'Publish', assignedTo: 'publisher', status: 'active' }
          ]
        },
        content: {
          excerpt: 'Introducing our revolutionary new platform that will change...',
          scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          platforms: ['email', 'linkedin', 'blog']
        },
        comments: [
          {
            id: 'comment-2',
            author: 'Mike Chen',
            role: 'Client Contact',
            message: 'Approved! Great work on the messaging.',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            type: 'approval'
          }
        ],
        tags: ['product', 'launch', 'email-campaign']
      },
      {
        id: 'approval-3',
        contentId: 'content-3',
        title: 'Seasonal Menu Promotion',
        contentType: 'blog',
        clientId: 'demo-client-3',
        clientName: 'Local Coffee Co.',
        status: 'needs_revision',
        priority: 'low',
        submittedBy: userId,
        submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        currentStep: 'content_review',
        totalSteps: 2,
        workflow: {
          id: 'workflow-simple',
          name: 'Simple Content Workflow',
          steps: [
            { id: 'content_review', name: 'Content Review', assignedTo: 'content-reviewer', status: 'needs_revision' },
            { id: 'publish', name: 'Publish', assignedTo: 'publisher', status: 'pending' }
          ]
        },
        content: {
          excerpt: 'As autumn arrives, we\'re excited to introduce our new seasonal...',
          scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          platforms: ['blog', 'facebook', 'instagram']
        },
        comments: [
          {
            id: 'comment-3',
            author: 'Emma Wilson',
            role: 'Content Reviewer',
            message: 'Please add more details about pricing and availability.',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            type: 'revision_request'
          }
        ],
        tags: ['seasonal', 'menu', 'promotion']
      },
      {
        id: 'approval-4',
        contentId: 'content-4',
        title: 'Community Partnership Announcement',
        contentType: 'social',
        clientId: 'demo-client-1',
        clientName: 'City of Springfield',
        status: 'rejected',
        priority: 'medium',
        submittedBy: userId,
        submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        rejectedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        currentStep: 'content_review',
        totalSteps: 4,
        workflow: {
          id: 'workflow-gov',
          name: 'Government Content Workflow',
          steps: [
            { id: 'content_review', name: 'Content Review', assignedTo: 'content-reviewer', status: 'rejected' },
            { id: 'legal_review', name: 'Legal Review', assignedTo: 'legal-team', status: 'pending' },
            { id: 'final_approval', name: 'Final Approval', assignedTo: 'content-approver', status: 'pending' },
            { id: 'publish', name: 'Publish', assignedTo: 'publisher', status: 'pending' }
          ]
        },
        content: {
          excerpt: 'We\'re proud to announce our new partnership with local businesses...',
          scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          platforms: ['facebook', 'twitter', 'website']
        },
        comments: [
          {
            id: 'comment-4',
            author: 'David Kim',
            role: 'Legal Reviewer',
            message: 'Partnership terms need to be reviewed before we can proceed.',
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            type: 'rejection'
          }
        ],
        tags: ['partnership', 'community', 'announcement']
      }
    ];

    // Apply filters
    let filteredItems = demoApprovalItems;

    if (clientId && clientId !== 'all') {
      filteredItems = filteredItems.filter(item => item.clientId === clientId);
    }

    if (status && status !== 'all') {
      filteredItems = filteredItems.filter(item => item.status === status);
    }

    if (priority && priority !== 'all') {
      filteredItems = filteredItems.filter(item => item.priority === priority);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + limit);

    // Calculate summary statistics
    const summary = {
      totalItems: filteredItems.length,
      statusCounts: {
        pending_review: filteredItems.filter(item => item.status === 'pending_review').length,
        approved: filteredItems.filter(item => item.status === 'approved').length,
        needs_revision: filteredItems.filter(item => item.status === 'needs_revision').length,
        rejected: filteredItems.filter(item => item.status === 'rejected').length
      },
      priorityCounts: {
        high: filteredItems.filter(item => item.priority === 'high').length,
        medium: filteredItems.filter(item => item.priority === 'medium').length,
        low: filteredItems.filter(item => item.priority === 'low').length
      },
      avgApprovalTime: '4.2 hours',
      overdueItems: filteredItems.filter(item => new Date(item.dueDate) < new Date()).length
    };

    const response = {
      approvalItems: paginatedItems,
      pagination: {
        page,
        limit,
        total: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / limit)
      },
      summary,
      workflows: [
        {
          id: 'workflow-gov',
          name: 'Government Content Workflow',
          description: 'Comprehensive workflow for government communications',
          steps: 4,
          avgDuration: '6 hours'
        },
        {
          id: 'workflow-business',
          name: 'Business Content Workflow',
          description: 'Streamlined workflow for business content',
          steps: 3,
          avgDuration: '3 hours'
        },
        {
          id: 'workflow-simple',
          name: 'Simple Content Workflow',
          description: 'Basic review and publish workflow',
          steps: 2,
          avgDuration: '2 hours'
        }
      ]
    };

    console.log('🔄 Service Provider Approval Workflows API response:', {
      itemCount: paginatedItems.length,
      totalItems: filteredItems.length,
      filters: { clientId, status, priority }
    });

    return NextResponse.json(response);

    // TODO: Replace with actual database query when schema is ready
    /*
    const whereClause = {
      organizationId: organizationId,
      ...(clientId && clientId !== 'all' && { clientId }),
      ...(status && status !== 'all' && { status }),
      ...(priority && priority !== 'all' && { priority })
    };

    const [approvalItems, totalCount] = await Promise.all([
      prisma.contentApproval.findMany({
        where: whereClause,
        include: {
          content: {
            select: { title: true, type: true, excerpt: true, scheduledFor: true }
          },
          client: {
            select: { id: true, name: true }
          },
          workflow: {
            include: { steps: true }
          },
          comments: {
            include: { author: true },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { submittedAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.contentApproval.count({ where: whereClause })
    ]);

    return NextResponse.json({
      approvalItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
    */

  } catch (error) {
    console.error('❌ Service provider approval workflows error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    const body = await request.json();
    const {
      action, // 'approve', 'reject', 'request_revision', 'submit_for_review'
      approvalId,
      contentId,
      clientId,
      comment,
      organizationId
    } = body;

    // DEVELOPMENT MODE: Allow testing without authentication  
    if (!userId) {
      console.log('🚧 DEV MODE: Approval Action - No auth required');
    }

    // Validate required fields
    if (!action || !organizationId) {
      return NextResponse.json({
        error: 'Missing required fields: action, organizationId'
      }, { status: 400 });
    }

    // 🚀 DEMO IMPLEMENTATION - Approval Action Processing
    const actionResult = {
      success: true,
      approvalId: approvalId || `approval-${Date.now()}`,
      action,
      processedAt: new Date().toISOString(),
      processedBy: userId || 'demo-user',
      nextStep: getNextStep(action),
      notifications: {
        sent: true,
        recipients: getNotificationRecipients(action, clientId),
        emailsQueued: 2
      }
    };

    console.log('🔄 Approval action processed:', {
      action,
      approvalId: actionResult.approvalId,
      nextStep: actionResult.nextStep
    });

    return NextResponse.json(actionResult, { status: 200 });

    // TODO: Replace with actual database operations when schema is ready
    /*
    const approval = await prisma.contentApproval.update({
      where: { id: approvalId },
      data: {
        status: getStatusFromAction(action),
        currentStep: getNextStep(action),
        comments: {
          create: comment ? {
            message: comment,
            authorId: userId,
            type: getCommentType(action)
          } : undefined
        },
        ...(action === 'approve' && { approvedAt: new Date() }),
        ...(action === 'reject' && { rejectedAt: new Date() })
      },
      include: {
        content: true,
        client: true,
        workflow: { include: { steps: true } },
        comments: { include: { author: true } }
      }
    });

    return NextResponse.json(approval, { status: 200 });
    */

  } catch (error) {
    console.error('❌ Error processing approval action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function getNextStep(action: string): string {
  switch (action) {
    case 'approve':
      return 'publish';
    case 'reject':
      return 'content_review';
    case 'request_revision':
      return 'content_revision';
    case 'submit_for_review':
      return 'content_review';
    default:
      return 'content_review';
  }
}

function getNotificationRecipients(action: string, clientId: string): string[] {
  const baseRecipients = ['content-manager@thrivesenddemo.com'];
  
  if (clientId === 'demo-client-1') {
    baseRecipients.push('contact@springfield.gov');
  } else if (clientId === 'demo-client-2') {
    baseRecipients.push('marketing@techstart.com');
  } else if (clientId === 'demo-client-3') {
    baseRecipients.push('owner@localcoffee.com');
  }
  
  return baseRecipients;
}

function getStatusFromAction(action: string): string {
  switch (action) {
    case 'approve':
      return 'approved';
    case 'reject':
      return 'rejected';
    case 'request_revision':
      return 'needs_revision';
    case 'submit_for_review':
      return 'pending_review';
    default:
      return 'pending_review';
  }
}

function getCommentType(action: string): string {
  switch (action) {
    case 'approve':
      return 'approval';
    case 'reject':
      return 'rejection';
    case 'request_revision':
      return 'revision_request';
    default:
      return 'comment';
  }
}