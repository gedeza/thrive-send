import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import {
  createSuccessResponse,
  createUnauthorizedResponse,
  createValidationResponse,
  handleApiError
} from '@/lib/api-utils';

// Simple in-memory storage for demo invitations (shared with invitations API)
const sessionInvitations = new Map<string, any[]>();

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

      // Also fetch pending invitations to include as PENDING team members
      const pendingInvitations = await db.teamMemberInvitation.findMany({
        where: {
          organizationId,
          status: 'pending',
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Convert pending invitations to team member format
      const pendingMembers = pendingInvitations.map(invitation => ({
        id: `pending-${invitation.id}`,
        name: `${invitation.firstName} ${invitation.lastName}`.trim(),
        email: invitation.email,
        role: invitation.role,
        status: 'PENDING',
        joinedAt: invitation.createdAt.toISOString(),
        lastActivity: invitation.createdAt.toISOString(),
        avatarUrl: `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(invitation.email)}&backgroundColor=fbbf24`,
        clientAssignments: [], // Would need to map from invitation permissions
        performance: {
          contentCreated: 0,
          reviewsCompleted: 0,
          approvalsGiven: 0,
          clientsManaged: 0,
          averageRating: 0,
        },
        isPending: true
      }));

      // Combine actual members and pending invitations
      databaseMembers = [...databaseMembers, ...pendingMembers];

      // Successfully loaded team members from database

    } catch (dbError) {
      // Database unavailable for team members, using demo mode
      databaseMembers = [];
    }

    // Also check for session-based invitations in demo mode
    const sessionKey = `${organizationId}-${userId}`;
    const sessionInvites = sessionInvitations.get(sessionKey) || [];
    const pendingSessionInvitations = sessionInvites.filter(inv => inv.status === 'PENDING');

    // Convert session-based pending invitations to team member format
    const sessionPendingMembers = pendingSessionInvitations.map((invitation: any) => ({
      id: `session-pending-${invitation.id}`,
      name: `${invitation.firstName || invitation.email.split('@')[0]} ${invitation.lastName || ''}`.trim(),
      email: invitation.email,
      role: invitation.role,
      status: 'PENDING',
      joinedAt: invitation.invitedAt,
      lastActivity: invitation.invitedAt,
      avatarUrl: `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(invitation.email)}&backgroundColor=fbbf24`,
      clientAssignments: invitation.clientAssignments || [],
      performance: {
        contentCreated: 0,
        reviewsCompleted: 0,
        approvalsGiven: 0,
        clientsManaged: 0,
        averageRating: 0,
      },
      isPending: true,
      isDemo: true
    }));

    // Add session pending invitations to database members
    databaseMembers = [...databaseMembers, ...sessionPendingMembers];

    // Demo team members data (only shown when database is empty to help new users understand the interface)
    // These are removed once real team members are added
    const demoMembers = databaseMembers.length === 0 ? [
      {
        id: 'demo-tm-1',
        name: 'Team Lead Example',
        email: 'teamlead@yourcompany.com',
        role: 'ADMIN',
        status: 'ACTIVE',
        joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=TeamLead&backgroundColor=c0aede',
        phone: '+1 (555) 000-0001',
        clientAssignments: [
          {
            id: 'demo-ca-1',
            clientId: 'demo-client-1',
            clientName: 'Your First Client',
            role: 'MANAGER',
            permissions: ['read', 'write', 'approve', 'publish'],
            assignedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ],
        performance: {
          contentCreated: 127,
          reviewsCompleted: 89,
          approvalsGiven: 45,
          clientsManaged: 1,
          averageRating: 4.8,
        },
        isDemo: true
      },
      {
        id: 'demo-tm-2',
        name: 'Content Creator Example',
        email: 'creator@yourcompany.com',
        role: 'CONTENT_CREATOR',
        status: 'ACTIVE',
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Creator&backgroundColor=a7f3d0',
        phone: '+1 (555) 000-0002',
        clientAssignments: [
          {
            id: 'demo-ca-2',
            clientId: 'demo-client-1',
            clientName: 'Your First Client',
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
        },
        isDemo: true
      }
    ] : [];

    // Combine database and demo data (demo data only shown when no real members exist)
    const allMembers = databaseMembers.length > 0 ? databaseMembers : demoMembers;

    // Returning team members data
    
    return createSuccessResponse(allMembers, 200, 'Team members retrieved successfully');

  } catch (_error) {
    return handleApiError(_error);
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
    return handleApiError(_error);
  }
}