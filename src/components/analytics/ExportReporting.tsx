'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Download,
  Share,
  FileText,
  Mail,
  Calendar as CalendarIcon,
  Settings,
  Users,
  Clock,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  FileSpreadsheet,
  FileImage,
  Presentation,
  Send,
  Schedule,
  Repeat,
  Star,
  Eye,
  Edit,
  Trash,
  Plus,
  Copy,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'pptx' | 'png' | 'svg';
  metrics: string[];
  charts: string[];
  dateRange: DateRange | undefined;
  filters: Record<string, any>;
  includeSummary: boolean;
  includeRawData: boolean;
  includeVisualizations: boolean;
  branding: boolean;
  watermark: boolean;
}

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  format: 'pdf' | 'excel' | 'csv';
  recipients: string[];
  metrics: string[];
  lastSent: Date;
  nextSend: Date;
  isActive: boolean;
  createdBy: string;
}

interface ExportReportingProps {
  className?: string;
}

export function ExportReporting({ className }: ExportReportingProps) {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'pdf',
    metrics: ['totalViews', 'engagementRate', 'conversions'],
    charts: ['performanceTrend', 'platformComparison'],
    dateRange: undefined,
    filters: {},
    includeSummary: true,
    includeRawData: false,
    includeVisualizations: true,
    branding: true,
    watermark: false
  });

  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: 'report-1',
      name: 'Weekly Performance Summary',
      description: 'Comprehensive weekly analytics report for stakeholders',
      frequency: 'weekly',
      format: 'pdf',
      recipients: ['ceo@company.com', 'marketing@company.com'],
      metrics: ['totalViews', 'engagementRate', 'conversions', 'revenue'],
      lastSent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextSend: new Date(),
      isActive: true,
      createdBy: 'Marketing Team'
    },
    {
      id: 'report-2',
      name: 'Monthly Executive Dashboard',
      description: 'High-level monthly metrics for executive team',
      frequency: 'monthly',
      format: 'excel',
      recipients: ['executives@company.com'],
      metrics: ['revenue', 'conversions', 'customerAcquisition'],
      lastSent: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextSend: addDays(new Date(), 5),
      isActive: true,
      createdBy: 'Analytics Team'
    }
  ]);

  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    frequency: 'weekly' as const,
    format: 'pdf' as const,
    recipients: '',
    metrics: [] as string[]
  });

  const availableMetrics = [
    { id: 'totalViews', label: 'Total Views', category: 'Engagement' },
    { id: 'engagementRate', label: 'Engagement Rate', category: 'Engagement' },
    { id: 'clickThroughRate', label: 'Click-Through Rate', category: 'Engagement' },
    { id: 'conversions', label: 'Conversions', category: 'Performance' },
    { id: 'conversionRate', label: 'Conversion Rate', category: 'Performance' },
    { id: 'revenue', label: 'Revenue', category: 'Financial' },
    { id: 'costPerAcquisition', label: 'Cost Per Acquisition', category: 'Financial' },
    { id: 'returnOnAdSpend', label: 'Return on Ad Spend', category: 'Financial' },
    { id: 'audienceGrowth', label: 'Audience Growth', category: 'Audience' },
    { id: 'demographicBreakdown', label: 'Demographic Breakdown', category: 'Audience' }
  ];

  const availableCharts = [
    { id: 'performanceTrend', label: 'Performance Trend', type: 'line' },
    { id: 'platformComparison', label: 'Platform Comparison', type: 'bar' },
    { id: 'audienceBreakdown', label: 'Audience Breakdown', type: 'pie' },
    { id: 'conversionFunnel', label: 'Conversion Funnel', type: 'funnel' },
    { id: 'heatMap', label: 'Performance Heat Map', type: 'heat' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Report', icon: FileText, description: 'Professional formatted report' },
    { value: 'excel', label: 'Excel Workbook', icon: FileSpreadsheet, description: 'Data tables and charts' },
    { value: 'csv', label: 'CSV Data', icon: FileSpreadsheet, description: 'Raw data export' },
    { value: 'pptx', label: 'PowerPoint', icon: Presentation, description: 'Presentation slides' },
    { value: 'png', label: 'PNG Image', icon: FileImage, description: 'High-resolution charts' },
    { value: 'svg', label: 'SVG Vector', icon: FileImage, description: 'Scalable vector graphics' }
  ];

  const handleMetricToggle = (metricId: string) => {
    setExportConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(id => id !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const handleChartToggle = (chartId: string) => {
    setExportConfig(prev => ({
      ...prev,
      charts: prev.charts.includes(chartId)
        ? prev.charts.filter(id => id !== chartId)
        : [...prev.charts, chartId]
    }));
  };

  const handleExport = async () => {
    // Simulate export process
    console.log('Exporting with config:', exportConfig);
    
    // Here you would typically make an API call to generate the export
    // For demo purposes, we'll just show a success message
    alert(`Export initiated! ${exportConfig.format.toUpperCase()} report will be ready shortly.`);
  };

  const handleScheduleReport = () => {
    if (!newReport.name.trim()) return;

    const report: ScheduledReport = {
      id: `report-${Date.now()}`,
      name: newReport.name,
      description: newReport.description,
      frequency: newReport.frequency,
      format: newReport.format,
      recipients: newReport.recipients.split(',').map(email => email.trim()),
      metrics: newReport.metrics,
      lastSent: new Date(),
      nextSend: addDays(new Date(), newReport.frequency === 'daily' ? 1 : newReport.frequency === 'weekly' ? 7 : 30),
      isActive: true,
      createdBy: 'Current User'
    };

    setScheduledReports(prev => [...prev, report]);
    setNewReport({
      name: '',
      description: '',
      frequency: 'weekly',
      format: 'pdf',
      recipients: '',
      metrics: []
    });
  };

  const toggleReportStatus = (reportId: string) => {
    setScheduledReports(prev =>
      prev.map(report =>
        report.id === reportId
          ? { ...report, isActive: !report.isActive }
          : report
      )
    );
  };

  const deleteReport = (reportId: string) => {
    setScheduledReports(prev => prev.filter(report => report.id !== reportId));
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: 'bg-blue-100 text-blue-700',
      weekly: 'bg-green-100 text-green-700',
      monthly: 'bg-purple-100 text-purple-700',
      quarterly: 'bg-orange-100 text-orange-700'
    };
    return colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getFormatIcon = (format: string) => {
    const icons = {
      pdf: FileText,
      excel: FileSpreadsheet,
      csv: FileSpreadsheet,
      pptx: Presentation
    };
    return icons[format as keyof typeof icons] || FileText;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Download className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Export & Reporting</h1>
            <p className="text-muted-foreground">
              Generate and schedule comprehensive analytics reports
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Share className="mr-2 h-4 w-4" />
            Share Template
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Quick Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            One-Time Export
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Schedule className="h-4 w-4" />
            Scheduled Reports
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Export Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Format Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {formatOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <div
                          key={option.value}
                          className={cn(
                            'p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md',
                            exportConfig.format === option.value
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/50'
                          )}
                          onClick={() => setExportConfig(prev => ({ ...prev, format: option.value as any }))}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-medium">{option.label}</h4>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Metrics</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Choose which metrics to include in your report
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Engagement', 'Performance', 'Financial', 'Audience'].map((category) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          {category}
                        </h4>
                        <div className="grid gap-2 md:grid-cols-2">
                          {availableMetrics
                            .filter(metric => metric.category === category)
                            .map((metric) => (
                              <div key={metric.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={metric.id}
                                  checked={exportConfig.metrics.includes(metric.id)}
                                  onCheckedChange={() => handleMetricToggle(metric.id)}
                                />
                                <Label htmlFor={metric.id} className="text-sm font-normal">
                                  {metric.label}
                                </Label>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Charts Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Visualizations</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select charts and visualizations to include
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {availableCharts.map((chart) => (
                      <div
                        key={chart.id}
                        className={cn(
                          'p-3 border rounded-lg cursor-pointer transition-all',
                          exportConfig.charts.includes(chart.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => handleChartToggle(chart.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded">
                            {chart.type === 'line' && <LineChart className="h-4 w-4" />}
                            {chart.type === 'bar' && <BarChart3 className="h-4 w-4" />}
                            {chart.type === 'pie' && <PieChart className="h-4 w-4" />}
                            {chart.type === 'funnel' && <Filter className="h-4 w-4" />}
                            {chart.type === 'heat' && <BarChart3 className="h-4 w-4" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{chart.label}</h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              {chart.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Options & Preview */}
            <div className="space-y-6">
              {/* Date Range */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Date Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {exportConfig.dateRange?.from ? (
                          exportConfig.dateRange.to ? (
                            <>
                              {format(exportConfig.dateRange.from, "LLL dd, y")} -{" "}
                              {format(exportConfig.dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(exportConfig.dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={exportConfig.dateRange?.from}
                        selected={exportConfig.dateRange}
                        onSelect={(range) => setExportConfig(prev => ({ ...prev, dateRange: range }))}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>

              {/* Additional Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeSummary"
                      checked={exportConfig.includeSummary}
                      onCheckedChange={(checked) => 
                        setExportConfig(prev => ({ ...prev, includeSummary: !!checked }))
                      }
                    />
                    <Label htmlFor="includeSummary">Include Executive Summary</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeRawData"
                      checked={exportConfig.includeRawData}
                      onCheckedChange={(checked) => 
                        setExportConfig(prev => ({ ...prev, includeRawData: !!checked }))
                      }
                    />
                    <Label htmlFor="includeRawData">Include Raw Data Tables</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="branding"
                      checked={exportConfig.branding}
                      onCheckedChange={(checked) => 
                        setExportConfig(prev => ({ ...prev, branding: !!checked }))
                      }
                    />
                    <Label htmlFor="branding">Company Branding</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="watermark"
                      checked={exportConfig.watermark}
                      onCheckedChange={(checked) => 
                        setExportConfig(prev => ({ ...prev, watermark: !!checked }))
                      }
                    />
                    <Label htmlFor="watermark">Add Watermark</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Export Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Export Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-medium uppercase">{exportConfig.format}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Metrics:</span>
                    <span className="font-medium">{exportConfig.metrics.length} selected</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Charts:</span>
                    <span className="font-medium">{exportConfig.charts.length} selected</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Size:</span>
                    <span className="font-medium">~2.5 MB</span>
                  </div>
                </CardContent>
              </Card>

              {/* Export Button */}
              <Button onClick={handleExport} className="w-full" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Generate Export
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Scheduled Reports List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Scheduled Reports</h2>
                <Badge variant="outline">
                  {scheduledReports.filter(r => r.isActive).length} active
                </Badge>
              </div>

              {scheduledReports.map((report) => {
                const FormatIcon = getFormatIcon(report.format);
                return (
                  <Card key={report.id} className={cn(
                    'transition-all hover:shadow-md',
                    !report.isActive && 'opacity-60'
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{report.name}</h4>
                            <Badge className={getFrequencyBadge(report.frequency)}>
                              {report.frequency}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <FormatIcon className="h-3 w-3" />
                              {report.format.toUpperCase()}
                            </Badge>
                            {!report.isActive && (
                              <Badge variant="secondary">Paused</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Created by {report.createdBy}</span>
                            <span>•</span>
                            <span>Last sent: {format(report.lastSent, 'MMM d, yyyy')}</span>
                            <span>•</span>
                            <span>Next: {format(report.nextSend, 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleReportStatus(report.id)}
                          >
                            {report.isActive ? <Clock className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteReport(report.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Create New Report */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Schedule New Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input
                      id="reportName"
                      value={newReport.name}
                      onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Weekly Marketing Report"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reportDescription">Description</Label>
                    <Input
                      id="reportDescription"
                      value={newReport.description}
                      onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description..."
                    />
                  </div>

                  <div>
                    <Label>Frequency</Label>
                    <Select
                      value={newReport.frequency}
                      onValueChange={(value: any) => setNewReport(prev => ({ ...prev, frequency: value }))}
                    >
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

                  <div>
                    <Label>Format</Label>
                    <Select
                      value={newReport.format}
                      onValueChange={(value: any) => setNewReport(prev => ({ ...prev, format: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                        <SelectItem value="excel">Excel Workbook</SelectItem>
                        <SelectItem value="csv">CSV Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="recipients">Recipients (comma-separated)</Label>
                    <Input
                      id="recipients"
                      value={newReport.recipients}
                      onChange={(e) => setNewReport(prev => ({ ...prev, recipients: e.target.value }))}
                      placeholder="email1@company.com, email2@company.com"
                    />
                  </div>

                  <Button onClick={handleScheduleReport} className="w-full">
                    <Schedule className="mr-2 h-4 w-4" />
                    Schedule Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="text-center py-12 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Report Templates Coming Soon</h3>
            <p>Pre-built templates for common reporting scenarios</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}