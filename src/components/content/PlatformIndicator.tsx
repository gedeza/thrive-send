"use client";

import React from 'react';
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram, 
  Mail, 
  FileText,
  Video,
  Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PlatformIndicatorProps {
  platforms?: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  maxVisible?: number;
}

// Platform configuration with icons and colors
const PLATFORM_CONFIG = {
  twitter: {
    icon: Twitter,
    label: 'Twitter',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  linkedin: {
    icon: Linkedin,
    label: 'LinkedIn',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  facebook: {
    icon: Facebook,
    label: 'Facebook',
    color: 'bg-blue-100 text-blue-600 border-blue-200'
  },
  instagram: {
    icon: Instagram,
    label: 'Instagram',
    color: 'bg-pink-100 text-pink-700 border-pink-200'
  },
  tiktok: {
    icon: Video,
    label: 'TikTok',
    color: 'bg-black/10 text-black border-black/20 dark:bg-white/10 dark:text-white dark:border-white/20'
  },
  email: {
    icon: Mail,
    label: 'Email',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  blog: {
    icon: FileText,
    label: 'Blog',
    color: 'bg-amber-100 text-amber-700 border-amber-200'
  }
} as const;

const DEFAULT_PLATFORM = {
  icon: Globe,
  label: 'Platform',
  color: 'bg-gray-100 text-gray-600 border-gray-200'
};

export function PlatformIndicator({ 
  platforms = [], 
  className, 
  size = 'sm', 
  showLabels = false,
  maxVisible = 3 
}: PlatformIndicatorProps) {
  if (!platforms || platforms.length === 0) return null;

  const displayPlatforms = platforms.slice(0, maxVisible);
  const remainingCount = platforms.length - maxVisible;

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
        {displayPlatforms.map((platform, index) => {
          const platformKey = platform.toLowerCase() as keyof typeof PLATFORM_CONFIG;
          const config = PLATFORM_CONFIG[platformKey] || DEFAULT_PLATFORM;
          const IconComponent = config.icon;
          
          return (
            <Tooltip key={`${platform}-${index}`}>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={cn(
                    'flex items-center gap-1 border',
                    badgeSizes[size],
                    config.color
                  )}
                >
                  <IconComponent className={iconSizes[size]} />
                  {showLabels && <span>{config.label}</span>}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Publishing to {config.label}</p>
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
                <p className="font-medium">Additional Platforms</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  {platforms.slice(maxVisible).map((platform, index) => {
                    const platformKey = platform.toLowerCase() as keyof typeof PLATFORM_CONFIG;
                    const config = PLATFORM_CONFIG[platformKey] || DEFAULT_PLATFORM;
                    return (
                      <p key={`remaining-${platform}-${index}`}>• {config.label}</p>
                    );
                  })}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
}

export default PlatformIndicator;