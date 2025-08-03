'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Save, 
  Copy, 
  Palette, 
  Type, 
  Image as ImageIcon,
  Link,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useServiceProvider, type ClientSummary } from '@/context/ServiceProviderContext';
import { type ServiceProviderTemplate } from '@/lib/api/template-service';
import { toast } from '@/components/ui/use-toast';

interface TemplateCustomizerProps {
  template: ServiceProviderTemplate;
  clientId?: string;
  onSave?: (customizedTemplate: CustomizedTemplate) => void;
  onPreview?: (previewContent: string) => void;
  onApply?: (customizations: Record<string, string>) => void;
}

interface CustomizedTemplate {
  templateId: string;
  clientId: string;
  customizations: Record<string, string>;
  customizedContent: string;
  previewData: TemplatePreviewData;
}

interface TemplatePreviewData {
  originalContent: string;
  customizedContent: string;
  variables: Array<{
    name: string;
    originalValue: string;
    customValue: string;
  }>;
}

export function TemplateCustomizer({ 
  template, 
  clientId, 
  onSave, 
  onPreview, 
  onApply 
}: TemplateCustomizerProps) {
  const { 
    state: { organizationId, selectedClient }, 
    switchClient 
  } = useServiceProvider();

  // State for customizations
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  const [selectedClientId, setSelectedClientId] = useState<string>(clientId || selectedClient?.id || '');
  const [currentTab, setCurrentTab] = useState<'customize' | 'preview' | 'compare'>('customize');
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize customizations with default values
  useEffect(() => {
    const initialCustomizations: Record<string, string> = {};
    template.customizableFields.forEach(field => {
      initialCustomizations[field.field] = getDefaultValue(field.field, selectedClientId);
    });
    setCustomizations(initialCustomizations);
  }, [template, selectedClientId]);

  // Get default value for a field based on client context
  const getDefaultValue = (fieldName: string, clientId: string): string => {
    const clientDefaults: Record<string, Record<string, string>> = {
      'demo-client-1': {
        'CLIENT_NAME': 'City of Springfield',
        'BRAND_COLOR': '#1E40AF',
        'INDUSTRY_TAG': 'Government',
        'CLIENT_HASHTAG': 'SpringfieldGov'
      },
      'demo-client-2': {
        'CLIENT_NAME': 'TechStart Inc.',
        'BRAND_COLOR': '#7C3AED',
        'INDUSTRY_TAG': 'Technology',
        'CLIENT_HASHTAG': 'TechStartInc'
      },
      'demo-client-3': {
        'CLIENT_NAME': 'Local Coffee Co.',
        'BRAND_COLOR': '#92400E',
        'INDUSTRY_TAG': 'Food & Beverage',
        'CLIENT_HASHTAG': 'LocalCoffeeCo'
      }
    };

    return clientDefaults[clientId]?.[fieldName] || '';
  };

  // Generate customized content preview
  const generatePreview = (): string => {
    let previewContent = template.content;
    
    Object.entries(customizations).forEach(([field, value]) => {
      const placeholder = `{{${field}}}`;
      previewContent = previewContent.replace(new RegExp(placeholder, 'g'), value || `[${field}]`);
    });
    
    return previewContent;
  };

  // Validate customizations
  const validateCustomizations = (): boolean => {
    setIsValidating(true);
    const errors: Record<string, string> = {};
    
    template.customizableFields.forEach(field => {
      const value = customizations[field.field];
      
      // Required field validation
      if (!value && field.field.includes('_NAME')) {
        errors[field.field] = `${field.label} is required`;
      }
      
      // URL validation
      if (field.type === 'url' && value && !isValidUrl(value)) {
        errors[field.field] = 'Please enter a valid URL';
      }
      
      // Color validation
      if (field.type === 'color' && value && !isValidColor(value)) {
        errors[field.field] = 'Please enter a valid color (hex format)';
      }
    });
    
    setValidationErrors(errors);
    setIsValidating(false);
    
    return Object.keys(errors).length === 0;
  };

  // Helper validation functions
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidColor = (color: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(color);
  };

  // Handle customization change
  const handleCustomizationChange = (field: string, value: string) => {
    setCustomizations(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle save customizations
  const handleSave = () => {
    if (!validateCustomizations()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }

    const customizedTemplate: CustomizedTemplate = {
      templateId: template.id,
      clientId: selectedClientId,
      customizations,
      customizedContent: generatePreview(),
      previewData: {
        originalContent: template.content,
        customizedContent: generatePreview(),
        variables: template.customizableFields.map(field => ({
          name: field.field,
          originalValue: `{{${field.field}}}`,
          customValue: customizations[field.field] || ''
        }))
      }
    };

    if (onSave) {
      onSave(customizedTemplate);
    }

    toast({
      title: "Customizations Saved",
      description: "Template customizations have been saved successfully",
    });
  };

  // Handle apply template
  const handleApply = () => {
    if (!validateCustomizations()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before applying the template",
        variant: "destructive",
      });
      return;
    }

    if (onApply) {
      onApply(customizations);
    }
  };

  // Render field input based on type
  const renderFieldInput = (field: typeof template.customizableFields[0]) => {
    const value = customizations[field.field] || '';
    const hasError = !!validationErrors[field.field];

    const baseInputProps = {
      id: field.field,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleCustomizationChange(field.field, e.target.value),
      className: hasError ? 'border-red-500' : '',
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...baseInputProps}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            rows={3}
          />
        );
      
      case 'color':
        return (
          <div className="flex gap-2">
            <Input
              {...baseInputProps}
              type="color"
              className="w-16 h-10 p-1 border rounded"
            />
            <Input
              {...baseInputProps}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        );
      
      case 'date':
        return <Input {...baseInputProps} type="date" />;
      
      case 'time':
        return <Input {...baseInputProps} type="time" />;
      
      case 'url':
        return (
          <div className="relative">
            <Input
              {...baseInputProps}
              type="url"
              placeholder="https://example.com"
            />
            <Link className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        );
      
      default:
        return (
          <Input
            {...baseInputProps}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
    }
  };

  // Get field icon
  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'color': return <Palette className="h-4 w-4" />;
      case 'url': return <Link className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'time': return <Clock className="h-4 w-4" />;
      case 'textarea': return <Type className="h-4 w-4" />;
      default: return <Type className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customize Template</h3>
          <p className="text-muted-foreground">{template.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onPreview?.(generatePreview())}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleApply}>
            <Copy className="h-4 w-4 mr-2" />
            Apply Template
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
        <TabsList>
          <TabsTrigger value="customize">Customize</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="customize" className="space-y-6">
          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client-select">Target Client</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo-client-1">City of Springfield</SelectItem>
                      <SelectItem value="demo-client-2">TechStart Inc.</SelectItem>
                      <SelectItem value="demo-client-3">Local Coffee Co.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedClientId && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">
                      Customizing template for{' '}
                      <span className="text-blue-600">
                        {selectedClientId === 'demo-client-1' ? 'City of Springfield' :
                         selectedClientId === 'demo-client-2' ? 'TechStart Inc.' :
                         'Local Coffee Co.'}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customization Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template Fields</CardTitle>
              <p className="text-sm text-muted-foreground">
                Customize the template variables for your selected client
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {template.customizableFields.map((field, index) => (
                  <div key={field.field} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(field.type)}
                      <Label htmlFor={field.field} className="font-medium">
                        {field.label}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                      {field.field.includes('_NAME') && (
                        <Badge variant="outline" className="text-xs text-red-600">
                          Required
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      {renderFieldInput(field)}
                      {validationErrors[field.field] && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors[field.field]}
                        </p>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Variable: <code>{'{{' + field.field + '}}'}</code>
                    </p>
                    
                    {index < template.customizableFields.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                See how your customized template will look
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generatePreview()}
                  </pre>
                </div>
                
                {/* Variable Summary */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Applied Variables:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {template.customizableFields.map(field => (
                      <div key={field.field} className="flex items-center gap-2 text-xs">
                        <code className="bg-gray-200 px-1 rounded">
                          {'{{' + field.field + '}}'}
                        </code>
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-medium">
                          {customizations[field.field] || '[Empty]'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Template */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Original Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {template.content}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Customized Template */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customized Version</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generatePreview()}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Changes Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customization Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {template.customizableFields.map(field => (
                  <div key={field.field} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{field.label}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <code>{'{{' + field.field + '}}'}</code> → "{customizations[field.field] || '[Empty]'}"
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}