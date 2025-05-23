import React from 'react';
import { Card } from '../patterns/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

interface AnalyticsData {
  engagements: {
    total: number;
    byPlatform: {
      platform: string;
      count: number;
    }[];
    byDate: {
      date: string;
      count: number;
    }[];
  };
  content: {
    total: number;
    byStatus: {
      status: string;
      count: number;
    }[];
    byType: {
      type: string;
      count: number;
    }[];
  };
  performance: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    byDate: {
      date: string;
      views: number;
      likes: number;
      shares: number;
      comments: number;
    }[];
  };
}

interface AnalyticsProps {
  data: AnalyticsData;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export function Analytics({ data, dateRange }: AnalyticsProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="text-sm text-gray-500">
          {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Engagements</h3>
          <p className="text-2xl font-bold">{data.engagements.total}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
          <p className="text-2xl font-bold">{data.performance.views}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Likes</h3>
          <p className="text-2xl font-bold">{data.performance.likes}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Shares</h3>
          <p className="text-2xl font-bold">{data.performance.shares}</p>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="engagements" className="w-full">
        <TabsList>
          <TabsTrigger value="engagements">Engagements</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="engagements" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Engagements by Platform</h3>
              <div className="space-y-2">
                {data.engagements.byPlatform.map((item) => (
                  <div key={item.platform} className="flex justify-between">
                    <span>{item.platform}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Engagements Over Time</h3>
              <div className="space-y-2">
                {data.engagements.byDate.map((item) => (
                  <div key={item.date} className="flex justify-between">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Content by Status</h3>
              <div className="space-y-2">
                {data.content.byStatus.map((item) => (
                  <div key={item.status} className="flex justify-between">
                    <span>{item.status}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Content by Type</h3>
              <div className="space-y-2">
                {data.content.byType.map((item) => (
                  <div key={item.type} className="flex justify-between">
                    <span>{item.type}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
            <div className="space-y-4">
              {data.performance.byDate.map((item) => (
                <div key={item.date} className="space-y-2">
                  <div className="font-medium">
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Views:</span> {item.views}
                    </div>
                    <div>
                      <span className="text-gray-500">Likes:</span> {item.likes}
                    </div>
                    <div>
                      <span className="text-gray-500">Shares:</span> {item.shares}
                    </div>
                    <div>
                      <span className="text-gray-500">Comments:</span> {item.comments}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 