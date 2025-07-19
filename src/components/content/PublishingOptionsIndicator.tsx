"use client";

import React from 'react';
import { Zap, Share2, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PublishingOptions {
  crossPost: boolean;
  autoOptimize: boolean;
  trackAnalytics: boolean;
}

interface PublishingOptionsIndicatorProps {
  publishingOptions?: PublishingOptions | any; // any for JSON parsing flexibility
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  maxVisible?: number;
}

// Helper function to parse publishing options safely
function parsePublishingOptions(options: any): PublishingOptions | null {
  if (!options) return null;
  
  try {
    // If it's already an object, return it
    if (typeof options === 'object' && !Array.isArray(options)) {
      return {
        crossPost: Boolean(options.crossPost),
        autoOptimize: Boolean(options.autoOptimize),
        trackAnalytics: Boolean(options.trackAnalytics),
      };
    }
    
    // If it's a string (JSON), try to parse it
    if (typeof options === 'string') {
      const parsed = JSON.parse(options);
      return {
        crossPost: Boolean(parsed.crossPost),
        autoOptimize: Boolean(parsed.autoOptimize),
        trackAnalytics: Boolean(parsed.trackAnalytics),
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to parse publishing options:', error);
    return null;
  }
}

export function PublishingOptionsIndicator({ 
  publishingOptions, 
  className, 
  size = 'sm', 
  showLabels = false,
  maxVisible = 3 
}: PublishingOptionsIndicatorProps) {
  const parsed = parsePublishingOptions(publishingOptions);
  
  if (!parsed) return null;

  const options = [
    {
      key: 'crossPost',
      enabled: parsed.crossPost,
      icon: Share2,
      label: 'Cross-post',
      description: 'Cross-post to all platforms',
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      key: 'autoOptimize',
      enabled: parsed.autoOptimize,
      icon: Zap,
      label: 'Auto-optimize',
      description: 'AI-powered content optimization',
      color: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    {
      key: 'trackAnalytics',
      enabled: parsed.trackAnalytics,
      icon: BarChart3,
      label: 'Track Analytics',
      description: 'Performance tracking enabled',
      color: 'bg-green-100 text-green-700 border-green-200'
    }
  ];

  const enabledOptions = options.filter(option => option.enabled);
  
  if (enabledOptions.length === 0) return null;

  const displayOptions = enabledOptions.slice(0, maxVisible);
  const remainingCount = enabledOptions.length - maxVisible;

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const badgeSizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1'
  };

  const containerClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  };

  return (
    <div className={cn('flex items-center flex-wrap', containerClasses[size], className)}>
      <TooltipProvider>
        {displayOptions.map((option) => {
          const IconComponent = option.icon;
          
          return (
            <Tooltip key={option.key}>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={cn(
                    'flex items-center gap-1 border',
                    badgeSizes[size],
                    option.color
                  )}
                >
                  <IconComponent className={iconSizes[size]} />
                  {showLabels && <span>{option.label}</span>}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={cn(
                  'border-gray-200 bg-gray-100 text-gray-600',
                  badgeSizes[size]
                )}
              >
                +{remainingCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="space-y-1">
                <p className="font-medium">Additional Options</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  {enabledOptions.slice(maxVisible).map((option) => (
                    <p key={option.key}>• {option.label}</p>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
}

export default PublishingOptionsIndicator;