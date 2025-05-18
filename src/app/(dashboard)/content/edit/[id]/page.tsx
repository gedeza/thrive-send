"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ContentForm from "@/components/content/ContentForm";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

// This page previously used content.mock-data, which is now removed.
// You should implement your own data fetching or API integration here.

export default function EditContentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/${params.id}`);
        if (!response.ok) {
          throw new Error('Content not found');
        }
        const data = await response.json();
        setContent(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load content. Please try again.",
          variant: "destructive",
        });
        router.push("/content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/content" className="hover:text-foreground transition-colors">
          Content
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">Edit Content</span>
      </nav>
      
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit Content</h1>
        <p className="text-muted-foreground">
          Update your content details and schedule.
        </p>
      </div>

      {/* Content Edit Form */}
      <Card className="p-6">
        <ContentForm initialData={content} mode="edit" />
      </Card>
    </div>
  );
}