import React from 'react';
import { Card } from '../patterns/card';
import { PrimaryButton } from '../PrimaryButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  startDate: Date;
  endDate: Date;
  client: {
    name: string;
  };
  manager: {
    name: string;
  };
}

interface ProjectManagementProps {
  projects: Project[];
  onProjectCreate: () => void;
  onProjectEdit: (id: string) => void;
  onProjectDelete: (id: string) => void;
}

export function ProjectManagement({
  projects,
  onProjectCreate,
  onProjectEdit,
  onProjectDelete,
}: ProjectManagementProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <PrimaryButton onClick={onProjectCreate}>
          Create New Project
        </PrimaryButton>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ProjectList
            projects={projects}
            onEdit={onProjectEdit}
            onDelete={onProjectDelete}
          />
        </TabsContent>

        <TabsContent value="planned" className="mt-6">
          <ProjectList
            projects={projects.filter(project => project.status === 'PLANNED')}
            onEdit={onProjectEdit}
            onDelete={onProjectDelete}
          />
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <ProjectList
            projects={projects.filter(project => project.status === 'IN_PROGRESS')}
            onEdit={onProjectEdit}
            onDelete={onProjectDelete}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <ProjectList
            projects={projects.filter(project => project.status === 'COMPLETED')}
            onEdit={onProjectEdit}
            onDelete={onProjectDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectList({
  projects,
  onEdit,
  onDelete,
}: {
  projects: Project[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{project.description}</p>
              <div className="space-y-1">
                <p className="text-sm">
                  Client: {project.client.name}
                </p>
                <p className="text-sm">
                  Manager: {project.manager.name}
                </p>
                <p className="text-sm">
                  Timeline: {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </p>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100">
                  {project.status}
                </span>
              </div>
            </div>
            <div className="space-x-2">
              <PrimaryButton
                variant="outline"
                onClick={() => onEdit(project.id)}
              >
                Edit
              </PrimaryButton>
              <PrimaryButton
                variant="destructive"
                onClick={() => onDelete(project.id)}
              >
                Delete
              </PrimaryButton>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 