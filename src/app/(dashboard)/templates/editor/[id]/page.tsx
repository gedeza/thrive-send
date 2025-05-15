
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Copy, Edit, Trash, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@clerk/nextjs";
import { Template, fetchTemplates, deleteTemplate, duplicateTemplate } from "@/lib/api/templates-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusBadgeMap: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-900",
  archived: "bg-gray-100 text-gray-600"
};

const categoryBadgeMap: Record<string, string> = {
  Email: "bg-blue-100 text-blue-800",
  "Social Media": "bg-indigo-100 text-indigo-800",
  Form: "bg-green-100 text-green-800",
  Notification: "bg-pink-100 text-pink-800",
  Blog: "bg-orange-100 text-orange-800"
};

export default function TemplatesPage() {
  const { toast } = useToast();
  const { organization } = useOrganization();

  const [search, setSearch] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      if (!organization) return;

      setIsLoading(true);
      try {
        const data = await fetchTemplates({
          organizationId: organization.id,
        });
        setTemplates(data);
      } catch (err) {
        setError("Failed to load templates. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load templates.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadTemplates();
  }, [organization, toast]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const success = await deleteTemplate(id);
      if (success) {
        setTemplates(templates.filter(t => t.id !== id));
        toast({
          title: "Success",
          description: "Template deleted successfully.",
        });
      } else {
        throw new Error("Failed to delete template");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setIsDuplicating(id);
    try {
      const duplicated = await duplicateTemplate(id);
      if (duplicated) {
        setTemplates([...templates, duplicated]);
        toast({
          title: "Success",
          description: "Template duplicated successfully.",
        });
      } else {
        throw new Error("Failed to duplicate template");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to duplicate template.",
        variant: "destructive",
      });
    } finally {
      setIsDuplicating(null);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return templates;
    return templates.filter(template =>
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.author.toLowerCase().includes(search.toLowerCase()) ||
      (template.description?.toLowerCase().includes(search.toLowerCase())) ||
      template.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, templates]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Create and manage reusable content templates
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, category, author..."
            className="max-w-xs"
            aria-label="Search templates"
          />
          <Button asChild>
            <Link href="/templates/editor/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Template
            </Link>
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-sm border">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-4 w-1/2 mt-3" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
              <CardFooter className="flex justify-between border-t p-3 bg-gray-50">
                <Skeleton className="h-8 w-24" />
                <div className="flex space-x-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p className="font-medium">Error loading templates</p>
          <p className="text-sm">{error}</p>
          <Button className="mt-2" variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(template => (
            <Card key={template.id} className="overflow-hidden group shadow-sm border">
              <CardHeader className="pb-3 flex flex-row justify-between items-center">
                <div>
                  <CardTitle>{template.name}</CardTitle>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className={`text-xs capitalize ${categoryBadgeMap[template.category] || "bg-gray-100"}`}>
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className={`text-xs capitalize ${statusBadgeMap[template.status] || "bg-gray-100"}`}>
                      {template.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground ml-2">by {template.author}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-gray-50 rounded flex items-center justify-center text-gray-400 text-sm">
                  {template.previewImage ? (
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>Template Preview</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3 mb-2">
                  Last updated: {new Date(template.lastUpdated).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </p>
                <p className="text-xs mb-2 line-clamp-2">{template.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-3 bg-gray-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDuplicate(template.id)}
                  disabled={isDuplicating === template.id}
                >
                  {isDuplicating === template.id ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  Duplicate
                </Button>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/templates/editor/${template.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the template and remove it from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(template.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting === template.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg">
          <div className="mx-auto max-w-md">
            <h2 className="text-xl font-semibold mb-2">No templates found</h2>
            <p className="text-muted-foreground mb-6">
              {search ? (
                <>
                  No templates match your search criteria. Please try a different search or clear the search field.
                </>
              ) : (
                <>
                  You don't have any templates yet. Create your first template to get started.
                </>
              )}
            </p>
            {search ? (
              <Button variant="outline" onClick={() => setSearch("")}>
                Clear Search
              </Button>
            ) : (
              <Button asChild>
                <Link href="/templates/editor/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Template
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
