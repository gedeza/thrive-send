'use client';

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Grid, List, MoreHorizontal, Plus, Search, Trash, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listContent, deleteContent, ContentData } from '@/lib/api/content-service';
import { toast } from '@/components/ui/use-toast';
import { ContentCalendarSync } from '@/components/content/ContentCalendarSync';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

type StatusFilter = 'all' | 'draft' | 'published';
type ContentTypeFilter = 'all' | 'article' | 'blog' | 'social' | 'email';

const ITEMS_PER_PAGE = 12;

function ContentLibraryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>('all');
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Define queryParams first
  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: ITEMS_PER_PAGE.toString(),
    });
    
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (contentTypeFilter !== 'all') params.set('contentType', contentTypeFilter);
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy) params.set('sortBy', sortBy);
    
    return params;
  }, [currentPage, statusFilter, contentTypeFilter, searchQuery, sortBy]);

  // Single useQuery hook with proper configuration
  const {
    data: contentData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['content', queryParams.toString()],
    queryFn: () => listContent(Object.fromEntries(queryParams.entries())),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Add useEffect to refetch when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Listen for content creation events
  useEffect(() => {
    const handleContentCreated = () => {
      console.log('Content created event received, refetching...');
      refetch();
    };

    window.addEventListener('content-created', handleContentCreated);
    return () => window.removeEventListener('content-created', handleContentCreated);
  }, [refetch]);

  // Filter content based on search query - FIXED variable reference
  const filteredContent = useMemo(() => {
    if (!contentData?.content) return [];
    if (!searchQuery.trim()) return contentData.content;
    
    const query = searchQuery.toLowerCase();
    return contentData.content.filter((item: ContentData) => 
      item.title.toLowerCase().includes(query) || 
      item.type.toLowerCase().includes(query) ||
      item.tags.some((tag: string) => tag.toLowerCase().includes(query))
    );
  }, [searchQuery, contentData?.content]);

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

  // Handle item selection
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === filteredContent.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredContent.map((item: ContentData) => item.id!));
    }
  };

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
      {/* Header with integrated sync functionality */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">
            Manage and organize your content assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSyncDialog(true)}
          >
            <RefreshCw className="h-4 w-4" />
            Sync Calendar
          </Button>
          <Button asChild>
            <Link href="/content/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Select value={contentTypeFilter} onValueChange={(value: ContentTypeFilter) => setContentTypeFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading content...</p>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No content found</p>
          <Button asChild>
            <Link href="/content/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Content
            </Link>
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredContent.map((item: ContentData) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{item.type}</Badge>
                      <Badge variant={item.status === 'published' ? 'default' : 'outline'}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link href={`/content/edit/${item.id}`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setItemToDelete(item.id!);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {item.excerpt && (
                  <p className="text-sm text-muted-foreground mb-3">{item.excerpt}</p>
                )}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {item.scheduledAt ? (
                    `Scheduled: ${format(new Date(item.scheduledAt), 'MMM d, yyyy')}`
                  ) : (
                    `Created: ${format(new Date(item.createdAt!), 'MMM d, yyyy')}`
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {contentData && contentData.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {contentData.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(contentData.pages, prev + 1))}
            disabled={currentPage === contentData.pages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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

export default ContentLibraryPage;
