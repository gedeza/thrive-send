"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProjectCard, Project, PROJECT_STATUS_CONFIG } from "@/components/projects/ProjectCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  Filter, 
  RefreshCw, 
  FolderPlus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Building2,
  Users
} from 'lucide-react';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from 'date-fns';
import { cn, debounce } from '@/lib/utils';

const STATUS_OPTIONS = ["All", "PLANNED", "IN_PROGRESS", "COMPLETED"] as const;
const ITEMS_PER_PAGE = 12;
const SEARCH_DEBOUNCE_MS = 300;

interface DropdownClient {
  id: string;
  name: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [clientFilter, setClientFilter] = useState<string>("All");
  const [clients, setClients] = useState<DropdownClient[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Client-side mounting check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedSearchQuery(query);
    }, SEARCH_DEBOUNCE_MS),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch projects");
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients/dropdown');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data);
    } catch (e) {
      console.error('Error fetching clients:', e);
      // Don't show error toast for clients since it's not critical
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Remove project from state
      setProjects((prev) => prev ? prev.filter(p => p.id !== id) : null);
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setDeleteProjectId(null);
    }
  };

  // Enhanced filtering and sorting logic
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let filtered = [...projects];
    
    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    
    // Apply client filter
    if (clientFilter !== "All") {
      filtered = filtered.filter((p) => p.client?.id === clientFilter);
    }
    
    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.description?.toLowerCase().includes(searchLower)) ||
          (p.client?.name.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'client':
          aValue = a.client?.name.toLowerCase() || 'zzz';
          bValue = b.client?.name.toLowerCase() || 'zzz';
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [projects, statusFilter, clientFilter, debouncedSearchQuery, sortBy, sortOrder]);

  // Calculate project statistics
  const projectStats = useMemo(() => {
    if (!projects) return { total: 0, planned: 0, inProgress: 0, completed: 0 };
    
    const stats = projects.reduce((acc, project) => {
      acc.total++;
      switch (project.status) {
        case 'PLANNED':
          acc.planned++;
          break;
        case 'IN_PROGRESS':
          acc.inProgress++;
          break;
        case 'COMPLETED':
          acc.completed++;
          break;
      }
      return acc;
    }, { total: 0, planned: 0, inProgress: 0, completed: 0 });
    
    return stats;
  }, [projects]);

  if (!isClient) {
    return <ProjectsPageSkeleton />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Project Management
            </h1>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Track, organize, and manage all your projects in one place. Stay on top of deadlines and monitor progress.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 mb-8">
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold text-primary">{projectStats.total}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Planned</p>
                  <p className="text-2xl font-bold text-warning">{projectStats.planned}</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-full">
                  <Calendar className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-primary">{projectStats.inProgress}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-success">{projectStats.completed}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects by name, description, or client..."
                  className="flex-1 h-8"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "All" ? "All Status" : PROJECT_STATUS_CONFIG[status as keyof typeof PROJECT_STATUS_CONFIG]?.label || status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-2 border-0 rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-2 border-0 rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Content Area */}
        {loading ? (
          <ProjectsContentSkeleton viewMode={viewMode} />
        ) : error ? (
          <Card className="p-6 text-center">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Failed to Load Projects</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={fetchProjects} variant="outline" className="w-full sm:w-auto">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/projects/new">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="sm:hidden">Create Project</span>
                    <span className="hidden sm:inline">Create New Project</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className={cn(
            "transition-all duration-200",
            viewMode === 'grid' 
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          )}>
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project}
                viewMode={viewMode}
                onDelete={(id) => setDeleteProjectId(id)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <div className="p-4 bg-muted/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FolderPlus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {debouncedSearchQuery || statusFilter !== "All" || clientFilter !== "All"
                      ? "No projects found" 
                      : "No projects yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {debouncedSearchQuery || statusFilter !== "All" || clientFilter !== "All"
                      ? "Try adjusting your search or filters to find what you're looking for"
                      : "Get started by creating your first project to organize and track your work"}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {(debouncedSearchQuery || statusFilter !== "All" || clientFilter !== "All") && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setDebouncedSearchQuery("");
                        setStatusFilter("All");
                        setClientFilter("All");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button asChild className="w-full sm:w-auto">
                    <Link href="/projects/new">
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="sm:hidden">Create Project</span>
                      <span className="hidden sm:inline">Create Your First Project</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this project? This action cannot be undone and will remove all project data permanently.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteProjectId && handleDeleteProject(deleteProjectId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

// Loading skeleton components
function ProjectsPageSkeleton() {
  return (
    <div className="container mx-auto py-4 space-y-4">
      <div className="text-center mb-8">
        <Skeleton className="h-12 w-96 mx-auto mb-4" />
        <Skeleton className="h-6 w-[600px] mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-muted/30 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      <ProjectsContentSkeleton viewMode="grid" />
    </div>
  );
}

function ProjectsContentSkeleton({ viewMode }: { viewMode: 'grid' | 'list' }) {
  return (
    <div className={cn(
      viewMode === 'grid' 
        ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "space-y-4"
    )}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className={cn(viewMode === 'list' && "flex items-center p-4")}>
          <CardHeader className={cn(viewMode === 'list' && "pb-0")}>
            <div className="flex items-start justify-between mb-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          {viewMode === 'grid' && (
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
