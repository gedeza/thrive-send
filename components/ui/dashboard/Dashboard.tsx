import React from 'react';
import { Card } from '../patterns/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

interface DashboardProps {
  contentStats: {
    total: number;
    published: number;
    scheduled: number;
    draft: number;
  };
  projectStats: {
    active: number;
    completed: number;
    upcoming: number;
  };
  analytics: {
    totalEngagements: number;
    totalViews: number;
    totalLikes: number;
  };
}

export function Dashboard({ contentStats, projectStats, analytics }: DashboardProps) {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Content Overview</h3>
          <div className="space-y-2">
            <p>Total Content: {contentStats.total}</p>
            <p>Published: {contentStats.published}</p>
            <p>Scheduled: {contentStats.scheduled}</p>
            <p>Drafts: {contentStats.draft}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Project Status</h3>
          <div className="space-y-2">
            <p>Active Projects: {projectStats.active}</p>
            <p>Completed: {projectStats.completed}</p>
            <p>Upcoming: {projectStats.upcoming}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Analytics Overview</h3>
          <div className="space-y-2">
            <p>Total Engagements: {analytics.totalEngagements}</p>
            <p>Total Views: {analytics.totalViews}</p>
            <p>Total Likes: {analytics.totalLikes}</p>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-6">
          <ContentOverview />
        </TabsContent>
        
        <TabsContent value="projects" className="mt-6">
          <ProjectOverview />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <AnalyticsOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Placeholder components - we'll implement these next
function ContentOverview() {
  return <div>Content Overview Component</div>;
}

function ProjectOverview() {
  return <div>Project Overview Component</div>;
}

function AnalyticsOverview() {
  return <div>Analytics Overview Component</div>;
} 