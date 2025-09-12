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
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

function KPICard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`p-6 card-enhanced ${className}`}>
      <div className="flex items-center justify-between">{children}</div>
    </Card>
  );
}

function LoadingKPICard() {
  return (
    <Card className="p-6 card-enhanced border-l-2 border-muted/20">
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
    <Card className="p-6 card-enhanced border-l-2 border-destructive/20 col-span-full">
      <div className="flex items-center justify-center text-center">
        <div>
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 w-fit mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h4 className="font-semibold text-destructive mb-2">Error Loading KPIs</h4>
          <p className="text-muted-foreground mb-4">Failed to load KPI data. Please try again later.</p>
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-md hover:bg-destructive/20 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    </Card>
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
      <KPICard className="border-l-2 border-primary/20">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
          <h3 className="text-2xl font-bold text-primary tracking-tight">{kpis.activeProjects}</h3>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
      </KPICard>

      <KPICard className={`border-l-2 ${kpis.budgetUtilization > 80 ? 'border-destructive/20' : 'border-success/20'}`}>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Budget Utilization</p>
          <h3 className={`text-2xl font-bold tracking-tight ${kpis.budgetUtilization > 80 ? 'text-destructive' : 'text-success'}`}>
            {formatPercentage(kpis.budgetUtilization)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(kpis.totalSpent)} of {formatCurrency(kpis.totalBudget)}
          </p>
        </div>
        {kpis.budgetUtilization > 80 ? (
          <div className="p-2 bg-destructive/10 rounded-lg border border-destructive/20">
            <TrendingUp className="h-5 w-5 text-destructive" />
          </div>
        ) : (
          <div className="p-2 bg-success/10 rounded-lg border border-success/20">
            <TrendingDown className="h-5 w-5 text-success" />
          </div>
        )}
      </KPICard>

      <KPICard className={`border-l-2 ${kpis.goalCompletion > 50 ? 'border-success/20' : 'border-muted/20'}`}>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Goal Completion</p>
          <h3 className={`text-2xl font-bold tracking-tight ${kpis.goalCompletion > 50 ? 'text-success' : 'text-muted-foreground'}`}>
            {formatPercentage(kpis.goalCompletion)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {kpis.completedGoals} of {kpis.totalGoals} goals
          </p>
        </div>
        {kpis.goalCompletion > 50 ? (
          <div className="p-2 bg-success/10 rounded-lg border border-success/20">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
        ) : (
          <div className="p-2 bg-muted/10 rounded-lg border border-muted/20">
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </KPICard>

      <KPICard className={`border-l-2 ${
        kpis.averageFeedback >= 4 ? 'border-success/20' :
        kpis.averageFeedback >= 3 ? 'border-primary/20' : 'border-destructive/20'
      }`}>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Client Satisfaction</p>
          <h3 className={`text-2xl font-bold tracking-tight ${
            kpis.averageFeedback >= 4 ? 'text-success' :
            kpis.averageFeedback >= 3 ? 'text-primary' : 'text-destructive'
          }`}>
            {kpis.averageFeedback.toFixed(1)} / 5
          </h3>
        </div>
        {kpis.averageFeedback >= 4 ? (
          <div className="p-2 bg-success/10 rounded-lg border border-success/20">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
        ) : kpis.averageFeedback >= 3 ? (
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <TrendingDown className="h-5 w-5 text-primary" />
          </div>
        ) : (
          <div className="p-2 bg-destructive/10 rounded-lg border border-destructive/20">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
        )}
      </KPICard>
    </>
  );
} 