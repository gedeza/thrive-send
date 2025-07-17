'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, Clock, Tag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  ContentTemplate,
  DEFAULT_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
  getTemplatesByType,
  searchTemplates,
  applyTemplateToEvent
} from '@/lib/utils/content-templates';
import { CalendarEvent, ContentType } from './types';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (eventData: Partial<CalendarEvent>) => void;
  initialType?: ContentType;
  initialDate?: string;
}

export function TemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate,
  initialType,
  initialDate
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    let templates = DEFAULT_TEMPLATES;

    // Filter by search query
    if (searchQuery) {
      templates = searchTemplates(searchQuery);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter(template => template.category === selectedCategory);
    }

    // Filter by initial type if provided
    if (initialType) {
      templates = templates.filter(template => template.type === initialType);
    }

    return templates;
  }, [searchQuery, selectedCategory, initialType]);

  // Group templates by category for better organization
  const templatesByCategory = useMemo(() => {
    const grouped = filteredTemplates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {} as Record<string, ContentTemplate[]>);

    return grouped;
  }, [filteredTemplates]);

  const handleTemplateSelect = (template: ContentTemplate) => {
    const eventData = applyTemplateToEvent(template, {
      date: initialDate
    });
    onSelectTemplate(eventData);
    onClose();
  };

  const handleStartFromScratch = () => {
    const eventData: Partial<CalendarEvent> = {
      title: '',
      description: '',
      type: initialType || 'social',
      date: initialDate || new Date().toISOString().split('T')[0],
      status: 'draft',
      socialMediaContent: initialType === 'social' ? {
        platforms: [],
        crossPost: false,
        mediaUrls: [],
        platformSpecificContent: {}
      } : undefined
    };
    onSelectTemplate(eventData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
        <div className="px-6 pt-6 pb-2 border-b border-border/10 flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Choose a Template
            </DialogTitle>
            <DialogDescription>
              Start with a pre-built template to speed up your content creation, or start from scratch.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-h-0 px-6 pb-6">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 sm:h-9"
              />
            </div>
            <Button
              onClick={handleStartFromScratch}
              variant="outline"
              className="whitespace-nowrap h-10 sm:h-9"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Start from Scratch</span>
              <span className="sm:hidden">Start Fresh</span>
            </Button>
          </div>

          {/* Category tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 flex-shrink-0">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              {TEMPLATE_CATEGORIES.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <span className="hidden sm:inline">{category.icon} {category.name}</span>
                  <span className="sm:hidden">{category.icon}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="flex-1 mt-4 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-6 pr-4">
                  {Object.entries(templatesByCategory).map(([categoryId, templates]) => {
                    const category = TEMPLATE_CATEGORIES.find(c => c.id === categoryId);
                    if (!category || templates.length === 0) return null;

                    return (
                      <div key={categoryId}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{category.icon}</span>
                          <h3 className="font-semibold">{category.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {templates.length}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          {templates.map(template => (
                            <TemplateCard
                              key={template.id}
                              template={template}
                              onSelect={() => handleTemplateSelect(template)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {TEMPLATE_CATEGORIES.map(category => (
              <TabsContent key={category.id} value={category.id} className="flex-1 mt-4 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-4 pr-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <h3 className="font-semibold mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {getTemplatesByCategory(category.id as any).map(template => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onSelect={() => handleTemplateSelect(template)}
                        />
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TemplateCardProps {
  template: ContentTemplate;
  onSelect: () => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow group touch-manipulation" onClick={onSelect}>
      <CardHeader className="pb-3 p-3 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-lg flex-shrink-0">{template.icon}</span>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm truncate">{template.name}</CardTitle>
              <Badge variant="outline" className="text-xs mt-1">
                {template.type}
              </Badge>
            </div>
          </div>
          {template.defaultDuration && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 ml-2">
              <Clock className="h-3 w-3" />
              <span className="hidden sm:inline">{template.defaultDuration}m</span>
              <span className="sm:hidden">{template.defaultDuration}'</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 p-3 sm:p-6 sm:pt-0">
        <CardDescription className="text-xs line-clamp-2 mb-3">
          {template.description}
        </CardDescription>
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="h-2 w-2 mr-1" />
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>
        <div className="mt-3 text-xs text-muted-foreground group-hover:text-primary transition-colors">
          <span className="hidden sm:inline">Click to use this template</span>
          <span className="sm:hidden">Tap to use</span>
        </div>
      </CardContent>
    </Card>
  );
}