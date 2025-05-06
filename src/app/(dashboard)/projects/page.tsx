"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProjectsPage() {
  // Sample project data - replace with real data fetching
  const projects = [
    { id: '1', name: 'Website Redesign', status: 'In Progress', progress: 65 },
    { id: '2', name: 'Email Campaign', status: 'Planned', progress: 10 },
    { id: '3', name: 'Social Media Strategy', status: 'Completed', progress: 100 }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all your projects
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          data-testid="create-project-main"
        >
          <span className="mr-2 text-lg font-bold">+</span>
          Create Project
        </Link>
      </div>
      
      {projects.length > 0 ? (
        <div className="grid gap-6">
          {projects.map(project => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-2">
                  <span>Status: {project.status}</span>
                  <span>{project.progress}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground">
          No projects found.
        </div>
      )}
    </div>
  );
}
