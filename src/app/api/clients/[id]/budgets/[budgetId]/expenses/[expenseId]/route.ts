import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; budgetId: string; expenseId: string } }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clientId, budgetId, expenseId } = params;

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
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}