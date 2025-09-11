import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; budgetId: string } }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clientId, budgetId } = params;

    // Verify the budget belongs to the client and organization
    const budget = await db.budget.findFirst({
      where: {
        id: budgetId,
        clientId: clientId,
        client: {
          organizationId: orgId,
        },
      },
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Fetch expenses for this budget
    const expenses = await db.expense.findMany({
      where: {
        budgetId: budgetId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(expenses);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; budgetId: string } }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clientId, budgetId } = params;
    const body = await request.json();

    // Validate required fields
    const { description, amount, date, category = 'OTHER' } = body;
    if (!description || !amount || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: description, amount, date' },
        { status: 400 }
      );
    }

    // Verify the budget belongs to the client and organization
    const budget = await db.budget.findFirst({
      where: {
        id: budgetId,
        clientId: clientId,
        client: {
          organizationId: orgId,
        },
      },
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Create the expense
    const expense = await db.expense.create({
      data: {
        budgetId: budgetId,
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        category,
      },
    });

    // Update budget spent amount
    const totalExpenses = await db.expense.aggregate({
      where: { budgetId },
      _sum: { amount: true },
    });

    await db.budget.update({
      where: { id: budgetId },
      data: { 
        spent: totalExpenses._sum.amount || 0,
        remaining: budget.amount - (totalExpenses._sum.amount || 0),
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}