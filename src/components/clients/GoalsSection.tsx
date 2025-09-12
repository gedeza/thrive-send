"use client"

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';
import { Plus, Target, Clock, CheckCircle2, AlertCircle, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Goal {
  id: string;
  name: string;
  description: string | null;
  targetValue: number | null;
  currentValue: number | null;
  startDate: string;
  endDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  milestones: {
    id: string;
    name: string;
    description: string | null;
    dueDate: string;
    completedDate: string | null;
    status: string;
  }[];
  metrics: {
    id: string;
    name: string;
    description: string | null;
    metricType: string;
    targetValue: number | null;
    currentValue: number | null;
    unit: string | null;
  }[];
}

interface GoalsResponse {
  goals: Goal[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    averageProgress: number;
  };
}

async function getGoalsData(clientId: string, limit?: number): Promise<GoalsResponse> {
  try {
    const response = await fetch(
      `/api/clients/${clientId}/goals${limit ? `?limit=${limit}` : ''}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch goals data: ${response.statusText}`);
    }

    const data = await response.json();
    // Handle both old direct data format and new standardized format
    return data.data ? data.data : data;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

function GoalCardSkeleton() {
  return (
    <Card className="p-6 card-enhanced border-l-2 border-muted/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-2 w-3/4" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </Card>
  );
}

function GoalsLoadingState() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="p-2 bg-muted/10 rounded-lg border border-muted/20">
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <GoalCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function GoalsErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="p-6 text-center">
      <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 w-fit mx-auto mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium text-destructive mb-1">Unable to load goals</h3>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      <Button
        variant="outline"
        onClick={onRetry}
        className="flex items-center gap-2 border-destructive/20 hover:bg-destructive/10"
      >
        <RefreshCcw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

export default function GoalsSection({
  clientId,
  limit,
}: {
  clientId: string;
  limit?: number;
}) {
  const router = useRouter();
  const [data, setData] = useState<GoalsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const responseData = await getGoalsData(clientId, limit);
      setData(responseData);
    } catch (err) {
      console.error('Error in goals component:', err);
      setError(err instanceof Error ? err.message : 'Failed to load goals data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId, limit]);

  if (loading) return <GoalsLoadingState />;
  if (error) return <GoalsErrorState error={error} onRetry={fetchData} />;
  if (!data) return <GoalsErrorState error="No data available" onRetry={fetchData} />;

  const { goals, stats } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-success/10 rounded-lg border border-success/20">
              <Target className="h-5 w-5 text-success" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Goals & Objectives</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{stats.total} Total Goals</span>
            <span className="text-success">{stats.completed} Completed</span>
            <span className="text-primary">{stats.inProgress} In Progress</span>
          </div>
        </div>
        <Button 
          size="sm"
          onClick={() => router.push(`/clients/${clientId}/goals/new`)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {goals.map((goal) => {
          const getGoalCardStyle = (status: string) => {
            switch (status) {
              case 'COMPLETED':
                return 'card-enhanced border-l-2 border-success/20';
              case 'IN_PROGRESS':
                return 'card-enhanced border-l-2 border-primary/20';
              case 'NOT_STARTED':
                return 'card-enhanced border-l-2 border-muted/20';
              default:
                return 'card-enhanced border-l-2 border-destructive/20';
            }
          };
          
          return (
          <Card key={goal.id} className={`p-6 ${getGoalCardStyle(goal.status)}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium text-foreground">{goal.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {goal.milestones.length} Milestones
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border ${
                    goal.status === 'COMPLETED'
                      ? 'bg-success/10 text-success border-success/20'
                      : goal.status === 'IN_PROGRESS'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : goal.status === 'NOT_STARTED'
                      ? 'bg-muted/10 text-muted-foreground border-muted/20'
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}
                >
                  {goal.status.toLowerCase().replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2">
                {goal.description && (
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <Progress 
                    value={goal.targetValue && goal.currentValue 
                      ? (goal.currentValue / goal.targetValue) * 100 
                      : 0
                    } 
                    className="h-2 flex-1 mr-4" 
                  />
                  <span className={`text-sm font-medium ${
                    goal.status === 'COMPLETED' ? 'text-success' :
                    goal.status === 'IN_PROGRESS' ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {goal.targetValue && goal.currentValue
                      ? Math.round((goal.currentValue / goal.targetValue) * 100)
                      : 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(goal.status)}
                  <span className={`capitalize ${
                    goal.status === 'COMPLETED' ? 'text-success' :
                    goal.status === 'IN_PROGRESS' ? 'text-primary' :
                    goal.status === 'NOT_STARTED' ? 'text-muted-foreground' : 'text-destructive'
                  }`}>
                    {goal.status.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                {goal.endDate && (
                  <time className="text-muted-foreground">
                    Due {formatDate(goal.endDate)}
                  </time>
                )}
              </div>
            </div>
          </Card>
        );})}
      </div>
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    case 'in_progress':
      return <Clock className="h-5 w-5 text-primary" />;
    case 'not_started':
      return <Target className="h-5 w-5 text-muted-foreground" />;
    default:
      return <AlertCircle className="h-5 w-5 text-destructive" />;
  }
} 