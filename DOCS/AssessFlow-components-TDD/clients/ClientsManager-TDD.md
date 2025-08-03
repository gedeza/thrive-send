# ClientsManager Component TDD

## Document Information
- **Component**: ClientsManager
- **Type**: Service Provider Client Management System
- **Business Model**: B2B2G Service Provider Platform
- **TDD Version**: 1.0.0
- **Created**: January 2025
- **PRD Compliant**: ✅ Yes

---

## Business Context

### Purpose
The ClientsManager component enables **service providers** to manage multiple client accounts within their organization. This is a core component of the B2B2G service provider business model where agencies manage content and campaigns for multiple municipal/business clients.

### Key Business Requirements
1. **Multi-Client Management**: Service providers can view, create, and manage multiple client accounts
2. **Service Provider Context**: All operations happen within service provider organization context
3. **Client Switching**: Integration with ServiceProviderDashboard for seamless client context switching
4. **Cross-Client Analytics**: Support for aggregated metrics across all managed clients
5. **Role-Based Access**: Team members can be assigned to specific clients

---

## Component Architecture

### Core Concept
```
Service Provider Organization
├── ServiceProviderDashboard (Overview)
├── ClientsManager (This Component)
│   ├── All Clients View
│   ├── Create New Client
│   ├── Client Details View
│   ├── Edit Client
│   └── Client Performance Analytics
└── Client-Specific Dashboards
```

### Data Flow
```
ServiceProviderContext → ClientsManager → Client Data → ServiceProviderDashboard
```

---

## User Stories

### Epic: Service Provider Client Management

#### Story 1: View All Clients
**As a** service provider admin  
**I want to** see all clients managed by my organization  
**So that** I can get an overview of my client portfolio

**Acceptance Criteria:**
- [ ] Display all clients belonging to service provider organization
- [ ] Show key metrics: name, type, status, active campaigns, performance score
- [ ] Support filtering by client type, status, industry
- [ ] Support search by client name, industry, location
- [ ] Display client performance rankings
- [ ] Show total client count and growth metrics

#### Story 2: Create New Client
**As a** service provider admin  
**I want to** add new clients to my organization  
**So that** I can expand my client portfolio

**Acceptance Criteria:**
- [ ] Form to create new client account
- [ ] Client assigned to service provider organization
- [ ] Support client types: Municipality, Business, Startup, Nonprofit
- [ ] Collect contact information, industry, goals
- [ ] Set up initial team assignments
- [ ] Generate client-specific dashboard access

#### Story 3: Switch Client Context
**As a** service provider team member  
**I want to** easily switch between client contexts  
**So that** I can work on different client accounts efficiently

**Acceptance Criteria:**
- [ ] Integration with ServiceProviderDashboard ClientSwitcher
- [ ] Maintain client context across application
- [ ] Show current client in navigation
- [ ] Support quick client switching from any page

#### Story 4: Manage Client Details
**As a** service provider admin  
**I want to** edit client information and settings  
**So that** I can keep client data up to date

**Acceptance Criteria:**
- [ ] Edit client profile information
- [ ] Update contact details and preferences
- [ ] Manage team member assignments
- [ ] Set client-specific goals and budgets
- [ ] Configure client branding and preferences

#### Story 5: Client Performance Overview
**As a** service provider admin  
**I want to** see performance metrics for each client  
**So that** I can identify opportunities and issues

**Acceptance Criteria:**
- [ ] Display client-specific analytics
- [ ] Show campaign performance and ROI
- [ ] Track engagement metrics and growth
- [ ] Compare performance across clients
- [ ] Generate client performance reports

---

## Technical Specifications

### Component Interface

#### Main ClientsManager Component
```typescript
interface ClientsManagerProps {
  // Service provider context (from ServiceProviderContext)
  organizationId: string;
  currentUser: ServiceProviderUser;
  
  // View configuration
  viewMode?: 'grid' | 'list' | 'table';
  defaultFilters?: ClientFilters;
  
  // Integration props
  onClientSelect?: (client: ClientAccount) => void;
  onClientCreate?: (client: ClientAccount) => void;
  showClientSwitcher?: boolean;
  
  // Layout props
  className?: string;
  headerActions?: React.ReactNode;
}
```

