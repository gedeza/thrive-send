import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BaseChartWidgetProps {
  title: string;
  isLoading?: boolean;
  error?: Error | string | null;
  className?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

const BaseChartWidget: React.FC<BaseChartWidgetProps> = ({ 
  title, 
  isLoading, 
  error, 
  className, 
  onRetry,
  children 
}) => {
  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <p className="text-sm text-destructive font-medium">
                Failed to load chart data
              </p>
              <p className="text-xs text-muted-foreground">
                {_error instanceof Error ? _error.message : String(_error)}
              </p>
            </div>
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Normal state
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default BaseChartWidget;