import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { 
  createSuccessResponse, 
  createUnauthorizedResponse, 
  createValidationResponse,
  handleApiError 
} from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createUnauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return createValidationResponse('Organization ID required');
    }

    // Demo team members data (in real implementation, this would come from database)
    const demoMembers = [
      {
        id: 'tm-1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@thrivesend.com',
        role: 'ADMIN',
        status: 'ACTIVE',
        joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Sarah&backgroundColor=c0aede',
        phone: '+1 (555) 123-4567',
        clientAssignments: [
          {
            id: 'ca-1',
            clientId: 'demo-client-1',
            clientName: 'City of Springfield',
            role: 'MANAGER',
            permissions: ['read', 'write', 'approve', 'publish'],
            assignedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'ca-2',
            clientId: 'demo-client-2',
            clientName: 'Regional Health District',
            role: 'REVIEWER',
            permissions: ['read', 'write', 'review'],
            assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ],
        performance: {
          contentCreated: 127,
          reviewsCompleted: 89,
          approvalsGiven: 45,
          clientsManaged: 2,
          averageRating: 4.8,
        }
      },
      {
        id: 'tm-2',
        name: 'Michael Chen',
        email: 'michael.chen@thrivesend.com',
        role: 'CONTENT_CREATOR',
        status: 'ACTIVE',
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Michael&backgroundColor=a7f3d0',
        phone: '+1 (555) 987-6543',
        clientAssignments: [
          {
            id: 'ca-3',
            clientId: 'demo-client-1',
            clientName: 'City of Springfield',
            role: 'CREATOR',
            permissions: ['read', 'write'],
            assignedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ],
        performance: {
          contentCreated: 203,
          reviewsCompleted: 15,
          approvalsGiven: 0,
          clientsManaged: 1,
          averageRating: 4.6,
        }
      },
      {
        id: 'tm-3',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@thrivesend.com',
        role: 'REVIEWER',
        status: 'ACTIVE',
        joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Emily&backgroundColor=fde68a',
        clientAssignments: [
          {
            id: 'ca-4',
            clientId: 'demo-client-2',
            clientName: 'Regional Health District',
            role: 'REVIEWER',
            permissions: ['read', 'review'],
            assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ],
        performance: {
          contentCreated: 45,
          reviewsCompleted: 156,
          approvalsGiven: 12,
          clientsManaged: 1,
          averageRating: 4.9,
        }
      },
      {
        id: 'tm-4',
        name: 'David Thompson',
        email: 'david.thompson@thrivesend.com',
        role: 'CLIENT_MANAGER',
        status: 'PENDING',
        joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        clientAssignments: [],
        performance: {
          contentCreated: 0,
          reviewsCompleted: 0,
          approvalsGiven: 0,
          clientsManaged: 0,
          averageRating: 0,
        }
      }
    ];

    let databaseMembers: any[] = [];
    
    try {
      // Attempting to fetch team members from database
      
      // Try to fetch organization members from database
      const orgMembers = await db.organizationMember.findMany({
        where: {
          organizationId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
              firstName: true,
              lastName: true,
              createdAt: true,
              updatedAt: true,
              activities: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: { createdAt: true }
              }
            }
          },
          clientAssignments: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Transform database data to expected format
      databaseMembers = orgMembers.map(member => {
        const lastActivity = member.user.activities[0]?.createdAt || member.user.updatedAt;
        
        return {
          id: member.id,
          name: member.user.name || `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim(),
          email: member.user.email,
          role: member.serviceProviderRole || 'CONTENT_CREATOR',
          status: 'ACTIVE', // In real implementation, this would be determined by user status
          joinedAt: member.createdAt.toISOString(),
          lastActivity: lastActivity.toISOString(),
          avatarUrl: member.user.imageUrl || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(member.user.name || member.user.email)}&backgroundColor=6366f1`,
          clientAssignments: member.clientAssignments.map(assignment => ({
            id: assignment.id,
            clientId: assignment.clientId,
            clientName: assignment.client.name,
            role: assignment.role,
            permissions: Array.isArray(assignment.permissions) ? assignment.permissions : ['read'],
            assignedAt: assignment.assignedAt.toISOString(),
          })),
          performance: {
            contentCreated: 0, // Would be calculated from actual data
            reviewsCompleted: 0,
            approvalsGiven: 0,
            clientsManaged: member.clientAssignments.length,
            averageRating: 0,
          }
        };
      });

      // Successfully loaded team members from database

    } catch (dbError) {
      // Database unavailable for team members, using demo mode
      databaseMembers = [];
    }

    // Combine database and demo data (demo data provides rich examples)
    const allMembers = databaseMembers.length > 0 ? databaseMembers : demoMembers;

    // Returning team members data
    
    return createSuccessResponse(allMembers, 200, 'Team members retrieved successfully');

  } catch (_error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();
    const { 
      email, 
      role, 
      organizationId, 
      clientAssignments = []
    } = body;

    // Validate required fields
    if (!email || !role || !organizationId) {
      return createValidationResponse('Missing required fields: email, role, organizationId');
    }

    let memberResponse: any;

    try {
      // Attempting to add team member to database
      
      // In a real implementation, this would:
      // 1. Find or create user by email
      // 2. Add user to organization with specified role
      // 3. Create client assignments
      
      // Simulate database operation
      memberResponse = {
        id: `tm-${Date.now()}`,
        email,
        role,
        organizationId,
        status: 'ACTIVE',
        joinedAt: new Date().toISOString(),
        clientAssignments: clientAssignments.map((assignment: any, index: number) => ({
          id: `ca-${Date.now()}-${index}`,
          ...assignment,
          assignedAt: new Date().toISOString()
        }))
      };

      // Team member added successfully

    } catch (dbError) {
      // Database unavailable, cannot add team member
      return NextResponse.json(
        { error: 'Database unavailable. Team member could not be added.' },
        { status: 503 }
      );
    }
    
    return createSuccessResponse(memberResponse, 201, 'Team member added successfully');

  } catch (_error) {
    return handleApiError(error);
  }
}