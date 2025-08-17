import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import CreateMultiClientCampaign from '@/components/Campaign/CreateMultiClientCampaign';

export const metadata: Metadata = {
  title: 'Create Multi-Client Campaign | ThriveSend',
  description: 'Create a campaign that spans across multiple clients'
};

export default function CreateMultiClientCampaignPage() {
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
        <Link href="/campaigns/multi-client" className="hover:text-foreground">
          Multi-Client
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">Create</span>
      </nav>
      
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-bold">Create Multi-Client Campaign</h1>
        <p className="text-muted-foreground">
          Set up a campaign that will run across multiple clients with unified management and analytics.
        </p>
      </div>

      {/* Multi-Client Campaign Creation Form Component */}
      <CreateMultiClientCampaign />
    </div>
  );
}