#### Client Data Types
```typescript
interface ClientAccount {
  id: string;
  name: string;
  organizationId: string; // Service provider org ID
  type: 'municipality' | 'business' | 'startup' | 'nonprofit';
  status: 'active' | 'inactive' | 'onboarding' | 'suspended';
  
  // Contact Information
  contactPerson: string;
  email: string;
  phone?: string;
  website?: string;
  address?: Address;
  
  // Business Details
  industry: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  monthlyBudget?: number;
  goals?: string[];
  
  // Performance Metrics
  performanceScore: number; // 0-100
  activeCampaigns: number;
  totalCampaigns: number;
  engagementRate: number;
  conversionRate: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  
  // Team Assignments
  assignedTeamMembers: TeamMemberAssignment[];
  primaryManager: string; // User ID
  
  // Branding
  logoUrl?: string;
  brandColors?: {
    primary: string;
    secondary: string;
  };
  
  // Settings
  settings: ClientSettings;
}

interface TeamMemberAssignment {
  userId: string;
  userName: string;
  role: 'manager' | 'creator' | 'reviewer' | 'analyst';
  permissions: string[];
  assignedAt: Date;
}

interface ClientFilters {
  status?: string[];
  type?: string[];
  industry?: string[];
  performanceRange?: [number, number];
  budgetRange?: [number, number];
  teamMember?: string;
  search?: string;
}
```

### Component Structure
```
src/components/clients/
├── ClientsManager.tsx              # Main component
├── ClientsList/
│   ├── ClientsGrid.tsx            # Grid view of clients
│   ├── ClientsList.tsx            # List view of clients
│   ├── ClientsTable.tsx           # Table view of clients
│   └── ClientCard.tsx             # Individual client card
├── ClientsFilters/
│   ├── ClientsFilters.tsx         # Filter controls
│   ├── ClientsSearch.tsx          # Search functionality
│   └── ClientsSorting.tsx         # Sorting options
├── ClientsMetrics/
│   ├── ClientsOverview.tsx        # Metrics summary
│   ├── ClientsPerformance.tsx     # Performance rankings
│   └── ClientsGrowth.tsx          # Growth analytics
├── ClientActions/
│   ├── CreateClientModal.tsx      # Create new client
│   ├── BulkActions.tsx           # Bulk operations
│   └── ExportClients.tsx         # Export functionality
└── ClientDetail/
    ├── ClientHeader.tsx           # Client detail header
    ├── ClientOverview.tsx         # Client summary
    ├── ClientMetrics.tsx          # Client analytics
    ├── ClientTeam.tsx             # Team assignments
    └── ClientSettings.tsx         # Client configuration
```

---

## User Interface Design

### Service Provider Clients Page Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [ServiceProviderHeader with ClientSwitcher]                │
├─────────────────────────────────────────────────────────────┤
│ CLIENTS MANAGEMENT                                          │
│                                                             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│ │Total    │ │Active   │ │New This │ │Avg      │            │
│ │Clients  │ │Clients  │ │Month    │ │Score    │            │
│ │   24    │ │   22    │ │   3     │ │  87%    │            │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│                                                             │
│ [Search] [Filter: Status▼] [Filter: Type▼] [+ New Client] │
│                                                             │
│ CLIENT LIST                                [Grid] [List]    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │[🏛️] Municipal│ │[🏢] Tech     │ │[☕] Coffee   │            │
│ │Corp          │ │Startup      │ │Shop         │            │
│ │🟢 Active     │ │🟢 Active    │ │🟡 Review    │            │
│ │Score: 92%    │ │Score: 88%   │ │Score: 76%   │            │
│ │12 campaigns  │ │8 campaigns  │ │5 campaigns  │            │
│ │[View] [Edit] │ │[View] [Edit]│ │[View] [Edit]│            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Create New Client Modal
```
┌─────────────────────────────────────────────────────────────┐
│ ✖ CREATE NEW CLIENT                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Basic Information                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Client Name: [Municipal Government of Springfield]      │ │
│ │ Client Type: [Municipality ▼]                          │ │
│ │ Industry:    [Government & Public Services ▼]          │ │
│ │ Website:     [https://springfield.gov]                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Contact Information                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Primary Contact: [Jane Smith]                          │ │
│ │ Email:          [jane.smith@springfield.gov]           │ │
│ │ Phone:          [+1 (555) 123-4567]                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Team Assignment                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Primary Manager: [John Doe ▼]                          │ │
│ │ Team Members:    [+ Add Team Member]                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                                    [Cancel] [Create Client] │
└─────────────────────────────────────────────────────────────┘
```

---

## API Integration

### Required API Endpoints

#### GET /api/service-provider/clients
```typescript
// Get all clients for service provider
GET /api/service-provider/clients?organizationId=org_123&filters={}
Response: {
  data: ClientAccount[];
  pagination: PaginationInfo;
  summary: {
    total: number;
    active: number;
    newThisMonth: number;
    averageScore: number;
  };
}
```

#### POST /api/service-provider/clients
```typescript
// Create new client
POST /api/service-provider/clients
Body: {
  organizationId: string;
  clientData: Partial<ClientAccount>;
  teamAssignments: TeamMemberAssignment[];
}
Response: {
  data: ClientAccount;
  message: string;
}
```

