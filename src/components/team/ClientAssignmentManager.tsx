'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Plus, 
  X, 
  Edit, 
  Shield, 
  Check,
  AlertCircle,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatarUrl?: string;
}

interface ClientAssignment {
  id: string;
  memberId: string;
  memberName: string;
  clientId: string;
  clientName: string;
  role: 'MANAGER' | 'CREATOR' | 'REVIEWER' | 'ANALYST';
  permissions: string[];
  assignedAt: string;
}

interface Client {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface ClientAssignmentManagerProps {
  organizationId: string;
  clients: Client[];
  teamMembers: TeamMember[];
  assignments: ClientAssignment[];
  onAssignmentChange?: (assignments: ClientAssignment[]) => void;
}

// Permission definitions
const permissionDefinitions = {
  read: {
    label: 'View Content',
    description: 'Can view all content and analytics for this client'
  },
  write: {
    label: 'Create/Edit Content',
    description: 'Can create and edit content for this client'
  },
  review: {
    label: 'Review Content',
    description: 'Can review and provide feedback on content'
  },
  approve: {
    label: 'Approve Content',
    description: 'Can approve content for publishing'
  },
  publish: {
    label: 'Publish Content',
    description: 'Can publish content to social platforms'
  },
  manage_team: {
    label: 'Manage Team',
    description: 'Can assign other team members to this client'
  },
  view_analytics: {
    label: 'View Analytics',
    description: 'Can access detailed analytics and reports'
  },
  export_data: {
    label: 'Export Data',
    description: 'Can export analytics and content data'
  },
  manage_campaigns: {
    label: 'Manage Campaigns',
    description: 'Can create and manage marketing campaigns'
  },
  communicate_clients: {
    label: 'Client Communication',
    description: 'Can communicate directly with client contacts'
  }
};

// Role-based default permissions
const rolePermissions = {
  MANAGER: ['read', 'write', 'review', 'approve', 'publish', 'manage_team', 'view_analytics', 'export_data', 'manage_campaigns', 'communicate_clients'],
  CREATOR: ['read', 'write', 'view_analytics'],
  REVIEWER: ['read', 'review', 'view_analytics'],
  ANALYST: ['read', 'view_analytics', 'export_data']
};

function getInitials(name: string) {
  const words = name.split(' ');
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function ClientAssignmentManager({ 
  organizationId, 
  clients, 
  teamMembers, 
  assignments, 
  onAssignmentChange 
}: ClientAssignmentManagerProps) {
  const [localAssignments, setLocalAssignments] = useState<ClientAssignment[]>(assignments);
  const [editingAssignment, setEditingAssignment] = useState<ClientAssignment | null>(null);
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    memberId: '',
    clientId: '',
    role: 'CREATOR' as const,
    permissions: ['read', 'write']
  });

  // Update local state when props change
  useEffect(() => {
    setLocalAssignments(assignments);
  }, [assignments]);

