'use client';

import * as React from 'react';
import { Clock, Upload, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { cn } from '@/lib/utils';
import { useTimezone } from '@/hooks/use-timezone';
import { CalendarEvent, SocialPlatform, ContentType } from './types';

// Import color maps from main calendar (these should be moved to a shared constants file)
const eventTypeColorMap: Record<ContentType, { bg: string; text: string }> = {
  email: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300"
  },
  social: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300"
  },
  blog: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300"
  },
  custom: {
    bg: "bg-gray-100 dark:bg-gray-700/30",
    text: "text-gray-700 dark:text-gray-300"
  },
  article: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300"
  }
};

function isValidContentType(type: any): type is ContentType {
  return ['social', 'blog', 'email', 'custom', 'article'].includes(type);
}

interface EventPreviewProps {
  event: CalendarEvent;
  position: { x: number; y: number };
}

export function EventPreview({ event, position }: EventPreviewProps) {
  const userTimezone = useTimezone();
  
  const formatEventTime = (date: string, time?: string) => {
    if (!time) return formatInTimeZone(new Date(date), userTimezone, "MMM d, yyyy");
    return formatInTimeZone(new Date(`${date}T${time}`), userTimezone, "MMM d, yyyy 'at' h:mm a");
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    const icons = {
      facebook: <Facebook className="h-3 w-3 text-blue-600" />,
      twitter: <Twitter className="h-3 w-3 text-sky-500" />,
      instagram: <Instagram className="h-3 w-3 text-pink-600" />,
      linkedin: <Linkedin className="h-3 w-3 text-blue-700" />,
      youtube: "🎥",
      tiktok: "🎵",
      pinterest: "📌"
    };
    return icons[platform] || "📱";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sent': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      className="fixed z-50 max-w-sm bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-2xl p-4 pointer-events-none backdrop-blur-sm"
      style={{
        left: Math.min(position.x + 10, window.innerWidth - 300),
        top: Math.min(position.y + 10, window.innerHeight - 200),
      }}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight text-gray-900 dark:text-gray-100">{event.title}</h3>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium border",
            getStatusColor(event.status)
          )}>
            {event.status}
          </span>
        </div>

        {/* Time and Type */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <Clock className="h-3 w-3" />
            <span>{formatEventTime(event.date, event.time)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              isValidContentType(event.type) ? eventTypeColorMap[event.type].bg : "bg-gray-100",
              isValidContentType(event.type) ? eventTypeColorMap[event.type].text : "text-gray-700"
            )}>
              {event.type}
            </span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Social Media Platforms */}
        {event.type === 'social' && event.socialMediaContent?.platforms && event.socialMediaContent.platforms.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-700 dark:text-gray-300">Platforms:</span>
            <div className="flex gap-1">
              {event.socialMediaContent.platforms.map((platform, index) => (
                <span key={index} className="inline-flex items-center">
                  {getPlatformIcon(platform)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Media Count */}
        {event.socialMediaContent?.mediaUrls && event.socialMediaContent.mediaUrls.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
            <Upload className="h-3 w-3" />
            <span>{event.socialMediaContent.mediaUrls.length} media file{event.socialMediaContent.mediaUrls.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* TDD-required Analytics Preview */}
        {event.analytics && (
          <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {event.analytics.impressions && (
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{event.analytics.impressions.toLocaleString()}</span> impressions
                </div>
              )}
              {event.analytics.clicks && (
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{event.analytics.clicks.toLocaleString()}</span> clicks
                </div>
              )}
              {event.analytics.engagements && (
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{event.analytics.engagements.toLocaleString()}</span> engagements
                </div>
              )}
              {event.analytics.ctr && (
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{(event.analytics.ctr * 100).toFixed(1)}%</span> CTR
                </div>
              )}
            </div>
          </div>
        )}

        {/* TDD-required Template Metadata */}
        {event.templateMetadata && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Template:</span> {event.templateMetadata.originalTitle || 'Custom'}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Click to view details
          </span>
        </div>
      </div>
    </div>
  );
}