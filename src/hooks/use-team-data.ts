import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

// Types (matching the teams page)
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: ServiceProviderRole;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  joinedAt: string;
  lastActivity: string;
  avatarUrl?: string;
  phone?: string;
  clientAssignments: ClientAssignment[];
  performance: {
    contentCreated: number;
    reviewsCompleted: number;
    approvalsGiven: number;
    clientsManaged: number;
    averageRating: number;
  };
}

interface ClientAssignment {
  id: string;
  clientId: string;
  clientName: string;
  role: 'MANAGER' | 'CREATOR' | 'REVIEWER' | 'ANALYST';
  permissions: string[];
  assignedAt: string;
}

type ServiceProviderRole = 
  | 'OWNER'
  | 'ADMIN' 
  | 'MANAGER'
  | 'CONTENT_CREATOR'
  | 'REVIEWER'
  | 'APPROVER'
  | 'PUBLISHER'
  | 'ANALYST'
  | 'CLIENT_MANAGER';

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  averagePerformance: number;
  membersByRole: Record<ServiceProviderRole, number>;
  topPerformers: TeamMember[];
}

interface TeamInvitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: ServiceProviderRole;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  invitedAt: string;
  invitedBy: string;
  clientAssignments: ClientAssignment[];
}

// Fetch team members from API
async function fetchTeamMembers(organizationId: string): Promise<TeamMember[]> {
  // Fetching team members from API
  
  const response = await fetch(`/api/service-provider/team/members?organizationId=${organizationId}`);
  
  if (!response.ok) {
    // Failed to fetch team members from API
    throw new Error(`Failed to fetch team members: ${response.status}`);
  }
  
  const data = await response.json();
  // Team members loaded from API
  // Handle both wrapped and unwrapped API responses
  return Array.isArray(data) ? data : (data.data || []);
}

// Fetch team invitations from API
async function fetchTeamInvitations(organizationId: string): Promise<TeamInvitation[]> {
  // Fetching team invitations from API
  
  const response = await fetch(`/api/service-provider/team/invitations?organizationId=${organizationId}`);
  
  if (!response.ok) {
    // Failed to fetch team invitations from API
    throw new Error(`Failed to fetch team invitations: ${response.status}`);
  }
  
  const data = await response.json();
  // Team invitations loaded from API
  // Handle both wrapped and unwrapped API responses
  return Array.isArray(data) ? data : (data.data || []);
}

// Calculate team statistics
function calculateTeamStats(members: TeamMember[], invitations: TeamInvitation[]): TeamStats {
  const safeMembers = Array.isArray(members) ? members : [];
  const safeInvitations = Array.isArray(invitations) ? invitations : [];
  const pendingInvitations = safeInvitations.filter(inv => inv.status === 'PENDING').length;
  const activeMembers = safeMembers.filter(m => m.status === 'ACTIVE').length;
  
  // Calculate average performance
  const totalRating = safeMembers.reduce((sum, member) => sum + member.performance.averageRating, 0);
  const averagePerformance = safeMembers.length > 0 ? totalRating / safeMembers.length : 0;
  
  // Count members by role
  const membersByRole = safeMembers.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<ServiceProviderRole, number>);
  
  // Get top performers
  const topPerformers = safeMembers
    .filter(m => m.status === 'ACTIVE')
    .sort((a, b) => b.performance.averageRating - a.performance.averageRating)
    .slice(0, 3);
  
  return {
    totalMembers: safeMembers.length,
    activeMembers,
    pendingInvitations,
    averagePerformance: Math.round(averagePerformance * 10) / 10,
    membersByRole,
    topPerformers
  };
}

// Main hook for team data
export function useTeamData(organizationId?: string) {
  
  // Fetch team members
  const {
    data: members = [],
    isLoading: loadingMembers,
    error: membersError,
    refetch: refetchMembers
  } = useQuery({
    queryKey: ['team-members', organizationId],
    queryFn: () => fetchTeamMembers(organizationId!),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Fetch team invitations
  const {
    data: invitations = [],
    isLoading: loadingInvitations,
    error: invitationsError,
    refetch: refetchInvitations
  } = useQuery({
    queryKey: ['team-invitations', organizationId],
    queryFn: () => fetchTeamInvitations(organizationId!),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Calculate stats using useMemo to avoid infinite loops
  const stats = useMemo(() => {
    const calculatedStats = calculateTeamStats(members, invitations);
    // Team stats calculated
    return calculatedStats;
  }, [members, invitations]);

  // Refetch all data
  const refetchAll = () => {
    refetchMembers();
    refetchInvitations();
  };

  return {
    members,
    invitations,
    stats,
    isLoading: loadingMembers || loadingInvitations,
    error: membersError || invitationsError,
    refetch: refetchAll,
  };
}

export type { TeamMember, TeamStats, TeamInvitation, ClientAssignment, ServiceProviderRole };