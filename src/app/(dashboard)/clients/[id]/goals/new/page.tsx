import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { CreateGoalForm } from '@/components/clients/CreateGoalForm';

export default function NewGoalPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/clients" className="hover:text-foreground">
          Clients
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href={`/clients/${params.id}`} className="hover:text-foreground">
          Client Details
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">New Goal</span>
      </nav>
      
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-bold">Create New Goal</h1>
        <p className="text-muted-foreground">
          Set up a new goal for your client.
        </p>
      </div>

      {/* Goal Creation Form Component */}
      <CreateGoalForm clientId={params.id} />
    </div>
  );
} 