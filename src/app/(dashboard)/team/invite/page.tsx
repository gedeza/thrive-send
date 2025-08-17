'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Mail, 
  Users, 
  Shield, 
  UserPlus, 
  Plus, 
  X,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert-new';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types
type ServiceProviderRole = 
  | 'ADMIN' 
  | 'MANAGER'
  | 'CONTENT_CREATOR'
  | 'REVIEWER'
  | 'APPROVER'
  | 'PUBLISHER'
  | 'ANALYST'
  | 'CLIENT_MANAGER';

interface ClientAssignment {
  clientId: string;
  clientName: string;
  role: 'MANAGER' | 'CREATOR' | 'REVIEWER' | 'ANALYST';
  permissions: string[];
}

interface ClientOption {
  id: string;
  name: string;
  type: string;
  status: string;
}

// Form validation schema
const invitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.string().min(1, 'Role is required'),
  message: z.string().optional(),
  sendEmail: z.boolean().default(true),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

// Role configuration
const roleConfig = {
  ADMIN: { 
    label: 'Administrator', 
    color: 'bg-red-100 text-red-800', 
    description: 'Full administrative access including team management and organization settings',
    level: 9,
    permissions: ['manage_team', 'manage_clients', 'manage_campaigns', 'manage_content', 'view_analytics', 'manage_billing']
  },
  MANAGER: { 
    label: 'Manager', 
    color: 'bg-blue-100 text-blue-800', 
    description: 'Project and team management with client oversight capabilities',
    level: 8,
    permissions: ['manage_projects', 'assign_team', 'manage_campaigns', 'manage_content', 'view_analytics']
  },
  CLIENT_MANAGER: { 
    label: 'Client Manager', 
    color: 'bg-green-100 text-green-800', 
    description: 'Client relationship management and account oversight',
    level: 7,
    permissions: ['manage_client_relationships', 'view_client_analytics', 'manage_campaigns', 'communicate_clients']
  },
  APPROVER: { 
    label: 'Approver', 
    color: 'bg-orange-100 text-orange-800', 
    description: 'Content approval authority with campaign oversight',
    level: 6,
    permissions: ['approve_content', 'manage_campaigns', 'view_analytics']
  },
  PUBLISHER: { 
    label: 'Publisher', 
    color: 'bg-indigo-100 text-indigo-800', 
    description: 'Content publishing and distribution management',
    level: 5,
    permissions: ['publish_content', 'manage_social_accounts', 'schedule_content']
  },
  REVIEWER: { 
    label: 'Reviewer', 
    color: 'bg-yellow-100 text-yellow-800', 
    description: 'Content review and quality assurance',
    level: 4,
    permissions: ['review_content', 'edit_content', 'view_analytics']
  },
  ANALYST: { 
    label: 'Analyst', 
    color: 'bg-teal-100 text-teal-800', 
    description: 'Analytics and performance tracking specialist',
    level: 3,
    permissions: ['view_analytics', 'create_reports', 'export_data']
  },
  CONTENT_CREATOR: { 
    label: 'Content Creator', 
    color: 'bg-pink-100 text-pink-800', 
    description: 'Content creation and development',
    level: 2,
    permissions: ['create_content', 'edit_own_content', 'view_basic_analytics']
  },
} as const;

// Client role options
const clientRoleOptions = [
  { 
    value: 'MANAGER', 
    label: 'Client Manager', 
    description: 'Full client account management',
    permissions: ['read', 'write', 'approve', 'publish', 'manage_team']
  },
  { 
    value: 'CREATOR', 
    label: 'Content Creator', 
    description: 'Create and edit content for this client',
    permissions: ['read', 'write']
  },
  { 
    value: 'REVIEWER', 
    label: 'Content Reviewer', 
    description: 'Review and provide feedback on content',
    permissions: ['read', 'review', 'comment']
  },
  { 
    value: 'ANALYST', 
    label: 'Analytics Specialist', 
    description: 'View analytics and create reports',
    permissions: ['read', 'view_analytics', 'export_data']
  }
];

