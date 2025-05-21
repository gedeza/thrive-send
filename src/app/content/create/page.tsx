'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ContentWizard } from '@/components/content/ContentWizard';
import { CalendarEvent } from '@/types';
import { toast } from '@/components/ui/use-toast';

export default function CreateContentPage() {
  const router = useRouter();

  const handleComplete = async (event: CalendarEvent) => {
    try {
      // TODO: Implement API call to save the event
      toast({
        title: 'Success',
        description: 'Content scheduled successfully',
      });
      router.push('/content');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to schedule content',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Content</h1>
        <ContentWizard onComplete={handleComplete} />
      </div>
    </div>
  );
} 