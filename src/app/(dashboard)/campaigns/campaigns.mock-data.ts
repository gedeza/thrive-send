export type CampaignStatus = "Scheduled" | "Sent" | "Draft" | "Paused" | "Archived";
export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  sentDate: string | null;
  openRate: string | null;
  channel: "Email" | "SMS" | "Social" | "Push";
  audience: string;
  createdAt: string;
}

export const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale Email',
    status: 'Scheduled',
    sentDate: '2023-07-15',
    openRate: '32%',
    channel: 'Email',
    audience: 'All Subscribers',
    createdAt: '2023-07-01'
  },
  {
    id: '2',
    name: 'Product Launch',
    status: 'Draft',
    sentDate: null,
    openRate: null,
    channel: 'Email',
    audience: 'VIP List',
    createdAt: '2023-06-28'
  },
  {
    id: '3',
    name: 'Monthly Newsletter',
    status: 'Sent',
    sentDate: '2023-06-01',
    openRate: '28%',
    channel: 'Email',
    audience: 'Newsletter',
    createdAt: '2023-05-20'
  },
  {
    id: '4',
    name: 'Black Friday SMS Blast',
    status: 'Archived',
    sentDate: '2022-11-24',
    openRate: '18%',
    channel: 'SMS',
    audience: 'All Customers',
    createdAt: '2022-11-01'
  },
  {
    id: '5',
    name: 'Spring Push Notification',
    status: 'Paused',
    sentDate: null,
    openRate: null,
    channel: 'Push',
    audience: 'App Users',
    createdAt: '2023-03-11'
  }
];