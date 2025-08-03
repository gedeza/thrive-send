# 📝 ContentManager Technical Design Document (TDD)

## Document Information
- **Component**: ContentManager (B2B2G Service Provider Content Management System)
- **Version**: 1.0.0
- **Date**: January 2025
- **Status**: Implementation Ready
- **Priority**: 🔴 **CRITICAL** - Core business functionality
- **Compliance Target**: 100% PRD Compliant B2B2G Service Provider Model

---

## 🎯 **EXECUTIVE SUMMARY**

### **Business Context**
Transform ThriveSend's content management system from single-tenant SaaS to B2B2G service provider platform enabling agencies to manage content across multiple client accounts with sophisticated client-specific workflows, templates, and analytics.

### **Current State vs Target State**
```
CURRENT (Single-Tenant):          TARGET (B2B2G Service Provider):
┌─────────────────────┐            ┌─────────────────────────────────┐
│ useAuth (Clerk)     │  =====>    │ useServiceProvider Context      │
│ Single Organization │            │ Multi-Client Management         │
│ Basic Content CRUD  │            │ Client-Specific Content         │
│ Simple Analytics    │            │ Cross-Client Analytics         │
│ No Client Context   │            │ Advanced Client Workflows       │
└─────────────────────┘            └─────────────────────────────────┘

PRD Compliance: 15% → 100%
```

---

## 🏗️ **ARCHITECTURE SPECIFICATION**

### **1. Service Provider Content Context**
```typescript
interface ServiceProviderContentContext {
  // Service Provider Organization
  organizationId: string;
  organizationType: 'service_provider';
  
  // Client Context
  selectedClient: ClientSummary | null;
  availableClients: ClientSummary[];
  
  // Content Management
  contentLibraries: {
    [clientId: string]: ContentLibrary;
  };
  sharedTemplates: Template[];
  
  // Permissions
  canCreateContentFor: (clientId: string) => boolean;
  canEditClientContent: (clientId: string, contentId: string) => boolean;
  canShareContentAcrossClients: () => boolean;
}
```

### **2. Multi-Client Content Architecture**
```typescript
interface ClientContentLibrary {
  clientId: string;
  clientName: string;
  
  // Content Organization
  categories: ContentCategory[];
  tags: ClientTag[];
  customFields: CustomField[];
  
  // Client-Specific Settings
  brandGuidelines: BrandGuidelines;
  approvalWorkflow: ApprovalWorkflow;
  publishingSchedule: PublishingSchedule;
  
  // Performance Tracking
  contentMetrics: ContentMetrics;
  engagementTargets: EngagementTargets;
}
```

### **3. Cross-Client Content Features**
```typescript
interface CrossClientContentFeatures {
  // Template Sharing
  shareTemplateWithClients: (templateId: string, clientIds: string[]) => Promise<void>;
  
  // Bulk Operations
  createCampaignAcrossClients: (campaign: Campaign, clientIds: string[]) => Promise<void>;
  
  // Analytics
  getCrossClientPerformance: () => Promise<CrossClientAnalytics>;
  
  // Content Distribution
  distributeContentToClients: (contentId: string, distribution: DistributionSettings) => Promise<void>;
}
```

---

## 🎨 **USER INTERFACE SPECIFICATIONS**

### **1. Enhanced Content Dashboard**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 Service Provider Content Management                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Client Selector ▼] [All Clients] [📊 Cross-Client Analytics]   │
│                                                                 │
│ ┌─ Client Performance ────┐ ┌─ Content Metrics ────┐           │
│ │ 📈 Springfield: 92%     │ │ 📝 Total Content: 847 │           │
│ │ 🏢 TechStart: 88%       │ │ ✅ Published: 623     │           │
│ │ ☕ Coffee Co: 76%       │ │ 📋 Draft: 224         │           │
│ └─────────────────────────┘ └───────────────────────┘           │
│                                                                 │
│ ┌─ Quick Actions ──────────────────────────────────────────────┐ │
│ │ [+ New Content] [📋 Templates] [🚀 Bulk Campaign]          │ │
│ │ [📊 Analytics] [⚙️ Client Settings] [🔄 Cross-Client]      │ │
│ └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **2. Client-Specific Content Library**
```
┌─────────────────────────────────────────────────────────────────┐
│ 📁 Springfield Municipal Content Library                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [🏛️ Springfield] [← Back to Overview] [⚙️ Client Settings]      │
│                                                                 │
│ ┌─ Performance Metrics ────────────────────────────────────────┐ │
│ │ 📈 Engagement: 4.2%  📊 Reach: 12.5K  🎯 Score: 92%       │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Filters: [📝 All Types ▼] [✅ Published ▼] [🏷️ Tags ▼]         │
│                                                                 │
│ ┌─ Content Grid ─────────────────────────────────────────────────┐ │
│ │ [📰 City Council Meeting] [📸 Summer Festival] [📧 Newsletter]│ │
│ │ [🎥 Public Safety Video] [📱 Social Campaign] [📊 Report]    │ │
│ └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **3. Cross-Client Content Analytics**
```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 Cross-Client Content Performance Analytics                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ Top Performing Clients ─────────────────────────────────────┐ │
│ │ 🥇 Springfield Municipal (92% avg)                           │ │
│ │ 🥈 TechStart Inc (88% avg)                                   │ │
│ │ 🥉 Local Coffee Co (76% avg)                                 │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─ Content Type Performance ───────────────────────────────────┐ │
│ │ 📧 Email: 89% │ 📱 Social: 84% │ 📰 Blog: 78% │ 📹 Video: 92%│ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─ Cross-Client Campaign Results ──────────────────────────────┐ │
│ │ Summer Festival Campaign (3 clients): +156% engagement      │ │
│ │ Public Health Initiative (2 clients): +98% reach           │ │
│ └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **1. Core Service Provider Integration**
```typescript
// Replace Clerk useAuth with ServiceProvider context
// BEFORE (Single-Tenant):
const { userId, orgId } = useAuth();

// AFTER (B2B2G Service Provider):
const { 
  state: { organizationId, selectedClient }, 
  switchClient,
  hasContentPermission 
} = useServiceProvider();
```

