// Sample mock data for clients that can be used during development
// Import this in your API route if you need fallback data

export const mockClients = [
  {
    id: '1',
    name: 'Starlight Municipality',
    email: 'contact@starlightcity.gov',
    type: 'MUNICIPALITY',
    status: 'active',
    industry: 'Government',
    website: 'https://starlightcity.gov',
    logoUrl: 'https://via.placeholder.com/150?text=SC',
    createdAt: '2023-05-10T14:30:00Z',
    socialAccounts: [
      {
        id: '101',
        platform: 'FACEBOOK',
        handle: '@starlightcitygov'
      },
      {
        id: '102',
        platform: 'TWITTER',
        handle: '@starlightcity'
      }
    ],
    projects: [
      {
        id: '201',
        name: 'Community Outreach 2025',
        status: 'ACTIVE'
      },
      {
        id: '202',
        name: 'Downtown Revitalization',
        status: 'PLANNED'
      }
    ]
  },
  {
    id: '2',
    name: 'Horizon Tech',
    email: 'info@horizontech.com',
    type: 'BUSINESS',
    status: 'active',
    industry: 'Technology',
    website: 'https://horizontech.com',
    logoUrl: 'https://via.placeholder.com/150?text=HT',
    createdAt: '2023-06-15T09:15:00Z',
    socialAccounts: [
      {
        id: '103',
        platform: 'LINKEDIN',
        handle: '/company/horizontech'
      },
      {
        id: '104',
        platform: 'TWITTER',
        handle: '@horizontech'
      }
    ],
    projects: [
      {
        id: '203',
        name: 'Product Launch Campaign',
        status: 'ACTIVE'
      }
    ]
  },
  {
    id: '3',
    name: 'GreenLeaf Nonprofit',
    email: 'hello@greenleaf.org',
    type: 'NONPROFIT',
    status: 'active',
    industry: 'Environmental',
    website: 'https://greenleaf.org',
    logoUrl: 'https://via.placeholder.com/150?text=GL',
    createdAt: '2023-07-20T11:45:00Z',
    socialAccounts: [
      {
        id: '105',
        platform: 'INSTAGRAM',
        handle: '@greenleaforg'
      },
      {
        id: '106',
        platform: 'FACEBOOK',
        handle: '@greenleafnonprofit'
      }
    ],
    projects: [
      {
        id: '204',
        name: 'Conservation Awareness',
        status: 'ACTIVE'
      },
      {
        id: '205',
        name: 'Fundraising Gala',
        status: 'PLANNED'
      }
    ]
  },
  {
    id: '4',
    name: 'NovaSpark Startup',
    email: 'team@novaspark.io',
    type: 'STARTUP',
    status: 'active',
    industry: 'Software',
    website: 'https://novaspark.io',
    logoUrl: null,
    createdAt: '2023-08-05T16:20:00Z',
    socialAccounts: [],
    projects: []
  },
  {
    id: '5',
    name: 'Jane Smith Consulting',
    email: 'jane@smithconsulting.com',
    type: 'INDIVIDUAL',
    status: 'inactive',
    industry: 'Consulting',
    website: null,
    logoUrl: null,
    createdAt: '2023-04-12T10:00:00Z',
    socialAccounts: [
      {
        id: '107',
        platform: 'LINKEDIN',
        handle: '/in/janesmith'
      }
    ],
    projects: [
      {
        id: '206',
        name: 'Brand Strategy',
        status: 'COMPLETED'
      }
    ]
  }
];

export default mockClients;