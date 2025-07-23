// Standard API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: any;
  code?: string;
  timestamp: string;
}

// Client API types
export interface ClientResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  industry?: string;
  type: string;
  website?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'ARCHIVED';
  logoUrl?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientWithRelations extends ClientResponse {
  socialAccounts?: SocialAccountResponse[];
  projects?: ProjectResponse[];
}

export interface ClientStatsResponse {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  clientGrowth: number;
  activeClientPercentage: number;
  clientsByType: Record<string, number>;
  clientsByStatus: Record<string, number>;
  projects: {
    total: number;
    active: number;
    completed: number;
    completionRate: number;
  };
}

// Project API types
export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  organizationId: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
  };
}

// Social Account API types
export interface SocialAccountResponse {
  id: string;
  platform: 'FACEBOOK' | 'TWITTER' | 'INSTAGRAM' | 'LINKEDIN';
  handle: string;
  clientId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// Organization API types
export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  primaryColor?: string;
  clerkOrganizationId?: string;
  createdAt: string;
  updatedAt: string;
}

// Form validation types
export interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  industry?: string;
  type: string;
  website?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'ARCHIVED';
  logoUrl?: string;
  organizationId: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  organizationId: string;
  managerId?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  timestamp: string;
}

// Filter types
export interface ClientFilters {
  status?: 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'ARCHIVED' | 'all';
  type?: string;
  industry?: string;
  search?: string;
}

export interface ProjectFilters {
  status?: string;
  clientId?: string;
  search?: string;
}