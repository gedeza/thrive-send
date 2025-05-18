'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from '@prisma/client';
import { User } from 'lucide-react';
import Image from 'next/image';

interface ActivityFeedProps {
  activities: (Activity & {
    user: {
      name: string | null;
      imageUrl: string | null;
    };
  })[];
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'PROFILE_UPDATE':
      return '👤';
    case 'CONTENT_CREATE':
      return '📝';
    case 'CONTENT_UPDATE':
      return '✏️';
    case 'SOCIAL_POST':
      return '📢';
    case 'SETTINGS_UPDATE':
      return '⚙️';
    default:
      return '📌';
  }
};

const getActivityDescription = (activity: Activity) => {
  const metadata = activity.metadata as Record<string, any>;
  
  switch (activity.action) {
    case 'PROFILE_UPDATE':
      return `Updated their profile`;
    case 'CONTENT_CREATE':
      return `Created new content: ${metadata?.title || 'Untitled'}`;
    case 'CONTENT_UPDATE':
      return `Updated content: ${metadata?.title || 'Untitled'}`;
    case 'SOCIAL_POST':
      return `Posted to ${metadata?.platform || 'social media'}`;
    case 'SETTINGS_UPDATE':
      return `Updated their settings`;
    default:
      return 'Performed an action';
  }
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities.length) {
    return (
      <div className="flex items-center justify-center h-32 text-neutral-text-light">
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start space-x-4 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800"
        >
          <div className="flex-shrink-0">
            {activity.user.imageUrl ? (
              <Image
                src={activity.user.imageUrl}
                alt={activity.user.name || 'User'}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                <User className="w-5 h-5 text-neutral-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getActivityIcon(activity.action)}</span>
              <p className="text-sm font-medium text-neutral-text">
                {activity.user.name || 'User'}
              </p>
            </div>
            <p className="text-sm text-neutral-text-light">
              {getActivityDescription(activity)}
            </p>
            <p className="text-xs text-neutral-text-light mt-1">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 