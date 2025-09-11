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

interface Schedule {
  id: string;
  title: string;
  contentType: string;
  clientId: string;
  clientName: string;
  scheduleType: 'recurring' | 'one_time';
  frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  status: 'active' | 'paused' | 'scheduled' | 'cancelled';
  nextRun: string;
  scheduledDate?: string;
  platforms: string[];
  timezone: string;
  priority: 'high' | 'medium' | 'low';
  template: {
    name: string;
    fields: string[];
  };
  recurring?: {
    frequency: string;
    endDate?: string | null;
  };
  approval: {
    required: boolean;
    approvers: string[];
    autoApprove: boolean;
  };
  estimatedReach?: number;
}

interface SchedulingData {
  schedules: Schedule[];
  summary: {
    total: number;
    active: number;
    scheduled: number;
    paused: number;
    recurring: number;
    oneTime: number;
  };
  upcomingRuns: Array<{
    id: string;
    title: string;
    clientName: string;
    nextRun: string;
    contentType: string;
    requiresApproval: boolean;
  }>;
  clients: Array<{
    id: string;
    name: string;
    scheduleCount: number;
  }>;
}

interface AdvancedContentSchedulerProps {
  defaultView?: 'overview' | 'schedules' | 'upcoming' | 'analytics';
}

