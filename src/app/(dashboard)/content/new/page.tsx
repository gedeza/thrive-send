import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ContentForm from '@/components/content/ContentForm';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Create New Content | ThriveSend',
  description: 'Create and schedule new content for your email marketing campaigns'
};

export default function NewContentPage() {
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

      {/* Content Creation Form */}
      <Card className="p-6">
        <ContentForm />
      </Card>
    </div>
  );
}