### **2. Client-Aware Content APIs**
```typescript
// Enhanced API endpoints with client context
GET    /api/service-provider/content?organizationId={id}&clientId={clientId}
POST   /api/service-provider/content/create
PUT    /api/service-provider/content/{id}/update
DELETE /api/service-provider/content/{id}/delete

// Cross-client operations  
GET    /api/service-provider/content/cross-client/analytics
POST   /api/service-provider/content/cross-client/campaign
GET    /api/service-provider/content/templates/shared
```

### **3. Enhanced Content Data Model**
```typescript
interface ServiceProviderContent extends BaseContent {
  // Client Association
  clientId: string;
  clientName: string;
  
  // Service Provider Fields
  serviceProviderId: string;
  createdByUserId: string;
  assignedTeam: TeamMember[];
  
  // Client-Specific Metadata
  clientCategory: string;
  clientTags: string[];
  clientApprovalStatus: 'pending' | 'approved' | 'revision_requested';
  
  // Performance Tracking
  performanceMetrics: {
    clientEngagementRate: number;
    crossClientBenchmark: number;
    clientROI: number;
  };
  
  // Template & Sharing
  isTemplate: boolean;
  sharedWithClients: string[];
  originalTemplateId?: string;
}
```

---

## 📊 **PERFORMANCE REQUIREMENTS**

### **1. Loading Performance**
- **Content Library Load**: < 800ms (with client switching)
- **Cross-Client Analytics**: < 1.2s (aggregated data)
- **Content Creation**: < 400ms (form initialization)
- **Client Context Switch**: < 300ms (seamless transition)

### **2. Data Management**
- **Client Content Isolation**: 100% secure client data separation
- **Cross-Client Analytics**: Real-time aggregation across all clients
- **Template Sharing**: Instant template distribution to selected clients
- **Bulk Operations**: Handle 100+ content items across multiple clients

### **3. User Experience**
- **Context Awareness**: Always show current client context
- **Permission Clarity**: Clear indicators of content permissions
- **Seamless Navigation**: Smooth transitions between client contexts
- **Progressive Loading**: Smart content loading strategies

---

## 🔒 **SECURITY & PERMISSIONS**

### **1. Client Data Isolation**
```typescript
interface ContentPermissions {
  // Client-Specific Permissions
  canViewClientContent: (clientId: string) => boolean;
  canEditClientContent: (clientId: string, contentId: string) => boolean;
  canDeleteClientContent: (clientId: string, contentId: string) => boolean;
  
  // Cross-Client Permissions
  canShareContentBetweenClients: () => boolean;
  canViewCrossClientAnalytics: () => boolean;
  canManageClientTemplates: () => boolean;
  
  // Service Provider Permissions
  canManageAllClientsContent: () => boolean;
  canAccessClientApprovalWorkflows: (clientId: string) => boolean;
}
```

### **2. Role-Based Access Control**
- **Service Provider Admin**: All content management capabilities
- **Client Manager**: Specific client content management
- **Content Creator**: Content creation for assigned clients
- **Content Reviewer**: Review and approval workflows
- **Content Analyst**: Analytics and performance insights

---

## 🧪 **TESTING STRATEGY**

### **1. Component Testing**
- **Content Library**: Client-specific content loading and filtering
- **Content Creation**: Multi-client content creation workflows
- **Template System**: Template sharing and customization
- **Analytics**: Cross-client performance calculations

### **2. Integration Testing**  
- **ServiceProvider Context**: Client switching with content context
- **API Integration**: Client-aware content CRUD operations
- **Permission System**: Role-based content access control
- **Dashboard Integration**: Content metrics in ServiceProviderDashboard

