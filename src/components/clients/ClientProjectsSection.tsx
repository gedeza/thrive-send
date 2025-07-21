"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  ArrowRight
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PLANNING' | 'ON_HOLD' | 'CANCELLED';
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

interface ClientProjectsSectionProps {
  clientId: string;
  limit?: number;
}

const STATUS_CONFIG = {
  PLANNED: { 
    label: 'Planned', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Calendar,
    description: 'Project in planning phase'
  },
  PLANNING: { 
    label: 'Planning', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Calendar,
    description: 'Project in planning phase'
  },
  IN_PROGRESS: { 
    label: 'In Progress', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock,
    description: 'Project currently active'
  },
  ON_HOLD: { 
    label: 'On Hold', 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertCircle,
    description: 'Project temporarily paused'
  },
  COMPLETED: { 
    label: 'Completed', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
    description: 'Project finished successfully'
  },
  CANCELLED: { 
    label: 'Cancelled', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: AlertCircle,
    description: 'Project was cancelled'
  },
} as const;

export default function ClientProjectsSection({ clientId, limit }: ClientProjectsSectionProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/clients/${clientId}/projects`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch projects');
        }

        const data = await response.json();
        // Handle both old direct data format and new standardized format
        const projectsData = data.data ? data.data : data;
        setProjects(projectsData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load projects';
        setError(message);
        console.error('Error fetching client projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [clientId]);

  if (loading) {
    return <ProjectsSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Projects</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const displayedProjects = limit ? projects.slice(0, limit) : projects;
  const hasMoreProjects = limit && projects.length > limit;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Projects ({projects.length})
          </CardTitle>
          <Button asChild>
            <Link href={`/clients/${clientId}/projects/new`}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating the first project for this client.
            </p>
            <Button asChild>
              <Link href={`/clients/${clientId}/projects/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            
            {hasMoreProjects && (
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/projects?clientId=${clientId}`}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View All {projects.length} Projects
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.PLANNED;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link 
            href={`/projects/${project.id}`}
            className="font-semibold hover:text-primary transition-colors"
          >
            {project.name}
          </Link>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <Badge className={`${statusConfig.color} border ml-3`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {project.startDate && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(project.startDate).toLocaleDateString()}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(project.createdAt))} ago
        </span>
      </div>
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}