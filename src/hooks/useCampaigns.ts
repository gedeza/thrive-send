import { useQuery } from '@tanstack/react-query';
import { queryConfig } from '@/lib/react-query-config';

export interface Campaign {
  id: string;
  name: string;
  status: "Scheduled" | "Sent" | "Draft" | "Paused" | "Archived";
  sentDate: string | null;
  openRate: string | null;
  channel?: "Email" | "SMS" | "Social" | "Push";
  audience?: string;
  createdAt: string;
  clientName?: string | null;
  clientId?: string | null;
  organizationId?: string;
  organizationName?: string | null;
  projectId?: string | null;
  projectName?: string | null;
}

// Custom hook to manage campaigns data with proper caching
export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async (): Promise<Campaign[]> => {
      const response = await fetch("/api/campaigns", {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }
      
      return data.map(campaign => ({
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
    },
    ...queryConfig.campaigns, // Use centralized campaigns configuration
  });
}

// Helper function to map database status to UI status (with defensive fallback)
function mapDatabaseStatusToUI(status: string): Campaign['status'] {
  const statusMap: Record<string, Campaign['status']> = {
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
function validateChannel(channel: string): Campaign['channel'] {
  const validChannels: Campaign['channel'][] = ['Email', 'SMS', 'Social', 'Push'];
  return validChannels.includes(channel as Campaign['channel']) 
    ? (channel as Campaign['channel']) 
    : 'Email';
}