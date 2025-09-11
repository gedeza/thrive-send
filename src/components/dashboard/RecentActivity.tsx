'use client';

import React, { useState, useEffect } from 'react';
import { Activity, User, BarChart3, FileText, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useServiceProvider } from '@/context/ServiceProviderContext';

interface ActivityItem {
  id: string;
  type: 'campaign' | 'content' | 'approval' | 'client' | 'team';
  title: string;
  description: string;
  clientName?: string;
  userName: string;
  timestamp: Date;
  status?: 'pending' | 'completed' | 'failed';
}

export function RecentActivity() {
  const { state } = useServiceProvider();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, [state.organizationId]);

  const fetchRecentActivity = async () => {
    if (!state.organizationId) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/service-provider/activity?organizationId=${state.organizationId}&limit=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (_error) {
      console.error("", _error);
      // Fallback to mock data for demo
      setActivities(getMockActivity());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockActivity = (): ActivityItem[] => [
    {
      id: '1',
      type: 'campaign',
      title: 'Campaign Approved',
      description: 'Holiday campaign approved and scheduled',
      clientName: 'Municipal Corp',
      userName: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'completed',
    },
    {
      id: '2',
      type: 'content',
      title: 'Content Published',
      description: '3 social media posts published',
      clientName: 'Tech Startup Inc',
      userName: 'Mike Chen',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'completed',
    },
    {
      id: '3',
      type: 'approval',
      title: 'Approval Requested',
      description: 'Newsletter content needs review',
      clientName: 'Local Coffee Shop',
      userName: 'Emily Davis',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'pending',
    },
    {
      id: '4',
      type: 'client',
      title: 'New Client Added',
      description: 'Restaurant chain onboarded',
      clientName: 'Downtown Bistro',
      userName: 'Alex Rivera',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed',
    },
    {
      id: '5',
      type: 'team',
      title: 'Team Assignment',
      description: 'John assigned to Municipal Corp',
      userName: 'Manager',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'completed',
    },
  ];

  const getActivityIcon = (type: string, status?: string) => {
    const iconProps = { className: "h-4 w-4" };
    
    if (status === 'pending') {
      return <Clock {...iconProps} className="h-4 w-4 text-orange-500" />;
    }
    
    if (status === 'completed') {
      return <CheckCircle {...iconProps} className="h-4 w-4 text-green-500" />;
    }

    switch (type) {
      case 'campaign':
        return <BarChart3 {...iconProps} className="h-4 w-4 text-blue-500" />;
      case 'content':
        return <FileText {...iconProps} className="h-4 w-4 text-purple-500" />;
      case 'approval':
        return <Clock {...iconProps} className="h-4 w-4 text-orange-500" />;
      case 'client':
        return <User {...iconProps} className="h-4 w-4 text-green-500" />;
      case 'team':
        return <User {...iconProps} className="h-4 w-4 text-indigo-500" />;
      default:
        return <Activity {...iconProps} className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchRecentActivity}>
          <Activity className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type, activity.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  {activity.clientName && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700">
                      {activity.clientName}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">by {activity.userName}</span>
                </div>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div className="text-sm">No recent activity</div>
            </div>
          )}
        </div>
        
        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button variant="ghost" size="sm" className="w-full">
              View All Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}