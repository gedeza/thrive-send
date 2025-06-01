"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart2, Mail, Smartphone, Globe2, PauseCircle, Archive, RefreshCcw, AlertCircle, Edit, Eye } from "lucide-react";
import DeleteCampaign from '@/components/Campaign/DeleteCampaign';

// Campaign type definition
type CampaignStatus = "Scheduled" | "Sent" | "Draft" | "Paused" | "Archived";
type CampaignChannel = "Email" | "SMS" | "Social" | "Push";

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  sentDate: string | null;
  openRate: string | null;
  channel?: CampaignChannel;
  audience?: string;
  createdAt: string;
  clientName?: string | null;
  clientId?: string | null;
  organizationId?: string;
  organizationName?: string | null;
  projectId?: string | null;
  projectName?: string | null;
}

// Badge color map
const statusBadgeMap: Record<CampaignStatus, string> = {
  Scheduled: "bg-blue-100 text-blue-800",
  Sent: "bg-green-100 text-green-800",
  Draft: "bg-yellow-100 text-yellow-900",
  Paused: "bg-orange-100 text-orange-700",
  Archived: "bg-gray-100 text-gray-600"
};

const channelIcons: Record<CampaignChannel, JSX.Element> = {
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

// Helper function to map status to badge variant
function getStatusVariant(status: CampaignStatus): "default" | "secondary" | "destructive" | "outline" {
  const statusMap: Record<CampaignStatus, "default" | "secondary" | "destructive" | "outline"> = {
    'Draft': 'outline',
    'Scheduled': 'secondary',
    'Sent': 'default',
    'Paused': 'outline',
    'Archived': 'outline'
  };
  return statusMap[status];
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to map database status to UI status (with defensive fallback)
  function mapDatabaseStatusToUI(status: string): CampaignStatus {
    const statusMap: Record<string, CampaignStatus> = {
      'draft': 'Draft',
      'active': 'Scheduled',
      'completed': 'Sent',
      'paused': 'Paused',
      'archived': 'Archived'
    };
    
    if (status in statusMap) {
      return statusMap[status];
    } else {
      // Defensive: log unknown status for developer debugging
      console.warn(`Unknown campaign status received from database: "${status}". Defaulting to 'Draft'.`);
      return 'Draft'; // fallback to Draft
    }
  }

  // Helper function to validate channel
  function validateChannel(channel: string): CampaignChannel {
    const validChannels: CampaignChannel[] = ['Email', 'SMS', 'Social', 'Push'];
    return validChannels.includes(channel as CampaignChannel) 
      ? (channel as CampaignChannel) 
      : 'Email';
  }

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching campaigns from API...');
      const res = await fetch("/api/campaigns", {
        // Add cache: 'no-store' to prevent caching issues during development
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Log the raw response for debugging
      console.log('API Response status:', res.status);
      console.log('API Response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        let errorMessage = `Server responded with status: ${res.status}`;
        
        try {
          const errorData = await res.json();
          console.error("API Error Response:", {
            status: res.status,
            statusText: res.statusText,
            errorData
          });
          
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
            if (errorData.details) {
              errorMessage += `: ${errorData.details}`;
            }
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      // Check if the response is valid JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Unexpected content type:', contentType);
        throw new Error('API response is not valid JSON');
      }
      
      const data = await res.json();
      console.log('Campaign data received:', data);
      
      if (!Array.isArray(data)) {
        console.error('Expected array of campaigns, received:', typeof data);
        throw new Error('Invalid data format received from API');
      }
      
      // Transform the data to match the Campaign interface
      const transformedData: Campaign[] = data.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        status: mapDatabaseStatusToUI(campaign.status),
        sentDate: campaign.sentDate || null,
        openRate: campaign.openRate || null,
        channel: validateChannel(campaign.channel || 'Email'),
        audience: campaign.audience || 'All Users',
        createdAt: campaign.createdAt,
        clientName: campaign.client?.name || campaign.clientName || null,
        clientId: campaign.clientId || null,
        organizationId: campaign.organizationId,
        organizationName: campaign.organization?.name || null,
        projectId: campaign.projectId,
        projectName: campaign.project?.name || null
      }));
      
      setCampaigns(transformedData);
      setLoading(false);
    } catch (err: any) {
      console.error("Failed to load campaigns:", err);
      const errorMessage = err.message || "Unable to load campaign data. Please try again later.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

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
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Campaign List
            </div>
            {error && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchCampaigns}
                className="flex items-center gap-1"
              >
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
                <div className="text-sm text-muted-foreground">Loading campaigns...</div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
              <p className="text-red-500 mb-3">{error}</p>
              <Button 
                variant="outline" 
                onClick={fetchCampaigns}
                className="flex items-center gap-1"
              >
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && campaigns.length === 0 && (
            <div className="text-center p-6">
              <p className="mb-4">No campaigns found</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first campaign to get started</p>
              <Button asChild>
                <Link href="/campaigns/new">
                  Create Your First Campaign
                </Link>
              </Button>
            </div>
          )}

          {!loading && !error && campaigns.length > 0 && (
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
                    {campaign.clientName && (
                      <span className="text-xs text-muted-foreground">Client: {campaign.clientName}</span>
                    )}
              </div>
                  {/* Channel */}
                  <div className="col-span-2 flex items-center gap-2">
                    {channelIcons[campaign.channel || 'Email'] || <Mail className="h-4 w-4" />}
                    {campaign.channel || 'Email'}
                  </div>
                  {/* Audience */}
                  <div className="col-span-2">{campaign.audience || 'All Users'}</div>
                  {/* Status */}
                  <div className="col-span-2">
                    <Badge variant={getStatusVariant(campaign.status)}>
                      {campaign.status}
                      {campaign.status === 'Paused' || campaign.status === 'Archived' ? (
                        <Archive className="ml-1 h-3 w-3 text-gray-500 inline-block" />
                      ) : null}
                    </Badge>
                  </div>
                  {/* Sent Date */}
                  <div className="col-span-2">{prettyDate(campaign.sentDate)}</div>
                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-start gap-1">
                    {campaign.status !== "Draft" && (
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                        <Link href={`/campaigns/analytics/${campaign.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {campaign.status === "Draft" && (
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50">
                        <Link href={`/campaigns/edit/${campaign.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <DeleteCampaign 
                      campaignId={campaign.id}
                      campaignName={campaign.name}
                      onDeleteSuccess={fetchCampaigns}
                      buttonVariant="ghost"
                      buttonSize="sm"
                      buttonLabel=""
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
