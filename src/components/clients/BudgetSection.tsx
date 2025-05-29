"use client"

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Download, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

interface Budget {
  id: string;
  amount: number;
  spent: number;
  remaining: number;
  currency: string;
  startDate: string;
  endDate: string | null;
  status: string;
  expenses: Expense[];
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  status: string;
}

async function getBudgetData(clientId: string): Promise<Budget[]> {
  try {
    // Use absolute URL with origin to avoid Invalid URL errors
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(
      `${baseUrl}/api/clients/${clientId}/budgets`,
      { 
        credentials: 'include' // Include cookies for auth
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch budget data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.budgets;
  } catch (error) {
    console.error('Error fetching budget data:', error);
    throw error;
  }
}

function BudgetCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </Card>
  );
}

function BudgetLoadingState() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <BudgetCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function BudgetErrorState({ error }: { error: string }) {
  return (
    <div className="p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
      <h3 className="text-lg font-medium mb-1">Unable to load budget data</h3>
      <p className="text-sm text-gray-500">{error}</p>
    </div>
  );
}

export default function BudgetSection({ clientId }: { clientId: string }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getBudgetData(clientId);
        setBudgets(data);
        setError(null);
      } catch (err) {
        console.error('Error in budget component:', err);
        setError(err instanceof Error ? err.message : 'Failed to load budget data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  if (loading) return <BudgetLoadingState />;
  if (error) return <BudgetErrorState error={error} />;
  if (!budgets.length) return <BudgetErrorState error="No budget data available" />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Budget Tracking</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {budgets.map((budget) => (
          <Card key={budget.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Budget</p>
                  <h4 className="text-2xl font-bold">
                    {formatCurrency(budget.amount, budget.currency)}
                  </h4>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    budget.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : budget.status === 'ON_HOLD'
                      ? 'bg-yellow-100 text-yellow-700'
                      : budget.status === 'COMPLETED'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {budget.status.toLowerCase().replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Budget Utilization</span>
                  <span className="font-medium">
                    {((budget.spent / budget.amount) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={(budget.spent / budget.amount) * 100}
                  className="h-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Spent</p>
                  <p className="font-medium text-red-600">
                    {formatCurrency(budget.spent, budget.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Remaining</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(budget.remaining, budget.currency)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Recent Expenses</p>
                <div className="space-y-2">
                  {budget.expenses.slice(0, 3).map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(expense.date)} · {expense.category}
                        </p>
                      </div>
                      <span
                        className={`font-medium ${
                          expense.status === 'APPROVED'
                            ? 'text-green-600'
                            : expense.status === 'PENDING'
                            ? 'text-yellow-600'
                            : expense.status === 'REJECTED'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {formatCurrency(expense.amount, budget.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {formatDate(budget.startDate)} -{' '}
                  {budget.endDate ? formatDate(budget.endDate) : 'Ongoing'}
                </span>
                <Button variant="link" size="sm">
                  View All Expenses
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 