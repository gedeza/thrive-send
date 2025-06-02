import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { useCalendarCache } from '@/context/CalendarCacheContext';
import { RefreshCw, Settings, Clock } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function CacheControl() {
  const { 
    lastCacheInvalidation, 
    invalidateCache, 
    isCachingEnabled, 
    setCachingEnabled,
    clearAllCaches 
  } = useCalendarCache();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleClearCache = () => {
    clearAllCaches();
    toast({
      title: 'Cache Cleared',
      description: 'Calendar data will be refreshed from the server on next load.',
    });
    setIsOpen(false);
  };

  // Calculate time since last cache invalidation
  const getTimeSinceInvalidation = () => {
    const seconds = Math.floor((Date.now() - lastCacheInvalidation) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden md:inline">Cache Controls</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Cache Settings</CardTitle>
            <CardDescription>
              Control how ThriveSend caches data to reduce database calls during development.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="cache-toggle">Enable Caching</Label>
                <p className="text-sm text-muted-foreground">
                  Reduces database calls by storing data locally
                </p>
              </div>
              <Switch
                id="cache-toggle"
                checked={isCachingEnabled}
                onCheckedChange={setCachingEnabled}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Last cache reset: {getTimeSinceInvalidation()}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Clear Cache & Refresh Data
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p>Caching is only active in development mode and helps reduce database load.</p>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
} 