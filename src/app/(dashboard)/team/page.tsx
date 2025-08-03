'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import ClientAssignmentManager from '@/components/team/ClientAssignmentManager';

// Types for team management
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
  // Client assignments
  clientAssignments: ClientAssignment[];
  // Performance metrics
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

// Role configuration
const roleConfig = {
  OWNER: { 
    label: 'Owner', 
    color: 'bg-purple-100 text-purple-800', 
    description: 'Full system access and management',
    level: 10
  },
  ADMIN: { 
    label: 'Administrator', 
    color: 'bg-red-100 text-red-800', 
    description: 'Administrative access and user management',
    level: 9
  },
  MANAGER: { 
    label: 'Manager', 
    color: 'bg-blue-100 text-blue-800', 
    description: 'Team and project management',
    level: 8
  },
  CLIENT_MANAGER: { 
    label: 'Client Manager', 
    color: 'bg-green-100 text-green-800', 
    description: 'Client relationship management',
    level: 7
  },
  APPROVER: { 
    label: 'Approver', 
    color: 'bg-orange-100 text-orange-800', 
    description: 'Content approval authority',
    level: 6
  },
  PUBLISHER: { 
    label: 'Publisher', 
    color: 'bg-indigo-100 text-indigo-800', 
    description: 'Content publishing and distribution',
    level: 5
  },
  REVIEWER: { 
    label: 'Reviewer', 
    color: 'bg-yellow-100 text-yellow-800', 
    description: 'Content review and quality assurance',
    level: 4
  },
  ANALYST: { 
    label: 'Analyst', 
    color: 'bg-teal-100 text-teal-800', 
    description: 'Analytics and performance tracking',
    level: 3
  },
  CONTENT_CREATOR: { 
    label: 'Content Creator', 
    color: 'bg-pink-100 text-pink-800', 
    description: 'Content creation and development',
    level: 2
  },
} as const;

// Status configuration
const statusConfig = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800' },
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  INACTIVE: { label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
} as const;

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

