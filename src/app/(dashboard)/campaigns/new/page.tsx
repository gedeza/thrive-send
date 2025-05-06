import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import CreateCampaign from '@/components/Campaign/CreateCampaign';

export const metadata: Metadata = {
  title: 'Create New Campaign | ThriveSend',
  description: 'Create a new email marketing campaign with ThriveSend'
};

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/campaigns" className="hover:text-foreground">
          Campaigns
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">New Campaign</span>
      </nav>
      
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-bold">Create New Campaign</h1>
        <p className="text-muted-foreground">
          Set up your campaign details and schedule content.
        </p>
      </div>

      {/* Campaign Creation Form Component */}
      <CreateCampaign />
    </div>
  );
}
