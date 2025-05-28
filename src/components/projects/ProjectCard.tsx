import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Project, PROJECT_STATUS } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

const STATUS_COLORS = {
  PLANNED: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

const STATUS_LABELS = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              <Link href={`/projects/${project.id}`} className="hover:underline">
                {project.name}
              </Link>
            </h3>
            <Badge 
              variant="secondary" 
              className={`mt-2 ${STATUS_COLORS[project.status]}`}
            >
              {STATUS_LABELS[project.status]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 line-clamp-2">
          {project.description || 'No description provided'}
        </p>
        
        <div className="mt-4 space-y-2">
          {project.startDate && (
            <div className="text-sm">
              <span className="font-medium">Start Date:</span>{' '}
              {new Date(project.startDate).toLocaleDateString()}
            </div>
          )}
          {project.endDate && (
            <div className="text-sm">
              <span className="font-medium">End Date:</span>{' '}
              {new Date(project.endDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="text-sm text-gray-500">
          Created {formatDistanceToNow(new Date(project.createdAt))} ago
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/projects/${project.id}/edit`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(project.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
