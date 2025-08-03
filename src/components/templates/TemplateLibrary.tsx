'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Share2, 
  Copy, 
  Eye, 
  Edit, 
  Users, 
  TrendingUp,
  FileText,
  Mail,
  MessageSquare,
  Globe,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { useServiceProvider, type ClientSummary } from '@/context/ServiceProviderContext';
import { useQuery } from '@tanstack/react-query';
import { 
  getServiceProviderTemplates, 
  shareTemplateWithClients,
  getTemplateSharingStatus,
  applyTemplateToClient,
  type ServiceProviderTemplate,
  type TemplateListResponse 
} from '@/lib/api/template-service';
import { toast } from '@/components/ui/use-toast';

interface TemplateLibraryProps {
  onTemplateSelect?: (template: ServiceProviderTemplate) => void;
  onTemplateApply?: (templateId: string, clientId: string) => void;
}

export function TemplateLibrary({ onTemplateSelect, onTemplateApply }: TemplateLibraryProps) {
  const { 
    state: { organizationId, selectedClient, currentUser }, 
    switchClient 
  } = useServiceProvider();

  // State for filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedClient_Filter, setSelectedClient_Filter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceProviderTemplate | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  // Template data query
  const { 
    data: templateData, 
    isLoading, 
    error,
    refetch 
  } = useQuery<TemplateListResponse>({
    queryKey: ['service-provider-templates', organizationId, selectedClient_Filter, selectedType, searchQuery, currentPage],
    queryFn: () => getServiceProviderTemplates({
      organizationId: organizationId!,
      clientId: selectedClient_Filter !== 'all' ? selectedClient_Filter : undefined,
      templateType: selectedType !== 'all' ? selectedType : undefined,
      search: searchQuery || undefined,
      page: currentPage,
      limit: 12,
    }),
    enabled: !!organizationId,
  });

  // Template sharing status query
  const { data: sharingStatus } = useQuery({
    queryKey: ['template-sharing-status', selectedTemplate?.id],
    queryFn: () => selectedTemplate ? getTemplateSharingStatus({
      templateId: selectedTemplate.id,
      serviceProviderId: organizationId!
    }) : null,
    enabled: !!selectedTemplate && !!organizationId,
  });

  const templates = templateData?.templates || [];
  const pagination = templateData?.pagination;
  const summary = templateData?.summary;
  const shareableClients = templateData?.shareableClients || [];

  // Template type icons
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'social': return <MessageSquare className="h-4 w-4" />;
      case 'blog': return <FileText className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  // Handle template sharing
  const handleShareTemplate = async (template: ServiceProviderTemplate, clientIds: string[]) => {
    try {
      await shareTemplateWithClients({
        templateId: template.id,
        clientIds,
        serviceProviderId: organizationId!
      });
      
      setShareDialogOpen(false);
      refetch();
      
      toast({
        title: "Template Shared",
        description: `${template.name} shared with ${clientIds.length} clients`,
      });
    } catch (error) {
      console.error('Error sharing template:', error);
    }
  };

  // Handle template application
  const handleApplyTemplate = async (template: ServiceProviderTemplate, clientId: string, customizations: Record<string, string>) => {
    try {
      const result = await applyTemplateToClient({
        templateId: template.id,
        clientId,
        customizations,
        serviceProviderId: organizationId!
      });
      
      setApplyDialogOpen(false);
      
      if (onTemplateApply) {
        onTemplateApply(template.id, clientId);
      }
      
      toast({
        title: "Template Applied",
        description: `Content created from ${template.name} for ${result.clientName}`,
      });
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Template Library</h2>
          <div className="flex gap-2">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-4">Failed to load templates</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Template Library</h2>
          <p className="text-muted-foreground">
            Manage and share templates across your clients
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                  <p className="text-2xl font-bold">{summary.totalTemplates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Share2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                  <p className="text-2xl font-bold">{summary.totalUsage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Engagement</p>
                  <p className="text-2xl font-bold">{summary.averageEngagement.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Shareable Clients</p>
                  <p className="text-2xl font-bold">{shareableClients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedClient_Filter} onValueChange={setSelectedClient_Filter}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {shareableClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(template.templateType)}
                  <Badge variant="secondary" className="text-xs">
                    {template.templateType}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setPreviewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShareDialogOpen(true);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Template Preview */}
                {template.previewImage && (
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                {/* Usage Stats */}
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                    <span>{template.sharedWithClients.length} clients</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{template.totalUsage} uses</span>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setApplyDialogOpen(true);
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShareDialogOpen(true);
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
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
            {[...Array(pagination.totalPages)].map((_, i) => (
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
            disabled={currentPage >= pagination.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Template Sharing Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Template</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && sharingStatus && (
            <TemplateShareDialog
              template={selectedTemplate}
              sharingStatus={sharingStatus}
              shareableClients={shareableClients}
              onShare={handleShareTemplate}
              onClose={() => setShareDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <TemplatePreviewDialog
              template={selectedTemplate}
              onClose={() => setPreviewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Template Application Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply Template</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <TemplateApplyDialog
              template={selectedTemplate}
              shareableClients={shareableClients}
              onApply={handleApplyTemplate}
              onClose={() => setApplyDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Template Share Dialog Component
function TemplateShareDialog({ 
  template, 
  sharingStatus, 
  shareableClients, 
  onShare, 
  onClose 
}: {
  template: ServiceProviderTemplate;
  sharingStatus: any;
  shareableClients: Array<{ id: string; name: string; type: string }>;
  onShare: (template: ServiceProviderTemplate, clientIds: string[]) => void;
  onClose: () => void;
}) {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
        <p className="text-muted-foreground">{template.description}</p>
      </div>

      {/* Current Sharing Status */}
      <div>
        <h4 className="font-medium mb-3">Currently Shared With</h4>
        {sharingStatus.sharedWith.length > 0 ? (
          <div className="space-y-2">
            {sharingStatus.sharedWith.map((client: any) => (
              <div key={client.clientId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">{client.clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    Used {client.usage.timesUsed} times • {client.usage.averageEngagement}% engagement
                  </p>
                </div>
                <Badge variant="secondary">Shared</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Not shared with any clients yet</p>
        )}
      </div>

      {/* Available Clients to Share With */}
      <div>
        <h4 className="font-medium mb-3">Share With Additional Clients</h4>
        <div className="space-y-2">
          {sharingStatus.availableClients.map((client: any) => (
            <div key={client.clientId} className="flex items-center space-x-3">
              <Checkbox
                id={client.clientId}
                checked={selectedClients.includes(client.clientId)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedClients([...selectedClients, client.clientId]);
                  } else {
                    setSelectedClients(selectedClients.filter(id => id !== client.clientId));
                  }
                }}
              />
              <Label htmlFor={client.clientId} className="flex-1">
                <div>
                  <span className="font-medium">{client.clientName}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {client.clientType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{client.eligibilityReason}</p>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={() => onShare(template, selectedClients)}
          disabled={selectedClients.length === 0}
        >
          Share Template ({selectedClients.length})
        </Button>
      </div>
    </div>
  );
}

// Template Preview Dialog Component
function TemplatePreviewDialog({ 
  template, 
  onClose 
}: {
  template: ServiceProviderTemplate;
  onClose: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
        <p className="text-muted-foreground">{template.description}</p>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="fields">Customizable Fields</TabsTrigger>
          <TabsTrigger value="stats">Usage Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{template.content}</pre>
          </div>
        </TabsContent>
        
        <TabsContent value="fields" className="mt-4">
          <div className="space-y-2">
            {template.customizableFields.map((field) => (
              <div key={field.field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{{field.field}}</span>
                  <p className="text-sm text-muted-foreground">{field.label}</p>
                </div>
                <Badge variant="outline">{field.type}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Usage</p>
              <p className="text-2xl font-bold">{template.totalUsage}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Avg Engagement</p>
              <p className="text-2xl font-bold">{template.averageEngagement}%</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

// Template Apply Dialog Component  
function TemplateApplyDialog({ 
  template, 
  shareableClients, 
  onApply, 
  onClose 
}: {
  template: ServiceProviderTemplate;
  shareableClients: Array<{ id: string; name: string; type: string }>;
  onApply: (template: ServiceProviderTemplate, clientId: string, customizations: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [customizations, setCustomizations] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Apply {template.name}</h3>
        <p className="text-muted-foreground">Customize and create content for a specific client</p>
      </div>

      {/* Client Selection */}
      <div>
        <Label htmlFor="client-select">Select Client</Label>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a client..." />
          </SelectTrigger>
          <SelectContent>
            {shareableClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name} ({client.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Customization Fields */}
      <div>
        <Label>Customize Template Fields</Label>
        <div className="space-y-4 mt-2">
          {template.customizableFields.map((field) => (
            <div key={field.field}>
              <Label htmlFor={field.field}>{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.field}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  value={customizations[field.field] || ''}
                  onChange={(e) => setCustomizations({
                    ...customizations,
                    [field.field]: e.target.value
                  })}
                />
              ) : (
                <Input
                  id={field.field}
                  type={field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  value={customizations[field.field] || ''}
                  onChange={(e) => setCustomizations({
                    ...customizations,
                    [field.field]: e.target.value
                  })}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={() => onApply(template, selectedClient, customizations)}
          disabled={!selectedClient}
        >
          Create Content
        </Button>
      </div>
    </div>
  );
}