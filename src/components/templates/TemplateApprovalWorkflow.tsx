"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  ArrowRight,
  FileText,
  Send,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: 'email' | 'social' | 'blog';
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'ARCHIVED';
  content: string;
  description?: string;
}

interface ApprovalWorkflow {
  id: string;
  templateId: string;
  requesterId: string;
  approverId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_changes';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestMessage?: string;
  approvalMessage?: string;
  changesRequested?: string[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  template: Template;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TemplateApprovalWorkflowProps {
  organizationId: string;
  currentUserId: string;
  userRole: string;
}

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700 border-gray-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200'
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  needs_changes: 'bg-orange-100 text-orange-800 border-orange-200'
};

export function TemplateApprovalWorkflow({ 
  organizationId, 
  currentUserId, 
  userRole 
}: TemplateApprovalWorkflowProps) {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingTemplates, setPendingTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Request approval form state
  const [approvalRequest, setApprovalRequest] = useState({
    templateId: '',
    approverId: '',
    priority: 'medium' as const,
    message: ''
  });

  // Filter and view state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'incoming' | 'outgoing' | 'all'>('all');

  // Load workflows and data
  useEffect(() => {
    loadWorkflows();
    loadTeamMembers();
    loadPendingTemplates();
  }, [organizationId]);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/templates/approval-workflows?organizationId=${organizationId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      }
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to load approval workflows",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const response = await fetch(`/api/organization/${organizationId}/members`);
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.filter((member: TeamMember) => 
          ['ADMIN', 'APPROVER', 'REVIEWER'].includes(member.role)
        ));
      }
    } catch (_error) {
      console.error("", _error);
    }
  };

  const loadPendingTemplates = async () => {
    try {
      const response = await fetch(`/api/templates?organizationId=${organizationId}&status=DRAFT&createdBy=${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        setPendingTemplates(data.templates || []);
      }
    } catch (_error) {
      console.error("", _error);
    }
  };

  const requestApproval = async () => {
    if (!approvalRequest.templateId || !approvalRequest.approverId) {
      toast({
        title: "Validation Error",
        description: "Please select a template and approver",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/templates/approval-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...approvalRequest,
          organizationId,
          requesterId: currentUserId
        }),
      });

      if (response.ok) {
        toast({
          title: "Approval Requested! 📋",
          description: "Your template has been sent for approval",
        });
        
        // Reset form and reload data
        setApprovalRequest({
          templateId: '',
          approverId: '',
          priority: 'medium',
          message: ''
        });
        setSelectedTemplate(null);
        loadWorkflows();
        loadPendingTemplates();
      } else {
        throw new Error('Failed to request approval');
      }
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to request approval",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprovalAction = async (
    workflowId: string, 
    action: 'approve' | 'reject' | 'request_changes',
    message?: string,
    changesRequested?: string[]
  ) => {
    try {
      const response = await fetch(`/api/templates/approval-workflows/${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          message,
          changesRequested,
          approverId: currentUserId
        }),
      });

      if (response.ok) {
        const actionLabels = {
          approve: 'approved ✅',
          reject: 'rejected ❌', 
          request_changes: 'requested changes 📝'
        };
        
        toast({
          title: `Template ${actionLabels[action]}!`,
          description: `Successfully ${actionLabels[action].toLowerCase()} the template`,
        });
        loadWorkflows();
      } else {
        throw new Error(`Failed to ${action} template`);
      }
    } catch (_error) {
      toast({
        title: "Error",
        description: `Failed to ${action} template`,
        variant: "destructive",
      });
    }
  };

  // Filter workflows based on current filters
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || workflow.priority === priorityFilter;
    
    let matchesView = true;
    if (viewMode === 'incoming') {
      matchesView = workflow.approverId === currentUserId || 
                   (workflow.status === 'pending' && ['ADMIN', 'APPROVER'].includes(userRole));
    } else if (viewMode === 'outgoing') {
      matchesView = workflow.requesterId === currentUserId;
    }
    
    return matchesStatus && matchesPriority && matchesView;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'needs_changes': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-6 w-6 animate-spin mr-2" />
            Loading approval workflows...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Approval Workflows</h2>
          <p className="text-muted-foreground">Manage team collaboration and template approvals</p>
        </div>
        
        {/* Request Approval Dialog */}
        {(['CONTENT_CREATOR', 'REVIEWER'].includes(userRole)) && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4 mr-2" />
                Request Approval
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request Template Approval</DialogTitle>
                <DialogDescription>
                  Submit a template for review and approval by your team leads
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Template</Label>
                  <Select 
                    value={approvalRequest.templateId} 
                    onValueChange={(value) => {
                      setApprovalRequest(prev => ({ ...prev, templateId: value }));
                      const template = pendingTemplates.find(t => t.id === value);
                      setSelectedTemplate(template || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template to submit" />
                    </SelectTrigger>
                    <SelectContent>
                      {pendingTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{template.type}</Badge>
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Approver</Label>
                  <Select 
                    value={approvalRequest.approverId} 
                    onValueChange={(value) => setApprovalRequest(prev => ({ ...prev, approverId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose team member to review" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span>{member.name}</span>
                            <Badge variant="outline" className="text-xs">{member.role}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <Select 
                    value={approvalRequest.priority} 
                    onValueChange={(value) => setApprovalRequest(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Request Message (Optional)</Label>
                  <Textarea
                    value={approvalRequest.message}
                    onChange={(e) => setApprovalRequest(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Add any context or specific review requests..."
                    rows={3}
                  />
                </div>

                {selectedTemplate && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Template Preview</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {selectedTemplate.name}</div>
                      <div><strong>Type:</strong> {selectedTemplate.type}</div>
                      <div><strong>Status:</strong> {selectedTemplate.status}</div>
                      {selectedTemplate.description && (
                        <div><strong>Description:</strong> {selectedTemplate.description}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  onClick={requestApproval}
                  disabled={isSubmitting || !approvalRequest.templateId || !approvalRequest.approverId}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Request Approval
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">View:</Label>
              <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="incoming">Incoming</SelectItem>
                  <SelectItem value="outgoing">My Requests</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="needs_changes">Needs Changes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Priority:</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto text-sm text-muted-foreground">
              {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflows List */}
      <div className="grid gap-4">
        {filteredWorkflows.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No workflows found</h3>
              <p className="text-muted-foreground">
                {viewMode === 'incoming' ? 
                  "No approval requests need your attention" :
                  viewMode === 'outgoing' ?
                  "You haven't submitted any templates for approval" :
                  "No approval workflows match your current filters"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              currentUserId={currentUserId}
              userRole={userRole}
              onAction={handleApprovalAction}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Individual workflow card component
interface WorkflowCardProps {
  workflow: ApprovalWorkflow;
  currentUserId: string;
  userRole: string;
  onAction: (id: string, action: 'approve' | 'reject' | 'request_changes', message?: string, changes?: string[]) => void;
}

function WorkflowCard({ workflow, currentUserId, userRole, onAction }: WorkflowCardProps) {
  const [actionMessage, setActionMessage] = useState('');
  const [changesRequested, setChangesRequested] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_changes'>('approve');

  const canApprove = workflow.status === 'pending' && 
    (workflow.approverId === currentUserId || 
     (['ADMIN', 'APPROVER'].includes(userRole) && !workflow.approverId));

  const isRequester = workflow.requesterId === currentUserId;

  const handleAction = () => {
    const changes = actionType === 'request_changes' && changesRequested ? 
      changesRequested.split('\n').filter(c => c.trim()) : undefined;
    
    onAction(workflow.id, actionType, actionMessage || undefined, changes);
    setShowApprovalDialog(false);
    setActionMessage('');
    setChangesRequested('');
  };

  return (
    <Card className={`${workflow.priority === 'urgent' ? 'border-red-200 bg-red-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{workflow.template.name}</h3>
              <Badge variant="outline" className={STATUS_COLORS[workflow.status]}>
                {getStatusIcon(workflow.status)}
                <span className="ml-1 capitalize">{workflow.status.replace('_', ' ')}</span>
              </Badge>
              <Badge variant="outline" className={PRIORITY_COLORS[workflow.priority]}>
                {workflow.priority.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>From: {workflow.requester.name}</span>
              </div>
              {workflow.approver && (
                <div className="flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  <span>To: {workflow.approver.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {canApprove && workflow.status === 'pending' && (
            <div className="flex items-center gap-2">
              <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => setActionType('approve')}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review Template: {workflow.template.name}</DialogTitle>
                    <DialogDescription>
                      Choose your action and provide feedback
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Action</Label>
                      <Select value={actionType} onValueChange={(value) => setActionType(value as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approve">✅ Approve & Publish</SelectItem>
                          <SelectItem value="request_changes">📝 Request Changes</SelectItem>
                          <SelectItem value="reject">❌ Reject</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Message {actionType === 'approve' ? '(Optional)' : '(Required)'}</Label>
                      <Textarea
                        value={actionMessage}
                        onChange={(e) => setActionMessage(e.target.value)}
                        placeholder={
                          actionType === 'approve' ? 'Add congratulations or notes...' :
                          actionType === 'reject' ? 'Explain why this template cannot be approved...' :
                          'Explain what changes are needed...'
                        }
                        rows={3}
                      />
                    </div>

                    {actionType === 'request_changes' && (
                      <div className="space-y-2">
                        <Label>Specific Changes Requested</Label>
                        <Textarea
                          value={changesRequested}
                          onChange={(e) => setChangesRequested(e.target.value)}
                          placeholder="List specific changes needed (one per line)..."
                          rows={4}
                        />
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={handleAction}
                      disabled={actionType !== 'approve' && !actionMessage.trim()}
                      className={
                        actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                        actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                        'bg-orange-600 hover:bg-orange-700'
                      }
                    >
                      {actionType === 'approve' ? '✅ Approve' :
                       actionType === 'reject' ? '❌ Reject' :
                       '📝 Request Changes'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{workflow.template.type}</Badge>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{workflow.template.status}</span>
        </div>

        {workflow.requestMessage && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-3 w-3" />
              <span className="text-xs font-medium">Request Message:</span>
            </div>
            <p className="text-sm">{workflow.requestMessage}</p>
          </div>
        )}

        {workflow.approvalMessage && (
          <div className={`p-3 rounded-lg ${
            workflow.status === 'approved' ? 'bg-green-50 border border-green-200' :
            workflow.status === 'rejected' ? 'bg-red-50 border border-red-200' :
            'bg-orange-50 border border-orange-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon(workflow.status)}
              <span className="text-xs font-medium">
                {workflow.status === 'approved' ? 'Approval' :
                 workflow.status === 'rejected' ? 'Rejection' :
                 'Changes'} Message:
              </span>
            </div>
            <p className="text-sm">{workflow.approvalMessage}</p>
          </div>
        )}

        {workflow.changesRequested && workflow.changesRequested.length > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-xs font-medium">Changes Requested:</span>
            </div>
            <ul className="text-sm space-y-1">
              {workflow.changesRequested.map((change, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}