'use client';

import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from '@/types/activity';
import { activityService } from '@/lib/services/activity-service';
import { User } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Button } from "@/components/ui/button";

interface ActivityFeedProps {
  activities?: Activity[];
  showFilters?: boolean;
  realTimeUpdates?: boolean;
  maxHeight?: string;
  className?: string;
}

// Safe version of ActivityFeed with error handling
const SafeActivityFeed: React.FC<ActivityFeedProps> = (props) => (
  <ErrorBoundary
    fallback={
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-destructive">Error Loading Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              An error occurred while loading the activity feed.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    }
  >
    <ActivityFeed {...props} />
  </ErrorBoundary>
);

export function ActivityFeed({ 
  activities: initialActivities,
  showFilters = true,
  realTimeUpdates = false,
  maxHeight = "400px",
  className = ""
}: ActivityFeedProps) {
  const { error, handleError } = useErrorHandler({
    fallbackMessage: 'Failed to load activity feed',
  });

  const [activities, setActivities] = useState<Activity[]>(initialActivities || []);
  const [loading, setLoading] = useState(!initialActivities);
  const [filter, setFilter] = useState<Activity['type'] | 'all'>('all');

  useEffect(() => {
    if (!initialActivities) {
      const fetchActivities = async () => {
        try {
          const data = await activityService.getActivities({});
          setActivities(data);
          setLoading(false);
        } catch (err) {
          handleError(err);
          setLoading(false);
        }
      };
      fetchActivities();
    }
  }, [initialActivities, handleError]);

  // Simulate real-time updates if enabled
  useEffect(() => {
    if (realTimeUpdates) {
      const interval = setInterval(() => {
        setActivities((prev) => {
          try {
            const type = ["campaign", "email", "user", "system"][Math.floor(Math.random() * 4)] as Activity['type'];
            let newActivity: Activity;
            
            switch (type) {
              case 'campaign':
                newActivity = {
                  id: Math.random().toString(),
                  type: 'campaign',
                  title: "New Campaign Activity",
                  description: "This is a simulated campaign update",
                  timestamp: new Date().toISOString(),
                  status: 'published'
                };
                break;
              case 'email':
                newActivity = {
                  id: Math.random().toString(),
                  type: 'email',
                  title: "New Email Activity",
                  description: "This is a simulated email update",
                  timestamp: new Date().toISOString(),
                  status: 'sent',
                  recipientCount: 100
                };
                break;
              case 'user':
                newActivity = {
                  id: Math.random().toString(),
                  type: 'user',
                  title: "New User Activity",
                  description: "This is a simulated user update",
                  timestamp: new Date().toISOString(),
                  action: 'joined'
                };
                break;
              case 'system':
                newActivity = {
                  id: Math.random().toString(),
                  type: 'system',
                  title: "New System Activity",
                  description: "This is a simulated system update",
                  timestamp: new Date().toISOString(),
                  severity: 'info'
                };
                break;
              default:
                throw new Error(`Unsupported activity type: ${type}`);
            }
            
            return [newActivity, ...prev].slice(0, 10);
          } catch (_error) {
            handleError(error);
            return prev;
          }
        });
      }, 30000); // Add new activity every 30 seconds

      return () => clearInterval(interval);
    }
  }, [realTimeUpdates, handleError]);

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter((activity) => activity.type === filter);

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'campaign':
        return 'bg-primary';
      case 'email':
        return 'bg-secondary';
      case 'user':
        return 'bg-accent';
      case 'system':
        return 'bg-muted';
      default:
        return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>Loading activities...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error.hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-destructive">Error Loading Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {error.message}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>
          Real-time updates from your campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="flex space-x-2 mb-4">
            <Badge
              variant="outline"
              className={`cursor-pointer ${
                filter === 'all' 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer ${
                filter === 'campaign' 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => setFilter('campaign')}
            >
              Campaigns
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer ${
                filter === 'email' 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => setFilter('email')}
            >
              Emails
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer ${
                filter === 'user' 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => setFilter('user')}
            >
              Users
            </Badge>
          </div>
        )}
        <ScrollArea className={`h-[${maxHeight}] pr-4`}>
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-muted/50"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {activity.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  {activity.user && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.user.image} alt={activity.user.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {activity.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {activity.user.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SafeActivityFeed; 