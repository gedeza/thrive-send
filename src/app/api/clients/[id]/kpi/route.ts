import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const clientId = params.id;
    if (!clientId) {
      return new NextResponse('Client ID is required', { status: 400 });
    }

    // Get client data
    const client = await db.client.findUnique({
      where: { 
        id: clientId
      },
      include: {
        projects: {
          where: { status: 'ACTIVE' },
        },
        // Note: Add these relations only if they exist in your schema
        // If they don't, you'll need to modify this query
        _count: {
          select: {
            projects: { where: { status: 'ACTIVE' } }
          }
        }
      },
    });

    if (!client) {
      return new NextResponse('Client not found', { status: 404 });
    }

    // In a real app, you would fetch this data from your database
    // For now, we'll create mock data to fix the error
    
    // Calculate KPIs with safe defaults
    const activeProjects = client.projects?.length || client._count?.projects || 0;
    
    // Since we don't have budgets in the query, use mock data or implement your own logic
    const totalBudget = 5000; // Mock data
    const totalSpent = 2500;  // Mock data
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Since we don't have goals in the query, use mock data or implement your own logic
    const completedGoals = 3; // Mock data
    const totalGoals = 5;     // Mock data
    const goalCompletion = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    
    // Since we don't have feedback in the query, use mock data or implement your own logic
    const averageFeedback = 4.2; // Mock data

    return NextResponse.json({
      kpis: {
        activeProjects,
        totalBudget,
        totalSpent,
        budgetUtilization,
        completedGoals,
        totalGoals,
        goalCompletion,
        averageFeedback,
      },
    });
  } catch (error) {
    console.error('Error fetching KPI data:', error);
    // Provide a fallback response with default values
    return NextResponse.json({
      kpis: {
        activeProjects: 0,
        totalBudget: 0,
        totalSpent: 0,
        budgetUtilization: 0,
        completedGoals: 0,
        totalGoals: 0,
        goalCompletion: 0,
        averageFeedback: 0,
      },
      error: 'Failed to fetch KPI data'
    }, { status: 500 });
  }
} 