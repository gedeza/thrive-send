'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  Users, 
  BarChart3,
  PieChart,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Eye,
  Mail,
  Settings,
  Zap,
  Target,
  Award,
  FileBarChart,
  LineChart,
  Activity,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Share2,
  Bookmark
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { cn } from '@/lib/utils';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import CrossClientAnalyticsReports from '@/components/reports/CrossClientAnalyticsReports';
import AutomatedReportScheduler from '@/components/reports/AutomatedReportScheduler';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

// Types for reporting system
interface Report {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'revenue' | 'engagement' | 'cross-client' | 'custom';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  status: 'draft' | 'scheduled' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  lastGenerated?: string;
  nextScheduled?: string;
  fileSize?: string;
  downloadUrl?: string;
  settings: {
    dateRange: string;
    clients: string[];
    metrics: string[];
    includeCharts: boolean;
    includeRawData: boolean;
  };
  creator: {
    name: string;
    role: string;
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  metrics: string[];
  charts: string[];
  isPopular: boolean;
  usageCount: number;
  estimatedTime: string;
}

interface ScheduledReport {
  id: string;
  reportId: string;
  reportTitle: string;
  frequency: string;
  nextRun: string;
  recipients: string[];
  isActive: boolean;
  lastRun?: string;
  runCount: number;
}

// Demo reports data
const demoReports: Report[] = [
  {
    id: 'report-1',
    title: 'Monthly Client Performance Overview',
    description: 'Comprehensive performance analysis across all clients with engagement metrics and ROI tracking',
    type: 'cross-client',
    format: 'pdf',
    frequency: 'monthly',
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextScheduled: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    fileSize: '2.4 MB',
    downloadUrl: '/api/reports/download/report-1',
    settings: {
      dateRange: 'last-30-days',
      clients: ['all'],
      metrics: ['engagement', 'reach', 'conversions', 'roi'],
      includeCharts: true,
      includeRawData: false
    },
    creator: {
      name: 'Sarah Johnson',
      role: 'Admin'
    }
  },
  {
    id: 'report-2',
    title: 'Municipal Clients Revenue Analysis',
    description: 'Detailed revenue breakdown for government and municipal clients',
    type: 'revenue',
    format: 'excel',
    frequency: 'weekly',
    status: 'generating',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    nextScheduled: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    settings: {
      dateRange: 'last-90-days',
      clients: ['demo-client-1', 'demo-client-2'],
      metrics: ['revenue', 'orders', 'avg_order_value'],
      includeCharts: true,
      includeRawData: true
    },
    creator: {
      name: 'Michael Chen',
      role: 'Manager'
    }
  },
  {
    id: 'report-3',
    title: 'Boost Performance Deep Dive',
    description: 'Analysis of boost campaign effectiveness across different client types',
    type: 'performance',
    format: 'pdf',
    frequency: 'once',
    status: 'completed',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    fileSize: '1.8 MB',
    downloadUrl: '/api/reports/download/report-3',
    settings: {
      dateRange: 'last-60-days',
      clients: ['all'],
      metrics: ['impressions', 'engagement_rate', 'conversion_rate', 'roi'],
      includeCharts: true,
      includeRawData: false
    },
    creator: {
      name: 'Emily Rodriguez',
      role: 'Analyst'
    }
  },
  {
    id: 'report-4',
    title: 'Client Engagement Trends',
    description: 'Weekly engagement analysis with trend predictions',
    type: 'engagement',
    format: 'pdf',
    frequency: 'weekly',
    status: 'failed',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    settings: {
      dateRange: 'last-7-days',
      clients: ['demo-client-3'],
      metrics: ['likes', 'comments', 'shares', 'saves'],
      includeCharts: true,
      includeRawData: false
    },
    creator: {
      name: 'David Thompson',
      role: 'Creator'
    }
  }
];

const demoTemplates: ReportTemplate[] = [
  {
    id: 'template-1',
    name: 'Executive Summary',
    description: 'High-level overview for C-suite and stakeholders',
    type: 'cross-client',
    category: 'Executive',
    metrics: ['revenue', 'growth', 'client_count', 'roi'],
    charts: ['revenue_trend', 'client_performance'],
    isPopular: true,
    usageCount: 45,
    estimatedTime: '3-5 min'
  },
  {
    id: 'template-2',
    name: 'Client Performance Detail',
    description: 'Comprehensive analysis for individual clients',
    type: 'performance',
    category: 'Operations',
    metrics: ['engagement', 'reach', 'conversions', 'content_performance'],
    charts: ['engagement_trend', 'content_breakdown'],
    isPopular: true,
    usageCount: 67,
    estimatedTime: '2-4 min'
  },
  {
    id: 'template-3',
    name: 'Revenue & Profitability',
    description: 'Financial analysis with profit margins and trends',
    type: 'revenue',
    category: 'Financial',
    metrics: ['revenue', 'profit', 'margins', 'order_value'],
    charts: ['revenue_breakdown', 'profit_trends'],
    isPopular: false,
    usageCount: 23,
    estimatedTime: '4-6 min'
  },
  {
    id: 'template-4',
    name: 'Campaign Effectiveness',
    description: 'Boost and campaign performance analysis',
    type: 'performance',
    category: 'Marketing',
    metrics: ['impressions', 'ctr', 'conversion_rate', 'cost_per_conversion'],
    charts: ['campaign_performance', 'roi_comparison'],
    isPopular: true,
    usageCount: 34,
    estimatedTime: '3-4 min'
  }
];

const demoScheduledReports: ScheduledReport[] = [
  {
    id: 'schedule-1',
    reportId: 'report-1',
    reportTitle: 'Monthly Client Performance Overview',
    frequency: 'monthly',
    nextRun: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    recipients: ['ceo@company.com', 'manager@company.com'],
    isActive: true,
    lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    runCount: 12
  },
  {
    id: 'schedule-2',
    reportId: 'report-2',
    reportTitle: 'Municipal Clients Revenue Analysis',
    frequency: 'weekly',
    nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    recipients: ['finance@company.com'],
    isActive: true,
    lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    runCount: 8
  }
];

// Utility functions
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'generating': return 'bg-blue-100 text-blue-800';
    case 'scheduled': return 'bg-yellow-100 text-yellow-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'draft': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'generating': return <RefreshCw className="h-4 w-4 animate-spin" />;
    case 'scheduled': return <Clock className="h-4 w-4" />;
    case 'failed': return <AlertCircle className="h-4 w-4" />;
    case 'draft': return <FileText className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'performance': return <BarChart3 className="h-4 w-4" />;
    case 'revenue': return <TrendingUp className="h-4 w-4" />;
    case 'engagement': return <Activity className="h-4 w-4" />;
    case 'cross-client': return <Users className="h-4 w-4" />;
    case 'custom': return <Settings className="h-4 w-4" />;
    default: return <FileBarChart className="h-4 w-4" />;
  }
}