// Metric card component
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  change?: number;
  isLoading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, description, icon, change, isLoading, trend = 'neutral' }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {change !== undefined && (
              <div className={cn(
                "flex items-center text-xs font-medium mt-1",
                change >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                <TrendingUp className={cn(
                  "mr-1 h-3 w-3",
                  change < 0 && "rotate-180"
                )} />
                {change >= 0 ? '+' : ''}{change}%
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <div className="h-6 w-6 text-primary">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Team member card component
interface TeamMemberCardProps {
  member: TeamMember;
  onEdit?: (member: TeamMember) => void;
  onDelete?: (member: TeamMember) => void;
  onViewDetails?: (member: TeamMember) => void;
}

function TeamMemberCard({ member, onEdit, onDelete, onViewDetails }: TeamMemberCardProps) {
  const roleInfo = roleConfig[member.role];
  const statusInfo = statusConfig[member.status];

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
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
              <h3 className="font-semibold text-lg truncate">{member.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{member.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn("text-xs px-2 py-1", roleInfo.color)}>
                  {roleInfo.label}
                </Badge>
                <Badge className={cn("text-xs px-2 py-1", statusInfo.color)}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Performance metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{member.performance.contentCreated}</p>
            <p className="text-xs text-muted-foreground">Content Created</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{member.performance.clientsManaged}</p>
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
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('members');
  
  // Client-related state
  const [clients, setClients] = useState<any[]>([]);
  const [clientAssignments, setClientAssignments] = useState<ClientAssignment[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  
  const { state: { organizationId } } = useServiceProvider();

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
      } catch (error) {
        console.error('Failed to load clients:', error);
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, [organizationId]);

  // Demo data - in real implementation, this would come from API
  useEffect(() => {
    const loadDemoData = () => {
      const demoMembers: TeamMember[] = [
        {
          id: 'tm-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@thrivesend.com',
          role: 'ADMIN',
          status: 'ACTIVE',
          joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Sarah&backgroundColor=c0aede',
          phone: '+1 (555) 123-4567',
          clientAssignments: [
            {
              id: 'ca-1',
              clientId: 'demo-client-1',
              clientName: 'City of Springfield',
              role: 'MANAGER',
              permissions: ['read', 'write', 'approve', 'publish'],
              assignedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: 'ca-2',
              clientId: 'demo-client-2',
              clientName: 'Regional Health District',
              role: 'REVIEWER',
              permissions: ['read', 'write', 'review'],
              assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ],
          performance: {
            contentCreated: 127,
            reviewsCompleted: 89,
            approvalsGiven: 45,
            clientsManaged: 2,
            averageRating: 4.8,
          }
        },
        {
          id: 'tm-2',
          name: 'Michael Chen',
          email: 'michael.chen@thrivesend.com',
          role: 'CONTENT_CREATOR',
          status: 'ACTIVE',
          joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Michael&backgroundColor=a7f3d0',
          phone: '+1 (555) 987-6543',
          clientAssignments: [
            {
              id: 'ca-3',
              clientId: 'demo-client-1',
              clientName: 'City of Springfield',
              role: 'CREATOR',
              permissions: ['read', 'write'],
              assignedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ],
          performance: {
            contentCreated: 203,
            reviewsCompleted: 15,
            approvalsGiven: 0,
            clientsManaged: 1,
            averageRating: 4.6,
          }
        },
        {
          id: 'tm-3',
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@thrivesend.com',
          role: 'REVIEWER',
          status: 'ACTIVE',
          joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Emily&backgroundColor=fde68a',
          clientAssignments: [
            {
              id: 'ca-4',
              clientId: 'demo-client-2',
              clientName: 'Regional Health District',
              role: 'REVIEWER',
              permissions: ['read', 'review'],
              assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ],
          performance: {
            contentCreated: 45,
            reviewsCompleted: 156,
            approvalsGiven: 12,
            clientsManaged: 1,
            averageRating: 4.9,
          }
        },
        {
          id: 'tm-4',
          name: 'David Thompson',
          email: 'david.thompson@thrivesend.com',
          role: 'CLIENT_MANAGER',
          status: 'PENDING',
          joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          clientAssignments: [],
          performance: {
            contentCreated: 0,
            reviewsCompleted: 0,
            approvalsGiven: 0,
            clientsManaged: 0,
            averageRating: 0,
          }
        }
      ];

      const demoStats: TeamStats = {
        totalMembers: demoMembers.length,
        activeMembers: demoMembers.filter(m => m.status === 'ACTIVE').length,
        pendingInvitations: demoMembers.filter(m => m.status === 'PENDING').length,
        averagePerformance: 4.7,
        membersByRole: demoMembers.reduce((acc, member) => {
          acc[member.role] = (acc[member.role] || 0) + 1;
          return acc;
        }, {} as Record<ServiceProviderRole, number>),
        topPerformers: demoMembers
          .filter(m => m.status === 'ACTIVE')
          .sort((a, b) => b.performance.averageRating - a.performance.averageRating)
          .slice(0, 3)
      };

      setMembers(demoMembers);
      setStats(demoStats);
      
      // Initialize client assignments from member data
      const allAssignments = demoMembers.flatMap(member => 
        member.clientAssignments.map(assignment => ({
          ...assignment,
          memberId: member.id,
          memberName: member.name
        }))
      );
      setClientAssignments(allAssignments);
      
      setLoading(false);
    };

    // Simulate API loading delay
    setTimeout(loadDemoData, 1000);
  }, []);

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
    // TODO: Implement edit functionality
    console.log('Edit member:', member);
  };

  const handleDeleteMember = (member: TeamMember) => {
    // TODO: Implement delete functionality
    console.log('Delete member:', member);
  };

  const handleViewDetails = (member: TeamMember) => {
    // TODO: Implement view details functionality
    console.log('View details:', member);
  };

  const handleAssignmentChange = (assignments: ClientAssignment[]) => {
    setClientAssignments(assignments);
    // In a real implementation, this would sync with the API
    console.log('Updated assignments:', assignments);
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Team Management
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your service provider team, assign roles, and track performance across all client accounts.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 mb-8">
          <Button asChild>
            <Link href="/team/invite">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Team Member
            </Link>
          </Button>
        </div>

        {/* Team metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Members"
            value={stats?.totalMembers || 0}
            description="Team members in organization"
            icon={<Users className="h-6 w-6" />}
            isLoading={loading}
          />
          
          <MetricCard
            title="Active Members"
            value={stats?.activeMembers || 0}
            description="Currently active team members"
            icon={<UserCheck className="h-6 w-6 text-green-600" />}
            isLoading={loading}
          />
          
          <MetricCard
            title="Pending Invitations"
            value={stats?.pendingInvitations || 0}
            description="Awaiting acceptance"
            icon={<Mail className="h-6 w-6 text-yellow-600" />}
            isLoading={loading}
          />
          
          <MetricCard
            title="Avg Performance"
            value={`${stats?.averagePerformance || 0}/5`}
            description="Team performance rating"
            icon={<Award className="h-6 w-6 text-orange-600" />}
            isLoading={loading}
          />
        </div>

        {/* Tabs for different team management views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="assignments">Client Assignments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="space-y-6">
            {/* Search and filters */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search team members..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px] bg-background">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {Object.entries(roleConfig).map(([role, config]) => (
                      <SelectItem key={role} value={role}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bg-background">
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
            </div>

            {/* Loading state */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-8 bg-gray-200 rounded"></div>
                          <div className="h-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error state */}
            {error && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 bg-destructive/10 rounded-full">
                      <Users className="h-6 w-6 text-destructive" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Failed to load team members</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {!loading && !error && filteredMembers.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-muted rounded-full">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No team members found</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    {members.length === 0 
                      ? "Get started by inviting your first team member to collaborate on client projects."
                      : "No team members match your current search criteria. Try adjusting your filters."
                    }
                  </p>
                  {members.length === 0 ? (
                    <Button asChild>
                      <Link href="/team/invite">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite First Team Member
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => {
                      setSearch('');
                      setRoleFilter('all');
                      setStatusFilter('all');
                    }}>
                      Clear Filters
                    </Button>
                  )}
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
      </div>
    </TooltipProvider>
  );
}