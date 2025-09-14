// Team Management Constants
export const TEAM_CONSTANTS = {
  // Page titles and descriptions
  TEAM_MANAGEMENT_TITLE: 'Team Management',
  TEAM_MANAGEMENT_DESCRIPTION: 'Manage your service provider team, assign roles, and track performance across all client accounts.',
  INVITE_TEAM_MEMBER_TITLE: 'Invite Team Member',
  INVITE_TEAM_MEMBER_DESCRIPTION: 'Add a new team member to your service provider organization',

  // Action labels
  INVITE_TEAM_MEMBER: 'Invite Team Member',
  INVITE_FIRST_TEAM_MEMBER: 'Invite First Team Member',
  BACK_TO_TEAM: 'Back to Team',
  SEND_INVITATION: 'Send Invitation',
  SENDING_INVITATION: 'Sending Invitation...',

  // Tab labels
  TAB_TEAM_MEMBERS: 'Team Members',
  TAB_CLIENT_ASSIGNMENTS: 'Client Assignments',

  // Section titles
  BASIC_INFORMATION: 'Basic Information',
  ROLE_PERMISSIONS: 'Role & Permissions',
  CLIENT_ASSIGNMENTS: 'Client Assignments',
  INVITATION_MESSAGE: 'Invitation Message',
  SEARCH_FILTER_TITLE: 'Search & Filter Team Members',

  // Form labels
  FIRST_NAME: 'First Name',
  LAST_NAME: 'Last Name',
  EMAIL_ADDRESS: 'Email Address',
  SERVICE_PROVIDER_ROLE: 'Service Provider Role',
  PERSONAL_MESSAGE: 'Personal Message (Optional)',
  SEND_INVITATION_EMAIL: 'Send invitation email',

  // Placeholders
  ENTER_FIRST_NAME: 'Enter first name',
  ENTER_LAST_NAME: 'Enter last name',
  ENTER_EMAIL: 'Enter email address',
  SEARCH_TEAM_MEMBERS: 'Search team members...',
  SELECT_ROLE: 'Select a role for this team member',
  ADD_CLIENT_ASSIGNMENT: 'Add client assignment...',
  ADD_PERSONAL_MESSAGE: 'Add a personal message to the invitation email...',

  // Metric labels
  TOTAL_MEMBERS: 'Total Members',
  TOTAL_MEMBERS_DESC: 'Team members in organization',
  ACTIVE_MEMBERS: 'Active Members',
  ACTIVE_MEMBERS_DESC: 'Currently active team members',
  PENDING_INVITATIONS: 'Pending Invitations',
  PENDING_INVITATIONS_DESC: 'Awaiting acceptance',
  AVG_PERFORMANCE: 'Avg Performance',
  AVG_PERFORMANCE_DESC: 'Team performance rating',

  // Performance metrics
  CONTENT_CREATED: 'Content Created',
  CLIENTS_MANAGED: 'Clients Managed',
  REVIEWS_COMPLETED: 'Reviews Completed',
  APPROVALS_GIVEN: 'Approvals Given',
  AVG_RATING: 'Avg Rating',

  // Status and activity
  LAST_ACTIVE: 'Last active',
  JOINED: 'Joined',
  JUST_NOW: 'Just now',

  // Actions and buttons
  VIEW_DETAILS: 'View Details',
  EDIT_MEMBER: 'Edit Member',
  REMOVE_MEMBER: 'Remove Member',
  SAVE_CHANGES: 'Save Changes',
  CANCEL: 'Cancel',
  TRY_AGAIN: 'Try Again',
  CLEAR_FILTERS: 'Clear Filters',

  // Modal titles
  EDIT_TEAM_MEMBER_TITLE: 'Edit Team Member',
  EDIT_TEAM_MEMBER_DESC: 'Update member information and role',
  REMOVE_TEAM_MEMBER_TITLE: 'Remove Team Member',
  REMOVE_TEAM_MEMBER_CONFIRM: 'Are you sure you want to remove {name} from the team? This action cannot be undone.',

  // Form fields
  NAME: 'Name',
  EMAIL: 'Email',
  ROLE: 'Role',
  PHONE: 'Phone',
  STATUS: 'Status',
  CLIENT_ROLE: 'Client Role',
  PERMISSIONS: 'Permissions',

  // Messages and notifications
  INVITATION_SUCCESS: 'Invitation sent to {email} successfully!',
  MEMBER_ADDED_SUCCESS: 'Team member {name} added successfully!',
  INVITATION_FAILED: 'Failed to send invitation',
  LOADING_CLIENTS: 'Loading client data...',
  CLIENT_ALREADY_ASSIGNED: 'Client already assigned',
  NO_ORGANIZATION: 'No organization selected',
  FAILED_LOAD_CLIENTS: 'Failed to load clients',

  // Empty states
  NO_TEAM_MEMBERS: 'No team members found',
  NO_TEAM_MEMBERS_DESC_EMPTY: 'Get started by inviting your first team member to collaborate on client projects.',
  NO_TEAM_MEMBERS_DESC_FILTERED: 'No team members match your current search criteria. Try adjusting your filters.',
  NO_CLIENT_ASSIGNMENTS: 'No Client Assignments',
  NO_CLIENT_ASSIGNMENTS_DESC: 'This team member won\'t have access to any specific clients. They will only have organization-level access based on their role.',

  // Error states
  FAILED_LOAD_TEAM: 'Failed to load team members',
  ORGANIZATION_CONTEXT_MISSING: 'Organization Context Missing',
  ORGANIZATION_CONTEXT_DESC: 'Unable to load organization context. Please refresh the page or contact support if the issue persists.',

  // Filters
  ALL_ROLES: 'All Roles',
  ALL_STATUS: 'All Status',
  FILTER_BY_ROLE: 'Filter by role',

  // Tooltips
  CLIENT_ASSIGNMENT_TOOLTIP: 'Select which clients this team member can access and their role for each client',

  // Time periods
  HOURS_AGO: '{hours}h ago',
  DAYS_AGO: '{days}d ago',
  WEEKS_AGO: '{weeks}w ago',

  // Client assignments
  CLIENT_ASSIGNMENTS_COUNT: '{count} assigned',
  CLIENT_ASSIGNMENTS_LIST_COUNT: 'Client Assignments ({count})',
  NO_CLIENT_ASSIGNMENTS_TEXT: 'No client assignments',

  // Performance
  PERFORMANCE_METRICS: 'Performance Metrics',
  VS_LAST_PERIOD: 'vs last period',

  // Loading states
  LOADING_TEAM_MEMBERS: 'Loading team members...',
} as const;

