import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye, Calendar, Clock, CheckCircle2, User, Building2, MoreHorizontal } from 'lucide-react';
import { Project, PROJECT_STATUS } from '@/types/project';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  viewMode?: 'grid' | 'list';
  onDelete?: (id: string) => void;
}

// Enhanced project configurations with icons and colors
export const PROJECT_STATUS_CONFIG = {
  PLANNED: { 
    label: 'Planned', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Calendar,
    description: 'Project in planning phase'
  },
  IN_PROGRESS: { 
    label: 'In Progress', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock,
    description: 'Project actively being worked on'
  },
  COMPLETED: { 
    label: 'Completed', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
    description: 'Project successfully completed'
  },
} as const;

export function ProjectCard({ project, viewMode = 'grid', onDelete }: ProjectCardProps) {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status];
  const StatusIcon = statusConfig.icon;

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center p-4">
          {/* Status Indicator */}
          <div className="flex-shrink-0 mr-4">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              statusConfig.color.replace('text-', 'text-').replace('bg-', 'bg-')
            )}>
              <StatusIcon className="h-5 w-5" />
            </div>
          </div>
          
          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                  <Link href={`/projects/${project.id}`} className="hover:underline">
                    {project.name}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {project.description || 'No description provided'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className={cn("text-xs", statusConfig.color)}>
                    {statusConfig.label}
                  </Badge>
                  <span>Created {formatDistanceToNow(new Date(project.createdAt))} ago</span>
                  {project.startDate && (
                    <span>Starts {new Date(project.startDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/projects/${project.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Project</TooltipContent>
                </Tooltip>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/projects/${project.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/projects/${project.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Project
                      </Link>
                    </DropdownMenuItem>
                    {onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(project.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Project
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 group border-l-4" style={{
      borderLeftColor: statusConfig.color.includes('yellow') ? '#eab308' : 
                      statusConfig.color.includes('blue') ? '#3b82f6' : '#22c55e'
    }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Badge 
            variant="secondary" 
            className={cn("text-xs px-2 py-1", statusConfig.color)}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Project
                </Link>
              </DropdownMenuItem>
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(project.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
          <Link href={`/projects/${project.id}`} className="hover:underline">
            {project.name}
          </Link>
        </h3>
      </CardHeader>
      
      <CardContent className="flex-grow pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description || 'No description provided'}
        </p>
        
        <div className="space-y-2">
          {project.client && (
            <div className="flex items-center text-xs text-muted-foreground">
              <User className="h-3 w-3 mr-2" />
              <span>Client: </span>
              <Link 
                href={`/clients/${project.client.id}`}
                className="text-primary hover:underline ml-1"
              >
                {project.client.name}
              </Link>
            </div>
          )}
          {project.startDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-2" />
              <span>Starts: {new Date(project.startDate).toLocaleDateString()}</span>
            </div>
          )}
          {project.endDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-2" />
              <span>Ends: {new Date(project.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>Created {formatDistanceToNow(new Date(project.createdAt))} ago</span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/projects/${project.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Project</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/projects/${project.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Project</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}