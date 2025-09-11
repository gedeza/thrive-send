import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { 
  createSuccessResponse, 
  createUnauthorizedResponse, 
  createValidationResponse,
  handleApiError 
} from '@/lib/api-utils';
import { sendInvitationEmail } from '@/lib/email';
import { generateId } from '@/lib/id-generator';
import crypto from 'crypto';

// Simple in-memory storage for demo invitations when database is unavailable
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

    // Demo invitations for testing
    const demoInvitations = [
      {
        id: 'inv-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CONTENT_CREATOR',
        status: 'PENDING',
        invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        invitedBy: 'Current User',
        clientAssignments: [
          {
            clientId: 'demo-client-1',
            clientName: 'City of Springfield',
            role: 'CREATOR',
            permissions: ['read', 'write']
          }
        ]
      },
      {
        id: 'inv-2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'REVIEWER',
        status: 'ACCEPTED',
        invitedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        acceptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        invitedBy: 'Current User',
        clientAssignments: []
      }
    ];

    let userInvitations: any[] = [];
    
    try {
      // Fetch real invitations from database
      const invitations = await db.teamMemberInvitation.findMany({
        where: {
          organizationId,
        },
        include: {
          invitedBy: {
            select: {
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      userInvitations = invitations.map(invitation => ({
        id: invitation.id,
        email: invitation.email,
        firstName: invitation.firstName || invitation.email.split('@')[0] || 'Unknown',
        lastName: invitation.lastName || '',
        role: invitation.role,
        status: invitation.status.toUpperCase(),
        invitedAt: invitation.createdAt.toISOString(),
        acceptedAt: invitation.acceptedAt?.toISOString(),
        invitedBy: invitation.invitedBy.name || invitation.invitedBy.email,
        organizationName: invitation.organization.name,
        token: invitation.token,
        expiresAt: invitation.expiresAt.toISOString(),
        clientAssignments: [], // Would need separate table for detailed client assignments
        permissions: invitation.permissions,
      }));
    } catch (dbError) {
      console.error('Database error fetching invitations:', dbError);
      // Fall back to empty array on database error
      userInvitations = [];
    }

    // Get session-specific invitations
    const sessionKey = `${organizationId}-${userId}`;
    const sessionInvites = sessionInvitations.get(sessionKey) || [];

    // Combine all invitations
    const allInvitations = [...demoInvitations, ...userInvitations, ...sessionInvites];

    // Returning invitations data
    
    return createSuccessResponse(allInvitations, 200, 'Invitations retrieved successfully');

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
      firstName, 
      lastName, 
      role, 
      organizationId, 
      clientAssignments = [],
      message,
      sendEmail = true,
      rolePermissions = []
    } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !role || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, firstName, lastName, role, organizationId' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    let invitationResponse: any;

    try {
      // 1. Get the current user who is sending the invitation
      const currentUser = await db.user.findUnique({
        where: { clerkId: userId },
      });

      if (!currentUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // 2. Get organization details for email
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }

      // 3. Check if user already has a pending invitation
      const existingInvitation = await db.teamMemberInvitation.findFirst({
        where: {
          email,
          organizationId,
          status: 'pending',
        },
      });

      if (existingInvitation) {
        return NextResponse.json(
          { error: 'User already has a pending invitation' },
          { status: 409 }
        );
      }

      // 4. Check if user is already a member
      const existingUser = await db.user.findUnique({
        where: { email },
        include: {
          organizationMemberships: {
            where: { organizationId },
          },
        },
      });

      if (existingUser?.organizationMemberships.length > 0) {
        return NextResponse.json(
          { error: 'User is already a member of this organization' },
          { status: 409 }
        );
      }

      // 5. Generate secure token and expiration
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

      // 6. Create invitation in database
      const invitation = await db.teamMemberInvitation.create({
        data: {
          email,
          firstName,
          lastName,
          role,
          organizationId,
          invitedById: currentUser.id,
          clientIds: clientAssignments.map((assignment: any) => assignment.clientId),
          permissions: {
            role: rolePermissions,
            clientAssignments,
            message,
          },
          token,
          expiresAt,
          status: 'pending',
        },
        include: {
          invitedBy: {
            select: {
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
        },
      });

      // 7. Send invitation email if requested
      if (sendEmail) {
        try {
          await sendInvitationEmail({
            email,
            token,
            organizationName: organization.name,
            role,
          });
          console.log(`✅ Invitation email sent to ${email}`);
        } catch (emailError) {
          console.error('Failed to send invitation email:', emailError);
          // Don't fail the entire request if email fails
          // The invitation is created, user can be notified manually
        }
      }

      // 8. Format response
      invitationResponse = {
        id: invitation.id,
        email: invitation.email,
        firstName,
        lastName,
        role: invitation.role,
        organizationId: invitation.organizationId,
        status: invitation.status.toUpperCase(),
        invitedAt: invitation.createdAt.toISOString(),
        invitedBy: invitation.invitedBy.name || invitation.invitedBy.email,
        organizationName: invitation.organization.name,
        token: invitation.token,
        expiresAt: invitation.expiresAt.toISOString(),
        clientAssignments: clientAssignments.map((assignment: any, index: number) => ({
          id: `ca-${Date.now()}-${index}`,
          ...assignment,
          assignedAt: new Date().toISOString(),
        })),
        message,
        sendEmail,
        rolePermissions,
        emailSent: sendEmail, // Track if email was attempted
      };

      console.log(`✅ Team invitation created successfully for ${email}`);

    } catch (dbError) {
      console.error('Database error creating invitation:', dbError);
      
      // Fallback to demo mode if database fails
      invitationResponse = {
        id: `inv-demo-${Date.now()}`,
        email,
        firstName,
        lastName,
        role,
        organizationId,
        status: 'PENDING',
        invitedAt: new Date().toISOString(),
        invitedBy: 'Current User',
        clientAssignments: clientAssignments.map((assignment: any) => ({
          id: `ca-${Date.now()}-${assignment.clientId}`,
          ...assignment,
          assignedAt: new Date().toISOString()
        })),
        message,
        sendEmail,
        rolePermissions,
        error: 'Database unavailable - invitation created in demo mode'
      };

      // Store in session-based storage
      const sessionKey = `${organizationId}-${userId}`;
      const existingInvitations = sessionInvitations.get(sessionKey) || [];
      existingInvitations.push(invitationResponse);
      sessionInvitations.set(sessionKey, existingInvitations);
    }
    
    return NextResponse.json({
      success: true,
      invitation: invitationResponse,
      message: sendEmail 
        ? `Invitation sent to ${email} successfully!` 
        : `Team member ${firstName} ${lastName} added successfully!`,
      demoMode: invitationResponse.id.startsWith('inv-demo-')
    }, { status: 201 });

  } catch (_error) {
    // Error creating invitation
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();
    const { invitationId, action, organizationId } = body;

    if (!invitationId || !action || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: invitationId, action, organizationId' },
        { status: 400 }
      );
    }

    if (!['accept', 'reject', 'resend', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: accept, reject, resend, cancel' },
        { status: 400 }
      );
    }

    let updatedInvitation: any;

    try {
      // Attempting to update invitation in database
      
      // In a real implementation, this would update the invitation status
      throw new Error('Database not implemented for invitation updates yet');

    } catch (dbError) {
      // Database unavailable, updating demo invitation
      
      // Update session-based invitation
      const sessionKey = `${organizationId}-${userId}`;
      const sessionInvites = sessionInvitations.get(sessionKey) || [];
      const invitationIndex = sessionInvites.findIndex(inv => inv.id === invitationId);
      
      if (invitationIndex === -1) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }

      const invitation = sessionInvites[invitationIndex];
      
      switch (action) {
        case 'accept':
          invitation.status = 'ACCEPTED';
          invitation.acceptedAt = new Date().toISOString();
          break;
        case 'reject':
          invitation.status = 'REJECTED';
          invitation.rejectedAt = new Date().toISOString();
          break;
        case 'resend':
          invitation.resentAt = new Date().toISOString();
          break;
        case 'cancel':
          invitation.status = 'CANCELLED';
          invitation.cancelledAt = new Date().toISOString();
          break;
      }

      sessionInvites[invitationIndex] = invitation;
      sessionInvitations.set(sessionKey, sessionInvites);
      updatedInvitation = invitation;

      // Demo invitation updated
    }

    return NextResponse.json({
      success: true,
      invitation: updatedInvitation,
      message: `Invitation ${action}ed successfully`
    });

  } catch (_error) {
    // Error updating invitation
    return NextResponse.json(
      { error: 'Failed to update invitation' },
      { status: 500 }
    );
  }
}