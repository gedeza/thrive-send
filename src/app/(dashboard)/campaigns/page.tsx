"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CampaignsPage() {
  // Sample campaign data - replace with real data fetching
  const campaigns = [
    { id: '1', name: 'Summer Sale Email', status: 'Scheduled', sentDate: 'July 15, 2023', openRate: '32%' },
    { id: '2', name: 'Product Launch', status: 'Draft', sentDate: '-', openRate: '-' },
    { id: '3', name: 'Monthly Newsletter', status: 'Sent', sentDate: 'June 1, 2023', openRate: '28%' }
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage your email campaigns
          </p>
        </div>
        <Button
          asChild
          className="mt-4 sm:mt-0"
          data-testid="create-campaign"
        >
          <Link href="/campaigns/new">
            Create Campaign
          </Link>
        </Button>
      </div>
      
      {campaigns.length > 0 ? (
        <div className="grid gap-6">
          {campaigns.map(campaign => (
            <Card key={campaign.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <CardTitle>{campaign.name}</CardTitle>
                  <Badge variant={
                    campaign.status === 'Sent' ? 'success' : 
                    campaign.status === 'Scheduled' ? 'warning' : 'secondary'
                  }>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{campaign.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sent Date</p>
                    <p className="font-medium">{campaign.sentDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Open Rate</p>
                    <p className="font-medium">{campaign.openRate}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/campaigns/analytics/${campaign.id}`}>
                      View Analytics
                    </Link>
                  </Button>
                  {campaign.status === 'Draft' && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/campaigns/edit/${campaign.id}`}>
                        Edit Campaign
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-6">
          <CardContent className="pt-6">
            <p className="mb-4">No campaigns found</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first campaign to get started</p>
            <Button asChild>
              <Link href="/campaigns/new">
                Create Your First Campaign
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
