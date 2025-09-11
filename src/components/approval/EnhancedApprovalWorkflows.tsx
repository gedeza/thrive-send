'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageSquare,
  User,
  Calendar,
  Filter,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Send,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Mail,
  Globe
} from 'lucide-react';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApprovalWorkflowItems,
  processApprovalAction,
  bulkApprovalAction,
  getApprovalWorkflowStats,
  type ApprovalWorkflowItem,
  type ApprovalWorkflowResponse 
} from '@/lib/api/approval-workflow-service';
import { toast } from '@/components/ui/use-toast';

interface EnhancedApprovalWorkflowsProps {
  defaultView?: 'queue' | 'statistics' | 'workflows';
}

export function EnhancedApprovalWorkflows({ 
  defaultView = 'queue' 
}: EnhancedApprovalWorkflowsProps) {
  const { state: { organizationId, selectedClient } } = useServiceProvider();
  const queryClient = useQueryClient();

  // State for filtering and management
  const [currentView, setCurrentView] = useState<'queue' | 'statistics' | 'workflows'>(defaultView);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>(selectedClient?.id || 'all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionComment, setActionComment] = useState('');
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState<'approve' | 'reject' | 'request_revision'>('approve');

  // Data queries
  const { 
    data: workflowData, 
    isLoading: workflowLoading,
    refetch: refetchWorkflows
  } = useQuery<ApprovalWorkflowResponse>({
    queryKey: ['approval-workflows', organizationId, statusFilter, priorityFilter, clientFilter, currentPage],
    queryFn: () => getApprovalWorkflowItems({
      organizationId: organizationId!,
      clientId: clientFilter !== 'all' ? clientFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      page: currentPage,
      limit: 10,
    }),
    enabled: !!organizationId && currentView === 'queue',
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['approval-workflow-stats', organizationId, clientFilter],
    queryFn: () => getApprovalWorkflowStats({
      organizationId: organizationId!,
      timeRange: '30d',
      clientId: clientFilter !== 'all' ? clientFilter : undefined,
    }),
    enabled: !!organizationId && currentView === 'statistics',
  });

  // Mutations for actions
  const processActionMutation = useMutation({
    mutationFn: processApprovalAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      setActionComment('');
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: bulkApprovalAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      setSelectedItems([]);
      setBulkActionDialogOpen(false);
      setActionComment('');
    },
  });

  // Get status badge color and icon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: <Clock className="h-3 w-3" /> 
        };
      case 'approved':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: <CheckCircle className="h-3 w-3" /> 
        };
      case 'needs_revision':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: <Edit className="h-3 w-3" /> 
        };
      case 'rejected':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: <XCircle className="h-3 w-3" /> 
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: <AlertCircle className="h-3 w-3" /> 
        };
    }
  };

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'blog':
        return <FileText className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  // Handle individual action
  const handleAction = async (
    action: 'approve' | 'reject' | 'request_revision',
    approvalId: string,
    contentId: string,
    clientId: string
  ) => {
    await processActionMutation.mutateAsync({
      action,
      approvalId,
      contentId,
      clientId,
      comment: actionComment,
      organizationId: organizationId!
    });
  };

  // Handle bulk action
  const handleBulkAction = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items to perform bulk action",
        variant: "destructive",
      });
      return;
    }

    await bulkActionMutation.mutateAsync({
      action: selectedBulkAction,
      approvalIds: selectedItems,
      comment: actionComment,
      organizationId: organizationId!
    });
  };

  // Handle item selection
  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked && workflowData) {
      setSelectedItems(workflowData.approvalItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  if (workflowLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Approval Workflows</h2>
          <div className="flex gap-2">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Approval Workflows</h2>
          <p className="text-muted-foreground">
            Manage content approval processes across all clients
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchWorkflows()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {selectedItems.length > 0 && (
            <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  Bulk Actions ({selectedItems.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Approval Action</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bulk-action">Action</Label>
                    <Select value={selectedBulkAction} onValueChange={(value: unknown) => setSelectedBulkAction(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approve">Approve All</SelectItem>
                        <SelectItem value="reject">Reject All</SelectItem>
                        <SelectItem value="request_revision">Request Revision</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bulk-comment">Comment (Optional)</Label>
                    <Textarea
                      id="bulk-comment"
                      value={actionComment}
                      onChange={(e) => setActionComment(e.target.value)}
                      placeholder="Add a comment for all selected items..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleBulkAction}
                      disabled={bulkActionMutation.isPending}
                    >
                      {bulkActionMutation.isPending ? 'Processing...' : `${selectedBulkAction} ${selectedItems.length} Items`}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {workflowData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{workflowData.summary.statusCounts.pending_review}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{workflowData.summary.statusCounts.approved}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Needs Revision</p>
                  <p className="text-2xl font-bold text-blue-600">{workflowData.summary.statusCounts.needs_revision}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Time</p>
                  <p className="text-2xl font-bold">{workflowData.summary.avgApprovalTime}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={currentView} onValueChange={(value: unknown) => setCurrentView(value)}>
        <TabsList>
          <TabsTrigger value="queue">Approval Queue</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="workflows">Workflow Templates</TabsTrigger>
        </TabsList>

        {/* Approval Queue Tab */}
        <TabsContent value="queue" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="needs_revision">Needs Revision</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="demo-client-1">City of Springfield</SelectItem>
                <SelectItem value="demo-client-2">TechStart Inc.</SelectItem>
                <SelectItem value="demo-client-3">Local Coffee Co.</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Approval Items List */}
          <div className="space-y-4">
            {/* Select All Header */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                checked={selectedItems.length === workflowData?.approvalItems.length && workflowData?.approvalItems.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="font-medium">
                {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'Select all'}
              </span>
            </div>

            {workflowData?.approvalItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleItemSelection(item.id, !!checked)}
                    />
                    
                    {/* Content Info */}
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getContentTypeIcon(item.contentType)}
                            <h3 className="font-semibold">{item.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.content.excerpt}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityBadge(item.priority)}>
                            {item.priority}
                          </Badge>
                          <Badge className={getStatusBadge(item.status).color}>
                            {getStatusBadge(item.status).icon}
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{item.clientName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Submitted: {new Date(item.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Workflow Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Workflow Progress</span>
                          <span>{item.workflow.steps.findIndex(s => s.id === item.currentStep) + 1} of {item.totalSteps}</span>
                        </div>
                        <Progress 
                          value={(item.workflow.steps.findIndex(s => s.id === item.currentStep) + 1) / item.totalSteps * 100} 
                          className="h-2" 
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Current: {item.workflow.steps.find(s => s.id === item.currentStep)?.name}</span>
                        </div>
                      </div>
                      
                      {/* Comments */}
                      {item.comments.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Latest Comment:</h4>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{item.comments[0].author}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.comments[0].createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{item.comments[0].message}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        {item.status === 'pending_review' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleAction('approve', item.id, item.contentId, item.clientId)}
                              disabled={processActionMutation.isPending}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAction('request_revision', item.id, item.contentId, item.clientId)}
                              disabled={processActionMutation.isPending}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Request Revision
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleAction('reject', item.id, item.contentId, item.clientId)}
                              disabled={processActionMutation.isPending}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Add Comment
                        </Button>
                        
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {workflowData?.pagination && workflowData.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {[...Array(workflowData.pagination.totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= workflowData.pagination.totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          {statsData && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Processed</p>
                      <p className="text-3xl font-bold">{statsData.totalProcessed}</p>
                      <p className="text-sm text-muted-foreground">Last 30 days</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Avg Approval Time</p>
                      <p className="text-3xl font-bold">{statsData.avgApprovalTime}h</p>
                      <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>12% faster</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Approval Rate</p>
                      <p className="text-3xl font-bold">{statsData.approvalRate}%</p>
                      <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>+3.2%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Client Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Client Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statsData.clientPerformance.map((client) => (
                      <div key={client.clientId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">{client.clientName}</h4>
                          <p className="text-sm text-muted-foreground">{client.totalItems} items processed</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-semibold">{client.approvalRate.toFixed(1)}% approved</p>
                          <p className="text-sm text-muted-foreground">{client.avgApprovalTime.toFixed(1)}h avg time</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bottlenecks */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Workflow Bottlenecks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statsData.bottlenecks.map((bottleneck) => (
                      <div key={bottleneck.step} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium capitalize">{bottleneck.step.replace('_', ' ')}</h4>
                          <p className="text-sm text-muted-foreground">{bottleneck.count} items affected</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-yellow-600">{bottleneck.avgTime.toFixed(1)}h</p>
                          <p className="text-sm text-muted-foreground">avg delay</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Workflow Templates Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Workflow Templates</h3>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          {workflowData?.workflows && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflowData.workflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">{workflow.name}</h4>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>{workflow.steps} steps</span>
                        <span>{workflow.avgDuration} avg duration</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}