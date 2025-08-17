/**
 * Client module internationalization strings
 * 
 * This file contains all hardcoded text from the clients module
 * organized for future i18n implementation.
 */

export const clientStrings = {
  // Page headers and descriptions
  pageTitle: "Client Management",
  pageDescription: "Build and manage strong client relationships. Track engagement, monitor projects, and grow your business partnerships.",
  
  // Navigation and actions
  newClient: "New Client",
  addClient: "Add Client",
  editClient: "Edit Client",
  deleteClient: "Delete Client",
  viewClient: "View Client",
  
  // Form labels
  clientName: "Client Name",
  clientNameRequired: "Client Name *",
  clientType: "Client Type",
  clientTypeRequired: "Client Type *",
  emailAddress: "Email Address",
  emailAddressRequired: "Email Address *",
  phoneNumber: "Phone Number",
  website: "Website",
  industry: "Industry",
  address: "Address",
  status: "Status",
  
  // Client types
  clientTypes: {
    municipality: "Municipality",
    business: "Business",
    startup: "Startup",
    individual: "Individual",
    nonprofit: "Nonprofit",
  },
  
  // Client statuses
  clientStatuses: {
    active: "Active",
    inactive: "Inactive",
    lead: "Lead",
    archived: "Archived",
  },
  
  // Filter options
  filters: {
    allStatus: "All Status",
    allTypes: "All Types",
    allIndustries: "All Industries",
    searchPlaceholder: "Search clients...",
  },
  
  // Validation messages
  validation: {
    nameRequired: "Name is required",
    nameMinLength: "Name must be at least 2 characters",
    nameMaxLength: "Name must be less than 100 characters",
    emailRequired: "Email is required",
    emailInvalid: "Invalid email format",
    phoneInvalid: "Invalid phone number format",
    phoneMinLength: "Phone number must be at least 10 digits",
    phoneMaxLength: "Phone number must be less than 20 digits",
    websiteInvalid: "Invalid website URL",
    addressMaxLength: "Address must be less than 500 characters",
    industryMaxLength: "Industry must be less than 100 characters",
    typeRequired: "Client type is required",
  },
  
  // Success messages
  success: {
    clientCreated: "Client created successfully!",
    clientUpdated: "Client updated successfully!",
    clientDeleted: "Client deleted successfully!",
  },
  
  // Error messages
  errors: {
    clientNotFound: "Client not found",
    unauthorized: "You don't have access to this client",
    emailAlreadyExists: "A client with this email already exists in this organization",
    organizationRequired: "No organization selected. Please select an organization first.",
    failedToCreate: "Failed to create client",
    failedToUpdate: "Failed to update client",
    failedToDelete: "Failed to delete client",
    failedToLoad: "Failed to load clients",
    networkError: "Network error occurred. Please try again.",
    unexpectedError: "An unexpected error occurred. Please try again later.",
  },
  
  // Demo mode
  demo: {
    runningInDemoMode: "(Running in demo mode)",
    databaseUnavailable: "Running in demo mode - database unavailable",
  },
  
  // View modes
  viewModes: {
    grid: "Grid View",
    list: "List View",
  },
  
  // Stats and metrics
  stats: {
    totalClients: "Total Clients",
    activeClients: "Active Clients",
    newThisMonth: "New This Month",
    clientGrowth: "Client Growth",
  },
  
  // Loading and empty states
  states: {
    loading: "Loading clients...",
    noClients: "No clients found",
    noClientsDescription: "Start by adding your first client to begin managing relationships.",
    errorLoadingClients: "Error loading clients",
    tryAgain: "Try Again",
    refresh: "Refresh",
  },
  
  // Form placeholders
  placeholders: {
    clientName: "Enter client name",
    email: "client@example.com",
    phone: "+1 (555) 123-4567",
    website: "https://example.com",
    industry: "Select industry",
    address: "Enter full address",
    selectClientType: "Select client type...",
    searchClients: "Search by name, email, or industry...",
  },
  
  // Actions and buttons
  actions: {
    save: "Save Client",
    cancel: "Cancel",
    create: "Create Client",
    update: "Update Client",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    filter: "Filter",
    clear: "Clear Filters",
    reset: "Reset",
    search: "Search",
    export: "Export",
    import: "Import",
  },
  
  // Social accounts
  socialAccounts: {
    title: "Social Accounts",
    addAccount: "Add Social Account",
    platform: "Platform",
    handle: "Handle",
    followers: "Followers",
    noAccounts: "No social accounts added",
  },
  
  // Projects
  projects: {
    title: "Projects",
    activeProjects: "Active Projects",
    completedProjects: "Completed Projects",
    totalProjects: "Total Projects",
    noProjects: "No projects found",
    viewAllProjects: "View All Projects",
  },
} as const;

export type ClientStringKeys = keyof typeof clientStrings;