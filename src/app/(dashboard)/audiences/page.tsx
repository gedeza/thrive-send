'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { useAudienceData } from '@/hooks/use-audience-data';
import type { Audience, AudienceSegment, AudienceStats } from '@/hooks/use-audience-data';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Users, 
  Target, 
  TrendingUp, 
  Filter,
  Search,
  Calendar,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Trash2,
  Upload,
  X,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

// Types are now imported from the hook

export default function AudiencesPage() {
  const { userId } = useAuth();
  const { organization } = useOrganization();
  const { state: { organizationId } } = useServiceProvider();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Import contacts state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importMethod, setImportMethod] = useState<'csv' | 'manual'>('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [manualContacts, setManualContacts] = useState('');
  const [audienceName, setAudienceName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  // Use live data hook instead of hardcoded demo data
  const { audiences, stats, isLoading, error, refetch } = useAudienceData(organizationId);

  // Filtered audiences using useMemo to prevent infinite loops
  const filteredAudiences = useMemo(() => {
    let filtered = audiences;

    if (searchQuery) {
      filtered = filtered.filter(audience =>
        audience.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audience.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audience.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(audience => audience.status.toLowerCase() === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(audience => audience.type.toLowerCase() === typeFilter);
    }

    return filtered;
  }, [audiences, searchQuery, statusFilter, typeFilter]);

  // Import contacts functionality
  const handleImportContacts = async () => {
    if (!audienceName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an audience name",
        variant: "destructive",
      });
      return;
    }

    if (importMethod === 'csv' && !csvFile) {
      toast({
        title: "Error", 
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    if (importMethod === 'manual' && !manualContacts.trim()) {
      toast({
        title: "Error",
        description: "Please enter contact information",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append('audienceName', audienceName);
      formData.append('organizationId', organizationId);
      formData.append('importMethod', importMethod);
      
      if (importMethod === 'csv' && csvFile) {
        formData.append('csvFile', csvFile);
      } else if (importMethod === 'manual') {
        formData.append('contacts', manualContacts);
      }

      const response = await fetch('/api/service-provider/audiences/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to import contacts');
      }

      const result = await response.json();
      
      toast({
        title: "Success!",
        description: `Imported ${result.contactCount} contacts into "${audienceName}" audience`,
      });

      // Reset form and close modal
      setIsImportOpen(false);
      setAudienceName('');
      setCsvFile(null);
      setManualContacts('');
      refetch(); // Refresh the audiences list

    } catch (error) {
      // Import error occurred
      toast({
        title: "Import failed",
        description: "There was an error importing your contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: { color: 'bg-green-500', variant: 'default', label: 'Active' },
      INACTIVE: { color: 'bg-gray-500', variant: 'secondary', label: 'Inactive' },
      PROCESSING: { color: 'bg-yellow-500', variant: 'warning', label: 'Processing' }
    };
    return configs[status as keyof typeof configs] || configs.ACTIVE;
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      CUSTOM: { label: 'Custom', color: 'text-blue-600' },
      IMPORTED: { label: 'Imported', color: 'text-purple-600' },
      DYNAMIC: { label: 'Dynamic', color: 'text-green-600' }
    };
    return configs[type as keyof typeof configs] || configs.CUSTOM;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Audience Management</h1>
          <p className="text-muted-foreground">
            Manage audience segments, track engagement, and optimize targeting
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/audiences/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Audience
            </Button>
          </Link>
          <Link href="/audiences/shared-segments">
            <Button variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Shared Segments
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import Contacts
          </Button>
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Import Contacts</DialogTitle>
                <DialogDescription>
                  Import contacts from CSV file or add them manually to create a new audience
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Audience Name */}
                <div className="space-y-2">
                  <Label htmlFor="audienceName">Audience Name</Label>
                  <Input
                    id="audienceName"
                    value={audienceName}
                    onChange={(e) => setAudienceName(e.target.value)}
                    placeholder="Enter audience name"
                  />
                </div>

                {/* Import Method Selection */}
                <div className="space-y-2">
                  <Label>Import Method</Label>
                  <Tabs value={importMethod} onValueChange={(value) => setImportMethod(value as 'csv' | 'manual')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="csv">CSV File</TabsTrigger>
                      <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    </TabsList>
                    <TabsContent value="csv" className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="csvFile">CSV File</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <input
                            id="csvFile"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label 
                            htmlFor="csvFile" 
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            {csvFile ? (
                              <>
                                <FileText className="h-8 w-8 text-green-600" />
                                <div className="text-sm">
                                  <span className="font-medium">{csvFile.name}</span>
                                  <p className="text-gray-500">Click to change file</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <Upload className="h-8 w-8 text-gray-400" />
                                <div className="text-sm">
                                  <span className="font-medium">Click to upload CSV file</span>
                                  <p className="text-gray-500">or drag and drop</p>
                                </div>
                              </>
                            )}
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          CSV should have columns: name, email, phone (optional)
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="manual" className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="manualContacts">Contact Information</Label>
                        <Textarea
                          id="manualContacts"
                          value={manualContacts}
                          onChange={(e) => setManualContacts(e.target.value)}
                          placeholder="Enter contacts (one per line)&#10;Format: Name, Email, Phone&#10;&#10;John Doe, john@example.com, +1234567890&#10;Jane Smith, jane@example.com"
                          rows={6}
                        />
                        <p className="text-xs text-gray-500">
                          Enter contacts one per line in format: Name, Email, Phone (optional)
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsImportOpen(false)}
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleImportContacts}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Import Contacts
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audiences</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalAudiences}</div>
            )}
            <p className="text-xs text-muted-foreground">Across all segments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalContacts.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Segments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeSegments}</div>
            )}
            <p className="text-xs text-muted-foreground">Across all audiences</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats.avgEngagementRate.toFixed(1)}%</div>
            )}
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="imported">Imported</SelectItem>
                <SelectItem value="dynamic">Dynamic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-2 bg-destructive/10 rounded-full">
                <Users className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to load audiences</h3>
            <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
            <Button
              variant="outline"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Audiences List */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {filteredAudiences.length > 0 ? (
            filteredAudiences.map((audience) => (
              <AudienceCard key={audience.id} audience={audience} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No audiences found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : audiences.length === 0
                      ? "Create your first audience to start targeting customers"
                      : "No audiences match your current search criteria"
                  }
                </p>
                {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && audiences.length === 0 && (
                  <Link href="/audiences/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Audience
                    </Button>
                  </Link>
                )}
                {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && audiences.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function AudienceCard({ audience }: { audience: Audience }) {
  const statusConfig = getStatusConfig(audience.status);
  const typeConfig = getTypeConfig(audience.type);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{audience.name}</h3>
              <Badge variant={statusConfig.variant as any}>
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className={typeConfig.color}>
                {typeConfig.label}
              </Badge>
            </div>
            {audience.description && (
              <p className="text-sm text-muted-foreground">{audience.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{audience.size.toLocaleString()} contacts</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(audience.createdAt)}</span>
              </div>
              {audience.lastUpdated && (
                <div className="flex items-center gap-1">
                  <span>Updated {formatDate(audience.lastUpdated)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tags */}
        {audience.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {audience.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Performance Metrics */}
        {audience.analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {audience.analytics.avgEngagementRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Avg. Engagement</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                +{audience.analytics.growth.monthly.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Monthly Growth</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {audience.segments.length}
              </div>
              <p className="text-xs text-muted-foreground">Segments</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {audience.analytics.totalEngagement.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total Engagement</p>
            </div>
          </div>
        )}

        {/* Segments Preview */}
        {audience.segments.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Segments ({audience.segments.length})</h4>
            <div className="space-y-2">
              {audience.segments.slice(0, 2).map((segment) => (
                <div key={segment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm">{segment.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        {segment.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{segment.size.toLocaleString()} contacts</span>
                      {segment.performance && (
                        <>
                          <span>{segment.performance.engagementRate.toFixed(1)}% engagement</span>
                          <span>{segment.performance.conversionRate.toFixed(1)}% conversion</span>
                        </>
                      )}
                    </div>
                  </div>
                  {segment.growth && (
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        segment.growth.thisMonth > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {segment.growth.thisMonth > 0 ? '+' : ''}{segment.growth.thisMonth.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">this month</p>
                    </div>
                  )}
                </div>
              ))}
              {audience.segments.length > 2 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{audience.segments.length - 2} more segments
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStatusConfig(status: string) {
  const configs = {
    ACTIVE: { color: 'bg-green-500', variant: 'default', label: 'Active' },
    INACTIVE: { color: 'bg-gray-500', variant: 'secondary', label: 'Inactive' },
    PROCESSING: { color: 'bg-yellow-500', variant: 'warning', label: 'Processing' }
  };
  return configs[status as keyof typeof configs] || configs.ACTIVE;
}

function getTypeConfig(type: string) {
  const configs = {
    CUSTOM: { label: 'Custom', color: 'text-blue-600' },
    IMPORTED: { label: 'Imported', color: 'text-purple-600' },
    DYNAMIC: { label: 'Dynamic', color: 'text-green-600' }
  };
  return configs[type as keyof typeof configs] || configs.CUSTOM;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}