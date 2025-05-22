import { Suspense } from 'react';
import { ApprovalDashboard } from '@/components/approval/ApprovalDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function ApprovalsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Approvals</h1>
      </div>
      
      <Suspense fallback={<ApprovalDashboardSkeleton />}>
        <ApprovalDashboard />
      </Suspense>
    </div>
  );
}

function ApprovalDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
} 