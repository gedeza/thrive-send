'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Crown, 
  Shield, 
  Edit, 
  Trash2,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  Copy,
  Search,
  Filter
} from 'lucide-react';
import { useOrganizationSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

// Types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CONTENT_CREATOR' | 'REVIEWER' | 'APPROVER' | 'PUBLISHER';
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  lastActive?: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: 'ADMIN' | 'CONTENT_CREATOR' | 'REVIEWER' | 'APPROVER' | 'PUBLISHER';
  invitedAt: string;
  invitedBy: string;
  expiresAt: string;
}

// Form schemas
const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'CONTENT_CREATOR', 'REVIEWER', 'APPROVER', 'PUBLISHER'])
});

type InviteFormData = z.infer<typeof inviteSchema>;

// Mock data
const mockMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@acmecorp.com',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    status: 'active',
    joinedAt: '2024-01-15T00:00:00Z',
    lastActive: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@acmecorp.com',
    role: 'CONTENT_CREATOR',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150',
    status: 'active',
    joinedAt: '2024-02-01T00:00:00Z',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@acmecorp.com',
    role: 'REVIEWER',
    status: 'pending',
    joinedAt: '2024-03-10T00:00:00Z'
  }
];

const mockPendingInvites: PendingInvite[] = [
  {
    id: '1',
    email: 'alex@newcompany.com',
    role: 'PUBLISHER',
    invitedAt: '2024-03-15T00:00:00Z',
    invitedBy: 'John Smith',
    expiresAt: '2024-03-22T00:00:00Z'
  }
];

// Role configuration
const ROLE_CONFIG = {
  ADMIN: { 
    label: 'Administrator', 
    color: 'bg-red-100 text-red-800', 
    icon: <Crown className="h-3 w-3" />,
    description: 'Full access to all features and settings'
  },
  CONTENT_CREATOR: { 
    label: 'Content Creator', 
    color: 'bg-blue-100 text-blue-800', 
    icon: <Edit className="h-3 w-3" />,
    description: 'Can create and edit content'
  },
  REVIEWER: { 
    label: 'Reviewer', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: <Shield className="h-3 w-3" />,
    description: 'Can review and provide feedback'
  },
  APPROVER: { 
    label: 'Approver', 
    color: 'bg-green-100 text-green-800', 
    icon: <Check className="h-3 w-3" />,
    description: 'Can approve content for publishing'
  },
  PUBLISHER: { 
    label: 'Publisher', 
    color: 'bg-purple-100 text-purple-800', 
    icon: <Mail className="h-3 w-3" />,
    description: 'Can publish approved content'
  }
};

// Member item component
function MemberItem({ member, onUpdateRole, onRemove, canManage }: {
  member: TeamMember;
  onUpdateRole: (memberId: string, role: TeamMember['role']) => void;
  onRemove: (memberId: string) => void;
  canManage: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const roleConfig = ROLE_CONFIG[member.role];
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {member.avatar ? (
            <AvatarImage src={member.avatar} alt={member.name} />
          ) : (
            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
          )}
        </Avatar>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{member.name}</span>
            {member.status === 'pending' && (
              <Badge variant="outline" className="text-xs">Pending</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{member.email}</p>
          {member.lastActive && (
            <p className="text-xs text-muted-foreground">
              {formatLastActive(member.lastActive)}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {isEditing && canManage ? (
          <div className="flex items-center gap-2">
            <Select
              value={member.role}
              onValueChange={(value: TeamMember['role']) => {
                onUpdateRole(member.id, value);
                setIsEditing(false);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      {config.icon}
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Badge variant="secondary" className={roleConfig.color}>
              {roleConfig.icon}
              <span className="ml-1">{roleConfig.label}</span>
            </Badge>
            
            {canManage && (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(member.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Pending invite item
function PendingInviteItem({ invite, onResend, onRevoke }: {
  invite: PendingInvite;
  onResend: (inviteId: string) => void;
  onRevoke: (inviteId: string) => void;
}) {
  const roleConfig = ROLE_CONFIG[invite.role];
  const isExpired = new Date(invite.expiresAt) < new Date();
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Mail className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{invite.email}</span>
            {isExpired ? (
              <Badge variant="destructive" className="text-xs">Expired</Badge>
            ) : (
              <Badge variant="outline" className="text-xs">Pending</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Invited by {invite.invitedBy} • Expires {new Date(invite.expiresAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className={roleConfig.color}>
          {roleConfig.icon}
          <span className="ml-1">{roleConfig.label}</span>
        </Badge>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onResend(invite.id)}
            className="h-8 px-2"
          >
            Resend
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRevoke(invite.id)}
            className="h-8 px-2 text-destructive hover:text-destructive"
          >
            Revoke
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main component
export default function MemberManagementSettings() {
  const { canManage } = useOrganizationSettings();
  const [members, setMembers] = useState<TeamMember[]>(mockMembers);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(mockPendingInvites);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showInviteForm, setShowInviteForm] = useState(false);
  
  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'CONTENT_CREATOR'
    }
  });
  
  const { register, handleSubmit, formState: { errors }, reset } = form;
  
  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });
  
  // Handle invite submission
  const onSubmitInvite = async (data: InviteFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newInvite: PendingInvite = {
        id: Date.now().toString(),
        email: data.email,
        role: data.role,
        invitedAt: new Date().toISOString(),
        invitedBy: 'Current User',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setPendingInvites([...pendingInvites, newInvite]);
      reset();
      setShowInviteForm(false);
      
    } catch (error) {
      console.error('Failed to send invite:', error);
    }
  };
  
  const handleUpdateRole = (memberId: string, role: TeamMember['role']) => {
    setMembers(members.map(member =>
      member.id === memberId ? { ...member, role } : member
    ));
  };
  
  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(member => member.id !== memberId));
  };
  
  const handleResendInvite = (inviteId: string) => {
    console.log('Resending invite:', inviteId);
  };
  
  const handleRevokeInvite = (inviteId: string) => {
    setPendingInvites(pendingInvites.filter(invite => invite.id !== inviteId));
  };
  
  if (!canManage) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to manage team members. Please contact an administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <Button onClick={() => setShowInviteForm(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Team stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">
                {members.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {members.filter(m => m.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {members.filter(m => m.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {pendingInvites.length}
              </div>
              <div className="text-sm text-muted-foreground">Invited</div>
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      {config.icon}
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Members list */}
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <MemberItem
                key={member.id}
                member={member}
                onUpdateRole={handleUpdateRole}
                onRemove={handleRemoveMember}
                canManage={canManage}
              />
            ))}
          </div>
          
          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || roleFilter !== 'all' 
                ? 'No members match your search criteria'
                : 'No team members found'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Form */}
      {showInviteForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmitInvite)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    {...register('email')}
                    placeholder="colleague@company.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={form.watch('role')}
                    onValueChange={(value: TeamMember['role']) => form.setValue('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              {config.icon}
                              {config.label}
                            </div>
                            <p className="text-xs text-muted-foreground">{config.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">Send Invitation</Button>
                <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations ({pendingInvites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <PendingInviteItem
                  key={invite.id}
                  invite={invite}
                  onResend={handleResendInvite}
                  onRevoke={handleRevokeInvite}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(ROLE_CONFIG).map(([role, config]) => (
              <div key={role} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className={config.color}>
                    {config.icon}
                    <span className="ml-1">{config.label}</span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}