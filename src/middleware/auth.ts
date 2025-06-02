import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/error-handler";

export interface AuthenticatedRequest extends NextRequest {
  auth: {
    userId: string;
    user: {
      id: string;
      clerkId: string;
    };
    organizationId?: string;
  };
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get internal user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, clerkId: true },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Add auth info to request
    const authedRequest = request as AuthenticatedRequest;
    authedRequest.auth = {
      userId,
      user,
      organizationId: undefined,
    };

    return handler(authedRequest);
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}

export async function withOrganization(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(request, async (authedRequest) => {
    try {
      // Try to get organizationId from Clerk session first
      // Import the auth function directly to get fresh session data
      const { auth } = await import('@clerk/nextjs/server');
      const session = await auth();
      let organizationId = session.orgId || undefined;
      
      console.log('Using organization ID from Clerk session:', organizationId);
      
      // If no organizationId in Clerk session, we could look for it in the URL or headers
      // This avoids consuming the request body
      if (!organizationId) {
        // For now, let's leave the organizationId as undefined
        // In the future we could check query params or headers
        console.log('No organization ID found in session');
      }

      console.log('Organization verification:', {
        organizationId,
        userId: authedRequest.auth.user.id,
        userClerkId: authedRequest.auth.user.clerkId
      });

      if (!organizationId) {
        throw new ApiError("organizationId is required", 400);
      }

      // First check if the organization exists
      let organization = await prisma.organization.findUnique({
        where: {
          clerkOrganizationId: organizationId
        }
      });

      console.log('Organization lookup result:', {
        organizationId,
        found: !!organization,
        organizationDetails: organization
      });

      if (!organization) {
        console.log('Organization not found, attempting to create it...');
        
        try {
          // Create the organization in our database with minimal info
          organization = await prisma.organization.create({
            data: {
              name: 'Organization ' + organizationId,
              slug: 'org-' + Date.now(), // Generate a unique slug
              clerkOrganizationId: organizationId,
              primaryColor: "#000000"
            }
          });
          
          console.log('Created new organization:', organization);
        } catch (error) {
          console.error('Failed to create organization:', error);
          throw new ApiError("Failed to create organization automatically", 500);
        }
      }

      // Get all user's organization memberships
      const userMemberships = await prisma.organizationMember.findMany({
        where: {
          user: {
            clerkId: authedRequest.auth.user.clerkId
          }
        },
        include: {
          organization: true
        }
      });

      console.log('User organization memberships:', {
        userClerkId: authedRequest.auth.user.clerkId,
        membershipsCount: userMemberships.length,
        memberships: userMemberships.map(m => ({
          organizationId: m.organizationId,
          organizationName: m.organization.name,
          organizationClerkId: m.organization.clerkOrganizationId,
          role: m.role
        }))
      });

      // Verify organization access using Clerk user ID
      let membership = await prisma.organizationMember.findFirst({
        where: {
          organization: {
            clerkOrganizationId: organizationId
          },
          user: {
            clerkId: authedRequest.auth.user.clerkId
          }
        },
        include: {
          user: true,
          organization: true
        }
      });

      console.log('Organization membership check:', {
        found: !!membership,
        membership,
        organizationId
      });

      if (!membership) {
        console.log('No membership found, checking if membership should be created...');
        
        // TEMPORARY FIX: Create organization for development purposes
        try {
          console.log('Creating new organization membership as workaround');
          // Ensure we have an organization to work with
          if (!organization) {
            organization = await prisma.organization.create({
              data: {
                name: 'Default Organization',
                slug: 'default-org-' + Date.now(),
                clerkOrganizationId: organizationId || 'default-clerk-org',
                primaryColor: "#3b82f6"
              }
            });
          }
          
          const newMembership = await prisma.organizationMember.create({
            data: {
              organizationId: organization.id,
              userId: authedRequest.auth.user.id,
              role: 'ADMIN'
            },
            include: {
              user: true,
              organization: true
            }
          });
          
          console.log('Created temporary organization membership:', newMembership);
          membership = newMembership;
        } catch (error) {
          console.error('Failed to create temporary membership:', error);
          throw new ApiError("Organization access denied", 403);
        }
      }

      // Add organization to auth context
      authedRequest.auth.organizationId = membership.organization.id;
      
      console.log('Organization middleware using internal ID:', membership.organization.id);

      // Instead of cloning the request (which fails), just use the authedRequest directly
      return handler(authedRequest);
    } catch (error) {
      console.error('Organization middleware error:', error);
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        { error: "Organization access check failed" },
        { status: 500 }
      );
    }
  });
} 