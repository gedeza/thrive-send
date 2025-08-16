"use client"

import { Card } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense, useState, useEffect } from 'react';
import { Alert } from '@/components/ui/alert';

interface KPIData {
  activeProjects: number;
  totalProjects: number;
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
  completedGoals: number;
  totalGoals: number;
  goalCompletion: number;
  averageFeedback: number;
  feedbackCount: number;
}

// Default KPI data to use as fallback
const defaultKPIData: KPIData = {
  activeProjects: 0,
  totalProjects: 0,
  totalBudget: 0,
  totalSpent: 0,
  budgetUtilization: 0,
  completedGoals: 0,
  totalGoals: 0,
  goalCompletion: 0,
  averageFeedback: 0,
  feedbackCount: 0
};

async function getKPIData(clientId: string): Promise<KPIData> {
  try {
    const response = await fetch(`/api/clients/${clientId}/kpi`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch KPI data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching KPI data:', error);
    throw error;
  }
}

function KPICard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">{children}</div>
    </Card>
  );
}

function LoadingKPICard() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </Card>
  );
}

function KPILoadingState() {
  return (
    <>
      <LoadingKPICard />
      <LoadingKPICard />
      <LoadingKPICard />
      <LoadingKPICard />
    </>
  );
}

function KPIErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert intent="error" style={{ marginBottom: '1rem' }}>
      <div className="flex items-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        <div>
          <h4 className="font-semibold">Error</h4>
          <p>Failed to load KPI data. Please try again later.</p>
          <button 
            onClick={onRetry}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </Alert>
  );
}

export default function KPISection({ clientId }: { clientId: string }) {
  return (
    <Suspense fallback={<KPILoadingState />}>
      <KPIContent clientId={clientId} />
    </Suspense>
  );
}

function KPIContent({ clientId }: { clientId: string }) {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIData>(defaultKPIData);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKPIData(clientId);
      setKpis(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load KPI data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  if (loading) {
    return <KPILoadingState />;
  }

  if (error) {
    return <KPIErrorState onRetry={loadData} />;
  }

  return (
    <>
      <KPICard>
        <div>
          <p className="text-sm font-medium text-gray-500">Active Projects</p>
          <h3 className="text-2xl font-bold">{kpis.activeProjects}</h3>
        </div>
        <div className="rounded-full bg-green-100 p-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
        </div>
      </KPICard>

      <KPICard>
        <div>
          <p className="text-sm font-medium text-gray-500">Budget Utilization</p>
          <h3 className="text-2xl font-bold">
            {formatPercentage(kpis.budgetUtilization)}
          </h3>
          <p className="text-sm text-gray-500">
            {formatCurrency(kpis.totalSpent)} of {formatCurrency(kpis.totalBudget)}
          </p>
        </div>
        {kpis.budgetUtilization > 80 ? (
          <div className="rounded-full bg-red-100 p-2">
            <TrendingUp className="h-4 w-4 text-red-600" />
          </div>
        ) : (
          <div className="rounded-full bg-green-100 p-2">
            <TrendingDown className="h-4 w-4 text-green-600" />
          </div>
        )}
      </KPICard>

      <KPICard>
        <div>
          <p className="text-sm font-medium text-gray-500">Goal Completion</p>
          <h3 className="text-2xl font-bold">
            {formatPercentage(kpis.goalCompletion)}
          </h3>
          <p className="text-sm text-gray-500">
            {kpis.completedGoals} of {kpis.totalGoals} goals
          </p>
        </div>
        {kpis.goalCompletion > 50 ? (
          <div className="rounded-full bg-green-100 p-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        ) : (
          <div className="rounded-full bg-yellow-100 p-2">
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </div>
        )}
      </KPICard>

      <KPICard>
        <div>
          <p className="text-sm font-medium text-gray-500">Client Satisfaction</p>
          <h3 className="text-2xl font-bold">
            {kpis.averageFeedback.toFixed(1)} / 5
          </h3>
        </div>
        {kpis.averageFeedback >= 4 ? (
          <div className="rounded-full bg-green-100 p-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        ) : kpis.averageFeedback >= 3 ? (
          <div className="rounded-full bg-yellow-100 p-2">
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </div>
        ) : (
          <div className="rounded-full bg-red-100 p-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
        )}
      </KPICard>
    </>
  );
} 