"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NewContentCreator } from '@/components/content/NewContentCreator';
import { toast } from '@/components/ui/use-toast';

interface EditContentPageProps {
  params: { id: string };
}

export default function EditContentPage({ params }: EditContentPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [contentData, setContentData] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/${params.id}`);
        if (!response.ok) {
          throw new Error('Content not found');
        }
        const data = await response.json();
        setContentData(data);
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
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!contentData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <NewContentCreator initialData={contentData} mode="edit" contentId={params.id} />
    </div>
  );
}