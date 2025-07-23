'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Clock, 
  RefreshCw,
  Zap,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RealTimeAnalyticsIndicatorProps {
  isConnected: boolean;
  lastUpdateTime: Date | null;
  onRefresh?: () => void;
  hasRecentUpdates?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLastUpdate?: boolean;
  showConnectionStatus?: boolean;
}

export function RealTimeAnalyticsIndicator({
  isConnected,
  lastUpdateTime,
  onRefresh,
  hasRecentUpdates = false,
  className,
  size = 'md',
  showLastUpdate = true,
  showConnectionStatus = true
}: RealTimeAnalyticsIndicatorProps) {
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Trigger pulse animation on new updates
  useEffect(() => {
    if (hasRecentUpdates) {
      setPulseAnimation(true);
      const timer = setTimeout(() => setPulseAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasRecentUpdates]);

  const sizeStyles = {
    sm: {
      container: 'text-xs',
      icon: 'h-3 w-3',
      badge: 'text-xs px-1 py-0',
      button: 'h-6 w-6 p-0'
    },
    md: {
      container: 'text-sm',
      icon: 'h-4 w-4',
      badge: 'text-xs px-2 py-1',
      button: 'h-8 w-8 p-0'
    },
    lg: {
      container: 'text-base',
      icon: 'h-5 w-5',
      badge: 'text-sm px-3 py-1',
      button: 'h-10 w-10 p-0'
    }
  };

  const styles = sizeStyles[size];

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-2', styles.container, className)}>
        {/* Connection Status */}
        {showConnectionStatus && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                {isConnected ? (
                  <div className="flex items-center gap-1">
                    <div className={cn(
                      "rounded-full bg-green-500",
                      pulseAnimation && "animate-pulse",
                      size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-2.5 w-2.5' : 'h-3 w-3'
                    )} />
                    <Wifi className={cn(styles.icon, "text-green-600")} />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className={cn(
                      "rounded-full bg-red-500",
                      size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-2.5 w-2.5' : 'h-3 w-3'
                    )} />
                    <WifiOff className={cn(styles.icon, "text-red-600")} />
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Analytics: {isConnected ? 'Connected' : 'Disconnected'}
              </p>
              {isConnected && (
                <p className="text-xs text-muted-foreground">
                  Real-time updates active
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Live Updates Badge */}
        {isConnected && (
          <Badge 
            variant="outline" 
            className={cn(
              "border-green-200 bg-green-50 text-green-700 font-medium",
              styles.badge,
              pulseAnimation && "animate-pulse border-green-400 bg-green-100"
            )}
          >
            <Activity className={cn(styles.icon, "mr-1")} />
            Live
          </Badge>
        )}

        {/* Recent Update Indicator */}
        {hasRecentUpdates && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={cn(
                  "border-blue-200 bg-blue-50 text-blue-700 font-medium animate-pulse",
                  styles.badge
                )}
              >
                <TrendingUp className={cn(styles.icon, "mr-1")} />
                New Data
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Analytics data was just updated</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Last Update Time */}
        {showLastUpdate && lastUpdateTime && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className={cn(styles.icon)} />
                <span className="font-medium">
                  {formatDistanceToNow(lastUpdateTime, { addSuffix: true })}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last updated: {lastUpdateTime.toLocaleTimeString()}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Manual Refresh Button */}
        {onRefresh && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className={cn(styles.button, "hover:bg-muted")}
              >
                <RefreshCw className={styles.icon} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh analytics data</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Simplified version for inline use
export function LiveAnalyticsBadge({ 
  isConnected, 
  hasUpdates = false,
  size = 'sm' 
}: { 
  isConnected: boolean; 
  hasUpdates?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const badgeSizes = {
    sm: 'text-xs px-1 py-0',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1'
  };

  if (!isConnected) {
    return (
      <Badge variant="outline" className={cn("border-gray-200 bg-gray-50 text-gray-500", badgeSizes[size])}>
        <WifiOff className={cn(iconSizes[size], "mr-1")} />
        Offline
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "border-green-200 bg-green-50 text-green-700 font-medium",
              badgeSizes[size],
              hasUpdates && "animate-pulse border-green-400 bg-green-100"
            )}
          >
            <Zap className={cn(iconSizes[size], "mr-1")} />
            Live
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Real-time analytics active</p>
          {hasUpdates && <p className="text-xs text-muted-foreground">New data available</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}