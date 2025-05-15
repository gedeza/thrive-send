// Sample mock data for campaigns that can be used during development
// Import this in your API route if you need fallback data

export const mockCampaigns = [
  {
    id: '1',
    name: 'Spring Newsletter',
    status: 'Sent',
    channel: 'Email',
    audience: 'All Subscribers',
    sentDate: '2023-04-15T10:00:00Z',
    openRate: '24.5%',
    createdAt: '2023-04-10T14:30:00Z',
    clientName: 'Starlight Municipality',
    clientId: '1'
  },
  {
    id: '2',
    name: 'Summer Sale Announcement',
    status: 'Scheduled',
    channel: 'Email',
    audience: 'Customers',
    sentDate: null,
    openRate: null,
    createdAt: '2023-06-01T09:15:00Z',
    clientName: 'Horizon Tech',
    clientId: '2'
  },
  {
    id: '3',
    name: 'Event Reminder',
    status: 'Draft',
    channel: 'SMS',
    audience: 'Event Registrants',
    sentDate: null,
    openRate: null,
    createdAt: '2023-05-20T11:45:00Z',
    clientName: 'GreenLeaf Nonprofit',
    clientId: '3'
  },
  {
    id: '4',
    name: 'Product Launch',
    status: 'Sent',
    channel: 'Social',
    audience: 'All Subscribers',
    sentDate: '2023-05-01T08:00:00Z',
    openRate: '32.1%',
    createdAt: '2023-04-25T16:20:00Z',
    clientName: 'NovaSpark Startup',
    clientId: '4'
  },
  {
    id: '5',
    name: 'Customer Feedback Survey',
    status: 'Paused',
    channel: 'Email',
    audience: 'Customers',
    sentDate: null,
    openRate: null,
    createdAt: '2023-03-15T10:00:00Z',
    clientName: 'Jane Smith Consulting',
    clientId: '5'
  },
  {
    id: '6',
    name: 'Weekly Update',
    status: 'Archived',
    channel: 'Email',
    audience: 'Team Members',
    sentDate: '2023-02-05T15:30:00Z',
    openRate: '89.3%',
    createdAt: '2023-02-04T14:00:00Z',
    clientName: 'Horizon Tech',
    clientId: '2'
  }
];

export default mockCampaigns;