import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Project type defined for props type safety
export interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  owner: string;
  lastUpdated: string;
}

// Badge color mapping for statuses
const statusBadgeStyles: Record<string, string> = {
  "In Progress": "bg-yellow-100 text-yellow-800",
  "Planned": "bg-blue-100 text-blue-800",
  "Completed": "bg-green-100 text-green-800",
};

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => (
  <Link href={`/projects/${project.id}`} className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
    <Card tabIndex={0} aria-labelledby={`project-card-${project.id}-title`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle id={`project-card-${project.id}-title`} className="text-lg">
          {project.name}
        </CardTitle>
        <Badge className={`capitalize ${statusBadgeStyles[project.status] || "bg-gray-100 text-gray-700"}`}>
          {project.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Owner:</span>
            <span className="font-medium">{project.owner}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Last Updated:</span>
            <span>
              {new Date(project.lastUpdated).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progress:</span>
            <span>{project.progress}% Complete</span>
          </div>
        </div>
        <div
          className="w-full bg-gray-200 rounded-full h-2.5"
          role="progressbar"
          aria-valuenow={project.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress for ${project.name}`}
        >
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  </Link>
);
