import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/badge';
import { syncContentToCalendar } from '@/lib/api/content-service';
import { RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ContentCalendarSyncProps {
  onSyncComplete?: () => void;
}

export function ContentCalendarSync({ onSyncComplete }: ContentCalendarSyncProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; errors: number } | null>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsLoading(true);
    setSyncResult(null);

    try {
      const result = await syncContentToCalendar();
      setSyncResult(result);
      
      if (result.synced > 0) {
        toast({
          title: "Sync Completed",
          description: `Successfully synced ${result.synced} content items to calendar${result.errors > 0 ? ` (${result.errors} errors)` : ''}`,
          variant: result.errors > 0 ? "default" : "default"
        });
      } else if (result.errors === 0) {
        toast({
          title: "Already in Sync",
          description: "All content is already synced to the calendar",
        });
      } else {
        toast({
          title: "Sync Completed with Errors",
          description: `${result.errors} items failed to sync`,
          variant: "destructive"
        });
      }

      onSyncComplete?.();
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Content Calendar Sync
        </CardTitle>
        <CardDescription>
          Sync your existing content to the calendar to see all your created content on the calendar view.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <div className="text-sm">
            This will create calendar events for any published, approved, or scheduled content that isn't already on the calendar.
          </div>
        </Alert>

        {syncResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Sync Results:</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">
                {syncResult.synced} synced
              </Badge>
              {syncResult.errors > 0 && (
                <Badge variant="destructive">
                  {syncResult.errors} errors
                </Badge>
              )}
            </div>
          </div>
        )}

        <Button
          onClick={handleSync}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Content to Calendar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 