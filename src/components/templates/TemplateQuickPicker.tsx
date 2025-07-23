"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Sparkles, 
  Mail, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  Eye,
  Copy,
  Zap,
  Clock,
  Star,
  Filter,
  X,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'social' | 'blog';
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  content?: string;
  createdAt: string;
  lastUpdated: string;
  // AI enhancement properties
  performanceScore?: number;
  engagementRate?: number;
  usageCount?: number;
  aiRecommended?: boolean;
}

interface TemplateQuickPickerProps {
  /** Context where the picker is being used */
  context: 'content-creation' | 'calendar' | 'campaign' | 'project' | 'general';
  
  /** Callback when a template is selected */
  onSelect: (template: Template) => void;
  
  /** Callback when picker is closed */
  onClose?: () => void;
  
  /** Filter templates by specific criteria */
  filters?: {
    type?: 'email' | 'social' | 'blog';
    category?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  };
  
  /** Show AI recommendations based on context */
  showAIRecommendations?: boolean;
  
  /** Compact mode for smaller spaces */
  compact?: boolean;
  
  /** Trigger element for dialog mode */
  trigger?: React.ReactNode;
  
  /** Max templates to display */
  maxTemplates?: number;
}

// Context-specific template suggestions
const contextSuggestions = {
  'content-creation': ['Welcome Email', 'Product Update', 'Newsletter'],
  'calendar': ['Event Reminder', 'Meeting Follow-up', 'Webinar Invitation'],
  'campaign': ['Product Launch', 'Seasonal Promotion', 'Customer Survey'],
  'project': ['Project Kickoff', 'Status Update', 'Milestone Celebration'],
  'general': ['Quick Note', 'Announcement', 'Thank You Message']
};

const typeIcons = {
  email: Mail,
  social: MessageSquare,
  blog: FileText
};

const statusColors = {
  PUBLISHED: 'bg-green-100 text-green-800 border-green-200',
  DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ARCHIVED: 'bg-gray-100 text-gray-800 border-gray-200'
};

export function TemplateQuickPicker({
  context = 'general',
  onSelect,
  onClose,
  filters,
  showAIRecommendations = true,
  compact = false,
  trigger,
  maxTemplates = 50
}: TemplateQuickPickerProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>(filters?.type || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(filters?.category || 'all');
  const [activeTab, setActiveTab] = useState<'all' | 'recommended' | 'recent'>('recommended');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch templates with AI enhancements
  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/templates?enhanced=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      
      const data = await response.json();
      setTemplates(data.slice(0, maxTemplates));
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Loading Error',
        description: 'Failed to load templates. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  // AI-powered template recommendations based on context
  const getRecommendedTemplates = useMemo(() => {
    return templates
      .filter(template => {
        // AI recommendation logic
        if (context === 'content-creation') {
          return template.type === 'email' || template.engagementRate && template.engagementRate > 0.15;
        }
        if (context === 'calendar') {
          return template.type === 'email' && template.category === 'marketing';
        }
        if (context === 'campaign') {
          return template.performanceScore && template.performanceScore > 0.7;
        }
        return template.aiRecommended || template.usageCount && template.usageCount > 5;
      })
      .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
      .slice(0, 6);
  }, [templates, context]);

  // Filter templates based on search and filters
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || template.type === selectedType;
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesFilters = !filters?.status || template.status === filters.status;
      
      return matchesSearch && matchesType && matchesCategory && matchesFilters;
    });
  }, [templates, searchQuery, selectedType, selectedCategory, filters]);

  // Recently used templates
  const recentTemplates = useMemo(() => {
    return templates
      .filter(template => template.usageCount && template.usageCount > 0)
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 8);
  }, [templates]);

  const handleTemplateSelect = async (template: Template) => {
    try {
      // Track template usage for AI improvement
      await fetch(`/api/templates/${template.id}/track-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      });

      onSelect(template);
      setIsOpen(false);
      onClose?.();

      toast({
        title: 'Template Selected! 🎉',
        description: `"${template.name}" is ready to use`,
      });
    } catch (error) {
      console.error('Error tracking template usage:', error);
      // Still proceed with template selection
      onSelect(template);
      setIsOpen(false);
      onClose?.();
    }
  };

  const TemplateCard = ({ template }: { template: Template }) => {
    const TypeIcon = typeIcons[template.type];
    
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
          template.aiRecommended ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
        }`}
        onClick={() => handleTemplateSelect(template)}
      >
        <CardContent className={`p-4 ${compact ? 'p-3' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <TypeIcon className="h-4 w-4 text-primary" />
              </div>
              {template.aiRecommended && (
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Pick
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {template.performanceScore && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  {Math.round(template.performanceScore * 100)}%
                </div>
              )}
              <Badge className={`text-xs ${statusColors[template.status]}`}>
                {template.status}
              </Badge>
            </div>
          </div>
          
          <h4 className={`font-semibold mb-1 line-clamp-1 ${compact ? 'text-sm' : ''}`}>
            {template.name}
          </h4>
          <p className={`text-muted-foreground line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            {template.description}
          </p>
          
          {!compact && (
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>{template.type} • {template.category}</span>
              {template.usageCount && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Used {template.usageCount}x
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const QuickSuggestions = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <h4 className="font-medium text-purple-900">Smart Suggestions for {context}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {contextSuggestions[context].map((suggestion, index) => (
          <Button 
            key={index}
            variant="outline" 
            size="sm" 
            className="h-7 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200 text-purple-700"
            onClick={() => setSearchQuery(suggestion)}
          >
            <Zap className="h-3 w-3 mr-1" />
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );

  const PickerContent = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Choose Template</h3>
            <p className="text-sm text-gray-600">Perfect for {context.replace('-', ' ')}</p>
          </div>
        </div>
        {!compact && (
          <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); onClose?.(); }}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {!compact && (
            <>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="social">📱 Social</SelectItem>
                  <SelectItem value="blog">📝 Blog</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      {showAIRecommendations && !searchQuery && (
        <QuickSuggestions />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommended" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Sparkles className="h-4 w-4 mr-1" />
            Recommended
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-1" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Filter className="h-4 w-4 mr-1" />
            All Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-3">
          <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {getRecommendedTemplates.length > 0 ? (
              getRecommendedTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No AI recommendations available yet</p>
                <p className="text-xs">Use templates to improve suggestions</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-3">
          <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {recentTemplates.length > 0 ? (
              recentTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recently used templates</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-3">
          <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No templates match your search</p>
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      {!compact && (
        <div className="flex items-center justify-between pt-3 border-t">
          <Button variant="ghost" size="sm" className="text-blue-600">
            <Eye className="h-4 w-4 mr-1" />
            Preview Mode
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Create New
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
              <ChevronRight className="h-4 w-4 mr-1" />
              Browse All
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Render as dialog if trigger is provided
  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Library</DialogTitle>
            <DialogDescription>
              Choose from your professional templates to accelerate content creation
            </DialogDescription>
          </DialogHeader>
          <PickerContent />
        </DialogContent>
      </Dialog>
    );
  }

  // Render inline component
  return (
    <div className={`${compact ? 'max-w-md' : 'max-w-4xl'} mx-auto`}>
      <PickerContent />
    </div>
  );
}

// Convenience hook for template selection
export function useTemplateSelection(context: TemplateQuickPickerProps['context']) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const selectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };
  
  const clearSelection = () => {
    setSelectedTemplate(null);
  };
  
  return {
    selectedTemplate,
    selectTemplate,
    clearSelection
  };
}