// Report card component
interface ReportCardProps {
  report: Report;
  onDownload: (report: Report) => void;
  onDelete: (report: Report) => void;
  onDuplicate: (report: Report) => void;
}

function ReportCard({ report, onDownload, onDelete, onDuplicate }: ReportCardProps) {
  const statusIcon = getStatusIcon(report.status);
  const typeIcon = getTypeIcon(report.type);

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              {typeIcon}
            </div>
            <Badge className={cn("text-xs", getStatusColor(report.status))}>
              <div className="flex items-center gap-1">
                {statusIcon}
                {report.status}
              </div>
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {report.format.toUpperCase()}
          </Badge>
        </div>
        
        <CardTitle className="text-lg">{report.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{report.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>By {report.creator.name}</span>
          <span>•</span>
          <span>{formatDate(report.createdAt)}</span>
          {report.fileSize && (
            <>
              <span>•</span>
              <span>{report.fileSize}</span>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Report details */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {report.type.replace('-', ' ')}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {report.frequency}
          </Badge>
          {report.settings.clients.includes('all') ? (
            <Badge variant="outline" className="text-xs">
              All clients
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              {report.settings.clients.length} clients
            </Badge>
          )}
        </div>
        
        {/* Metrics included */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Metrics:</p>
          <div className="flex flex-wrap gap-1">
            {report.settings.metrics.slice(0, 3).map((metric) => (
              <Badge key={metric} variant="outline" className="text-xs capitalize">
                {metric.replace('_', ' ')}
              </Badge>
            ))}
            {report.settings.metrics.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{report.settings.metrics.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        {/* Schedule info */}
        {report.nextScheduled && (
          <div className="text-sm text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            Next: {formatDate(report.nextScheduled)}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {report.status === 'completed' && report.downloadUrl && (
            <Button 
              onClick={() => onDownload(report)}
              size="sm"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          
          {report.status === 'generating' && (
            <Button size="sm" disabled className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </Button>
          )}
          
          {report.status === 'failed' && (
            <Button size="sm" variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          
          <Button 
            onClick={() => onDuplicate(report)}
            size="sm" 
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={() => onDelete(report)}
            size="sm" 
            variant="ghost"
            className="text-destructive hover:text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Template card component
interface TemplateCardProps {
  template: ReportTemplate;
  onUse: (template: ReportTemplate) => void;
}

function TemplateCard({ template, onUse }: TemplateCardProps) {
  const typeIcon = getTypeIcon(template.type);

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              {typeIcon}
            </div>
            {template.isPopular && (
              <Badge className="bg-orange-100 text-orange-800 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
        </div>
        
        <CardTitle className="text-lg">{template.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{template.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{template.usageCount} uses</span>
          <span>•</span>
          <span>{template.estimatedTime}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Metrics included */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Includes:</p>
          <div className="flex flex-wrap gap-1">
            {template.metrics.slice(0, 3).map((metric) => (
              <Badge key={metric} variant="outline" className="text-xs capitalize">
                {metric.replace('_', ' ')}
              </Badge>
            ))}
            {template.metrics.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.metrics.length - 3} metrics
              </Badge>
            )}
          </div>
        </div>
        
        {/* Charts */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Charts:</p>
          <div className="flex flex-wrap gap-1">
            {template.charts.map((chart) => (
              <Badge key={chart} variant="secondary" className="text-xs capitalize">
                {chart.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Use button */}
        <Button 
          onClick={() => onUse(template)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdvancedReportsPage() {
  const [activeTab, setActiveTab] = useState('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [reports] = useState<Report[]>(demoReports);
  const [templates] = useState<ReportTemplate[]>(demoTemplates);
  const [scheduledReports] = useState<ScheduledReport[]>(demoScheduledReports);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { state: { organizationId } } = useServiceProvider();

  // Filter and sort reports
  const filteredReports = reports
    .filter(report => {
      const matchesSearch = searchQuery === '' || 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || report.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title': return a.title.localeCompare(b.title);
        case 'status': return a.status.localeCompare(b.status);
        default: return 0;
      }
    });

  const handleDownloadReport = (report: Report) => {
    // TODO: Implement report download
    console.log('Downloading report:', report);
  };

  const handleDeleteReport = (report: Report) => {
    // TODO: Implement report deletion
    console.log('Deleting report:', report);
  };

  const handleDuplicateReport = (report: Report) => {
    // TODO: Implement report duplication
    console.log('Duplicating report:', report);
  };

  const handleUseTemplate = (template: ReportTemplate) => {
    // TODO: Implement template usage
    console.log('Using template:', template);
    setIsCreateDialogOpen(true);
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileBarChart className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Advanced Reports
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate comprehensive analytics reports, schedule automated delivery, and gain deep insights across all your clients
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 mb-8">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
                <DialogDescription>
                  Generate a custom report with your preferred metrics and settings
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-title">Report Title</Label>
                    <Input id="report-title" placeholder="Enter report title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="cross-client">Cross-Client</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="report-description">Description</Label>
                  <Textarea 
                    id="report-description" 
                    placeholder="Describe what this report will analyze"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">One-time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Report Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-charts" />
                      <Label htmlFor="include-charts" className="text-sm">Include charts and visualizations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-raw-data" />
                      <Label htmlFor="include-raw-data" className="text-sm">Include raw data tables</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="email-delivery" />
                      <Label htmlFor="email-delivery" className="text-sm">Email delivery to stakeholders</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>
                    Create Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                  <p className="text-3xl font-bold">{reports.length}</p>
                  <p className="text-xs text-green-600 mt-1">+3 this month</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Scheduled Reports</p>
                  <p className="text-3xl font-bold">{scheduledReports.length}</p>
                  <p className="text-xs text-blue-600 mt-1">2 running weekly</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Templates Available</p>
                  <p className="text-3xl font-bold">{templates.length}</p>
                  <p className="text-xs text-purple-600 mt-1">3 popular picks</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Bookmark className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reports Generated</p>
                  <p className="text-3xl font-bold">47</p>
                  <p className="text-xs text-green-600 mt-1">This quarter</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="reports">My Reports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px] bg-background">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="cross-client">Cross-Client</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] bg-background">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="generating">Generating</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px] bg-background">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onDownload={handleDownloadReport}
                  onDelete={handleDeleteReport}
                  onDuplicate={handleDuplicateReport}
                />
              ))}
            </div>

            {filteredReports.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or create a new report
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            {/* Scheduled Reports */}
            <div className="space-y-4">
              {scheduledReports.map((schedule) => (
                <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{schedule.reportTitle}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="capitalize">{schedule.frequency}</span>
                          <span>•</span>
                          <span>{schedule.runCount} runs</span>
                          <span>•</span>
                          <span>{schedule.recipients.length} recipients</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={cn(
                          "mb-2",
                          schedule.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        )}>
                          {schedule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Next: {formatDate(schedule.nextRun)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {schedule.recipients.map((email, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {email}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {scheduledReports.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No scheduled reports</h3>
                  <p className="text-muted-foreground mb-4">
                    Set up automated report generation and delivery
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <CrossClientAnalyticsReports />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <AutomatedReportScheduler />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}