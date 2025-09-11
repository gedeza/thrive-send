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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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
    } catch (_error) {
      console.error("", _error);
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
    } catch (_error) {
      console.error("", _error);
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
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold">Template Library</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage and share templates across your clients
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            className="w-full sm:w-auto"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Create Template</span>
            <span className="xs:hidden">Create</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="ml-2 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Templates</p>
                  <p className="text-lg sm:text-2xl font-bold">{summary.totalTemplates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                  <Share2 className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="ml-2 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Usage</p>
                  <p className="text-lg sm:text-2xl font-bold">{summary.totalUsage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="ml-2 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avg Engagement</p>
                  <p className="text-lg sm:text-2xl font-bold">{summary.averageEngagement.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div className="ml-2 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Shareable Clients</p>
                  <p className="text-lg sm:text-2xl font-bold">{shareableClients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col space-y-3 sm:space-y-4">
        {/* Search Bar */}
        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-48">
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
            <SelectTrigger className="w-full sm:w-48">
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
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <div className="flex gap-0.5 sm:gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setPreviewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShareDialogOpen(true);
                    }}
                  >
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                    <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <CardTitle className="text-base sm:text-lg mb-2 line-clamp-1 sm:line-clamp-none">{template.name}</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Template Preview */}
                {template.previewImage && (
                  <div className="w-full h-24 sm:h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                )}
                
                {/* Usage Stats */}
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <span className="truncate">{template.sharedWithClients.length} clients</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <span className="truncate">{template.totalUsage} uses</span>
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs sm:text-sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setApplyDialogOpen(true);
                    }}
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Use Template</span>
                    <span className="xs:hidden">Use</span>
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 text-xs sm:text-sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShareDialogOpen(true);
                    }}
                  >
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="w-full sm:w-auto"
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
              const pageNum = pagination.totalPages <= 5 ? i + 1 : 
                currentPage <= 3 ? i + 1 :
                currentPage >= pagination.totalPages - 2 ? pagination.totalPages - 4 + i :
                currentPage - 2 + i;
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                >
                  {pageNum}
                </Button>
              );
            })}
            {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
              <span className="text-muted-foreground">...</span>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= pagination.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      )}

      {/* Template Sharing Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Share Template</DialogTitle>
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
        <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Template Preview</DialogTitle>
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
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Apply Template</DialogTitle>
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

      {/* Create Template Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Create New Template</DialogTitle>
          </DialogHeader>
          
          <TemplateCreateDialog
            shareableClients={shareableClients}
            onClose={() => setCreateDialogOpen(false)}
            onSuccess={() => {
              setCreateDialogOpen(false);
              refetch();
            }}
          />
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
}): React.JSX.Element {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-2 line-clamp-1">{template.name}</h3>
        <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">{template.description}</p>
      </div>

      {/* Current Sharing Status */}
      <div>
        <h4 className="text-sm sm:text-base font-medium mb-3">Currently Shared With</h4>
        {sharingStatus.sharedWith.length > 0 ? (
          <div className="space-y-2">
            {sharingStatus.sharedWith.map((client: any) => (
              <div key={client.clientId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-green-50 rounded-lg gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">{client.clientName}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Used {client.usage.timesUsed} times • {client.usage.averageEngagement}% engagement
                  </p>
                </div>
                <Badge variant="secondary" className="self-start sm:self-center">Shared</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm sm:text-base text-muted-foreground">Not shared with any clients yet</p>
        )}
      </div>

      {/* Available Clients to Share With */}
      <div>
        <h4 className="text-sm sm:text-base font-medium mb-3">Share With Additional Clients</h4>
        <div className="space-y-3">
          {sharingStatus.availableClients.map((client: any) => (
            <div key={client.clientId} className="flex items-start space-x-3">
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
                className="mt-1"
              />
              <Label htmlFor={client.clientId} className="flex-1 cursor-pointer">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-medium text-sm sm:text-base">{client.clientName}</span>
                  <Badge variant="outline" className="text-xs w-fit">
                    {client.clientType}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{client.eligibilityReason}</p>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button 
          onClick={() => onShare(template, selectedClients)}
          disabled={selectedClients.length === 0}
          className="w-full sm:w-auto"
        >
          Share Template ({selectedClients.length})
        </Button>
      </div>
    </div>
  );
}

// Helper function to render template preview with sample data
function renderTemplatePreview(content: string, fields: Array<{field: string, label: string, type: string}>): string {
  let previewContent = content;
  
  // Create sample data for template variables
  const sampleData: Record<string, string> = {
    'EVENT_TITLE': 'Sample Event: Technology Conference 2024',
    'EVENT_SUBTITLE': 'Join us for an exciting day of innovation and networking',
    'EVENT_DATE': '2024-03-15',
    'EVENT_TIME': '9:00 AM - 5:00 PM',
    'EVENT_LOCATION': 'Tech Center, Downtown',
    'REGISTRATION_LINK': 'https://example.com/register',
    'EVENT_DESCRIPTION': 'Experience cutting-edge presentations from industry leaders, network with peers, and discover the latest technological innovations shaping our future.',
    'CLIENT_NAME': 'Demo Client',
    'CAMPAIGN_MESSAGE': 'Discover our amazing new product!',
    'BENEFIT_1': 'Save time with automated features',
    'BENEFIT_2': 'Increase productivity by 50%',
    'BENEFIT_3': 'Get 24/7 customer support',
    'CALL_TO_ACTION': 'Try it free today!',
    'CLIENT_HASHTAG': 'DemoClient',
    'INDUSTRY_TAG': 'Innovation',
    'BRAND_COLOR': '#3b82f6',
    'LOGO_URL': '/demo-logo.png'
  };
  
  // Generate sample data for any fields not covered above
  fields.forEach(field => {
    if (!sampleData[field.field]) {
      switch (field.type) {
        case 'date':
          sampleData[field.field] = '2024-03-15';
          break;
        case 'time':
          sampleData[field.field] = '10:00 AM';
          break;
        case 'url':
          sampleData[field.field] = 'https://example.com';
          break;
        case 'color':
          sampleData[field.field] = '#3b82f6';
          break;
        case 'textarea':
          sampleData[field.field] = 'This is sample content for ' + field.label.toLowerCase();
          break;
        default:
          sampleData[field.field] = 'Sample ' + field.label;
      }
    }
  });
  
  // Replace template variables with sample data
  Object.keys(sampleData).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    previewContent = previewContent.replace(regex, sampleData[key]);
  });
  
  return previewContent;
}

// Template Preview Dialog Component
function TemplatePreviewDialog({ 
  template, 
  onClose 
}: {
  template: ServiceProviderTemplate;
  onClose: () => void;
}): React.JSX.Element {
  const [contentView, setContentView] = useState<'preview' | 'code'>('preview');
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-2 line-clamp-1">{template.name}</h3>
        <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">{template.description}</p>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content" className="text-xs sm:text-sm">Content</TabsTrigger>
          <TabsTrigger value="fields" className="text-xs sm:text-sm">Fields</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs sm:text-sm">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-4">
          <div className="space-y-4">
            {/* Preview/Code Toggle */}
            <div className="flex gap-2">
              <Button 
                variant={contentView === 'preview' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setContentView('preview')}
              >
                Preview
              </Button>
              <Button 
                variant={contentView === 'code' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setContentView('code')}
              >
                Code
              </Button>
            </div>
            
            {/* Content Display */}
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto border">
              {contentView === 'preview' ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderTemplatePreview(template.content, template.customizableFields) }}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-xs sm:text-sm font-mono">{template.content}</pre>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="fields" className="mt-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {template.customizableFields.map((field) => (
              <div key={field.field} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2">
                <div className="flex-1">
                  <span className="font-medium text-sm sm:text-base">{field.field}</span>
                  <p className="text-xs sm:text-sm text-muted-foreground">{field.label}</p>
                </div>
                <Badge variant="outline" className="self-start sm:self-center text-xs">{field.type}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Usage</p>
              <p className="text-xl sm:text-2xl font-bold">{template.totalUsage}</p>
            </div>
            <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">Avg Engagement</p>
              <p className="text-xl sm:text-2xl font-bold">{template.averageEngagement}%</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={onClose} className="w-full sm:w-auto">Close</Button>
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
}): React.JSX.Element {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [customizations, setCustomizations] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-2 line-clamp-1">Apply {template.name}</h3>
        <p className="text-sm sm:text-base text-muted-foreground">Customize and create content for a specific client</p>
      </div>

      {/* Client Selection */}
      <div>
        <Label htmlFor="client-select" className="text-sm sm:text-base">Select Client</Label>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a client..." />
          </SelectTrigger>
          <SelectContent>
            {shareableClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <span className="truncate">{client.name} ({client.type})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Customization Fields */}
      <div>
        <Label className="text-sm sm:text-base">Customize Template Fields</Label>
        <div className="space-y-3 sm:space-y-4 mt-2 max-h-64 overflow-y-auto">
          {template.customizableFields.map((field) => (
            <div key={field.field}>
              <Label htmlFor={field.field} className="text-sm sm:text-base">{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.field}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  value={customizations[field.field] || ''}
                  onChange={(e) => setCustomizations({
                    ...customizations,
                    [field.field]: e.target.value
                  })}
                  className="text-sm sm:text-base min-h-[80px]"
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
                  className="text-sm sm:text-base"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button 
          onClick={() => onApply(template, selectedClient, customizations)}
          disabled={!selectedClient}
          className="w-full sm:w-auto"
        >
          Create Content
        </Button>
      </div>
    </div>
  );
}

// Template Create Dialog Component
const TemplateCreateDialog: React.FC<{
  shareableClients: Array<{ id: string; name: string; type: string }>;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ shareableClients, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateType: 'email' as 'email' | 'social' | 'blog',
    content: '',
    tags: '',
    category: 'General',
    shareWithClients: [] as string[]
  });

  const { state: { organizationId } } = useServiceProvider();

  const handleSubmit = async () => {
    try {
      const templateData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        customizableFields: [{ field: 'CLIENT_NAME', label: 'Client Name', type: 'text' }],
        serviceProviderId: organizationId!,
        shareWithClients: formData.shareWithClients
      };

      const response = await fetch('/api/service-provider/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        toast({
          title: "Template Created",
          description: `${formData.name} has been created successfully!`,
        });
        onSuccess();
      } else {
        throw new Error('Failed to create template');
      }
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter template name..."
          />
        </div>

        <div>
          <Label htmlFor="content">Template Content</Label>
          <Textarea
            id="content"
            required
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            placeholder="Enter your template content with {{VARIABLE_NAME}} for customizable fields..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="w-full sm:w-auto">
          Create Template
        </Button>
      </div>
    </div>
  );
};