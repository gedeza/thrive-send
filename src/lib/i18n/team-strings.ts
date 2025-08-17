/**
 * Team module internationalization strings
 * 
 * This file contains all hardcoded text from the team module
 * organized for future i18n implementation.
 */

export const teamStrings = {
  // Page headers and descriptions
  pageTitle: "Team Management",
  pageDescription: "Manage your service provider team, assign roles, and track performance across all client accounts.",
  invitePageTitle: "Invite Team Member",
  
  // Navigation and actions
  inviteTeamMember: "Invite Team Member",
  inviteFirstTeamMember: "Invite First Team Member",
  viewDetails: "View Details", 
  editMember: "Edit Member",
  removeMember: "Remove Member",
  saveChanges: "Save Changes",
  cancel: "Cancel",
  clearFilters: "Clear Filters",
  
  // Tabs and sections
  teamMembers: "Team Members",
  clientAssignments: "Client Assignments",
  
  // Metrics and stats
  totalMembers: "Total Members",
  activeMembers: "Active Members", 
  pendingInvitations: "Pending Invitations",
  avgPerformance: "Avg Performance",
  teamPerformanceRating: "Team performance rating",
  teamMembersInOrganization: "Team members in organization",
  currentlyActiveTeamMembers: "Currently active team members",
  awaitingAcceptance: "Awaiting acceptance",
  
  // Performance metrics
  contentCreated: "Content Created",
  reviewsCompleted: "Reviews Completed",
  approvalsGiven: "Approvals Given",
  clientsManaged: "Clients Managed",
  averageRating: "Avg Rating",
  
  // Time and activity
  lastActive: "Last active",
  joined: "Joined",
  justNow: "Just now",
  hoursAgo: "h ago",
  daysAgo: "d ago", 
  weeksAgo: "w ago",
  
  // Search and filters
  searchTeamMembers: "Search team members...",
  filterByRole: "Filter by role",
  allRoles: "All Roles",
  allStatus: "All Status",
  status: "Status",
  
  // Role types
  roles: {
    owner: "Owner",
    admin: "Administrator", 
    manager: "Manager",
    clientManager: "Client Manager",
    approver: "Approver",
    publisher: "Publisher",
    reviewer: "Reviewer",
    analyst: "Analyst",
    contentCreator: "Content Creator",
  },
  
  // Role descriptions
  roleDescriptions: {
    owner: "Full system access and management",
    admin: "Administrative access and user management",
    manager: "Team and project management", 
    clientManager: "Client relationship management",
    approver: "Content approval authority",
    publisher: "Content publishing and distribution",
    reviewer: "Content review and quality assurance",
    analyst: "Analytics and performance tracking",
    contentCreator: "Content creation and development",
  },
  
  // Status types
  statuses: {
    active: "Active",
    pending: "Pending", 
    inactive: "Inactive",
  },
  
  // Form fields
  name: "Name",
  email: "Email",
  emailAddress: "Email Address",
  firstName: "First Name",
  lastName: "Last Name", 
  phone: "Phone",
  role: "Role",
  message: "Message",
  rolePermissions: "Role Permissions",
  sendEmail: "Send Email",
  clientAssignments: "Client Assignments",
  
  // Permissions
  permissions: {
    viewContent: "View Content",
    createEditContent: "Create/Edit Content", 
    reviewContent: "Review Content",
    approveContent: "Approve Content",
    publishContent: "Publish Content",
    manageTeam: "Manage Team",
    manageClients: "Manage Clients",
    analytics: "Analytics",
  },
  
  // Permission descriptions
  permissionDescriptions: {
    read: "Can view all content and analytics for this client",
    write: "Can create and edit content for this client",
    review: "Can review and provide feedback on content", 
    approve: "Can approve content for publishing",
    publish: "Can publish content to social platforms",
    manageTeam: "Can assign other team members to this client",
    manageClients: "Can manage client settings and information",
    analytics: "Can view analytics and performance data",
  },
  
  // Success messages
  success: {
    memberAdded: "Team member added successfully",
    memberUpdated: "Team member updated successfully", 
    memberRemoved: "Team member removed successfully",
    invitationSent: "Invitation sent successfully!",
    invitationAccepted: "Invitation accepted successfully",
    invitationRejected: "Invitation rejected",
    invitationCancelled: "Invitation cancelled",
    invitationResent: "Invitation resent successfully",
  },
  
  // Error messages
  errors: {
    memberNotFound: "Team member not found",
    unauthorized: "You don't have access to this team member",
    emailAlreadyExists: "A team member with this email already exists", 
    organizationRequired: "No organization selected. Please select an organization first.",
    failedToLoad: "Failed to load team members",
    failedToLoadClients: "Failed to load clients",
    failedToCreate: "Failed to add team member",
    failedToUpdate: "Failed to update team member", 
    failedToDelete: "Failed to remove team member",
    failedToSendInvitation: "Failed to send invitation",
    networkError: "Network error occurred. Please try again.",
    unexpectedError: "An unexpected error occurred. Please try again later.",
    invalidEmailFormat: "Invalid email format",
    missingRequiredFields: "Missing required fields",
    databaseUnavailable: "Database unavailable. Team member could not be added.",
  },
  
  // Loading and empty states
  states: {
    loading: "Loading team members...",
    noMembers: "No team members found",
    noMembersDescription: "Get started by inviting your first team member to collaborate on client projects.",
    noMembersFilterDescription: "No team members match your current search criteria. Try adjusting your filters.",
    errorLoadingMembers: "Failed to load team members",
    tryAgain: "Try Again",
    refresh: "Refresh",
  },
  
  // Form placeholders and labels
  placeholders: {
    searchMembers: "Search by name, email, or role...",
    firstName: "Enter first name",
    lastName: "Enter last name", 
    email: "member@company.com",
    phone: "+1 (555) 123-4567",
    message: "Optional message for the invitation...",
    selectRole: "Select a role...",
  },
  
  // Invitation flow
  invitation: {
    title: "Team Invitation", 
    sendInvitation: "Send Invitation",
    inviteNewMember: "Invite New Member",
    personalInformation: "Personal Information",
    roleAndPermissions: "Role & Permissions",
    optionalMessage: "Optional Message",
    reviewAndSend: "Review & Send",
    invitationPreview: "Invitation Preview",
    noClientAssignments: "No Client Assignments",
    emailWillBeSent: "An email invitation will be sent to",
    directlyAddToTeam: "Directly add to team without email",
  },
  
  // Confirmation dialogs
  confirmations: {
    removeMemberTitle: "Remove Team Member",
    removeMemberDescription: "Are you sure you want to remove {memberName} from the team? This action cannot be undone.",
    removeMemberConfirm: "Remove Member",
    editMemberTitle: "Edit Team Member", 
    editMemberDescription: "Update member information and role",
  },
  
  // Assignment management
  assignments: {
    manageAssignments: "Manage Client Assignments",
    assignMember: "Assign Member",
    unassignMember: "Unassign Member", 
    noAssignments: "No client assignments",
    assignmentRole: "Assignment Role",
    assignmentPermissions: "Permissions",
    clientName: "Client Name",
    memberName: "Member Name",
    assignedAt: "Assigned",
    manager: "Manager",
    creator: "Creator", 
    reviewer: "Reviewer",
    analyst: "Analyst",
  },
  
  // Demo mode
  demo: {
    runningInDemoMode: "(Running in demo mode)",
    demoInvitationCreated: "Demo invitation created",
    databaseUnavailable: "Database unavailable for team operations",
  },
  
  // Navigation
  navigation: {
    backToTeam: "Back to Team",
    teamOverview: "Team Overview",
    invitations: "Invitations", 
    settings: "Team Settings",
  },
  
  // Performance tracking
  performance: {
    performanceMetrics: "Performance Metrics",
    thisMonth: "This Month",
    thisWeek: "This Week", 
    overall: "Overall",
    productivity: "Productivity",
    quality: "Quality",
    collaboration: "Collaboration",
  },
  
  // Time periods
  timePeriods: {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly", 
    quarterly: "Quarterly",
  },
} as const;

export type TeamStringKeys = keyof typeof teamStrings;