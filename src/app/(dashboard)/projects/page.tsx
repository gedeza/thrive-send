"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProjectCard, Project } from "@/components/projects/ProjectCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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

const STATUS_OPTIONS = ["All", "PLANNED", "IN_PROGRESS", "COMPLETED"];

export default function ProjectsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  // Filter button color sets from theme (for clarity)
  const FILTER_BUTTON_VARIANTS = {
    active: "bg-primary text-white border-primary hover:bg-primary/90",
    inactive: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
  };

  useEffect(() => {
    fetchProjects();
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setDeleteProjectId(null);
    }
  };

  // Search and Filter logic
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let filtered = [...projects];
    if (statusFilter !== "All") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.description?.toLowerCase().includes(searchLower))
      );
    }
    return filtered;
  }, [projects, statusFilter, search]);

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all your projects
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:gap-3">
          <Input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or description..."
            className="max-w-xs"
            aria-label="Search projects"
            data-testid="search-projects"
          />
          <Button
            asChild
            variant="primary"
            data-testid="create-project-main"
            className="px-4 py-2"
          >
            <Link href="/projects/new">
              <span className="mr-2 text-lg font-bold">+</span>
              Create Project
            </Link>
          </Button>
        </div>
      </header>
      
      <section aria-labelledby="projects-list-heading" className="space-y-4">
        <nav className="flex flex-wrap gap-2" aria-label="Project Filters">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              type="button"
              className={`rounded-full px-4 py-1 text-xs font-semibold border transition-colors outline-none
                ${statusFilter === status 
                  ? FILTER_BUTTON_VARIANTS.active
                  : FILTER_BUTTON_VARIANTS.inactive
                }`}
              aria-pressed={statusFilter === status}
              tabIndex={0}
            >
              {status === "IN_PROGRESS" ? "In Progress" : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </nav>
        
        <h2 id="projects-list-heading" className="sr-only">Project List</h2>
        
        {loading && (
          <div className="text-muted-foreground">Loading projects...</div>
        )}
        
        {error && (
          <div className="text-red-500" role="alert">{error}</div>
        )}
        
        {filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onDelete={(id) => setDeleteProjectId(id)}
              />
            ))}
          </div>
        ) : !loading && (
          <div className="text-center p-10 border rounded-lg text-muted-foreground">
            <p className="mb-4">No projects found</p>
            <p className="text-sm">
              Try a different search or create a new project to get started.
            </p>
          </div>
        )}
      </section>

      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProjectId && handleDeleteProject(deleteProjectId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