export function AdvancedContentScheduler({ 
  defaultView = 'overview' 
}: AdvancedContentSchedulerProps) {
  const { organizationId } = useServiceProvider();
  const queryClient = useQueryClient();

  // State management
  const [currentView, setCurrentView] = useState<'overview' | 'schedules' | 'upcoming' | 'analytics'>(defaultView);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    contentType: 'social_post',
    clientId: '',
    scheduleType: 'recurring',
    frequency: 'weekly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '09:00',
    scheduledDate: '',
    timezone: 'America/New_York',
    templateId: 'template-1',
    socialPlatforms: [] as string[],
    approval: {
      required: true,
      autoApprove: false
    }
  });

  // Data queries
  const { 
    data: schedulingData, 
    isLoading: dataLoading,
    refetch: refetchData
  } = useQuery<SchedulingData>({
    queryKey: ['scheduling', organizationId, selectedClient],
    queryFn: async () => {
      const params = new URLSearchParams({
        organizationId: organizationId || '',
        clientId: selectedClient,
        view: 'list'
      });

      const response = await fetch(`/api/service-provider/scheduling?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch scheduling data');
      }
      return response.json();
    },
    enabled: !!organizationId,
  });

  // Mutations
  const scheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const response = await fetch('/api/service-provider/scheduling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling'] });
      setShowCreateForm(false);
      resetScheduleForm();
    },
  });

  const controlMutation = useMutation({
    mutationFn: async ({ scheduleId, action }: { scheduleId: string; action: string }) => {
      const response = await fetch('/api/service-provider/scheduling', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId, action })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling'] });
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
    if (!scheduleForm.clientId || !scheduleForm.title) {
      return;
    }

    await scheduleMutation.mutateAsync({
      ...scheduleForm,
      organizationId: organizationId || ''
    });
  };

  // Handle schedule control
  const handleScheduleControl = async (
    scheduleId: string,
    action: 'pause' | 'resume' | 'cancel'
  ) => {
    await controlMutation.mutateAsync({
      scheduleId,
      action
    });
  };

  // Reset schedule form
  const resetScheduleForm = () => {
    setScheduleForm({
      title: '',
      contentType: 'social_post',
      clientId: '',
      scheduleType: 'recurring',
      frequency: 'weekly',
      dayOfWeek: 1,
      dayOfMonth: 1,
      time: '09:00',
      scheduledDate: '',
      timezone: 'America/New_York',
      templateId: 'template-1',
      socialPlatforms: [],
      approval: {
        required: true,
        autoApprove: false
      }
    });
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'scheduled': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'newsletter': return '📧';
      case 'social_post': return '📱';
      case 'report': return '📊';
      case 'alert': return '🚨';
      case 'analytics': return '📈';
      default: return '📄';
    }
  };

  const formatNextRun = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter scheduled content
  const filteredContent = schedulingData?.schedules.filter(item => {
    if (selectedClient !== 'all' && item.clientId !== selectedClient) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (platformFilter !== 'all' && !item.platforms.includes(platformFilter)) return false;
    return true;
  }) || [];

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scheduling data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Advanced Content Scheduler</h2>
          <p className="text-sm lg:text-base text-gray-600">Manage recurring and scheduled content across all clients</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {schedulingData?.clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} ({client.scheduleCount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </div>

      <Tabs value={currentView} onValueChange={(value: unknown) => setCurrentView(value)} className="space-y-4 lg:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="schedules" className="text-xs sm:text-sm">All Schedules</TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming Runs</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Schedules</p>
                    <p className="text-2xl font-bold text-gray-900">{schedulingData?.summary.total || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{schedulingData?.summary.active || 0}</p>
                  </div>
                  <Play className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recurring</p>
                    <p className="text-2xl font-bold text-blue-600">{schedulingData?.summary.recurring || 0}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">One-Time</p>
                    <p className="text-2xl font-bold text-orange-600">{schedulingData?.summary.oneTime || 0}</p>
                  </div>
                  <Square className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Next 10 Scheduled Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedulingData?.upcomingRuns.map(run => (
                  <div key={run.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getContentTypeIcon(run.contentType)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{run.title}</p>
                        <p className="text-sm text-gray-600">{run.clientName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatNextRun(run.nextRun)}</p>
                      {run.requiresApproval && (
                        <Badge variant="outline" className="text-xs">Requires Approval</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <div className="grid gap-4">
            {filteredContent.map(schedule => (
              <Card key={schedule.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{getContentTypeIcon(schedule.contentType)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{schedule.title}</h3>
                        <p className="text-sm text-gray-600">{schedule.clientName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`text-white ${getStatusColor(schedule.status)}`}>
                            {schedule.status}
                          </Badge>
                          <Badge variant="outline">
                            {schedule.scheduleType === 'recurring' ? schedule.frequency : 'One-time'}
                          </Badge>
                          <Badge variant="outline">{schedule.contentType}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Next Run</p>
                      <p className="font-medium text-gray-900">{formatNextRun(schedule.nextRun)}</p>
                      <div className="flex items-center gap-2 mt-3">
                        {schedule.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScheduleControl(schedule.id, 'pause')}
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        {schedule.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScheduleControl(schedule.id, 'resume')}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Resume
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleScheduleControl(schedule.id, 'cancel')}
                        >
                          <Square className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">Template</p>
                        <p>{schedule.template.name}</p>
                      </div>
                      <div>
                        <p className="font-medium">Timezone</p>
                        <p>{schedule.timezone}</p>
                      </div>
                      <div>
                        <p className="font-medium">Approval Required</p>
                        <p>{schedule.approval.required ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    
                    {schedule.platforms.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-600 mb-2">Social Platforms</p>
                        <div className="flex gap-2">
                          {schedule.platforms.map(platform => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Scheduled Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedulingData?.upcomingRuns.map(run => (
                  <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getContentTypeIcon(run.contentType)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{run.title}</h4>
                        <p className="text-sm text-gray-600">{run.clientName}</p>
                        <p className="text-xs text-gray-500">{run.contentType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatNextRun(run.nextRun)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(run.nextRun).toLocaleString()}
                      </p>
                      {run.requiresApproval && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Requires Approval
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">94.5%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Engagement</p>
                    <p className="text-2xl font-bold text-blue-600">8.7%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Scheduled</p>
                    <p className="text-2xl font-bold text-gray-900">247</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedulingData?.clients.filter(c => c.id !== 'all').map(client => (
                    <div key={client.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{client.name}</span>
                      <span className="font-medium">{client.scheduleCount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {showCreateForm && (
        <CreateScheduleForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={(data) => scheduleMutation.mutate(data)}
          clients={schedulingData?.clients || []}
          organizationId={organizationId || ''}
        />
      )}
    </div>
  );
};

interface CreateScheduleFormProps {
  onClose: () => void;
  onSubmit: (data: unknown) => void;
  clients: Array<{ id: string; name: string; scheduleCount: number }>;
  organizationId: string;
}

const CreateScheduleForm: React.FC<CreateScheduleFormProps> = ({
  onClose,
  onSubmit,
  clients,
  organizationId
}) => {
  const [formData, setFormData] = useState({
    title: '',
    contentType: 'social_post',
    clientId: '',
    scheduleType: 'recurring',
    frequency: 'weekly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '09:00',
    scheduledDate: '',
    timezone: 'America/New_York',
    templateId: 'template-1',
    socialPlatforms: [],
    approval: {
      required: true,
      autoApprove: false
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      organizationId
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create New Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social_post">Social Post</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="clientId">Client</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.filter(c => c.id !== 'all').map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="scheduleType">Schedule Type</Label>
              <Select
                value={formData.scheduleType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, scheduleType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recurring">Recurring</SelectItem>
                  <SelectItem value="one_time">One Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.scheduleType === 'recurring' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
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
            )}

            {formData.scheduleType === 'one_time' && (
              <div>
                <Label htmlFor="scheduledDate">Scheduled Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  required
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                Create Schedule
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedContentScheduler;