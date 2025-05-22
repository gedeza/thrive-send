'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ContentWizard } from '@/components/content/ContentWizard';
import { CalendarEvent } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

// Note: Metadata must be exported from a Server Component
// We'll need to handle this differently since this is now a Client Component
// export const metadata: Metadata = {
//   title: 'Create New Content | ThriveSend',
//   description: 'Create and schedule new content for your email marketing campaigns'
// };

export default function NewContentPage() {
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
    <div className="p-6 space-y-8">
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
        <span className="text-foreground">New Content</span>
      </nav>
      
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Create New Content</h1>
        <p className="text-muted-foreground">
          Create and manage content for your marketing campaigns. Add rich text, media, and schedule your content.
        </p>
      </div>

      {/* Content Creation Wizard */}
      <ContentWizard onComplete={handleComplete} />
    </div>
  );
}