// Role configuration with production-ready descriptions
export const ROLE_CONFIG = {
  OWNER: {
    label: 'Owner',
    description: 'Full system access and management capabilities with complete organizational control',
    level: 10,
    priority: 'highest' as const
  },
  ADMIN: {
    label: 'Administrator',
    description: 'Complete administrative access including team management and organizational settings',
    level: 9,
    priority: 'highest' as const,
    permissions: ['manage_team', 'manage_clients', 'manage_campaigns', 'manage_content', 'view_analytics', 'manage_billing']
  },
  MANAGER: {
    label: 'Manager',
    description: 'Project and team management with comprehensive client oversight capabilities',
    level: 8,
    priority: 'high' as const,
    permissions: ['manage_projects', 'assign_team', 'manage_campaigns', 'manage_content', 'view_analytics']
  },
  CLIENT_MANAGER: {
    label: 'Client Manager',
    description: 'Dedicated client relationship management and account oversight specialist',
    level: 7,
    priority: 'high' as const,
    permissions: ['manage_client_relationships', 'view_client_analytics', 'manage_campaigns', 'communicate_clients']
  },
  APPROVER: {
    label: 'Approver',
    description: 'Content approval authority with strategic campaign oversight responsibilities',
    level: 6,
    priority: 'medium' as const,
    permissions: ['approve_content', 'manage_campaigns', 'view_analytics']
  },
  PUBLISHER: {
    label: 'Publisher',
    description: 'Content publishing and distribution management across all channels',
    level: 5,
    priority: 'medium' as const,
    permissions: ['publish_content', 'manage_social_accounts', 'schedule_content']
  },
  REVIEWER: {
    label: 'Reviewer',
    description: 'Content review and quality assurance with editorial oversight',
    level: 4,
    priority: 'medium' as const,
    permissions: ['review_content', 'edit_content', 'view_analytics']
  },
  ANALYST: {
    label: 'Analyst',
    description: 'Analytics and performance tracking specialist with data insights focus',
    level: 3,
    priority: 'medium' as const,
    permissions: ['view_analytics', 'create_reports', 'export_data']
  },
  CONTENT_CREATOR: {
    label: 'Content Creator',
    description: 'Content creation and development with creative production focus',
    level: 2,
    priority: 'standard' as const,
    permissions: ['create_content', 'edit_own_content', 'view_basic_analytics']
  },
} as const;

// Status configuration
export const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', isSuccess: true },
  PENDING: { label: 'Pending', isSuccess: false },
  INACTIVE: { label: 'Inactive', isSuccess: false },
} as const;

// Client role options for assignments
export const CLIENT_ROLE_OPTIONS = [
  {
    value: 'MANAGER' as const,
    label: 'Client Manager',
    description: 'Full client account management with all permissions',
    permissions: ['read', 'write', 'approve', 'publish', 'manage_team']
  },
  {
    value: 'CREATOR' as const,
    label: 'Content Creator',
    description: 'Create and edit content for this client account',
    permissions: ['read', 'write']
  },
  {
    value: 'REVIEWER' as const,
    label: 'Content Reviewer',
    description: 'Review and provide feedback on client content',
    permissions: ['read', 'review', 'comment']
  },
  {
    value: 'ANALYST' as const,
    label: 'Analytics Specialist',
    description: 'View analytics and create performance reports',
    permissions: ['read', 'view_analytics', 'export_data']
  }
];