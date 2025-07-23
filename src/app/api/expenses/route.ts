import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const budgetId = url.searchParams.get('budgetId');
    const clientId = url.searchParams.get('clientId');

    if (!budgetId || !clientId) {
      return NextResponse.json(
        { error: 'Missing required parameters: budgetId and clientId' },
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
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { budgetId, clientId, description, amount, date, category = 'OTHER' } = body;

    // Validate required fields
    if (!budgetId || !clientId || !description || !amount || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: budgetId, clientId, description, amount, date' },
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
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const expenseId = url.searchParams.get('expenseId');
    const budgetId = url.searchParams.get('budgetId');
    const clientId = url.searchParams.get('clientId');

    if (!expenseId || !budgetId || !clientId) {
      return NextResponse.json(
        { error: 'Missing required parameters: expenseId, budgetId, clientId' },
        { status: 400 }
      );
    }

    // Verify the expense belongs to the budget and organization
    const expense = await db.expense.findFirst({
      where: {
        id: expenseId,
        budgetId: budgetId,
        budget: {
          clientId: clientId,
          client: {
            organizationId: orgId,
          },
        },
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Delete the expense
    await db.expense.delete({
      where: { id: expenseId },
    });

    // Update budget spent amount
    const budget = await db.budget.findUnique({
      where: { id: budgetId },
    });

    if (budget) {
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
    }

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}