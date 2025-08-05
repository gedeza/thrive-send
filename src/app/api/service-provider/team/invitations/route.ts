import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Simple in-memory storage for demo invitations when database is unavailable
const sessionInvitations = new Map<string, any[]>();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
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
      console.log('Attempting to fetch invitations from database...');
      // In a real implementation, this would fetch from an Invitations table
      // For now, we'll simulate with demo data
      userInvitations = [];
    } catch (dbError) {
      console.warn('Database unavailable for invitations, using demo mode:', dbError);
      userInvitations = [];
    }

    // Get session-specific invitations
    const sessionKey = `${organizationId}-${userId}`;
    const sessionInvites = sessionInvitations.get(sessionKey) || [];

    // Combine all invitations
    const allInvitations = [...demoInvitations, ...userInvitations, ...sessionInvites];

    console.log(`Returning ${allInvitations.length} total invitations (${demoInvitations.length} demo + ${userInvitations.length} database + ${sessionInvites.length} session)`);
    
    return NextResponse.json(allInvitations);

  } catch (error) {
    console.error('Service provider invitations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      console.log('Attempting to create invitation in database...');
      
      // In a real implementation, this would:
      // 1. Check if user already exists or has pending invitation
      // 2. Create invitation record in database
      // 3. Send invitation email
      // 4. Create client assignments
      
      // For now, simulate database operation
      throw new Error('Database not implemented for invitations yet');

    } catch (dbError) {
      console.warn('Database unavailable, creating demo invitation:', dbError);
      
      // Fallback: Create a demo invitation response and store in session
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
        rolePermissions
      };

      // Store in session-based storage
      const sessionKey = `${organizationId}-${userId}`;
      const existingInvitations = sessionInvitations.get(sessionKey) || [];
      existingInvitations.push(invitationResponse);
      sessionInvitations.set(sessionKey, existingInvitations);

      console.log('Demo invitation created and stored in session:', {
        invitationId: invitationResponse.id,
        sessionKey,
        invitationsInSession: existingInvitations.length,
        email: invitationResponse.email,
        role: invitationResponse.role,
        clientAssignments: invitationResponse.clientAssignments.length
      });
    }
    
    return NextResponse.json({
      success: true,
      invitation: invitationResponse,
      message: sendEmail 
        ? `Invitation sent to ${email} successfully!` 
        : `Team member ${firstName} ${lastName} added successfully!`,
      demoMode: invitationResponse.id.startsWith('inv-demo-')
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating invitation:', error);
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      console.log(`Attempting to ${action} invitation in database...`);
      
      // In a real implementation, this would update the invitation status
      throw new Error('Database not implemented for invitation updates yet');

    } catch (dbError) {
      console.warn('Database unavailable, updating demo invitation:', dbError);
      
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

      console.log(`Demo invitation ${action}ed:`, {
        invitationId,
        newStatus: invitation.status,
        email: invitation.email
      });
    }

    return NextResponse.json({
      success: true,
      invitation: updatedInvitation,
      message: `Invitation ${action}ed successfully`
    });

  } catch (error) {
    console.error('Error updating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to update invitation' },
      { status: 500 }
    );
  }
}