### **3. Performance Testing**
- **Load Testing**: Multiple clients with large content libraries
- **Response Time**: API performance with client context switching
- **Memory Usage**: Efficient client data management
- **Concurrent Users**: Multi-user content management

---

## 📈 **SUCCESS METRICS**

### **1. PRD Compliance Targets**
- **Week 1**: 40% PRD compliance (Service Provider integration)
- **Week 2**: 70% PRD compliance (Enhanced content features)  
- **Week 3**: 95% PRD compliance (Full dashboard integration)

### **2. Performance Benchmarks**
- **Content Load Time**: < 800ms (improved from current)
- **Client Switch Time**: < 300ms (new capability)
- **Cross-Client Analytics**: < 1.2s (new capability)
- **User Task Completion**: +200% efficiency vs single-tenant

### **3. Feature Completeness**
- ✅ **Client-Specific Content Libraries**: Full implementation
- ✅ **Cross-Client Template Sharing**: Advanced sharing workflows
- ✅ **Service Provider Analytics**: Comprehensive performance insights
- ✅ **Multi-Client Campaign Management**: Bulk operations support

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Week 1: Service Provider Foundation** 🔴
**Objective**: Transform core content management to B2B2G architecture

#### **Day 1-2: Context Integration**
- Replace `useAuth` with `useServiceProvider` in main content page
- Update ContentForm to include client context
- Add client selection to content creation workflow

#### **Day 3-4: API Transformation**
- Update content APIs to support client context
- Add service provider content data model
- Implement client-aware content filtering

#### **Day 5-7: Testing & Integration**
- Test content creation with client context
- Validate client-specific content isolation
- Integration with ServiceProviderContext

**Success Criteria**: 
- ✅ Content creation works with client context
- ✅ Client-specific content libraries functional
- ✅ No breaking changes to existing functionality

### **Week 2: Enhanced Content Features** 🟡
**Objective**: Add advanced service provider content capabilities

#### **Day 1-3: Template System**
- Implement cross-client template sharing
- Add template customization for clients
- Build template library interface

#### **Day 4-5: Analytics Enhancement**
- Add client-specific content analytics
- Implement cross-client performance comparison
- Build content performance dashboards

#### **Day 6-7: Workflow Improvements**
- Enhanced content approval workflows
- Bulk content operations across clients
- Advanced content scheduling

**Success Criteria**:
- ✅ Template sharing system functional
- ✅ Client-specific analytics implemented
- ✅ Advanced workflows operational

### **Week 3: Dashboard Integration** 🟢
**Objective**: Complete integration with ServiceProviderDashboard

#### **Day 1-3: Dashboard Components**
- Add content metrics to ServiceProviderDashboard
- Implement content performance rankings
- Build cross-client content widgets

#### **Day 4-5: Navigation Integration**
- Seamless navigation from dashboard to content
- Client context preservation across navigation
- Enhanced breadcrumb navigation

#### **Day 6-7: Final Testing**
- End-to-end testing of complete workflow
- Performance optimization
- User acceptance testing

**Success Criteria**:
- ✅ Full ServiceProviderDashboard integration
- ✅ Seamless client context switching
- ✅ 95%+ PRD compliance achieved

---

## 🎯 **IMMEDIATE NEXT STEPS**

### **Ready to Execute: Week 1 Foundation**

1. **Replace useAuth in main content page** (`src/app/(dashboard)/content/page.tsx`)
2. **Update ContentForm with client context** (`src/components/content/ContentForm.tsx`)
3. **Modify content APIs for client support** (`/api/content/*`)
4. **Add client selection to content workflows**

### **Quick Wins Available**
- **Content creation with client context**: 2-3 hours
- **Client-specific content filtering**: 3-4 hours  
- **Basic client context switching**: 4-5 hours

---

## 📋 **DELIVERABLES CHECKLIST**

### **Week 1 Deliverables**
- [ ] Service Provider context integration in main content components
- [ ] Client-aware content APIs  
- [ ] Client selection in content creation
- [ ] Updated content data model with client association
- [ ] Basic client-specific content filtering

### **Week 2 Deliverables**  
- [ ] Cross-client template sharing system
- [ ] Client-specific content analytics
- [ ] Enhanced approval workflows
- [ ] Bulk content operations
- [ ] Content performance dashboards  

### **Week 3 Deliverables**
- [ ] ServiceProviderDashboard content integration
- [ ] Cross-client content metrics widgets
- [ ] Seamless navigation and context switching
- [ ] Complete end-to-end testing
- [ ] 95%+ PRD compliance validation

---

*This TDD represents the complete blueprint for transforming ThriveSend's content management system from single-tenant SaaS to B2B2G service provider platform using our proven systematic methodology.*

**Status**: 🎯 **IMPLEMENTATION READY** | **Priority**: 🔴 **CRITICAL** | **Timeline**: 3 weeks systematic transformation