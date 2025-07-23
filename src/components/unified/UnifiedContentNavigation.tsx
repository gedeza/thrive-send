"use client";

/**
 * Unified Content Navigation Component
 * Provides cross-component navigation and data sharing between systems
 */

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  FileText, 
  Search, 
  Filter, 
  ArrowRight, 
  Grid, 
  List,
  Workflow,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  Settings,
  BarChart3,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnifiedContent, useContentSyncStatus } from '@/context/unified-content-context';
import { UnifiedContentQuery } from '@/lib/services/unified-content-service';
import { ContentType, SocialPlatform } from '@/components/content/types';

// Navigation Item Type
interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
  isActive?: boolean;
  description?: string;
}

// View Mode Type
type ViewMode = 'grid' | 'list' | 'calendar' | 'kanban';

// Content Status Filter Type
type StatusFilter = 'all' | 'draft' | 'scheduled' | 'published' | 'failed';

export function UnifiedContentNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, actions } = useUnifiedContent();
  const syncStatus = useContentSyncStatus();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'all'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Calculate navigation items with dynamic badges
  const getNavigationItems = (): NavigationItem[] => {
    const calendarCount = state.items.filter(item => item.type === 'calendar-event').length;
    const contentCount = state.items.filter(item => item.type === 'content-item').length;
    const unifiedCount = state.items.filter(item => item.type === 'unified').length;
    const draftCount = state.items.filter(item => item.status === 'draft').length;
    const scheduledCount = state.items.filter(item => item.status === 'scheduled').length;

    return [
      {
        id: 'unified-dashboard',
        label: 'Unified Dashboard',
        path: '/dashboard/unified',
        icon: <Workflow className="h-4 w-4" />,
        badge: unifiedCount > 0 ? unifiedCount : undefined,
        description: 'Overview of all unified content workflows'
      },
      {
        id: 'content-calendar',
        label: 'Content Calendar',
        path: '/dashboard/content/calendar',
        icon: <Calendar className="h-4 w-4" />,
        badge: calendarCount > 0 ? calendarCount : undefined,
        description: 'Schedule and manage content publication dates'
      },
      {
        id: 'content-manager',
        label: 'Content Manager',
        path: '/dashboard/content',
        icon: <FileText className="h-4 w-4" />,
        badge: contentCount > 0 ? contentCount : undefined,
        description: 'Create and manage your content library'
      },
      {
        id: 'drafts',
        label: 'Drafts',
        path: '/dashboard/content?status=draft',
        icon: <AlertCircle className="h-4 w-4" />,
        badge: draftCount > 0 ? draftCount : undefined,
        description: 'Content in draft status'
      },
      {
        id: 'scheduled',
        label: 'Scheduled',
        path: '/dashboard/content?status=scheduled',
        icon: <Clock className="h-4 w-4" />,
        badge: scheduledCount > 0 ? scheduledCount : undefined,
        description: 'Content scheduled for publication'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        path: '/dashboard/analytics',
        icon: <BarChart3 className="h-4 w-4" />,
        description: 'Performance insights and metrics'
      }
    ];
  };

  const navigationItems = getNavigationItems();

  // Determine active navigation item
  const activeItem = navigationItems.find(item => 
    pathname === item.path || pathname.startsWith(item.path)
  );

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    actions.searchContent(query);
  };

  // Handle filters
  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
    const query: UnifiedContentQuery = {
      ...state.currentQuery,
      status: status === 'all' ? undefined : status
    };
    actions.filterContent(query);
  };

  const handleContentTypeFilter = (type: ContentType | 'all') => {
    setContentTypeFilter(type);
    const query: UnifiedContentQuery = {
      ...state.currentQuery,
      contentType: type === 'all' ? undefined : type
    };
    actions.filterContent(query);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Store preference in localStorage
    localStorage.setItem('unified-content-view-mode', mode);
  };

  // Load view mode preference
  useEffect(() => {
    const savedViewMode = localStorage.getItem('unified-content-view-mode') as ViewMode;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Sync data on mount and periodically
  useEffect(() => {
    actions.syncAllContent();
    
    // Set up periodic sync (every 5 minutes)
    const interval = setInterval(() => {
      actions.syncAllContent();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Quick action handlers
  const handleQuickCreate = (type: 'unified' | 'calendar' | 'content') => {
    switch (type) {
      case 'unified':
        router.push('/dashboard/content/create?mode=unified');
        break;
      case 'calendar':
        router.push('/dashboard/content/calendar?action=create');
        break;
      case 'content':
        router.push('/dashboard/content/create');
        break;
    }
  };

  const handleSync = () => {
    actions.syncAllContent();
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between h-14">
          {/* Left: Navigation Items */}
          <nav className="flex items-center space-x-1">
            {navigationItems.slice(0, 4).map((item) => (
              <Button
                key={item.id}
                variant={activeItem?.id === item.id ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex items-center gap-2 text-sm",
                  activeItem?.id === item.id && "bg-primary text-primary-foreground"
                )}
                onClick={() => router.push(item.path)}
                title={item.description}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={activeItem?.id === item.id ? "secondary" : "default"}
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* Right: Actions and Status */}
          <div className="flex items-center gap-2">
            {/* Sync Status */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={syncStatus.status === 'syncing'}
              className="flex items-center gap-2"
              title={`Last sync: ${syncStatus.lastSyncAt ? new Date(syncStatus.lastSyncAt).toLocaleTimeString() : 'Never'}`}
            >
              <RefreshCw className={cn(
                "h-4 w-4",
                syncStatus.status === 'syncing' && "animate-spin"
              )} />
              <span className="hidden sm:inline text-xs">
                {syncStatus.status === 'syncing' ? 'Syncing...' : 'Sync'}
              </span>
            </Button>

            {/* Quick Create Menu */}
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Quick Create</h4>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleQuickCreate('unified')}
                      >
                        <Workflow className="h-4 w-4 mr-2" />
                        Unified Content
                        <span className="ml-auto text-xs text-muted-foreground">Calendar + Content</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleQuickCreate('calendar')}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Calendar Event
                        <span className="ml-auto text-xs text-muted-foreground">Schedule first</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleQuickCreate('content')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Content Item
                        <span className="ml-auto text-xs text-muted-foreground">Create first</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4 pb-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {(statusFilter !== 'all' || contentTypeFilter !== 'all') && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {[statusFilter !== 'all' ? 1 : 0, contentTypeFilter !== 'all' ? 1 : 0].reduce((a, b) => a + b)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={handleStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Content Type</label>
                  <Select value={contentTypeFilter} onValueChange={handleContentTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {state.items.length} items found
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('all');
                      setContentTypeFilter('all');
                      actions.filterContent({});
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none border-r"
              onClick={() => handleViewModeChange('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none border-r"
              onClick={() => handleViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => handleViewModeChange('calendar')}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Filter Display */}
        {(statusFilter !== 'all' || contentTypeFilter !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 pb-3">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchQuery}"
                <button onClick={() => handleSearch('')} className="ml-1">×</button>
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusFilter}
                <button onClick={() => handleStatusFilter('all')} className="ml-1">×</button>
              </Badge>
            )}
            {contentTypeFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type: {contentTypeFilter}
                <button onClick={() => handleContentTypeFilter('all')} className="ml-1">×</button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Export the current view mode hook for other components to use
export function useCurrentViewMode(): ViewMode {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    const savedViewMode = localStorage.getItem('unified-content-view-mode') as ViewMode;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  return viewMode;
}