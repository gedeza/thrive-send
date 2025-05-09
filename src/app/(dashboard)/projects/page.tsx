"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ProjectCard, Project } from "@/components/projects/ProjectCard";
import { Input } from "@/components/ui/input";

const STATUS_OPTIONS = ["All", "In Progress", "Planned", "Completed"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    // Simulated async fetch, replace with real API call
    const fetchProjects = async () => {
      try {
        // In a real app, this would be an API call
        // await fetch('/api/projects')
        setTimeout(() => {
          setProjects([
            { 
              id: '1', 
              name: 'Website Redesign', 
              status: 'In Progress', 
              progress: 65,
              owner: "Alice",
              lastUpdated: "2024-06-03"
            },
            { 
              id: '2', 
              name: 'Email Campaign', 
              status: 'Planned', 
              progress: 10,
              owner: "Bob",
              lastUpdated: "2024-05-28"
            },
            { 
              id: '3', 
              name: 'Social Media Strategy', 
              status: 'Completed', 
              progress: 100,
              owner: "Charlie",
              lastUpdated: "2024-05-15"
            },
            { 
              id: '4', 
              name: 'Mobile App Launch', 
              status: 'In Progress', 
              progress: 40,
              owner: "Alice",
              lastUpdated: "2024-06-01"
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (e) {
        setError("Failed to fetch projects");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Search and Filter logic
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let filtered = [...projects];
    if (statusFilter !== "All") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    if (search.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.owner.toLowerCase().includes(search.toLowerCase()) ||
          p.status.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Search by name, owner or status..."
            className="max-w-xs"
            aria-label="Search projects"
            data-testid="search-projects"
          />
          <Link
            href="/projects/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            data-testid="create-project-main"
          >
            <span className="mr-2 text-lg font-bold">+</span>
            Create Project
          </Link>
        </div>
      </header>
      
      <section aria-labelledby="projects-list-heading" className="space-y-4">
        <nav className="flex flex-wrap gap-2" aria-label="Project Filters">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                statusFilter === status
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-muted-foreground border-gray-300 hover:bg-gray-100"
              }`}
              aria-pressed={statusFilter === status}
            >
              {status}
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
              <ProjectCard key={project.id} project={project} />
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
    </div>
  );
}
