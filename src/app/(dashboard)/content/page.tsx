'use client';

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Grid, List, MoreHorizontal, Plus, Search, Trash, RefreshCw, Edit, Eye, Calendar, Clock, Tag, FileText, Newspaper, Share2, Mail } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listContent, deleteContent, ContentData } from '@/lib/api/content-service';
import { toast } from '@/components/ui/use-toast';
import { ContentCalendarSync } from '@/components/content/ContentCalendarSync';
import { SystemMonitor } from '@/components/debug/SystemMonitor';
import { cn, debounce, formatDate, truncateText } from '@/lib/utils';
import { MediaPreview } from '@/components/content/MediaPreview';
import { PublishingOptionsIndicator } from '@/components/content/PublishingOptionsIndicator';
import { PlatformIndicator } from '@/components/content/PlatformIndicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type StatusFilter = 'all' | 'draft' | 'published';
type ContentTypeFilter = 'all' | 'article' | 'blog' | 'social' | 'email';

const ITEMS_PER_PAGE = 12;
const SEARCH_DEBOUNCE_MS = 300;

// Enhanced content type configurations with icons
const CONTENT_TYPE_CONFIG = {
  blog: { 
    label: 'Blog Post', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Newspaper,
    description: 'Long-form blog content'
  },
  article: { 
    label: 'Article', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: FileText,
    description: 'Editorial or informational article'
  },
  social: { 
    label: 'Social Media', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Share2,
    description: 'Social media post'
  },
  email: { 
    label: 'Email Campaign', 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Mail,
    description: 'Email newsletter or campaign'
  },
} as const;

// Status configurations
const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Edit },
  published: { label: 'Published', color: 'bg-green-100 text-green-800 border-green-200', icon: Eye },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Calendar },
} as const;

function ContentLibraryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>('all');
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Debounced search query
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedSearchQuery(query);
      setCurrentPage(1); // Reset to first page on search
    }, SEARCH_DEBOUNCE_MS),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Define queryParams with debounced search
  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: ITEMS_PER_PAGE.toString(),
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
    
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (contentTypeFilter !== 'all') params.set('contentType', contentTypeFilter);
    if (debouncedSearchQuery) params.set('search', debouncedSearchQuery);
    
    return params;
  }, [currentPage, statusFilter, contentTypeFilter, debouncedSearchQuery, sortBy, sortOrder]);

  // Single useQuery hook with proper configuration
  const {
    data: contentData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['content', Object.fromEntries(queryParams.entries())], // Use object instead of string for better key handling
    queryFn: () => listContent(Object.fromEntries(queryParams.entries())),
    staleTime: 2 * 60 * 1000, // 2 minutes - balance between freshness and performance
    cacheTime: 10 * 60 * 1000, // 10 minutes in memory
    refetchOnMount: false, // Don't refetch on every mount - rely on cache
    refetchOnWindowFocus: false, // Don't refetch on window focus - too aggressive
    retry: 1, // Limit retries for failed requests
  });

  // Remove aggressive manual refetch on mount - React Query handles this with proper cache settings

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Listen for content creation events and invalidate cache
  useEffect(() => {
    const handleContentCreated = () => {
      console.log('Content created event received, invalidating cache...');
      // Use cache invalidation instead of manual refetch for better performance
      queryClient.invalidateQueries({ queryKey: ['content'] });
      // Also invalidate calendar cache since content and calendar are now connected
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    };

    window.addEventListener('content-created', handleContentCreated);
    return () => window.removeEventListener('content-created', handleContentCreated);
  }, [queryClient]);

  // Filter content based on search query (now handled server-side via debounced search)
  const filteredContent = useMemo(() => {
    return contentData?.content || [];
  }, [contentData?.content]);

  // Bulk selection handlers
  const isAllSelected = selectedItems.length === filteredContent.length && filteredContent.length > 0;
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < filteredContent.length;

  // Enhanced content stats
  const contentStats = useMemo(() => {
    if (!filteredContent.length) return null;
    
    const stats = filteredContent.reduce((acc, item) => {
      // Convert status to lowercase for consistent key matching
      const statusKey = item.status.toLowerCase();
      const typeKey = item.type.toLowerCase();
      
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      acc[typeKey] = (acc[typeKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  }, [filteredContent]);

  // Handle bulk actions
  const handleBulkDelete = async () => {
    if (!selectedItems.length) return;
    
    try {
      await Promise.all(selectedItems.map(id => deleteContent(id)));
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast({
        title: 'Success',
        description: 'Selected items have been deleted',
      });
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete items',
        variant: 'destructive',
      });
    }
  };

  // Handle single item delete
  const handleDelete = async (id: string) => {
    try {
      await deleteContent(id);
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast({
        title: 'Success',
        description: 'Content has been deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete content',
        variant: 'destructive',
      });
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Enhanced selection handlers
  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSelection = prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id];
      
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const newSelection = isAllSelected ? [] : filteredContent.map((item: ContentData) => item.id!);
    setSelectedItems(newSelection);
    setShowBulkActions(newSelection.length > 0);
  }, [isAllSelected, filteredContent]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
    setShowBulkActions(false);
  }, []);

  // Add refresh functionality
  const handleManualRefresh = async () => {
    try {
      await refetch();
      toast({
        title: 'Success',
        description: 'Content list refreshed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh content list',
        variant: 'destructive',
      });
    }
  };

  // Handle sync completion
  const handleSyncComplete = () => {
    setShowSyncDialog(false);
    refetch(); // Refresh content list after sync
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-destructive">Error Loading Content</h2>
        <p className="text-muted-foreground mt-2">Please try again later</p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard-style Header */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Content Library
              </h1>
              <p className="text-gray-600 text-lg">
                Create, manage, and schedule your content across all platforms
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    <span className="hidden sm:inline ml-2">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh content list</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSyncDialog(true)}
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Sync Calendar</span>
            </Button>
            
            <Button asChild>
              <Link href="/content/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Content
              </Link>
            </Button>
          </div>
        </div>

        {/* Analytics-style Metric Cards */}
        {contentStats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const count = contentStats[status] || 0;
              const total = filteredContent.length;
              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
              
              return (
                <Card key={status}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{config.label}</p>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs text-muted-foreground">
                          {percentage}% of total content
                        </p>
                      </div>
                      <div className={cn("rounded-lg p-2", config.color)}>
                        <config.icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Analytics-style Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search and Primary Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search content by title, type, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                    onClick={() => setSearchQuery('')}
                  >
                    ×
                  </Button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={contentTypeFilter} onValueChange={(value: ContentTypeFilter) => setContentTypeFilter(value)}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Newest first</SelectItem>
                    <SelectItem value="createdAt-asc">Oldest first</SelectItem>
                    <SelectItem value="title-asc">Title A-Z</SelectItem>
                    <SelectItem value="title-desc">Title Z-A</SelectItem>
                    <SelectItem value="updatedAt-desc">Recently updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* View Controls and Results Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {filteredContent.length} {filteredContent.length === 1 ? 'item' : 'items'}
                  {(debouncedSearchQuery || statusFilter !== 'all' || contentTypeFilter !== 'all') && ' found'}
                </p>
                {(debouncedSearchQuery || statusFilter !== 'all' || contentTypeFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setContentTypeFilter('all');
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-7 px-2"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-7 px-2"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isPartiallySelected;
                  }}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={selectedItems.length === 0}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content List with Analytics-style Loading */}
      {isLoading ? (
        <div className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Skeleton className="h-4 w-4 rounded" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <div className="flex gap-2">
                              <Skeleton className="h-5 w-16 rounded-full" />
                              <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                          </div>
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-1">
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Skeleton className="h-4 w-4 rounded" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-5 w-1/3" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-2/3" />
                          <div className="flex gap-1">
                            <Skeleton className="h-4 w-12 rounded-full" />
                            <Skeleton className="h-4 w-16 rounded-full" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <div className="mb-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {debouncedSearchQuery || statusFilter !== 'all' || contentTypeFilter !== 'all' 
                ? 'No content matches your filters' 
                : 'No content yet'
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {debouncedSearchQuery || statusFilter !== 'all' || contentTypeFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Get started by creating your first piece of content.'
              }
            </p>
            <div className="flex gap-2 justify-center">
              {(debouncedSearchQuery || statusFilter !== 'all' || contentTypeFilter !== 'all') && (
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setContentTypeFilter('all');
                }}>
                  Clear Filters
                </Button>
              )}
              <Button asChild>
                <Link href="/content/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Content
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-3'
        )}>
          {filteredContent.map((item: ContentData) => (
            viewMode === 'grid' ? (
              <ContentCard
                key={item.id}
                item={item}
                isSelected={selectedItems.includes(item.id!)}
                onSelect={handleSelectItem}
                onDelete={(id) => {
                  setItemToDelete(id);
                  setDeleteDialogOpen(true);
                }}
              />
            ) : (
              <ContentListItem
                key={item.id}
                item={item}
                isSelected={selectedItems.includes(item.id!)}
                onSelect={handleSelectItem}
                onDelete={(id) => {
                  setItemToDelete(id);
                  setDeleteDialogOpen(true);
                }}
              />
            )
          ))}
        </div>
      )}

      {/* Analytics-style Pagination */}
      {contentData && contentData.pages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, contentData.total)} of {contentData.total} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, contentData.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {contentData.pages > 5 && (
                    <>
                      <span className="text-muted-foreground">...</span>
                      <Button
                        variant={currentPage === contentData.pages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(contentData.pages)}
                        className="h-8 w-8 p-0"
                      >
                        {contentData.pages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(contentData.pages, prev + 1))}
                  disabled={currentPage === contentData.pages}
                  className="h-8"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sync Content to Calendar</DialogTitle>
            <DialogDescription>
              Sync your existing content to the calendar to see all your created content on the calendar view.
            </DialogDescription>
          </DialogHeader>
          <ContentCalendarSync onSyncComplete={handleSyncComplete} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Enhanced Content Card Component
interface ContentCardProps {
  item: ContentData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function ContentCard({ item, isSelected, onSelect, onDelete }: ContentCardProps) {
  const typeConfig = CONTENT_TYPE_CONFIG[item.type.toLowerCase() as keyof typeof CONTENT_TYPE_CONFIG];
  const statusConfig = STATUS_CONFIG[item.status.toLowerCase() as keyof typeof STATUS_CONFIG];
  
  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-200 cursor-pointer border-2",
      isSelected ? "border-blue-500 bg-blue-50" : "border-transparent hover:border-gray-200"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(item.id!)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                {truncateText(item.title, 60)}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                {typeConfig && (
                  <Badge variant="outline" className={cn("text-xs border flex items-center gap-1", typeConfig.color)}>
                    <typeConfig.icon className="h-3 w-3" />
                    {typeConfig.label}
                  </Badge>
                )}
                {statusConfig && (
                  <Badge variant="outline" className={cn("text-xs border", statusConfig.color)}>
                    <statusConfig.icon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                )}
              </div>
              
              {/* Publishing Options Indicators */}
              <PublishingOptionsIndicator 
                publishingOptions={item.publishingOptions}
                size="sm"
                maxVisible={2}
                className="mt-2"
              />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/content/edit-new/${item.id}`} className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/content/${item.id}`} className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(item.id!)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {item.excerpt && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {truncateText(item.excerpt, 120)}
          </p>
        )}
        
        {/* Media Preview */}
        <MediaPreview 
          media={item.media} 
          mediaItems={item.mediaItems}
          size="md" 
          maxItems={3}
          className="mb-3"
        />
        
        {/* Platform Indicators */}
        <PlatformIndicator 
          platforms={item.platforms}
          size="sm"
          maxVisible={4}
          className="mb-3"
        />
        
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            <Tag className="h-3 w-3 text-muted-foreground mr-1" />
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                +{item.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {item.scheduledAt ? (
              <span>Scheduled {formatDistanceToNow(new Date(item.scheduledAt), { addSuffix: true })}</span>
            ) : (
              <span>Created {formatDistanceToNow(new Date(item.createdAt!), { addSuffix: true })}</span>
            )}
          </div>
          {item.scheduledAt && (
            <span className="text-blue-600 font-medium">
              {format(new Date(item.scheduledAt), 'MMM d, h:mm a')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced List Item Component
function ContentListItem({ item, isSelected, onSelect, onDelete }: ContentCardProps) {
  const typeConfig = CONTENT_TYPE_CONFIG[item.type.toLowerCase() as keyof typeof CONTENT_TYPE_CONFIG];
  const statusConfig = STATUS_CONFIG[item.status.toLowerCase() as keyof typeof STATUS_CONFIG];
  
  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200 border-2",
      isSelected ? "border-blue-500 bg-blue-50" : "border-transparent hover:border-gray-200"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(item.id!)}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-base group-hover:text-blue-600 transition-colors truncate">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {typeConfig && (
                    <Badge variant="outline" className={cn("text-xs border flex items-center gap-1", typeConfig.color)}>
                      <typeConfig.icon className="h-3 w-3" />
                      {typeConfig.label}
                    </Badge>
                  )}
                  {statusConfig && (
                    <Badge variant="outline" className={cn("text-xs border", statusConfig.color)}>
                      <statusConfig.icon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  )}
                  {/* Publishing Options Indicators */}
                  <PublishingOptionsIndicator 
                    publishingOptions={item.publishingOptions}
                    size="sm"
                    maxVisible={3}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {item.excerpt && (
                  <span className="truncate max-w-md">{truncateText(item.excerpt, 80)}</span>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  {item.scheduledAt ? (
                    <span>Scheduled {formatDistanceToNow(new Date(item.scheduledAt), { addSuffix: true })}</span>
                  ) : (
                    <span>Created {formatDistanceToNow(new Date(item.createdAt!), { addSuffix: true })}</span>
                  )}
                </div>
              </div>
              
              {/* Media Preview */}
              <MediaPreview 
                media={item.media} 
                mediaItems={item.mediaItems}
                size="sm" 
                maxItems={4}
                className="mt-2"
              />
              
              {/* Platform Indicators */}
              <PlatformIndicator 
                platforms={item.platforms}
                size="sm"
                maxVisible={5}
                className="mt-2"
              />
              
              {item.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 5).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{item.tags.length - 5} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/content/edit-new/${item.id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/content/${item.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onDelete(item.id!)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ContentLibraryPage;
