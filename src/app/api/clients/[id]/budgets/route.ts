import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

interface Budget {
  id: string;
  amount: number;
  spent: number;
  currency: string;
  startDate: Date;
  endDate: Date | null;
  status: string;
  expenses: Expense[];
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  status: string;
}

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

    // Get client budget data
    const budgets = await db.$queryRaw<Budget[]>`
      SELECT 
        b.id,
        b.amount,
        b.spent,
        b.currency,
        b.start_date as "startDate",
        b.end_date as "endDate",
        b.status,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', e.id,
                'description', e.description,
                'amount', e.amount,
                'date', e.date,
                'category', e.category,
                'status', e.status
              )
            )
            FROM (
              SELECT *
              FROM "Expense"
              WHERE "budgetId" = b.id
              ORDER BY date DESC
              LIMIT 3
            ) e
          ),
          '[]'::json
        ) as expenses
      FROM "Budget" b
      WHERE b."clientId" = ${clientId}
      ORDER BY b.start_date DESC
    `;

    // Calculate remaining budget for each budget
    const budgetsWithRemaining = budgets.map((budget: Budget) => ({
      ...budget,
      remaining: budget.amount - budget.spent,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate?.toISOString() || null,
      expenses: budget.expenses.map((expense: Expense) => ({
        ...expense,
        date: expense.date.toISOString(),
      })),
    }));

    return NextResponse.json({ budgets: budgetsWithRemaining });
  } catch (error) {
    console.error('Error fetching budget data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 