  // Add new assignment
  const handleAddAssignment = () => {
    if (!newAssignment.memberId || !newAssignment.clientId) return;

    const member = teamMembers.find(m => m.id === newAssignment.memberId);
    const client = clients.find(c => c.id === newAssignment.clientId);
    
    if (!member || !client) return;

    // Check if assignment already exists
    if (localAssignments.find(a => a.memberId === newAssignment.memberId && a.clientId === newAssignment.clientId)) {
      return; // Assignment already exists
    }

    const assignment: ClientAssignment = {
      id: `ca-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      clientId: client.id,
      clientName: client.name,
      role: newAssignment.role,
      permissions: newAssignment.permissions,
      assignedAt: new Date().toISOString()
    };

    const updatedAssignments = [...localAssignments, assignment];
    setLocalAssignments(updatedAssignments);
    onAssignmentChange?.(updatedAssignments);

    // Reset form
    setNewAssignment({
      memberId: '',
      clientId: '',
      role: 'CREATOR',
      permissions: ['read', 'write']
    });
    setIsAddingAssignment(false);
  };

  // Remove assignment
  const handleRemoveAssignment = (assignmentId: string) => {
    const updatedAssignments = localAssignments.filter(a => a.id !== assignmentId);
    setLocalAssignments(updatedAssignments);
    onAssignmentChange?.(updatedAssignments);
  };

  // Update assignment permissions
  const handleUpdatePermissions = (assignmentId: string, permissions: string[]) => {
    const updatedAssignments = localAssignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, permissions }
        : assignment
    );
    setLocalAssignments(updatedAssignments);
    onAssignmentChange?.(updatedAssignments);
  };

  // Update assignment role
  const handleUpdateRole = (assignmentId: string, role: 'MANAGER' | 'CREATOR' | 'REVIEWER' | 'ANALYST') => {
    const defaultPermissions = rolePermissions[role] || ['read'];
    const updatedAssignments = localAssignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, role, permissions: defaultPermissions }
        : assignment
    );
    setLocalAssignments(updatedAssignments);
    onAssignmentChange?.(updatedAssignments);
  };

  // Get available members for a client (not already assigned)
  const getAvailableMembersForClient = (clientId: string) => {
    const assignedMemberIds = localAssignments
      .filter(a => a.clientId === clientId)
      .map(a => a.memberId);
    
    return teamMembers.filter(member => !assignedMemberIds.includes(member.id));
  };

  // Get assignments by client
  const getAssignmentsByClient = (clientId: string) => {
    return localAssignments.filter(a => a.clientId === clientId);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Client-Specific Permissions
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage team member access and permissions for each client
            </p>
          </div>
          
          <Dialog open={isAddingAssignment} onOpenChange={setIsAddingAssignment}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Client Assignment</DialogTitle>
                <DialogDescription>
                  Assign a team member to a specific client with defined permissions.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Member</label>
                  <Select value={newAssignment.memberId} onValueChange={(value) => 
                    setNewAssignment({ ...newAssignment, memberId: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                              {getInitials(member.name)}
                            </div>
                            <span>{member.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Client</label>
                  <Select value={newAssignment.clientId} onValueChange={(value) => 
                    setNewAssignment({ ...newAssignment, clientId: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-2">
                            <span>{client.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {client.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={newAssignment.role} onValueChange={(value: any) => 
                    setNewAssignment({ 
                      ...newAssignment, 
                      role: value,
                      permissions: rolePermissions[value as keyof typeof rolePermissions] || ['read']
                    })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(rolePermissions).map(([role, perms]) => (
                        <SelectItem key={role} value={role}>
                          <div>
                            <div className="font-medium">{role.replace('_', ' ')}</div>
                            <div className="text-xs text-muted-foreground">
                              {perms.length} permissions
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddingAssignment(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAssignment}>
                    Add Assignment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Client-based assignments */}
        {clients.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Clients Available</AlertTitle>
            <AlertDescription>
              Add clients to your organization before assigning team members.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {clients.map(client => {
              const clientAssignments = getAssignmentsByClient(client.id);
              
              return (
                <Card key={client.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{client.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {client.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {clientAssignments.length} members
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    {clientAssignments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No team members assigned to this client</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {clientAssignments.map(assignment => (
                          <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                {getInitials(assignment.memberName)}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{assignment.memberName}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {assignment.role}
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-wrap gap-1">
                                  {assignment.permissions.slice(0, 4).map(permission => (
                                    <Badge key={permission} variant="secondary" className="text-xs">
                                      {permissionDefinitions[permission as keyof typeof permissionDefinitions]?.label || permission}
                                    </Badge>
                                  ))}
                                  {assignment.permissions.length > 4 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{assignment.permissions.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => setEditingAssignment(assignment)}>
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Edit Permissions</DialogTitle>
                                    <DialogDescription>
                                      Manage {assignment.memberName}'s access to {assignment.clientName}
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-6 py-4">
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Role</label>
                                      <Select 
                                        value={assignment.role} 
                                        onValueChange={(value: any) => handleUpdateRole(assignment.id, value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Object.keys(rolePermissions).map(role => (
                                            <SelectItem key={role} value={role}>
                                              {role.replace('_', ' ')}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-3">
                                      <label className="text-sm font-medium">Permissions</label>
                                      <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(permissionDefinitions).map(([permission, config]) => (
                                          <div key={permission} className="flex items-start space-x-2">
                                            <Checkbox
                                              id={`${assignment.id}-${permission}`}
                                              checked={assignment.permissions.includes(permission)}
                                              onCheckedChange={(checked) => {
                                                const updatedPermissions = checked
                                                  ? [...assignment.permissions, permission]
                                                  : assignment.permissions.filter(p => p !== permission);
                                                handleUpdatePermissions(assignment.id, updatedPermissions);
                                              }}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                              <label
                                                htmlFor={`${assignment.id}-${permission}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                              >
                                                {config.label}
                                              </label>
                                              <p className="text-xs text-muted-foreground">
                                                {config.description}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveAssignment(assignment.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {localAssignments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assignment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{localAssignments.length}</div>
                  <div className="text-xs text-muted-foreground">Total Assignments</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{new Set(localAssignments.map(a => a.memberId)).size}</div>
                  <div className="text-xs text-muted-foreground">Assigned Members</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{new Set(localAssignments.map(a => a.clientId)).size}</div>
                  <div className="text-xs text-muted-foreground">Clients Covered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{localAssignments.filter(a => a.role === 'MANAGER').length}</div>
                  <div className="text-xs text-muted-foreground">Client Managers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}