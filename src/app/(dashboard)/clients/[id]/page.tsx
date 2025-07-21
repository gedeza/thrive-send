import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingPage, LoadingSkeleton } from '@/components/common/LoadingSpinner';

// Components
import ClientHeader, { ClientHeaderSkeleton } from '@/components/clients/ClientHeader';
import KPISection from '@/components/clients/KPISection';
import TimelineView from '@/components/clients/TimelineView';
import BudgetSection from '@/components/clients/BudgetSection';
import DocumentSection from '@/components/clients/DocumentSection';
import FeedbackSection from '@/components/clients/FeedbackSection';
import GoalsSection from '@/components/clients/GoalsSection';
import ClientProjectsSection from '@/components/clients/ClientProjectsSection';

export default async function ClientDashboard({
  params,
}: {
  params: { id: string };
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return null;
  }

  const clientId = params.id;

  try {
    // Fetch initial client data
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        industry: true,
        website: true,
        email: true,
        phone: true,
      },
    });

    if (!client) {
      notFound();
    }

    return (
      <div className="container mx-auto py-8">
        <Suspense fallback={<ClientHeaderSkeleton />}>
          <ClientHeader client={client} />
        </Suspense>

        <Tabs defaultValue="overview" className="mt-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Suspense fallback={<KPILoadingState />}>
                <KPISection clientId={clientId} />
              </Suspense>

              <Card className="col-span-full">
                <Suspense fallback={
                  <Card className="p-6">
                    <LoadingSkeleton rows={4} showAvatar={false} />
                  </Card>
                }>
                  <TimelineView clientId={clientId} limit={5} />
                </Suspense>
              </Card>

              <Card className="col-span-full md:col-span-2">
                <Suspense fallback={
                  <Card className="p-6">
                    <LoadingSkeleton rows={3} showAvatar={false} />
                  </Card>
                }>
                  <GoalsSection clientId={clientId} limit={3} />
                </Suspense>
              </Card>

              <Card>
                <Suspense fallback={
                  <Card className="p-6">
                    <LoadingSkeleton rows={2} showAvatar={true} />
                  </Card>
                }>
                  <FeedbackSection clientId={clientId} limit={3} />
                </Suspense>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <Suspense fallback={
              <LoadingPage 
                title="Loading Projects..." 
                description="Fetching client project data"
                size="md" 
              />
            }>
              <ClientProjectsSection clientId={clientId} />
            </Suspense>
          </TabsContent>

          <TabsContent value="timeline">
            <Suspense fallback={
              <LoadingPage 
                title="Loading Timeline..." 
                description="Building client activity timeline"
                size="md" 
              />
            }>
              <TimelineView clientId={clientId} />
            </Suspense>
          </TabsContent>

          <TabsContent value="budget">
            <Suspense fallback={
              <LoadingPage 
                title="Loading Budget..." 
                description="Calculating budget information"
                size="md" 
              />
            }>
              <BudgetSection clientId={clientId} />
            </Suspense>
          </TabsContent>

          <TabsContent value="documents">
            <Suspense fallback={
              <LoadingPage 
                title="Loading Documents..." 
                description="Preparing document library"
                size="md" 
              />
            }>
              <DocumentSection clientId={clientId} />
            </Suspense>
          </TabsContent>

          <TabsContent value="feedback">
            <Suspense fallback={
              <LoadingPage 
                title="Loading Feedback..." 
                description="Gathering client feedback data"
                size="md" 
              />
            }>
              <FeedbackSection clientId={clientId} />
            </Suspense>
          </TabsContent>

          <TabsContent value="goals">
            <Suspense fallback={
              <LoadingPage 
                title="Loading Goals..." 
                description="Loading goal progress data"
                size="md" 
              />
            }>
              <GoalsSection clientId={clientId} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error('Error in ClientDashboard:', error);
    throw error;
  }
}

function KPILoadingState() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </Card>
      ))}
    </>
  );
} 