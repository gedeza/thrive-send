'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Download,
  Settings,
  Play,
  Pause,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  FileText,
  BarChart3,
  Users,
  TrendingUp,
  Zap,
  Send,
  Archive
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// Types for automated reporting
interface ScheduledReport {
  id: string;
  title: string;
  type: 'performance' | 'revenue' | 'engagement' | 'cross-client' | 'executive-summary';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  status: 'active' | 'paused' | 'completed' | 'failed';
  recipients: string[];
  format: 'pdf' | 'excel' | 'email';
  nextRun: string;
  lastRun?: string;
  createdAt: string;
  parameters: {
    timeRange: string;
    clientIds?: string[];
    metrics?: string[];
    includeCharts: boolean;
    includeInsights: boolean;
  };
  deliverySettings: {
    emailSubject?: string;
    emailBody?: string;
    attachmentName?: string;
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ElementType;
  defaultFrequency: string;
  estimatedRuntime: string;
  sections: string[];
}

// Live API service functions
async function fetchScheduledReports(organizationId: string): Promise<{reports: ScheduledReport[], isDemoData: boolean} | null> {
  try {
    const response = await fetch(`/api/service-provider/reports/automated?organizationId=${organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      reports: data.reports || [],
      isDemoData: data.isDemoData || false
    };
  } catch (error) {
    console.error('Failed to fetch scheduled reports:', error);
    return null;
  }
}

async function createScheduledReport(organizationId: string, reportData: Partial<ScheduledReport>): Promise<ScheduledReport | null> {
  try {
    const response = await fetch('/api/service-provider/reports/automated', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        ...reportData
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.report;
  } catch (error) {
    console.error('Failed to create scheduled report:', error);
    return null;
  }
}

async function updateScheduledReport(reportId: string, organizationId: string, action: string, updateData?: any): Promise<boolean> {
  try {
    const response = await fetch('/api/service-provider/reports/automated', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportId,
        organizationId,
        action,
        updateData
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to update scheduled report:', error);
    return false;
  }
}

async function deleteScheduledReport(reportId: string, organizationId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/service-provider/reports/automated?reportId=${reportId}&organizationId=${organizationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to delete scheduled report:', error);
    return false;
  }
}

// Demo data (kept for reference but not used)
const demoScheduledReports: ScheduledReport[] = [
  {
    id: 'report-1',
    title: 'Weekly Performance Summary',
    type: 'performance',
    frequency: 'weekly',
    status: 'active',
    recipients: ['admin@springfield.gov', 'marketing@springfield.gov'],
    format: 'pdf',
    nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastRun: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    parameters: {
      timeRange: 'last-7-days',
      clientIds: ['demo-client-1'],
      metrics: ['engagement', 'reach', 'conversions'],
      includeCharts: true,
      includeInsights: true
    },
    deliverySettings: {
      emailSubject: 'Weekly Performance Report - {{date}}',
      emailBody: 'Please find attached your weekly performance report.',
      attachmentName: 'Springfield_Weekly_Report_{{date}}'
    }
  },
  {
    id: 'report-2',
    title: 'Monthly Revenue Dashboard',
    type: 'revenue',
    frequency: 'monthly',
    status: 'active',
    recipients: ['finance@thrivesend.com', 'admin@thrivesend.com'],
    format: 'excel',
    nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    parameters: {
      timeRange: 'last-30-days',
      includeCharts: true,
      includeInsights: false
    },
    deliverySettings: {
      emailSubject: 'Monthly Revenue Report - {{month}} {{year}}',
      emailBody: 'Monthly revenue analysis and client performance metrics attached.',
      attachmentName: 'Revenue_Report_{{month}}_{{year}}'
    }
  },
  {
    id: 'report-3',
    title: 'Cross-Client Comparison',
    type: 'cross-client',
    frequency: 'weekly',
    status: 'paused',
    recipients: ['strategy@thrivesend.com'],
    format: 'pdf',
    nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    parameters: {
      timeRange: 'last-14-days',
      clientIds: ['demo-client-1', 'demo-client-2', 'demo-client-3'],
      metrics: ['engagement', 'growth', 'revenue'],
      includeCharts: true,
      includeInsights: true
    },
    deliverySettings: {
      emailSubject: 'Cross-Client Analysis Report',
      emailBody: 'Weekly comparison of client performance metrics.',
      attachmentName: 'Cross_Client_Report_{{date}}'
    }
  }
];

const reportTemplates: ReportTemplate[] = [
  {
    id: 'template-performance',
    name: 'Performance Report',
    type: 'performance',
    description: 'Comprehensive performance analytics for individual clients',
    icon: BarChart3,
    defaultFrequency: 'weekly',
    estimatedRuntime: '2-3 minutes',
    sections: ['Engagement Metrics', 'Content Performance', 'Trend Analysis', 'Recommendations']
  },
  {
    id: 'template-revenue',
    name: 'Revenue Dashboard',
    type: 'revenue',
    description: 'Financial performance and boost marketplace analytics',
    icon: TrendingUp,
    defaultFrequency: 'monthly',
    estimatedRuntime: '1-2 minutes',
    sections: ['Revenue Summary', 'Client Spending', 'Product Performance', 'Growth Metrics']
  },
  {
    id: 'template-cross-client',
    name: 'Cross-Client Analysis',
    type: 'cross-client',
    description: 'Compare performance across all managed clients',
    icon: Users,
    defaultFrequency: 'weekly',
    estimatedRuntime: '3-5 minutes',
    sections: ['Client Rankings', 'Industry Benchmarks', 'Growth Comparison', 'Strategic Insights']
  },
  {
    id: 'template-executive',
    name: 'Executive Summary',
    type: 'executive-summary',
    description: 'High-level overview for stakeholders and decision makers',
    icon: FileText,
    defaultFrequency: 'monthly',
    estimatedRuntime: '1 minute',
    sections: ['Key Metrics', 'Performance Highlights', 'Growth Summary', 'Action Items']
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
    case 'active': return 'bg-success/10 text-success';
    case 'paused': return 'bg-warning/10 text-warning';
    case 'completed': return 'bg-primary/10 text-primary';
    case 'failed': return 'bg-destructive/10 text-destructive';
    default: return 'bg-muted text-muted-foreground';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'active': return <Play className="h-3 w-3" />;
    case 'paused': return <Pause className="h-3 w-3" />;
    case 'completed': return <CheckCircle className="h-3 w-3" />;
    case 'failed': return <AlertCircle className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
  }
}

function getFrequencyColor(frequency: string): string {
  switch (frequency) {
    case 'daily': return 'bg-purple-500/10 text-purple-700';
    case 'weekly': return 'bg-primary/10 text-primary';
    case 'monthly': return 'bg-success/10 text-success';
    case 'quarterly': return 'bg-orange-500/10 text-orange-700';
    default: return 'bg-muted text-muted-foreground';
  }
}

// Report Card Component
interface ReportCardProps {
  report: ScheduledReport;
  onToggleStatus: (id: string) => void;
  onEdit: (report: ScheduledReport) => void;
  onDelete: (id: string) => void;
  onRunNow: (id: string) => void;
}

function ReportCard({ report, onToggleStatus, onEdit, onDelete, onRunNow }: ReportCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {report.type === 'performance' && <BarChart3 className="h-5 w-5 text-primary" />}
              {report.type === 'revenue' && <TrendingUp className="h-5 w-5 text-primary" />}
              {report.type === 'cross-client' && <Users className="h-5 w-5 text-primary" />}
              {report.type === 'executive-summary' && <FileText className="h-5 w-5 text-primary" />}
              {report.type === 'engagement' && <Zap className="h-5 w-5 text-primary" />}
            </div>
            <div>
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <p className="text-sm text-muted-foreground capitalize">{report.type.replace('-', ' ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(report.status)}>
              {getStatusIcon(report.status)}
              <span className="ml-1 capitalize">{report.status}</span>
            </Badge>
            <Badge className={getFrequencyColor(report.frequency)}>
              {report.frequency}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Schedule Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Next Run</p>
              <p className="font-medium">{formatDate(report.nextRun)}</p>
            </div>
            {report.lastRun && (
              <div>
                <p className="text-muted-foreground">Last Run</p>
                <p className="font-medium">{formatDate(report.lastRun)}</p>
              </div>
            )}
          </div>

          {/* Recipients */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Recipients ({report.recipients.length})</p>
            <div className="flex flex-wrap gap-1">
              {report.recipients.slice(0, 2).map((email, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {email.split('@')[0]}
                </Badge>
              ))}
              {report.recipients.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{report.recipients.length - 2} more
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleStatus(report.id)}
                className="flex items-center gap-1"
              >
                {report.status === 'active' ? (
                  <>
                    <Pause className="h-3 w-3" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    Resume
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRunNow(report.id)}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Run Now
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(report)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(report.id)}
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Create Report Dialog Component
interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateReport: (report: Partial<ScheduledReport>) => void;
  isCreating?: boolean;
}

function CreateReportDialog({ open, onOpenChange, onCreateReport, isCreating = false }: CreateReportDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    frequency: 'weekly',
    recipients: '',
    format: 'pdf',
    timeRange: 'last-7-days',
    emailSubject: '',
    emailBody: '',
    includeCharts: true,
    includeInsights: true
  });

  const handleSubmit = () => {
    if (!selectedTemplate || !formData.title || !formData.recipients) return;

    const newReport: Partial<ScheduledReport> = {
      title: formData.title,
      type: selectedTemplate.type as any,
      frequency: formData.frequency as any,
      recipients: formData.recipients.split(',').map(email => email.trim()),
      format: formData.format as any,
      status: 'active',
      parameters: {
        timeRange: formData.timeRange,
        includeCharts: formData.includeCharts,
        includeInsights: formData.includeInsights
      },
      deliverySettings: {
        emailSubject: formData.emailSubject || `${formData.title} - {{date}}`,
        emailBody: formData.emailBody || 'Please find your scheduled report attached.',
        attachmentName: `${formData.title.replace(/\s+/g, '_')}_{{date}}`
      }
    };

    onCreateReport(newReport);
    onOpenChange(false);
    
    // Reset form
    setSelectedTemplate(null);
    setFormData({
      title: '',
      frequency: 'weekly',
      recipients: '',
      format: 'pdf',
      timeRange: 'last-7-days',
      emailSubject: '',
      emailBody: '',
      includeCharts: true,
      includeInsights: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Automated Report</DialogTitle>
          <DialogDescription>
            Set up a recurring report to be automatically generated and delivered
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          {!selectedTemplate ? (
            <div>
              <Label className="text-base font-medium">Choose Report Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {reportTemplates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Default: {template.defaultFrequency}</span>
                              <span>Runtime: {template.estimatedRuntime}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Selected Template Summary */}
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <selectedTemplate.icon className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">{selectedTemplate.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Change
                </Button>
              </div>

              {/* Report Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Weekly Performance Summary"
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={formData.format} onValueChange={(value) => setFormData(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="email">Email Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeRange">Time Range</Label>
                  <Select value={formData.timeRange} onValueChange={(value) => setFormData(prev => ({ ...prev, timeRange: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-7-days">Last 7 days</SelectItem>
                      <SelectItem value="last-30-days">Last 30 days</SelectItem>
                      <SelectItem value="last-90-days">Last 90 days</SelectItem>
                      <SelectItem value="last-year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="recipients">Email Recipients</Label>
                <Input
                  id="recipients"
                  value={formData.recipients}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
                  placeholder="admin@example.com, manager@example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate multiple emails with commas</p>
              </div>

              {/* Report Options */}
              <div className="space-y-3">
                <Label>Report Options</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={formData.includeCharts}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeCharts: checked as boolean }))}
                  />
                  <Label htmlFor="includeCharts" className="text-sm">Include charts and visualizations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeInsights"
                    checked={formData.includeInsights}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeInsights: checked as boolean }))}
                  />
                  <Label htmlFor="includeInsights" className="text-sm">Include AI-generated insights</Label>
                </div>
              </div>

              {/* Email Customization */}
              <div className="space-y-3">
                <Label>Email Delivery Settings</Label>
                <div>
                  <Label htmlFor="emailSubject" className="text-sm">Subject Line</Label>
                  <Input
                    id="emailSubject"
                    value={formData.emailSubject}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailSubject: e.target.value }))}
                    placeholder="Use {{date}}, {{month}}, {{year}} for dynamic dates"
                  />
                </div>
                <div>
                  <Label htmlFor="emailBody" className="text-sm">Email Message</Label>
                  <Textarea
                    id="emailBody"
                    value={formData.emailBody}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailBody: e.target.value }))}
                    placeholder="Custom message to include in the email..."
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedTemplate || !formData.title || !formData.recipients || isCreating}
          >
            {isCreating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating Report...
              </>
            ) : (
              'Create Report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AutomatedReportScheduler() {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoData, setIsDemoData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const { state: { organizationId } } = useServiceProvider();
  const { toast } = useToast();

  // Load scheduled reports from API
  const loadReports = async () => {
    if (!organizationId) return;
    
    setIsLoading(true);
    try {
      const result = await fetchScheduledReports(organizationId);
      if (result) {
        setReports(result.reports);
        setIsDemoData(result.isDemoData);
        setError(null);
      } else {
        setError('Failed to load scheduled reports');
      }
    } catch (err) {
      console.error('Reports loading error:', err);
      setError('Failed to load scheduled reports');
    } finally {
      setIsLoading(false);
    }
  };

  // Load reports on component mount
  useEffect(() => {
    loadReports();
  }, [organizationId]);

  const handleToggleStatus = async (reportId: string) => {
    if (!organizationId) return;

    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const newStatus = report.status === 'active' ? 'paused' : 'active';
    const action = newStatus === 'active' ? 'resume' : 'pause';

    const success = await updateScheduledReport(reportId, organizationId, action);
    
    if (success) {
      // Update local state immediately for better UX
      setReports(prevReports =>
        prevReports.map(r =>
          r.id === reportId
            ? { ...r, status: newStatus as any }
            : r
        )
      );
      
      toast({
        title: `Report ${action === 'resume' ? 'Resumed' : 'Paused'}`,
        description: `"${report.title}" has been ${action === 'resume' ? 'resumed' : 'paused'} successfully.`,
        variant: "default"
      });
    } else {
      toast({
        title: "Error",
        description: `Failed to ${action} the report. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (report: ScheduledReport) => {
    // TODO: Implement edit functionality
    console.log('Edit report:', report);
  };

  const handleDelete = async (reportId: string) => {
    if (!organizationId) return;

    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const success = await deleteScheduledReport(reportId, organizationId);
    
    if (success) {
      // Update local state immediately
      setReports(prevReports => prevReports.filter(r => r.id !== reportId));
      
      toast({
        title: "Report Deleted",
        description: `"${report.title}" has been permanently deleted.`,
        variant: "default"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRunNow = async (reportId: string) => {
    setIsLoading(true);
    // Simulate running report
    setTimeout(() => {
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId
            ? { ...report, lastRun: new Date().toISOString() }
            : report
        )
      );
      setIsLoading(false);
    }, 2000);
  };

  const handleCreateReport = async (newReportData: Partial<ScheduledReport>) => {
    if (!organizationId) {
      toast({
        title: "Error",
        description: "Organization ID is required to create a report.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingReport(true);
    
    try {
      const createdReport = await createScheduledReport(organizationId, newReportData);
      
      if (createdReport) {
        // Show success toast
        toast({
          title: "Report Created Successfully!",
          description: `"${createdReport.title}" has been scheduled and will run ${createdReport.frequency}.`,
          variant: "default"
        });
        
        // Refresh the reports list to show the new report
        await loadReports();
      } else {
        // Show error toast if creation failed
        toast({
          title: "Failed to Create Report",
          description: "There was an error creating your report. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the report.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingReport(false);
    }
  };

  const activeReports = reports.filter(r => r.status === 'active').length;
  const pausedReports = reports.filter(r => r.status === 'paused').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Automated Reports
          </h2>
          <p className="text-muted-foreground mt-1">
            Schedule and manage automated report generation and delivery
          </p>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{reports.length}</p>
            <p className="text-xs text-muted-foreground">Total Reports</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Play className="h-6 w-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{activeReports}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Pause className="h-6 w-6 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">{pausedReports}</p>
            <p className="text-xs text-muted-foreground">Paused</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Mail className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {reports.reduce((sum, r) => sum + r.recipients.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Recipients</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRunNow={handleRunNow}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Recent Report Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports
              .filter(r => r.lastRun)
              .sort((a, b) => new Date(b.lastRun!).getTime() - new Date(a.lastRun!).getTime())
              .slice(0, 5)
              .map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Delivered to {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDate(report.lastRun!)}</p>
                    <Badge variant="outline" className="text-xs">
                      {report.format.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Report Dialog */}
      <CreateReportDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateReport={handleCreateReport}
        isCreating={isCreatingReport}
      />
    </div>
  );
}