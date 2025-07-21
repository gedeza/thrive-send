import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { 
  createSuccessResponse, 
  createUnauthorizedResponse, 
  createValidationResponse,
  createNotFoundResponse,
  handleApiError 
} from "@/lib/api-utils";
import type { ClientStatsResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return createUnauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return createValidationResponse("organizationId is required");
    }

    // Find the organization by either internal ID or Clerk ID
    const organization = await db.organization.findFirst({
      where: {
        OR: [
          { id: organizationId },
          { clerkOrganizationId: organizationId }
        ]
      }
    });

    if (!organization) {
      return createNotFoundResponse("Organization");
    }

    // Simplified stats calculation to avoid potential errors
    const [clientCount, projectCount] = await Promise.all([
      db.client.count({
        where: { organizationId: organization.id }
      }),
      db.project.count({
        where: { organizationId: organization.id }
      })
    ]);

    // Get basic client and project data
    const [clients, projects] = await Promise.all([
      db.client.findMany({
        where: { organizationId: organization.id },
        select: {
          status: true,
          type: true,
          createdAt: true
        }
      }),
      db.project.findMany({
        where: { organizationId: organization.id },
        select: {
          status: true
        }
      })
    ]);

    // Calculate basic statistics
    const totalClients = clientCount;
    // Use default status since existing clients may not have status set yet
    const activeClients = clients.filter(c => !c.status || c.status === 'ACTIVE').length;
    const totalProjects = projectCount;
    const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;

    // Calculate simple percentages
    const completionRate = totalProjects > 0 
      ? Math.round((completedProjects / totalProjects) * 100) 
      : 0;

    const stats: ClientStatsResponse = {
      totalClients,
      activeClients,
      newClientsThisMonth: 0, // Simplified for now
      clientGrowth: 0, // Simplified for now
      activeClientPercentage: totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0,
      clientsByType: {},
      clientsByStatus: {},
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        completionRate
      }
    };

    return createSuccessResponse(stats, 200, "Client statistics retrieved successfully");
  } catch (error) {
    console.error("Stats API Error:", error);
    return handleApiError(error);
  }
}