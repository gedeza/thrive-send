'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar,
  Clock,
  Globe,
  Repeat,
  Target,
  TrendingUp,
  Users,
  Settings,
  Play,
  Pause,
  Square,
  Edit,
  MoreHorizontal,
  Plus,
  Zap,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  Filter,
  MapPin,
  Lightbulb,
  Mail,
  Share2,
  FileText,
  Instagram,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getContentSchedulingData,
  createContentSchedule,
  controlContentSchedule,
  bulkScheduleContent,
  applySchedulingTemplate,
  getOptimalPostingTimes,
  generateSchedulingReport,
  type ContentSchedulingData,
  type ScheduleRequest,
  type ScheduledContentItem 
} from '@/lib/api/content-scheduling-service';
import { toast } from '@/components/ui/use-toast';

interface AdvancedContentSchedulerProps {
  defaultView?: 'calendar' | 'list' | 'analytics' | 'templates';
}

export function AdvancedContentScheduler({ 
  defaultView = 'calendar' 
}: AdvancedContentSchedulerProps) {
  const { state: { organizationId, selectedClient } } = useServiceProvider();
  const queryClient = useQueryClient();

  // State management
  const [currentView, setCurrentView] = useState<'calendar' | 'list' | 'analytics' | 'templates'>(defaultView);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [clientFilter, setClientFilter] = useState<string>(selectedClient?.id || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [optimizationDialogOpen, setOptimizationDialogOpen] = useState(false);

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState<Partial<ScheduleRequest>>({
    action: 'create_schedule',
    clientIds: [],
    scheduledDate: '',
    platforms: [],
    timezone: 'America/New_York',
    priority: 'medium',
    organizationId: organizationId || ''
  });

  // Data queries
  const { 
    data: schedulingData, 
    isLoading: dataLoading,
    refetch: refetchData
  } = useQuery<ContentSchedulingData>({
    queryKey: ['content-scheduling-data', organizationId, clientFilter, timeRange, currentView],
    queryFn: () => getContentSchedulingData({
      organizationId: organizationId!,
      clientId: clientFilter !== 'all' ? clientFilter : undefined,
      timeRange,
      view: currentView === 'analytics' ? 'analytics' : 'calendar',
    }),
    enabled: !!organizationId,
  });

  // Mutations
  const scheduleMutation = useMutation({
    mutationFn: createContentSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-scheduling-data'] });
      setScheduleDialogOpen(false);
      resetScheduleForm();
    },
  });

  const controlMutation = useMutation({
    mutationFn: controlContentSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-scheduling-data'] });
    },
  });

  const bulkScheduleMutation = useMutation({
    mutationFn: bulkScheduleContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-scheduling-data'] });
      setSelectedItems([]);
    },
  });

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'blog':
        return <FileText className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: <Clock className="h-3 w-3" /> 
        };
      case 'published':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: <CheckCircle className="h-3 w-3" /> 
        };
      case 'paused':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: <Pause className="h-3 w-3" /> 
        };
      case 'failed':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: <AlertTriangle className="h-3 w-3" /> 
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: <Clock className="h-3 w-3" /> 
        };
    }
  };

  // Handle schedule creation
  const handleCreateSchedule = async () => {
    if (!scheduleForm.clientIds?.length || !scheduleForm.scheduledDate || !scheduleForm.platforms?.length) {
      toast({
        title: "Missing Information",
        description: "Please select clients, date, and platforms",
        variant: "destructive",
      });
      return;
    }

    await scheduleMutation.mutateAsync(scheduleForm as ScheduleRequest);
  };

  // Handle schedule control
  const handleScheduleControl = async (
    scheduleId: string,
    action: 'pause' | 'resume' | 'cancel' | 'reschedule'
  ) => {
    await controlMutation.mutateAsync({
      scheduleId,
      action,
      organizationId: organizationId!
    });
  };

  // Handle bulk scheduling
  const handleBulkSchedule = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select content items to schedule",
        variant: "destructive",
      });
      return;
    }

    await bulkScheduleMutation.mutateAsync({
      contentIds: selectedItems,
      clientIds: scheduleForm.clientIds || [],
      scheduledDate: scheduleForm.scheduledDate || '',
      platforms: scheduleForm.platforms || [],
      timezone: scheduleForm.timezone,
      organizationId: organizationId!
    });
  };

  // Reset schedule form
  const resetScheduleForm = () => {
    setScheduleForm({
      action: 'create_schedule',
      clientIds: [],
      scheduledDate: '',
      platforms: [],
      timezone: 'America/New_York',
      priority: 'medium',
      organizationId: organizationId || ''
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

  // Filter scheduled content
  const filteredContent = schedulingData?.scheduledContent.filter(item => {
    if (clientFilter !== 'all' && item.clientId !== clientFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (platformFilter !== 'all' && !item.platforms.includes(platformFilter)) return false;
    return true;
  }) || [];

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Content Scheduler</h2>
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
          <h2 className="text-2xl font-bold">Advanced Content Scheduler</h2>
          <p className="text-muted-foreground">
            Manage content scheduling across all clients and platforms
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule Content</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Client Selection */}
                <div>
                  <Label>Select Clients</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                    {schedulingData?.availableClients.map((client) => (
                      <div key={client.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={client.id}
                          checked={scheduleForm.clientIds?.includes(client.id)}
                          onCheckedChange={(checked) => {
                            const clientIds = scheduleForm.clientIds || [];
                            if (checked) {
                              setScheduleForm({
                                ...scheduleForm,
                                clientIds: [...clientIds, client.id]
                              });
                            } else {
                              setScheduleForm({
                                ...scheduleForm,
                                clientIds: clientIds.filter(id => id !== client.id)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={client.id} className="flex-1">
                          <div className="flex items-center justify-between">
                            <span>{client.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {client.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {client.activeSchedules} active
                              </span>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduled-date">Scheduled Date & Time</Label>
                    <Input
                      id="scheduled-date"
                      type="datetime-local"
                      value={scheduleForm.scheduledDate}
                      onChange={(e) => setScheduleForm({
                        ...scheduleForm,
                        scheduledDate: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={scheduleForm.timezone} 
                      onValueChange={(value) => setScheduleForm({
                        ...scheduleForm,
                        timezone: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Platform Selection */}
                <div>
                  <Label>Platforms</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['facebook', 'instagram', 'twitter', 'linkedin', 'email', 'blog'].map((platform) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform}
                          checked={scheduleForm.platforms?.includes(platform)}
                          onCheckedChange={(checked) => {
                            const platforms = scheduleForm.platforms || [];
                            if (checked) {
                              setScheduleForm({
                                ...scheduleForm,
                                platforms: [...platforms, platform]
                              });
                            } else {
                              setScheduleForm({
                                ...scheduleForm,
                                platforms: platforms.filter(p => p !== platform)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={platform} className="flex items-center gap-2 capitalize">
                          {getPlatformIcon(platform)}
                          {platform}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recurring Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="recurring"
                      checked={!!scheduleForm.recurring}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setScheduleForm({
                            ...scheduleForm,
                            recurring: {
                              frequency: 'weekly',
                              daysOfWeek: [1],
                              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                            }
                          });
                        } else {
                          setScheduleForm({
                            ...scheduleForm,
                            recurring: undefined
                          });
                        }
                      }}
                    />
                    <Label htmlFor="recurring">Recurring Schedule</Label>
                  </div>

                  {scheduleForm.recurring && (
                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label>Frequency</Label>
                        <Select 
                          value={scheduleForm.recurring.frequency}
                          onValueChange={(value: any) => setScheduleForm({
                            ...scheduleForm,
                            recurring: {
                              ...scheduleForm.recurring!,
                              frequency: value
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={scheduleForm.recurring.endDate?.split('T')[0]}
                          onChange={(e) => setScheduleForm({
                            ...scheduleForm,
                            recurring: {
                              ...scheduleForm.recurring!,
                              endDate: e.target.value + 'T00:00:00.000Z'
                            }
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <Label>Priority</Label>
                  <Select 
                    value={scheduleForm.priority}
                    onValueChange={(value: any) => setScheduleForm({
                      ...scheduleForm,
                      priority: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateSchedule}
                    disabled={scheduleMutation.isPending}
                  >
                    {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Content'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Stats */}
      {schedulingData?.schedulingOverview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Scheduled</p>
                  <p className="text-2xl font-bold">{schedulingData.schedulingOverview.totalScheduledContent}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Schedules</p>
                  <p className="text-2xl font-bold">{schedulingData.schedulingOverview.activeSchedules}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{schedulingData.schedulingOverview.successRate}%</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Posts</p>
                  <p className="text-2xl font-bold">{schedulingData.schedulingOverview.scheduledToday}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights */}
      {schedulingData?.insights && schedulingData.insights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Scheduling Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {schedulingData.insights.map((insight, index) => (
              <Card key={index} className={`border-l-4 ${
                insight.priority === 'high' ? 'border-l-red-500' :
                insight.priority === 'medium' ? 'border-l-yellow-500' : 
                'border-l-green-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'optimization' ? 'bg-blue-100' :
                      insight.type === 'conflict' ? 'bg-red-100' :
                      'bg-green-100'
                    }`}>
                      {insight.type === 'optimization' ? <Lightbulb className="h-4 w-4" /> :
                       insight.type === 'conflict' ? <AlertTriangle className="h-4 w-4" /> :
                       <TrendingUp className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                      {insight.actionable && (
                        <Button size="sm" variant="outline" className="mt-2">
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="flex items-center gap-4">
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {schedulingData?.availableClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calendar Grid - Simplified for demo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.slice(0, 9).map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.clientName}</p>
                      </div>
                      <Badge className={getStatusBadge(item.status).color}>
                        {getStatusBadge(item.status).icon}
                        {item.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(item.scheduledDate).toLocaleDateString()}</span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{new Date(item.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {item.platforms.map((platform) => (
                        <div key={platform} className="p-1 bg-gray-100 rounded">
                          {getPlatformIcon(platform)}
                        </div>
                      ))}
                    </div>
                    
                    {item.recurring && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Repeat className="h-3 w-3" />
                        <span>Repeats {item.recurring.frequency}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {item.status === 'scheduled' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleScheduleControl(item.id, 'pause')}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleScheduleControl(item.id, 'cancel')}
                          >
                            <Square className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      
                      {item.status === 'paused' && (
                        <Button 
                          size="sm"
                          onClick={() => handleScheduleControl(item.id, 'resume')}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button size="sm" variant="ghost">
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {schedulingData?.availableClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedItems.length > 0 && (
              <Button onClick={handleBulkSchedule} disabled={bulkScheduleMutation.isPending}>
                <Zap className="h-4 w-4 mr-2" />
                Bulk Action ({selectedItems.length})
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {filteredContent.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleItemSelection(item.id, !!checked)}
                    />
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.clientName}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={item.priority === 'high' ? 'border-red-200 text-red-700' : 
                                                                item.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                                                                'border-green-200 text-green-700'}>
                            {item.priority}
                          </Badge>
                          <Badge className={getStatusBadge(item.status).color}>
                            {getStatusBadge(item.status).icon}
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(item.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(item.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          <span>{item.timezone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{item.estimatedReach.toLocaleString()} reach</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.platforms.map((platform) => (
                          <div key={platform} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                            {getPlatformIcon(platform)}
                            <span className="capitalize">{platform}</span>
                          </div>
                        ))}
                      </div>
                      
                      {item.recurring && (
                        <div className="flex items-center gap-2 text-sm">
                          <Repeat className="h-4 w-4 text-blue-500" />
                          <span className="text-blue-600">
                            Repeats {item.recurring.frequency} 
                            {item.recurring.endDate && (
                              <> until {new Date(item.recurring.endDate).toLocaleDateString()}</>
                            )}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {item.status === 'scheduled' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleScheduleControl(item.id, 'pause')}
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleScheduleControl(item.id, 'cancel')}
                            >
                              <Square className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        
                        {item.status === 'paused' && (
                          <Button 
                            size="sm"
                            onClick={() => handleScheduleControl(item.id, 'resume')}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        )}
                        
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
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
        </TabsContent>

        {/* Analytics View */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Platform Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedulingData?.platformAnalysis.map((platform) => (
                    <div key={platform.platform} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(platform.platform)}
                        <div>
                          <p className="font-medium capitalize">{platform.platform}</p>
                          <p className="text-sm text-muted-foreground">{platform.scheduledPosts} posts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{platform.successRate}%</p>
                        <p className="text-sm text-muted-foreground">success rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timezone Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timezone Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedulingData?.timezoneAnalysis.map((tz) => (
                    <div key={tz.timezone} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{tz.timezone.replace('America/', '').replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{tz.clientCount} clients</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{tz.scheduledPosts}</p>
                        <p className="text-sm text-muted-foreground">posts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Optimal Times */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Optimal Posting Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {schedulingData?.platformAnalysis.slice(0, 3).map((platform) => (
                  <div key={platform.platform} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      {getPlatformIcon(platform.platform)}
                      <span className="font-medium capitalize">{platform.platform}</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Best Times:</p>
                      {platform.optimalTimes.map((time, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{time}</span>
                          <span className="text-green-600">{platform.avgEngagement}% avg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates View */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Scheduling Templates</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedulingData?.schedulingTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Frequency:</span>
                        <span className="capitalize">{template.frequency}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Time:</span>
                        <span>{template.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Usage:</span>
                        <span>{template.usageCount} times</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {template.platforms.map((platform) => (
                        <div key={platform} className="p-1 bg-gray-100 rounded">
                          {getPlatformIcon(platform)}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm">
                        <Zap className="h-4 w-4 mr-1" />
                        Apply
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
      </Tabs>
    </div>
  );
}