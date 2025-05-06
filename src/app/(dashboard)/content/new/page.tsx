import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ContentForm from '@/components/content/ContentForm';

export const metadata: Metadata = {
  title: 'Create New Content | ThriveSend',
  description: 'Create and schedule new content for your email marketing campaigns'
};

export default function NewContentPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/content" className="hover:text-foreground">
          Content
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">New Content</span>
      </nav>
      
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-bold">Create New Content</h1>
        <p className="text-muted-foreground">
          Create and manage content for your marketing campaigns.
        </p>
      </div>

      {/* Content Creation Form Component */}
      <ContentForm />
    </div>
  );
}
