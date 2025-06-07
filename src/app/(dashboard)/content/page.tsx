"use client";

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

  // Fetch content data with refetch function
  // Add debug logging to understand what's happening
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['content', currentPage, sortBy, statusFilter, contentTypeFilter],
    queryFn: async () => {
      console.log('Fetching content with params:', {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: contentTypeFilter === 'all' ? undefined : contentTypeFilter,
      });
      const result = await listContent({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: contentTypeFilter === 'all' ? undefined : contentTypeFilter,
      });
      console.log('Content fetch result:', result);
      return result;
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Add useEffect to refetch when component mounts
  useEffect(() => {
    refetch();
  }, []);

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

  // Filter content based on search query
  const filteredContent = useMemo(() => {
    if (!data?.content) return [];
    if (!searchQuery.trim()) return data.content;
    
    const query = searchQuery.toLowerCase();
    return data.content.filter((item: ContentData) => 
      item.title.toLowerCase().includes(query) || 
      item.contentType.toLowerCase().includes(query) ||
      item.tags.some((tag: string) => tag.toLowerCase().includes(query))
    );
  }, [searchQuery, data?.content]);

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

  // Update the query parameters to include content type
  const queryParams = new URLSearchParams({
    page: currentPage.toString(),
    limit: ITEMS_PER_PAGE.toString(),
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(contentTypeFilter !== 'all' && { contentType: contentTypeFilter }),
    ...(searchQuery && { search: searchQuery }),
    ...(sortBy && { sortBy }),
  });

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-destructive">Error Loading Content</h2>
        <p className="text-muted-foreground mt-2">Please try again later</p>
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
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSyncDialog(true)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync to Calendar
          </Button>
          <Button asChild>
            <Link href="/content/new">
              <Plus className="h-4 w-4 mr-2" />
              New Content
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="contentType">Content Type</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={contentTypeFilter} 
            onValueChange={(value) => setContentTypeFilter(value as ContentTypeFilter)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="blog">Blog Post</SelectItem>
              <SelectItem value="social">Social Media Post</SelectItem>
              <SelectItem value="email">Email Campaign</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <Checkbox
            checked={selectedItems.length === filteredContent.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">
            {selectedItems.length} items selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setItemToDelete('bulk');
              setDeleteDialogOpen(true);
            }}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Content Grid/List */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredContent.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          : "space-y-4"
        }>
          {filteredContent.map((item: ContentData) => (
            <Card key={item.id} className={viewMode === 'list' ? "flex items-center" : ""}>
              {viewMode === 'list' && (
                <div className="p-4">
                  <Checkbox
                    checked={selectedItems.includes(item.id!)}
                    onCheckedChange={() => handleSelectItem(item.id!)}
                  />
                </div>
              )}
              <CardHeader className={viewMode === 'list' ? "flex-1 pb-2" : "pb-2"}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {item.contentType}
                      </span>
                    </div>
                  </div>
                  {viewMode === 'grid' && (
                    <Checkbox
                      checked={selectedItems.includes(item.id!)}
                      onCheckedChange={() => handleSelectItem(item.id!)}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className={viewMode === 'list' ? "flex-1" : ""}>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(item.createdAt!), 'MMM d, yyyy')}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/content/edit/${item.id}`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setItemToDelete(item.id!);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <p className="mb-4">No content found</p>
            <Button asChild>
              <Link href="/content/new">
                Create New Content
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && data.total > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, data.total)} of {data.total} items
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage * ITEMS_PER_PAGE >= data.total}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Sync Content Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Content Calendar Sync</DialogTitle>
            <DialogDescription>
              Sync your existing content to the calendar to see all your created content on the calendar view.
            </DialogDescription>
          </DialogHeader>
          <ContentCalendarSync 
            onSyncComplete={() => {
              refetch();
              setShowSyncDialog(false);
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete === 'bulk' 
                ? `This will permanently delete ${selectedItems.length} selected items.`
                : 'This will permanently delete this content item.'}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete === 'bulk') {
                  handleBulkDelete();
                } else if (itemToDelete) {
                  handleDelete(itemToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  // Format dates only on client side
  const formatDate = (dateString: string) => {
    if (!isClient) return dateString; // Return raw string on server
    return format(new Date(dateString), 'MMM d, yyyy');
  };
}

export default ContentLibraryPage;
