'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeamData } from '@/hooks/use-team-data';
import type { TeamMember, TeamStats, ClientAssignment, ServiceProviderRole } from '@/hooks/use-team-data';
import { 
  Plus, 
  Users, 
  UserCheck, 
  Settings, 
  Mail, 
  Phone, 
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  Eye,
  Filter,
  Search,
  TrendingUp,
  Activity,
  Clock,
  Award
} from 'lucide-react';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ClientAssignmentManager from '@/components/team/ClientAssignmentManager';
import { TEAM_CONSTANTS, ROLE_CONFIG, STATUS_CONFIG } from '@/constants/team-constants';

// Types are now imported from the hook

// Use imported configurations from constants

function getInitials(name: string) {
  const words = name.split(' ');
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
}

function formatRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

// Simplified metric card component - Single border treatment
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  change?: number;
  isLoading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

const getMetricCardStyle = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('total') || lowerTitle.includes('members')) {
    return {
      cardStyle: 'card-enhanced border-l-2 border-primary/20',
      iconBg: 'p-3 bg-primary/10 rounded-lg border border-primary/20',
      iconColor: 'h-6 w-6 text-primary',
      valueColor: 'text-2xl font-bold text-primary tracking-tight'
    };
  }
  if (lowerTitle.includes('active')) {
    return {
      cardStyle: 'card-enhanced border-l-2 border-success/20',
      iconBg: 'p-3 bg-success/10 rounded-lg border border-success/20',
      iconColor: 'h-6 w-6 text-success',
      valueColor: 'text-2xl font-bold text-success tracking-tight'
    };
  }
  if (lowerTitle.includes('pending') || lowerTitle.includes('invitation')) {
    return {
      cardStyle: 'card-enhanced border-l-2 border-muted/20',
      iconBg: 'p-3 bg-muted/10 rounded-lg border border-muted/20',
      iconColor: 'h-6 w-6 text-muted-foreground',
      valueColor: 'text-2xl font-bold text-muted-foreground tracking-tight'
    };
  }
  return {
    cardStyle: 'card-enhanced border-l-2 border-primary/20',
    iconBg: 'p-3 bg-primary/10 rounded-lg border border-primary/20',
    iconColor: 'h-6 w-6 text-primary',
    valueColor: 'text-2xl font-bold text-primary tracking-tight'
  };
};

