import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get current period stats
    const currentDate = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(currentDate.getMonth() - 1);

    // Get client statistics
    const [
      totalClients,
      activeClients,
      newClientsThisMonth,
      newClientsLastMonth,
      clientsByType,
      clientsByStatus,
      totalProjects,
      activeProjects,
      completedProjects
    ] = await Promise.all([
      // Total clients
      db.client.count({
        where: { organizationId: organization.id }
      }),
      
      // Active clients (since Client model doesn't have status field, use total clients)
      db.client.count({
        where: { 
          organizationId: organization.id
        }
      }),
      
      // New clients this month
      db.client.count({
        where: {
          organizationId: organization.id,
          createdAt: { gte: lastMonth }
        }
      }),
      
      // New clients last month (for comparison)
      db.client.count({
        where: {
          organizationId: organization.id,
          createdAt: {
            gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, 1),
            lt: lastMonth
          }
        }
      }),
      
      // Clients by type
      db.client.groupBy({
        by: ['type'],
        where: { organizationId: organization.id },
        _count: { type: true }
      }),
      
      // Clients by status (Client model doesn't have status field, return empty)
      Promise.resolve([]),
      
      // Total projects
      db.project.count({
        where: {
          organizationId: organization.id
        }
      }),
      
      // Active projects (using string value as seen in schema)
      db.project.count({
        where: {
          organizationId: organization.id,
          status: 'ACTIVE'
        }
      }),
      
      // Completed projects (using string value as seen in schema)
      db.project.count({
        where: {
          organizationId: organization.id,
          status: 'COMPLETED'
        }
      })
    ]);

    // Calculate growth percentages
    const clientGrowth = newClientsLastMonth > 0 
      ? ((newClientsThisMonth - newClientsLastMonth) / newClientsLastMonth) * 100 
      : newClientsThisMonth > 0 ? 100 : 0;

    const activeClientPercentage = totalClients > 0 
      ? (activeClients / totalClients) * 100 
      : 0;

    const projectCompletionRate = totalProjects > 0 
      ? (completedProjects / totalProjects) * 100 
      : 0;

    const stats = {
      totalClients,
      activeClients,
      newClientsThisMonth,
      clientGrowth: Number(clientGrowth.toFixed(1)),
      activeClientPercentage: Number(activeClientPercentage.toFixed(1)),
      clientsByType: clientsByType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
      clientsByStatus: {}, // Empty since Client model doesn't have status field
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        completionRate: Number(projectCompletionRate.toFixed(1))
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching client statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch client statistics" },
      { status: 500 }
    );
  }
}