'use client';

import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw,
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Download,
  Upload,
  Copy,
  Send,
  Settings,
  Eye,
  MoreHorizontal,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getBulkOperationsData,
  executeBulkOperation,
  controlBulkOperation,
  getBulkOperationStatus,
  bulkPublishContent,
  bulkApplyTemplates,
  bulkSubmitForApproval,
  bulkScheduleContent,
  bulkExportAnalytics,
  type BulkOperationData,
  type BulkOperationRequest,
  type BulkOperationResponse 
} from '@/lib/api/bulk-operations-service';
import { toast } from '@/components/ui/use-toast';

interface BulkOperationsManagerProps {
  defaultView?: 'operations' | 'history' | 'templates';
}

export function BulkOperationsManager({ 
  defaultView = 'operations' 
}: BulkOperationsManagerProps) {
  const { state: { organizationId, selectedClient } } = useServiceProvider();
  const queryClient = useQueryClient();

  // State management
  const [currentView, setCurrentView] = useState<'operations' | 'history' | 'templates'>(defaultView);
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [operationDialogOpen, setOperationDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [currentOperationId, setCurrentOperationId] = useState<string>('');
  const [operationParameters, setOperationParameters] = useState<Record<string, any>>({});

  // Data queries
  const { 
    data: bulkOpsData, 
    isLoading: dataLoading,
    refetch: refetchData
  } = useQuery<BulkOperationData>({
    queryKey: ['bulk-operations-data', organizationId],
    queryFn: () => getBulkOperationsData({
      organizationId: organizationId!,
    }),
    enabled: !!organizationId,
  });

  // Operation status polling
  const { data: operationStatus } = useQuery({
    queryKey: ['bulk-operation-status', currentOperationId],
    queryFn: () => getBulkOperationStatus({
      operationId: currentOperationId,
      organizationId: organizationId!
    }),
    enabled: !!currentOperationId && !!organizationId,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Mutations
  const executeMutation = useMutation({
    mutationFn: executeBulkOperation,
    onSuccess: (data) => {
      setCurrentOperationId(data.operationId);
      setStatusDialogOpen(true);
      setOperationDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['bulk-operations-data'] });
    },
  });

  const controlMutation = useMutation({
    mutationFn: controlBulkOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk-operations-data'] });
      queryClient.invalidateQueries({ queryKey: ['bulk-operation-status'] });
    },
  });

  // Get operation status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: <CheckCircle className="h-3 w-3" /> 
        };
      case 'in_progress':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: <Clock className="h-3 w-3" /> 
        };
      case 'failed':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: <XCircle className="h-3 w-3" /> 
        };
      case 'cancelled':
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: <Square className="h-3 w-3" /> 
        };
      case 'paused':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: <Pause className="h-3 w-3" /> 
        };
      case 'scheduled':
        return { 
          color: 'bg-purple-100 text-purple-800 border-purple-200', 
          icon: <Calendar className="h-3 w-3" /> 
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: <AlertTriangle className="h-3 w-3" /> 
        };
    }
  };

  // Get operation icon
  const getOperationIcon = (operationType: string) => {
    switch (operationType) {
      case 'content-publish':
        return <Send className="h-4 w-4" />;
      case 'content-schedule':
        return <Calendar className="h-4 w-4" />;
      case 'approval-submit':
        return <CheckCircle className="h-4 w-4" />;
      case 'template-apply':
        return <Copy className="h-4 w-4" />;
      case 'analytics-export':
        return <Download className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  // Handle operation execution
  const handleExecuteOperation = async () => {
    if (!selectedOperation || selectedClients.length === 0) {
      toast({
        title: "Missing Selection",
        description: "Please select an operation type and at least one client",
        variant: "destructive",
      });
      return;
    }

    const operationRequest: BulkOperationRequest = {
      operationType: selectedOperation as any,
      clientIds: selectedClients,
      itemIds: selectedItems.length > 0 ? selectedItems : undefined,
      parameters: operationParameters,
      organizationId: organizationId!
    };

    await executeMutation.mutateAsync(operationRequest);
  };

  // Handle operation control
  const handleControlOperation = async (
    operationId: string, 
    action: 'cancel' | 'pause' | 'resume' | 'retry'
  ) => {
    await controlMutation.mutateAsync({
      operationId,
      action,
      organizationId: organizationId!
    });
  };

  // Handle client selection
  const handleClientSelection = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients([...selectedClients, clientId]);
    } else {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    }
  };

  // Handle select all clients
  const handleSelectAllClients = (checked: boolean) => {
    if (checked && bulkOpsData) {
      setSelectedClients(bulkOpsData.availableClients.map(client => client.id));
    } else {
      setSelectedClients([]);
    }
  };

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Bulk Operations</h2>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
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
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold">Bulk Operations Manager</h2>
          <p className="text-sm lg:text-base text-muted-foreground">
            Execute operations across multiple clients simultaneously
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => refetchData()} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={operationDialogOpen} onOpenChange={setOperationDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Zap className="h-4 w-4 mr-2" />
                New Bulk Operation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Bulk Operation</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Operation Type Selection */}
                <div>
                  <Label htmlFor="operation-type">Operation Type</Label>
                  <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose operation type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {bulkOpsData?.bulkOperationTypes.map((op) => (
                        <SelectItem key={op.id} value={op.id}>
                          <div className="flex items-center gap-2">
                            {getOperationIcon(op.id)}
                            <div>
                              <div className="font-medium">{op.name}</div>
                              <div className="text-xs text-muted-foreground">{op.estimatedTime}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedOperation && bulkOpsData && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {bulkOpsData.bulkOperationTypes.find(op => op.id === selectedOperation)?.description}
                    </p>
                  )}
                </div>

                {/* Client Selection */}
                <div>
                  <Label>Select Clients ({selectedClients.length} selected)</Label>
                  <div className="space-y-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-clients"
                        checked={selectedClients.length === bulkOpsData?.availableClients.length}
                        onCheckedChange={handleSelectAllClients}
                      />
                      <Label htmlFor="select-all-clients" className="font-medium">
                        Select All Clients
                      </Label>
                    </div>
                    {bulkOpsData?.availableClients.map((client) => (
                      <div key={client.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={client.id}
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={(checked) => handleClientSelection(client.id, !!checked)}
                        />
                        <Label htmlFor={client.id} className="flex-1">
                          <div className="flex items-center justify-between">
                            <span>{client.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {client.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {client.contentCount} items
                              </span>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operation-specific Parameters */}
                {selectedOperation === 'content-schedule' && (
                  <div className="space-y-4">
                    <Label>Schedule Settings</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="publish-date">Publish Date</Label>
                        <Input
                          id="publish-date"
                          type="datetime-local"
                          onChange={(e) => setOperationParameters({
                            ...operationParameters,
                            scheduleSettings: {
                              ...operationParameters.scheduleSettings,
                              publishDate: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="platforms">Platforms</Label>
                        <Select
                          onValueChange={(value) => setOperationParameters({
                            ...operationParameters,
                            scheduleSettings: {
                              ...operationParameters.scheduleSettings,
                              platforms: [value]
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select platforms..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Platforms</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="twitter">Twitter</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {selectedOperation === 'approval-submit' && (
                  <div className="space-y-4">
                    <Label>Approval Settings</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          onValueChange={(value) => setOperationParameters({
                            ...operationParameters,
                            approvalSettings: {
                              ...operationParameters.approvalSettings,
                              priority: value
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="due-date">Due Date</Label>
                        <Input
                          id="due-date"
                          type="date"
                          onChange={(e) => setOperationParameters({
                            ...operationParameters,
                            approvalSettings: {
                              ...operationParameters.approvalSettings,
                              dueDate: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="approval-comment">Comment (Optional)</Label>
                      <Textarea
                        id="approval-comment"
                        placeholder="Add a comment for the approval workflow..."
                        onChange={(e) => setOperationParameters({
                          ...operationParameters,
                          approvalSettings: {
                            ...operationParameters.approvalSettings,
                            comment: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOperationDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleExecuteOperation}
                    disabled={executeMutation.isPending || selectedClients.length === 0}
                  >
                    {executeMutation.isPending ? 'Starting...' : 'Start Operation'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {bulkOpsData?.operationStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Operations</p>
                  <p className="text-2xl font-bold">{bulkOpsData.operationStats.totalOperationsToday}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{bulkOpsData.operationStats.successRate}%</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Time</p>
                  <p className="text-2xl font-bold">{bulkOpsData.operationStats.avgExecutionTime}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items Processed</p>
                  <p className="text-2xl font-bold">{bulkOpsData.operationStats.totalItemsProcessed}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clients Affected</p>
                  <p className="text-2xl font-bold">{bulkOpsData.operationStats.totalClientsAffected}</p>
                </div>
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="operations" className="text-xs sm:text-sm">Available Operations</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">Operation History</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs sm:text-sm">Operation Templates</TabsTrigger>
        </TabsList>

        {/* Available Operations Tab */}
        <TabsContent value="operations" className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {bulkOpsData?.bulkOperationTypes.map((operation) => (
              <Card key={operation.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getOperationIcon(operation.id)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{operation.name}</h3>
                        <p className="text-sm text-muted-foreground">{operation.estimatedTime}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {operation.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Affects: {operation.affectedItems}</span>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => {
                        setSelectedOperation(operation.id);
                        setOperationDialogOpen(true);
                      }}
                    >
                      Configure & Execute
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Operation History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="space-y-4">
            {bulkOpsData?.recentOperations.map((operation) => (
              <Card key={operation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getOperationIcon(operation.type)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{operation.name}</h3>
                          <Badge className={getStatusBadge(operation.status).color}>
                            {getStatusBadge(operation.status).icon}
                            {operation.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p>Clients: {operation.clientsAffected.map(id => {
                            const client = bulkOpsData?.availableClients.find(c => c.id === id);
                            return client?.name || id;
                          }).join(', ')}</p>
                          <p>Started: {new Date(operation.startedAt).toLocaleString()}</p>
                          {operation.completedAt && (
                            <p>Completed: {new Date(operation.completedAt).toLocaleString()}</p>
                          )}
                        </div>
                        
                        {operation.status === 'in_progress' && operation.progress && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>{operation.progress}%</span>
                            </div>
                            <Progress value={operation.progress} className="h-2" />
                          </div>
                        )}
                        
                        {operation.results && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-green-600">✓ {operation.results.successful} successful</span>
                              {operation.results.failed > 0 && (
                                <span className="text-red-600">✗ {operation.results.failed} failed</span>
                              )}
                            </div>
                            {operation.results.errors.length > 0 && (
                              <div className="text-sm">
                                <p className="font-medium">Errors:</p>
                                <ul className="list-disc list-inside text-muted-foreground">
                                  {operation.results.errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {operation.error && (
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            {operation.error}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {operation.status === 'in_progress' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleControlOperation(operation.id, 'pause')}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleControlOperation(operation.id, 'cancel')}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {operation.status === 'paused' && (
                        <Button 
                          size="sm"
                          onClick={() => handleControlOperation(operation.id, 'resume')}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {operation.status === 'failed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleControlOperation(operation.id, 'retry')}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
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
        </TabsContent>

        {/* Operation Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Operation Templates</h3>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Template cards would go here */}
            <Card className="border-dashed border-2 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto">
                    <Upload className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create Template</h3>
                    <p className="text-sm text-muted-foreground">
                      Save operation configurations as reusable templates
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Operation Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Operation Status</DialogTitle>
          </DialogHeader>
          {operationStatus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Operation ID:</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{operationStatus.operationId}</code>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusBadge(operationStatus.status).color}>
                  {getStatusBadge(operationStatus.status).icon}
                  {operationStatus.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{operationStatus.progress.percentage}%</span>
                </div>
                <Progress value={operationStatus.progress.percentage} className="h-2" />
                <p className="text-sm text-muted-foreground">{operationStatus.progress.currentStep}</p>
              </div>
              
              <div className="text-sm">
                <p><strong>Items Processed:</strong> {operationStatus.progress.itemsProcessed} of {operationStatus.progress.itemsTotal}</p>
                <p><strong>Estimated Time Remaining:</strong> {operationStatus.progress.estimatedTimeRemaining}</p>
              </div>
              
              {operationStatus.results && (
                <div className="space-y-2">
                  <h4 className="font-medium">Results:</h4>
                  <div className="text-sm space-y-1">
                    <p className="text-green-600">✓ {operationStatus.results.successful} successful</p>
                    {operationStatus.results.failed > 0 && (
                      <p className="text-red-600">✗ {operationStatus.results.failed} failed</p>
                    )}
                  </div>
                  
                  {operationStatus.results.clientResults && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Client Results:</h5>
                      {operationStatus.results.clientResults.map((result) => (
                        <div key={result.clientId} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span>{result.clientName}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={result.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                              {result.status}
                            </Badge>
                            <span>{result.itemsProcessed} items</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                {operationStatus.status === 'in_progress' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleControlOperation(operationStatus.operationId, 'cancel')}
                  >
                    Cancel Operation
                  </Button>
                )}
                <Button onClick={() => setStatusDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}