function MetricCard({ title, value, description, icon, change, isLoading, trend = 'neutral' }: MetricCardProps) {
  const styles = getMetricCardStyle(title);
  
  if (isLoading) {
    return (
      <Card className="card-enhanced border-l-2 border-muted/20 hover:shadow-professional transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-10 w-24 rounded" />
              </div>
              <div className="p-3 bg-muted/10 rounded-lg border border-muted/20">
                <Skeleton className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${styles.cardStyle} hover:shadow-professional transition-shadow duration-200`}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
              <p className={styles.valueColor}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            </div>
            <div className={styles.iconBg}>
              <div className={styles.iconColor}>
                {icon}
              </div>
            </div>
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground font-medium">{description}</p>
          )}
          
          {change !== undefined && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
              change >= 0 ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}>
              {change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <div className="h-3 w-3 rotate-180">
                  <TrendingUp className="h-3 w-3" />
                </div>
              )}
              <span>{change >= 0 ? '+' : ''}{change}%</span>
              <span>vs last period</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced role styling functions for team member cards
const getRoleCardStyle = (role: ServiceProviderRole) => {
  const config = ROLE_CONFIG[role];
  if (config.level >= 9) return 'card-enhanced border-l-2 border-destructive/20';
  if (config.level >= 7) return 'card-enhanced border-l-2 border-primary/20';
  if (config.level >= 5) return 'card-enhanced border-l-2 border-success/20';
  return 'card-enhanced border-l-2 border-muted/20';
};

const getRoleBadgeStyle = (role: ServiceProviderRole) => {
  const config = ROLE_CONFIG[role];
  if (config.level >= 9) return 'bg-destructive/10 text-destructive border border-destructive/20';
  if (config.level >= 7) return 'bg-primary/10 text-primary border border-primary/20';
  if (config.level >= 5) return 'bg-success/10 text-success border border-success/20';
  return 'bg-muted/10 text-muted-foreground border border-muted/20';
};

// Simplified team member card component
interface TeamMemberCardProps {
  member: TeamMember;
  onEdit?: (member: TeamMember) => void;
  onDelete?: (member: TeamMember) => void;
  onViewDetails?: (member: TeamMember) => void;
}

function TeamMemberCard({ member, onEdit, onDelete, onViewDetails }: TeamMemberCardProps) {
  const roleInfo = ROLE_CONFIG[member.role];
  const statusInfo = STATUS_CONFIG[member.status];
  const cardStyle = getRoleCardStyle(member.role);
  const roleBadgeStyle = getRoleBadgeStyle(member.role);

  return (
    <Card className={`${cardStyle} hover:shadow-professional transition-shadow duration-200`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={`${member.name} avatar`}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary border-2 border-primary/20 font-semibold">
                {getInitials(member.name)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-lg truncate">{member.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{member.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn("text-xs px-2 py-1", roleBadgeStyle)}>
                  {roleInfo.label}
                </Badge>
                <Badge
                  className={cn(
                    "text-xs px-2 py-1",
                    statusInfo.isSuccess ? "bg-success/10 text-success border border-success/20" : "bg-muted/10 text-muted-foreground border border-muted/20"
                  )}
                >
                  {statusInfo.label}
                </Badge>
                {(member as any).isDemo && (
                  <Badge className="text-xs px-2 py-1 bg-blue/10 text-blue border border-blue/20">
                    Demo
                  </Badge>
                )}
                {(member as any).isPending && (
                  <Badge className="text-xs px-2 py-1 bg-orange/10 text-orange border border-orange/20">
                    Pending Invitation
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {!(member as any).isDemo && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(member as any).isPending ? (
                  // Pending invitation actions
                  <>
                    <DropdownMenuItem onClick={() => onViewDetails?.(member)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Invitation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {/* TODO: Resend invitation */}}>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Invitation
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete?.(member)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Invitation
                    </DropdownMenuItem>
                  </>
                ) : (
                  // Active member actions
                  <>
                    <DropdownMenuItem onClick={() => onViewDetails?.(member)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(member)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Member
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete?.(member)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Member
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Performance metrics - Unified styling */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{member.performance.contentCreated}</p>
            <p className="text-xs text-muted-foreground">Content Created</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{member.performance.clientsManaged}</p>
            <p className="text-xs text-muted-foreground">Clients Managed</p>
          </div>
        </div>

        {/* Client assignments */}
        {member.clientAssignments.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Client Assignments ({member.clientAssignments.length})</p>
            <div className="flex flex-wrap gap-1">
              {member.clientAssignments.slice(0, 3).map((assignment) => (
                <Badge key={assignment.id} variant="outline" className="text-xs">
                  {assignment.clientName}
                </Badge>
              ))}
              {member.clientAssignments.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{member.clientAssignments.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Footer with last activity */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last active: {formatRelativeTime(member.lastActivity)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Joined: {formatDate(member.joinedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamManagementPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('members');
  
  // Modal state
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Client-related state
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  
  const { state: { organizationId } } = useServiceProvider();
  
  // Use live data hook instead of hardcoded demo data
  const { members, stats, isLoading: loading, error, refetch } = useTeamData(organizationId);

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      try {
        if (!organizationId) return;
        
        setLoadingClients(true);
        const response = await fetch(`/api/service-provider/clients?organizationId=${organizationId}`);
        if (response.ok) {
          const clientsData = await response.json();
          setClients(clientsData);
        }
      } catch (_error) {
        // Handle client loading error silently
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, [organizationId]);

  // Initialize client assignments from live team data using useMemo
  const clientAssignments = useMemo(() => {
    if (members.length > 0) {
      return members.flatMap(member => 
        member.clientAssignments.map(assignment => ({
          ...assignment,
          memberId: member.id,
          memberName: member.name
        }))
      );
    }
    return [];
  }, [members]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    let filtered = members;

    // Text search
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        member.role.toLowerCase().includes(term)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    return filtered;
  }, [members, search, roleFilter, statusFilter]);

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleDeleteMember = (member: TeamMember) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (member: TeamMember) => {
    setSelectedMember(member);
    setShowDetailModal(true);
  };

  const handleSaveEdit = () => {
    // Implementation placeholder for API call to save changes
    setShowEditModal(false);
    setSelectedMember(null);
  };

  const handleConfirmDelete = async () => {
    // Implementation placeholder for API call to delete member
    if (selectedMember) {
      // In a real implementation, this would call DELETE API
      // await deleteTeamMember(selectedMember.id);
      refetch();
    }
    setShowDeleteModal(false);
    setSelectedMember(null);
  };

  const handleAssignmentChange = (assignments: ClientAssignment[]) => {
    // In a real implementation, this would sync with the API
    // Implementation placeholder: Update member assignments via API call
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto py-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">{TEAM_CONSTANTS.TEAM_MANAGEMENT_TITLE}</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {TEAM_CONSTANTS.TEAM_MANAGEMENT_DESCRIPTION}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2">
          <Button asChild>
            <Link href="/team/invite" className="inline-flex items-center">
              <UserPlus className="mr-2 h-4 w-4" />
              {TEAM_CONSTANTS.INVITE_TEAM_MEMBER}
            </Link>
          </Button>
        </div>

        {/* Team metrics - Unified styling */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title={TEAM_CONSTANTS.TOTAL_MEMBERS}
            value={stats?.totalMembers || 0}
            description={TEAM_CONSTANTS.TOTAL_MEMBERS_DESC}
            icon={<Users className="h-6 w-6" />}
            isLoading={loading}
          />

          <MetricCard
            title={TEAM_CONSTANTS.ACTIVE_MEMBERS}
            value={stats?.activeMembers || 0}
            description={TEAM_CONSTANTS.ACTIVE_MEMBERS_DESC}
            icon={<UserCheck className="h-6 w-6" />}
            isLoading={loading}
          />

          <MetricCard
            title={TEAM_CONSTANTS.PENDING_INVITATIONS}
            value={stats?.pendingInvitations || 0}
            description={TEAM_CONSTANTS.PENDING_INVITATIONS_DESC}
            icon={<Mail className="h-6 w-6" />}
            isLoading={loading}
          />

          <MetricCard
            title={TEAM_CONSTANTS.AVG_PERFORMANCE}
            value={`${stats?.averagePerformance || 0}/5`}
            description={TEAM_CONSTANTS.AVG_PERFORMANCE_DESC}
            icon={<Award className="h-6 w-6" />}
            isLoading={loading}
          />
        </div>

        {/* Tabs for different team management views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">{TEAM_CONSTANTS.TAB_TEAM_MEMBERS}</TabsTrigger>
            <TabsTrigger value="assignments">{TEAM_CONSTANTS.TAB_CLIENT_ASSIGNMENTS}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="space-y-6">
            {/* Search and filters */}
            <Card className="card-enhanced border-l-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  Search & Filter Team Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search team members..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                        <SelectItem key={role} value={role}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Loading state */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-muted rounded-full"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-8 bg-muted rounded"></div>
                          <div className="h-8 bg-muted rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error state */}
            {error && (
              <Card className="card-enhanced border-l-2 border-destructive/20">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                      <Users className="h-8 w-8 text-destructive" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load team members</h3>
                  <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                    className="border-destructive/20 hover:bg-destructive/10"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {!loading && !error && filteredMembers.length === 0 && (
              <Card className="card-enhanced border-l-2 border-muted/20 border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-muted/10 rounded-lg border border-muted/20">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No team members found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {members.length === 0 
                      ? "Get started by inviting your first team member to collaborate on client projects."
                      : "No team members match your current search criteria. Try adjusting your filters."
                    }
                  </p>
                  {members.length === 0 ? (
                    <Button asChild className="inline-flex items-center gap-2">
                      <Link href="/team/invite">
                        <UserPlus className="h-4 w-4" />
                        Invite First Team Member
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => {
                      setSearch('');
                      setRoleFilter('all');
                      setStatusFilter('all');
                    }} className="border-muted/20 hover:bg-muted/10">
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Demo data info banner */}
            {!loading && !error && filteredMembers.length > 0 && filteredMembers.some((m: any) => m.isDemo) && (
              <Card className="bg-blue/5 border-blue/20 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue/10 rounded-lg border border-blue/20">
                      <Users className="h-5 w-5 text-blue" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue mb-1">Demo Team Members</h4>
                      <p className="text-sm text-blue/80">
                        These are example team members to help you understand the interface. They will automatically disappear when you add your first real team member.
                      </p>
                    </div>
                    <Button asChild size="sm" className="bg-blue hover:bg-blue/90">
                      <Link href="/team/invite" className="inline-flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add Real Member
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team members grid */}
            {!loading && !error && filteredMembers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    onEdit={handleEditMember}
                    onDelete={handleDeleteMember}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-6">
            <ClientAssignmentManager
              organizationId={organizationId || 'demo-org'}
              clients={clients}
              teamMembers={members}
              assignments={clientAssignments}
              onAssignmentChange={handleAssignmentChange}
            />
          </TabsContent>
        </Tabs>

        {/* Team Member Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedMember?.avatarUrl ? (
                  <img
                    src={selectedMember.avatarUrl}
                    alt={`${selectedMember.name} avatar`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary font-semibold">
                    {selectedMember && getInitials(selectedMember.name)}
                  </div>
                )}
                {selectedMember?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedMember?.email} • {selectedMember && ROLE_CONFIG[selectedMember.role].label}
              </DialogDescription>
            </DialogHeader>
            
            {selectedMember && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge 
                        variant={statusConfig[selectedMember.status].isSuccess ? "default" : "outline"}
                        className={cn(
                          "text-xs px-2 py-1",
                          statusConfig[selectedMember.status].isSuccess && "bg-success/10 text-success border-success/20"
                        )}
                      >
                        {statusConfig[selectedMember.status].label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="mt-1 text-sm">{selectedMember.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Joined</Label>
                    <p className="mt-1 text-sm">{formatDate(selectedMember.joinedAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Activity</Label>
                    <p className="mt-1 text-sm">{formatRelativeTime(selectedMember.lastActivity)}</p>
                  </div>
                </div>

                {/* Performance Metrics - Unified styling */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-3 block">Performance Metrics</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{selectedMember.performance.contentCreated}</p>
                      <p className="text-xs text-muted-foreground">Content Created</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{selectedMember.performance.reviewsCompleted}</p>
                      <p className="text-xs text-muted-foreground">Reviews Completed</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{selectedMember.performance.approvalsGiven}</p>
                      <p className="text-xs text-muted-foreground">Approvals Given</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{selectedMember.performance.averageRating}/5</p>
                      <p className="text-xs text-muted-foreground">Avg Rating</p>
                    </div>
                  </div>
                </div>

                {/* Client Assignments */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Client Assignments ({selectedMember.clientAssignments.length})
                  </Label>
                  {selectedMember.clientAssignments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedMember.clientAssignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{assignment.clientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.role} • Assigned {formatDate(assignment.assignedAt)}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {assignment.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-3 border rounded-lg text-center">
                      No client assignments
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Member Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
              <DialogDescription>
                Update member information and role
              </DialogDescription>
            </DialogHeader>
            
            {selectedMember && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="memberName">Name</Label>
                  <Input
                    id="memberName"
                    defaultValue={selectedMember.name}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="memberEmail">Email</Label>
                  <Input
                    id="memberEmail"
                    type="email"
                    defaultValue={selectedMember.email}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="memberRole">Role</Label>
                  <Select defaultValue={selectedMember.role}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                        <SelectItem key={role} value={role}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="memberPhone">Phone</Label>
                  <Input
                    id="memberPhone"
                    defaultValue={selectedMember.phone || ''}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Remove Team Member</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {selectedMember?.name} from the team? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {selectedMember && (
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedMember.avatarUrl ? (
                    <img
                      src={selectedMember.avatarUrl}
                      alt={`${selectedMember.name} avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary font-semibold">
                      {getInitials(selectedMember.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{selectedMember.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {ROLE_CONFIG[selectedMember.role].label} • {selectedMember.clientAssignments.length} client assignments
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Remove Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}