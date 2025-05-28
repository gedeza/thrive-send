"use client";

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Globe, Facebook, Twitter, Instagram, Linkedin, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

// Types
type ClientType = "MUNICIPALITY" | "BUSINESS" | "STARTUP" | "INDIVIDUAL" | "NONPROFIT";
type SocialAccount = {
  id: string;
  platform: "FACEBOOK" | "TWITTER" | "INSTAGRAM" | "LINKEDIN";
  handle: string;
  createdAt: string;
  updatedAt: string;
};
type Project = {
  id: string;
  name: string;
  description?: string;
  status: "PLANNING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
};
type Client = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  type: ClientType;
  website?: string;
  industry?: string;
  logoUrl?: string;
  projects: Project[];
  socialAccounts: SocialAccount[];
  createdAt: string;
  updatedAt: string;
};

// Map of social platform icons
const platformIconMap: Record<string, JSX.Element> = {
  FACEBOOK: <Facebook className="h-5 w-5" />,
  TWITTER: <Twitter className="h-5 w-5" />,
  INSTAGRAM: <Instagram className="h-5 w-5" />,
  LINKEDIN: <Linkedin className="h-5 w-5" />,
};

// Helper function to get initials from name
function getInitials(name: string) {
  const words = name.split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function ClientDetailsPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { organization } = useOrganization();

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch client");
        }
        const data = await response.json();
        setClient(data);
      } catch (error) {
        console.error("Error fetching client:", error);
        toast.error("Failed to load client data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [params.id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/clients/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete client");
      }

      toast.success("Client deleted successfully");
      router.push("/clients");
      router.refresh();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${params.id}/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      toast.success("Project deleted successfully");
      // Refresh client data
      const updatedClient = await fetch(`/api/clients/${params.id}`).then(res => res.json());
      setClient(updatedClient);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleDeleteSocialAccount = async (accountId: string) => {
    if (!window.confirm("Are you sure you want to delete this social account? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${params.id}/social-accounts/${accountId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete social account");
      }

      toast.success("Social account deleted successfully");
      // Refresh client data
      const updatedClient = await fetch(`/api/clients/${params.id}`).then(res => res.json());
      setClient(updatedClient);
    } catch (error) {
      console.error("Error deleting social account:", error);
      toast.error("Failed to delete social account");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Client not found</h1>
        <Link
          href="/clients"
          className="text-blue-500 hover:text-blue-700"
        >
          Back to clients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {client.logoUrl ? (
            <div className="relative h-16 w-16 rounded-full border overflow-hidden">
              <Image
                src={client.logoUrl}
                alt={`${client.name} logo`}
                fill
                className="object-cover"
                onError={(e) => {
                  // Handle image loading errors by showing initials instead
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-800 text-xl font-bold">${getInitials(client.name)}</div>`;
                }}
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full border bg-gray-100 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-800">{getInitials(client.name)}</span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground">
              Client details and management
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href={`/clients/${client.id}/edit`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Edit Client
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 py-2"
          >
            {isDeleting ? "Deleting..." : "Delete Client"}
          </button>
        </div>
      </div>

      {/* Client Information */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="mt-1">{client.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p className="mt-1">{client.type.charAt(0) + client.type.slice(1).toLowerCase()}</p>
            </div>
            {client.phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="mt-1">{client.phone}</p>
              </div>
            )}
            {client.website && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-blue-500 hover:text-blue-700 flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  {client.website}
                </a>
              </div>
            )}
            {client.industry && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Industry</p>
                <p className="mt-1">{client.industry}</p>
              </div>
            )}
            {client.logoUrl && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Logo URL</p>
                <a
                  href={client.logoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-blue-500 hover:text-blue-700 flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  View Logo
                </a>
              </div>
            )}
            {client.address && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="mt-1">{client.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Projects</h2>
            <Link
              href={`/clients/${client.id}/projects/new`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
            >
              Add Project
            </Link>
          </div>
          {client.projects.length === 0 ? (
            <p className="text-muted-foreground">No projects yet.</p>
          ) : (
            <div className="space-y-4">
              {client.projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm">
                          Status: {project.status.charAt(0) + project.status.slice(1).toLowerCase().replace("_", " ")}
                        </span>
                        <span className="text-sm">
                          Start: {new Date(project.startDate).toLocaleDateString()}
                        </span>
                        {project.endDate && (
                          <span className="text-sm">
                            End: {new Date(project.endDate).toLocaleDateString()}
                          </span>
                        )}
                        {project.budget && (
                          <span className="text-sm">
                            Budget: ${project.budget.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/clients/${client.id}/projects/${project.id}/edit`}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Social Accounts */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Social Media Accounts</h2>
            <Link
              href={`/clients/${client.id}/social-accounts/new`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
            >
              Add Social Account
            </Link>
          </div>
          {client.socialAccounts.length === 0 ? (
            <p className="text-muted-foreground">No social media accounts yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.socialAccounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {account.platform.charAt(0) + account.platform.slice(1).toLowerCase()}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        @{account.handle}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/clients/${client.id}/social-accounts/${account.id}/edit`}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteSocialAccount(account.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="text-sm text-muted-foreground">
        <p>Created {formatDistanceToNow(new Date(client.createdAt))} ago</p>
        <p>Last updated {formatDistanceToNow(new Date(client.updatedAt))} ago</p>
      </div>
    </div>
  );
}
