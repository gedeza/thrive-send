"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { campaigns, type Campaign } from "./campaigns.mock-data";
import { BarChart2, Mail, Smartphone, Globe2, PauseCircle, Archive } from "lucide-react";

// Badge color map
const statusBadgeMap: Record<Campaign["status"], string> = {
  Scheduled: "bg-blue-100 text-blue-800",
  Sent: "bg-green-100 text-green-800",
  Draft: "bg-yellow-100 text-yellow-900",
  Paused: "bg-orange-100 text-orange-700",
  Archived: "bg-gray-100 text-gray-600"
};

const channelIcons: Record<Campaign["channel"], JSX.Element> = {
  Email: <Mail className="h-4 w-4 inline-block" />,
  SMS: <Smartphone className="h-4 w-4 inline-block" />,
  Social: <Globe2 className="h-4 w-4 inline-block" />,
  Push: <PauseCircle className="h-4 w-4 inline-block" />,
};

function prettyDate(d: string | null) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function CampaignsPage() {

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage your marketing campaigns</p>
        </div>
        <Button 
          asChild 
          className="flex items-center gap-1"
          data-testid="create-campaign"
        >
          <Link href="/campaigns/new">
            + Create Campaign
          </Link>
        </Button>
      </div>
      
      {campaigns.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Campaign List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border divide-y">
              {/* Table Head */}
              <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Channel</div>
                <div className="col-span-2">Audience</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Sent Date</div>
                <div className="col-span-1">Actions</div>
              </div>
              {campaigns.map(campaign => (
                <div key={campaign.id} className="grid grid-cols-12 items-center p-3 text-sm">
                  {/* Name + Created At + Link */}
                  <div className="col-span-3 flex flex-col">
                    <Link href={`/campaigns/analytics/${campaign.id}`} className="font-medium text-blue-700 hover:underline">
                      {campaign.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">Created: {prettyDate(campaign.createdAt)}</span>
                  </div>
                  {/* Channel */}
                  <div className="col-span-2 flex items-center gap-2">
                    {channelIcons[campaign.channel]}
                    {campaign.channel}
                  </div>
                  {/* Audience */}
                  <div className="col-span-2">{campaign.audience}</div>
                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeMap[campaign.status]}`}>
                      {campaign.status}
                    </span>
                    {campaign.status === "Paused" && (
                      <Archive className="ml-1 h-3 w-3 text-gray-500 inline-block" title="Paused/Archived" />
                    )}
                  </div>
                  {/* Sent Date */}
                  <div className="col-span-2">{prettyDate(campaign.sentDate)}</div>
                  {/* Analytics Link */}
                  <div className="col-span-1">
                    {campaign.status !== "Draft" && (
                      <Link href={`/campaigns/analytics/${campaign.id}`} className="inline-block text-blue-600 hover:underline text-xs">
                        View
                      </Link>
                    )}
                    {campaign.status === "Draft" && (
                      <Link href={`/campaigns/edit/${campaign.id}`} className="inline-block text-yellow-800 hover:underline text-xs">
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
