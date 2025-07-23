import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.id;

    // Verify client exists
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get budgets with expenses
    const budgets = await db.budget.findMany({
      where: { clientId },
      include: {
        expenses: {
          orderBy: { date: 'desc' },
          take: 3,
          select: {
            id: true,
            description: true,
            amount: true,
            date: true,
            category: true,
            status: true,
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    // Format response
    const formattedBudgets = budgets.map(budget => ({
      id: budget.id,
      amount: budget.amount,
      spent: budget.spent,
      remaining: budget.amount - budget.spent,
      currency: budget.currency,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate?.toISOString() || null,
      status: budget.status,
      expenses: budget.expenses.map(expense => ({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date.toISOString(),
        category: expense.category,
        status: expense.status,
      }))
    }));

    return NextResponse.json({ budgets: formattedBudgets });
  } catch (error) {
    console.error("Budget API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.id;
    const body = await request.json();

    // Verify client exists
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Basic validation
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({ error: "Valid budget amount is required" }, { status: 400 });
    }

    // Create budget
    const budget = await db.budget.create({
      data: {
        amount: body.amount,
        currency: body.currency || "USD",
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || "ACTIVE",
        clientId,
        projectId: body.projectId || null,
      },
      include: {
        expenses: true
      }
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Create budget API error:", error);
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    );
  }
}