export default function InviteTeamMemberPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { state: { organizationId } } = useServiceProvider();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableClients, setAvailableClients] = useState<ClientOption[]>([]);
  const [clientAssignments, setClientAssignments] = useState<ClientAssignment[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Debug: Log when component mounts
  useEffect(() => {
    // InviteTeamMemberPage mounted
  }, [organizationId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      role: '',
      message: '',
      sendEmail: true,
    },
  });

  const selectedRole = watch('role') as ServiceProviderRole;
  const selectedRoleConfig = selectedRole ? roleConfig[selectedRole] : null;

  // Load available clients
  useEffect(() => {
    const loadClients = async () => {
      try {
        if (!organizationId) return;
        
        setLoadingClients(true);
        const response = await fetch(`/api/service-provider/clients?organizationId=${organizationId}`);
        if (response.ok) {
          const clients = await response.json();
          setAvailableClients(clients.map((client: any) => ({
            id: client.id,
            name: client.name,
            type: client.type,
            status: client.status
          })));
        }
      } catch (error) {
        // Handle client loading error
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive",
        });
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, [organizationId]);

  // Add client assignment
  const addClientAssignment = (clientId: string) => {
    const client = availableClients.find(c => c.id === clientId);
    if (!client) return;

    if (clientAssignments.find(ca => ca.clientId === clientId)) {
      toast({
        title: "Error",
        description: "Client already assigned",
        variant: "destructive",
      });
      return;
    }

    const newAssignment: ClientAssignment = {
      clientId: client.id,
      clientName: client.name,
      role: 'CREATOR',
      permissions: ['read', 'write']
    };

    setClientAssignments([...clientAssignments, newAssignment]);
  };

  // Remove client assignment
  const removeClientAssignment = (clientId: string) => {
    setClientAssignments(clientAssignments.filter(ca => ca.clientId !== clientId));
  };

  // Update client assignment role
  const updateClientAssignmentRole = (clientId: string, role: 'MANAGER' | 'CREATOR' | 'REVIEWER' | 'ANALYST') => {
    const roleOption = clientRoleOptions.find(r => r.value === role);
    if (!roleOption) return;

    setClientAssignments(clientAssignments.map(ca => 
      ca.clientId === clientId 
        ? { ...ca, role, permissions: roleOption.permissions }
        : ca
    ));
  };

  const onSubmit = async (data: InvitationFormData) => {
    try {
      setIsSubmitting(true);

      if (!organizationId) {
        toast({
          title: "Error",
          description: "No organization selected",
          variant: "destructive",
        });
        return;
      }

      const invitationData = {
        ...data,
        organizationId,
        clientAssignments,
        rolePermissions: selectedRoleConfig?.permissions || []
      };

      // Sending invitation data to API

      const response = await fetch('/api/service-provider/team/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invitationData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send invitation';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `API Error: ${response.status} ${response.statusText}`;
        } catch (parseError) {
          errorMessage = `API Error: ${response.status} ${response.statusText}`;
        }
        // API response error
        throw new Error(errorMessage);
      }

      const result = await response.json();
      // Invitation sent successfully

      toast({
        title: "Success!",
        description: data.sendEmail 
          ? `Invitation sent to ${data.email} successfully!`
          : `Team member ${data.firstName} ${data.lastName} added successfully!`,
      });

      router.push('/team');

    } catch (error) {
      // Handle invitation sending error
      toast({
        title: "Error",
        description: `Failed to send invitation: ${error instanceof Error ? error.message : 'Please try again.'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show error if no organization context
  if (!organizationId) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Organization Context Missing</strong>
            <br />
            Unable to load organization context. Please refresh the page or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/team">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold">Invite Team Member</h1>
            <p className="text-muted-foreground">
              Add a new team member to your service provider organization
            </p>
            {loadingClients && (
              <p className="text-sm text-muted-foreground mt-1">
                🔄 Loading client data...
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">Service Provider Role *</Label>
                <Select value={selectedRole} onValueChange={(value) => setValue('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role for this team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleConfig).map(([role, config]) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-xs", config.color)}>
                            {config.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Level {config.level}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
              </div>

              {selectedRoleConfig && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{selectedRoleConfig.label} Role</strong>
                    <p className="mb-2 mt-1">{selectedRoleConfig.description}</p>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Permissions included:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedRoleConfig.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Client Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Assignments
                <Badge variant="secondary" className="ml-2">
                  {clientAssignments.length} assigned
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>Assign to Clients</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select which clients this team member can access and their role for each client</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {!loadingClients && availableClients.length > 0 && (
                  <Select onValueChange={addClientAssignment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add client assignment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClients
                        .filter(client => !clientAssignments.find(ca => ca.clientId === client.id))
                        .map((client) => (
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
                )}

                {/* Client assignments list */}
                {clientAssignments.length > 0 && (
                  <div className="space-y-3">
                    {clientAssignments.map((assignment) => (
                      <div key={assignment.clientId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{assignment.clientName}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeClientAssignment(assignment.clientId)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Label className="text-sm">Client Role</Label>
                              <Select 
                                value={assignment.role} 
                                onValueChange={(value: any) => updateClientAssignmentRole(assignment.clientId, value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {clientRoleOptions.map((roleOption) => (
                                    <SelectItem key={roleOption.value} value={roleOption.value}>
                                      <div>
                                        <div className="font-medium">{roleOption.label}</div>
                                        <div className="text-xs text-muted-foreground">{roleOption.description}</div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex-1">
                              <Label className="text-sm">Permissions</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {assignment.permissions.map((permission) => (
                                  <Badge key={permission} variant="outline" className="text-xs">
                                    {permission}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {clientAssignments.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>No Client Assignments</strong>
                      <br />
                      This team member won't have access to any specific clients. They will only have organization-level access based on their role.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invitation Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invitation Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sendEmail" 
                  {...register('sendEmail')}
                  defaultChecked={true}
                />
                <Label 
                  htmlFor="sendEmail" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Send invitation email
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  {...register('message')}
                  placeholder="Add a personal message to the invitation email..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Link href="/team">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Invitation...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}