#### GET /api/service-provider/clients/:id
```typescript
// Get specific client details
GET /api/service-provider/clients/client_123
Response: {
  data: ClientAccount;
  analytics: ClientAnalytics;
  recentActivity: Activity[];
}
```

#### PUT /api/service-provider/clients/:id
```typescript
// Update client information
PUT /api/service-provider/clients/client_123
Body: Partial<ClientAccount>
Response: {
  data: ClientAccount;
  message: string;
}
```

#### GET /api/service-provider/clients/metrics
```typescript
// Get aggregated client metrics
GET /api/service-provider/clients/metrics?organizationId=org_123
Response: {
  data: {
    totalClients: number;
    activeClients: number;
    clientGrowth: number;
    averagePerformance: number;
    topPerformingClients: ClientAccount[];
    clientsByType: Record<string, number>;
    revenueByClient: Record<string, number>;
  };
}
```

---

## Integration Requirements

### ServiceProviderContext Integration
```typescript
// Component uses ServiceProviderContext for:
const {
  state: { organizationId, currentUser, selectedClient },
  switchClient,
  refreshClients,
  hasPermission
} = useServiceProvider();
```

### ServiceProviderDashboard Integration
- Clients list feeds into dashboard metrics
- Client switching updates dashboard context
- Performance data flows to cross-client analytics
- Recent activity includes client-related events

### Permission System Integration
```typescript
// Role-based access control
const canCreateClients = hasPermission('clients', 'create');
const canEditClient = hasPermission('clients', 'edit', clientId);
const canViewClientAnalytics = hasPermission('analytics', 'read', clientId);
```

---

## Key Differences from Current Implementation

### ❌ Current Issues (Non-PRD Compliant)
1. **Single Organization Context**: Uses `useOrganization()` from Clerk (wrong context)
2. **No Service Provider Model**: Treats each organization as individual client
3. **Missing Multi-Client View**: No cross-client analytics or management
4. **Wrong Data Model**: Clients are organizations, not sub-entities
5. **No Client Switching**: Not integrated with ServiceProviderDashboard
6. **Missing Team Assignments**: No role-based client access
7. **No Performance Rankings**: Missing competitive client analytics

### ✅ Required Changes (PRD Compliant)
1. **Service Provider Context**: Use ServiceProviderContext instead of Clerk org
2. **Multi-Client Architecture**: Clients are entities within service provider org
3. **Cross-Client Features**: Analytics, comparisons, rankings
4. **Client Context Switching**: Integration with ServiceProviderDashboard
5. **Team Management**: Assign team members to specific clients
6. **Performance Tracking**: Client scoring and ranking system
7. **B2B2G Workflows**: Service provider managing multiple client accounts

---

## Implementation Priority

### Phase 1: Core Client Management (Week 1)
- [ ] Replace Clerk organization with ServiceProviderContext
- [ ] Implement multi-client data model
- [ ] Create basic clients list and create functionality
- [ ] Add client switching integration

### Phase 2: Enhanced Features (Week 2)
- [ ] Add client performance metrics and rankings
- [ ] Implement team member assignments
- [ ] Create client detail views and editing
- [ ] Add filtering and search capabilities

### Phase 3: Advanced Analytics (Week 3)
- [ ] Integrate with ServiceProviderDashboard analytics
- [ ] Add cross-client performance comparisons
- [ ] Implement client growth tracking
- [ ] Create export and reporting features

---

## Testing Requirements

### Unit Tests
- Client data fetching and display
- Filtering and search functionality
- Client creation and editing
- Permission-based access control

### Integration Tests
- ServiceProviderContext integration
- API endpoint integration
- Client switching functionality
- Dashboard metrics updating

### E2E Tests
- Complete client management workflow
- Multi-client context switching
- Team member assignment flows
- Performance analytics accuracy

---

## Success Criteria

### Functional Requirements
- [ ] Service provider can view all their managed clients
- [ ] Service provider can create new client accounts
- [ ] Service provider can switch between client contexts
- [ ] Service provider can assign team members to clients
- [ ] Service provider can track client performance metrics
- [ ] Team members can access assigned clients only
- [ ] Client data integrates with ServiceProviderDashboard

### Performance Requirements
- [ ] Clients list loads in < 1 second
- [ ] Client switching completes in < 500ms
- [ ] Search and filtering respond in < 300ms
- [ ] Client creation completes in < 2 seconds

### Business Requirements
- [ ] Supports B2B2G service provider business model
- [ ] Enables multi-client account management
- [ ] Provides cross-client analytics and insights
- [ ] Integrates with service provider workflows
- [ ] Maintains client data isolation and security

---

*This TDD ensures the ClientsManager component fully supports the B2B2G service provider business model as specified in the ThriveSend PRD.*