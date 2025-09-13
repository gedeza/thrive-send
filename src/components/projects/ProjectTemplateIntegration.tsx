"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Briefcase,
  FileText,
  Users,
  Calendar,
  Target,
  Sparkles,
  MessageSquare,
  Mail,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Plus
} from 'lucide-react';
import { TemplateQuickPicker, useTemplateSelection } from '@/components/templates/TemplateQuickPicker';
import { useToast } from '@/components/ui/use-toast';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'social' | 'blog';
  category: string;
  content: string;
  useCase: 'kickoff' | 'update' | 'milestone' | 'completion' | 'issue' | 'feedback';
}

interface ProjectTemplateSectionProps {
  projectType: 'client-project' | 'internal-project' | 'campaign-project';
  projectPhase: 'planning' | 'execution' | 'review' | 'completion';
  teamSize: number;
  onTemplateApply: (template: ProjectTemplate, context: string) => void;
}

const PROJECT_TEMPLATE_CATEGORIES = {
  'kickoff': {
    name: 'Project Kickoff',
    description: 'Templates for starting new projects and aligning teams',
    icon: Target,
    color: 'bg-green-100 text-green-800 border-green-200',
    templates: [
      'Project kickoff meeting invitation',
      'Team introduction email',
      'Project scope and timeline',
      'Stakeholder welcome message'
    ]
  },
  'update': {
    name: 'Status Updates', 
    description: 'Keep stakeholders informed with regular progress updates',
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    templates: [
      'Weekly progress report',
      'Sprint review summary',
      'Budget and timeline update',
      'Risk and issue alert'
    ]
  },
  'milestone': {
    name: 'Milestone Celebrations',
    description: 'Acknowledge achievements and maintain momentum',
    icon: CheckCircle,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    templates: [
      'Milestone achievement announcement',
      'Team appreciation message',
      'Client success story',
      'Social media milestone post'
    ]
  },
  'completion': {
    name: 'Project Completion',
    description: 'Wrap up projects professionally and gather feedback',
    icon: Calendar,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    templates: [
      'Project completion announcement',
      'Final deliverables handover',
      'Client satisfaction survey',
      'Team retrospective invitation'
    ]
  },
  'issue': {
    name: 'Issue Resolution',
    description: 'Handle project challenges with clear communication',
    icon: MessageSquare,
    color: 'bg-red-100 text-red-800 border-red-200',
    templates: [
      'Issue escalation notice',
      'Problem resolution update',
      'Deadline change notification',
      'Resource request email'
    ]
  },
  'feedback': {
    name: 'Feedback & Reviews',
    description: 'Gather insights and improve project outcomes',
    icon: Users,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    templates: [
      'Client feedback request',
      'Team performance review',
      'Process improvement survey',
      'Testimonial request email'
    ]
  }
};

export function ProjectTemplateIntegration({
  projectType,
  projectPhase,
  teamSize,
  onTemplateApply
}: ProjectTemplateSectionProps) {
  const { toast } = useToast();
  const { selectedTemplate, selectTemplate, clearSelection } = useTemplateSelection('project');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customizationData, setCustomizationData] = useState({
    projectName: '',
    clientName: '',
    deadline: '',
    priority: 'medium'
  });

  // Get recommended template categories based on project phase
  const getRecommendedCategories = () => {
    const phaseRecommendations = {
      'planning': ['kickoff'],
      'execution': ['update', 'issue'],
      'review': ['milestone', 'feedback'],
      'completion': ['completion', 'feedback']
    };
    
    return phaseRecommendations[projectPhase] || [];
  };

  const handleTemplateSelect = (template: any) => {
    selectTemplate(template);
    setIsCustomizing(true);
    
    toast({
      title: "Project Template Selected! 📋",
      description: `"${template.name}" ready for your ${projectType}`,
    });
  };

  const handleTemplateApply = () => {
    if (!selectedTemplate) return;
    
    const context = `${projectType}-${projectPhase}-team${teamSize}`;
    onTemplateApply(selectedTemplate as ProjectTemplate, context);
    
    // Track template usage for AI learning
    fetch(`/api/templates/${selectedTemplate.id}/track-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: 'project',
        action: 'apply',
        source: 'project-management',
        metadata: {
          project_type: projectType,
          project_phase: projectPhase,
          team_size: teamSize,
          customization_data: customizationData
        }
      })
    }).catch(() => {}); // Non-blocking
    
    clearSelection();
    setIsCustomizing(false);
    
    toast({
      title: "Template Applied to Project! ✅",
      description: `Communication sent to ${teamSize} team members`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Project Context Header */}
      <Card className="bg-gradient-to-r from-muted/50 to-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Briefcase className="h-5 w-5" />
            Project Communication Templates
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3 text-sm text-primary">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {projectType.replace('-', ' ')}
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {projectPhase} phase
            </Badge>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{teamSize} team members</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Template Categories */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(PROJECT_TEMPLATE_CATEGORIES).map(([categoryId, category]) => {
          const Icon = category.icon;
          const isRecommended = getRecommendedCategories().includes(categoryId);
          const isSelected = selectedCategory === categoryId;
          
          return (
            <Card 
              key={categoryId}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              } ${isRecommended ? 'border-green-300 bg-green-50/30' : ''}`}
              onClick={() => setSelectedCategory(isSelected ? '' : categoryId)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{category.name}</CardTitle>
                      {isRecommended && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300 mt-1">
                          Recommended
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{category.description}</p>
              </CardHeader>
              
              {isSelected && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Available Templates:</h4>
                    <div className="space-y-1">
                      {category.templates.map((template, index) => (
                        <div key={index} className="text-xs p-2 bg-white rounded border border-gray-100">
                          {template}
                        </div>
                      ))}
                    </div>
                    
                    <TemplateQuickPicker
                      context="project"
                      onSelect={handleTemplateSelect}
                      filters={{
                        category: categoryId
                      }}
                      compact={true}
                      showAIRecommendations={true}
                      trigger={
                        <Button size="sm" className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
                          <FileText className="h-3 w-3 mr-1" />
                          Browse Templates
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Template Customization */}
      {isCustomizing && selectedTemplate && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Sparkles className="h-5 w-5" />
              Customize Template: {selectedTemplate.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={customizationData.projectName}
                  onChange={(e) => setCustomizationData(prev => ({ ...prev, projectName: e.target.value }))}
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <Label htmlFor="client-name">Client/Stakeholder Name</Label>
                <Input
                  id="client-name"
                  value={customizationData.clientName}
                  onChange={(e) => setCustomizationData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Enter client name"
                />
              </div>
              
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={customizationData.deadline}
                  onChange={(e) => setCustomizationData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select 
                  value={customizationData.priority} 
                  onValueChange={(value) => setCustomizationData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Template Preview */}
            <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
              <h4 className="text-sm font-medium mb-2">Template Preview:</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Subject:</strong> {selectedTemplate.name} - {customizationData.projectName || '[Project Name]'}</p>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  {selectedTemplate.description || 'Template content will be customized with your project details...'}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleTemplateApply} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply to Project
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCustomizing(false);
                  clearSelection();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Zap className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-emerald-900">Project Communication Hub</h3>
                <p className="text-sm text-emerald-700">Streamline team communications with smart templates</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-emerald-300 hover:bg-emerald-100">
                <Clock className="h-4 w-4 mr-1" />
                Schedule Update
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1" />
                Create Custom
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}