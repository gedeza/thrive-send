"use client"

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Download, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { SimpleBudgetModal } from './SimpleBudgetModal';
import { ExpensesModal } from './ExpensesModal';

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
    const response = await fetch(`/api/clients/${clientId}/budgets`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch budget data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.budgets || [];
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

async function createBudget(clientId: string, budgetData: {
  amount: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: string;
}) {
  try {
    const response = await fetch(`/api/clients/${clientId}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budgetData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create budget');
    }

    return await response.json();
  } catch (_error) {
    console.error("", _error);
    throw _error;
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

function CreateBudgetModal({ clientId, onSuccess }: { clientId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'ACTIVE'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createBudget(clientId, {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        status: formData.status,
      });

      setOpen(false);
      setFormData({
        amount: '',
        currency: 'USD',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'ACTIVE'
      });
      onSuccess();
    } catch (_error) {
      console.error("", _error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onOpenChange={setOpen}>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="Enter budget amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                min={formData.startDate}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.amount}>
              {loading ? 'Creating...' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BudgetErrorState({ error, onRetry, clientId, onSuccess }: { 
  error: string; 
  onRetry?: () => void; 
  clientId?: string;
  onSuccess?: () => void;
}) {
  return (
    <Card className="p-6">
      <div className="text-center">
        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
        <h3 className="text-lg font-medium mb-1">Unable to load budget data</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <div className="flex gap-2 justify-center">
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          )}
          {clientId && onSuccess && (
            <CreateBudgetModal clientId={clientId} onSuccess={onSuccess} />
          )}
        </div>
      </div>
    </Card>
  );
}

export default function BudgetSection({ clientId }: { clientId: string }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching budget data for client:', clientId);
      const data = await getBudgetData(clientId);
      console.log('Budget data received:', data);
      setBudgets(data);
    } catch (err) {
      console.error('Error in budget component:', err);
      setError(err instanceof Error ? err.message : 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId]);

  if (loading) return <BudgetLoadingState />;
  if (error) return <BudgetErrorState error={error} onRetry={fetchData} clientId={clientId} onSuccess={fetchData} />;
  if (!budgets.length) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No budgets available</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create your first budget to start tracking project expenses.
          </p>
          <SimpleBudgetModal clientId={clientId} onSuccess={fetchData} />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Budget Tracking</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <CreateBudgetModal clientId={clientId} onSuccess={fetchData} />
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
                <ExpensesModal budgetId={budget.id} clientId={clientId} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 