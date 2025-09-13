'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Brain, 
  Sparkles, 
  Target, 
  Palette,
  MessageSquare,
  TrendingUp,
  Shield,
  Zap,
  Settings,
  Info,
  AlertTriangle,
  Check,
  Eye,
  BarChart3,
  FileText,
  Image,
  Mic,
  Video
} from 'lucide-react';
import { useUserSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

// AI feature configurations
interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'content' | 'analytics' | 'optimization' | 'automation';
  isPremium?: boolean;
  enabled: boolean;
  settings?: {
    [key: string]: {
      label: string;
      type: 'switch' | 'select' | 'slider' | 'text';
      options?: string[];
      min?: number;
      max?: number;
      defaultValue: any;
    };
  };
}

const AI_FEATURES: AIFeature[] = [
  {
    id: 'contentGeneration',
    name: 'AI Content Generation',
    description: 'Generate engaging content ideas, captions, and full articles using AI',
    icon: FileText,
    category: 'content',
    enabled: true,
    settings: {
      creativity: {
        label: 'Creativity Level',
        type: 'slider',
        min: 0,
        max: 100,
        defaultValue: 70
      },
      tone: {
        label: 'Default Tone',
        type: 'select',
        options: ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Playful'],
        defaultValue: 'Professional'
      },
      language: {
        label: 'Primary Language',
        type: 'select',
        options: ['English', 'Spanish', 'French', 'German', 'Portuguese'],
        defaultValue: 'English'
      }
    }
  },
  {
    id: 'smartSuggestions',
    name: 'Smart Content Suggestions',
    description: 'Get AI-powered suggestions for improving your content',
    icon: Sparkles,
    category: 'content',
    enabled: true,
    settings: {
      frequency: {
        label: 'Suggestion Frequency',
        type: 'select',
        options: ['Low', 'Medium', 'High'],
        defaultValue: 'Medium'
      },
      includeHashtags: {
        label: 'Include Hashtag Suggestions',
        type: 'switch',
        defaultValue: true
      }
    }
  },
  {
    id: 'imageGeneration',
    name: 'AI Image Generation',
    description: 'Create custom images and graphics using AI',
    icon: Image,
    category: 'content',
    isPremium: true,
    enabled: false,
    settings: {
      style: {
        label: 'Default Art Style',
        type: 'select',
        options: ['Realistic', 'Artistic', 'Minimalist', 'Corporate', 'Vibrant'],
        defaultValue: 'Corporate'
      },
      resolution: {
        label: 'Default Resolution',
        type: 'select',
        options: ['1024x1024', '1024x768', '768x1024', '1920x1080'],
        defaultValue: '1024x1024'
      }
    }
  },
  {
    id: 'voiceGeneration',
    name: 'AI Voice Generation',
    description: 'Generate natural-sounding voiceovers for your content',
    icon: Mic,
    category: 'content',
    isPremium: true,
    enabled: false,
    settings: {
      voice: {
        label: 'Default Voice',
        type: 'select',
        options: ['Professional Male', 'Professional Female', 'Friendly Male', 'Friendly Female'],
        defaultValue: 'Professional Female'
      },
      speed: {
        label: 'Speaking Speed',
        type: 'slider',
        min: 0.5,
        max: 2.0,
        defaultValue: 1.0
      }
    }
  },
  {
    id: 'performanceAnalysis',
    name: 'AI Performance Analysis',
    description: 'Get detailed insights and predictions about content performance',
    icon: TrendingUp,
    category: 'analytics',
    enabled: true,
    settings: {
      analysisDepth: {
        label: 'Analysis Depth',
        type: 'select',
        options: ['Basic', 'Detailed', 'Comprehensive'],
        defaultValue: 'Detailed'
      },
      includePredictions: {
        label: 'Include Performance Predictions',
        type: 'switch',
        defaultValue: true
      }
    }
  },
  {
    id: 'sentimentAnalysis',
    name: 'Sentiment Analysis',
    description: 'Analyze audience sentiment and emotional response to your content',
    icon: MessageSquare,
    category: 'analytics',
    enabled: true,
    settings: {
      realTime: {
        label: 'Real-time Analysis',
        type: 'switch',
        defaultValue: false
      }
    }
  },
  {
    id: 'autoOptimization',
    name: 'Auto-Optimization',
    description: 'Automatically optimize posting times and content format',
    icon: Target,
    category: 'optimization',
    enabled: true,
    settings: {
      aggressiveness: {
        label: 'Optimization Level',
        type: 'select',
        options: ['Conservative', 'Moderate', 'Aggressive'],
        defaultValue: 'Moderate'
      },
      optimizeFor: {
        label: 'Optimize For',
        type: 'select',
        options: ['Engagement', 'Reach', 'Conversions', 'Balanced'],
        defaultValue: 'Balanced'
      }
    }
  },
  {
    id: 'smartScheduling',
    name: 'Smart Scheduling',
    description: 'AI-powered optimal timing for content publication',
    icon: Zap,
    category: 'optimization',
    enabled: true,
    settings: {
      timezone: {
        label: 'Target Timezone',
        type: 'select',
        options: ['Auto-detect', 'UTC', 'EST', 'PST', 'GMT'],
        defaultValue: 'Auto-detect'
      },
      considerHolidays: {
        label: 'Consider Holidays',
        type: 'switch',
        defaultValue: true
      }
    }
  },
  {
    id: 'autoModeration',
    name: 'Auto Content Moderation',
    description: 'Automatically flag inappropriate or risky content',
    icon: Shield,
    category: 'automation',
    enabled: true,
    settings: {
      sensitivity: {
        label: 'Moderation Sensitivity',
        type: 'select',
        options: ['Low', 'Medium', 'High', 'Maximum'],
        defaultValue: 'Medium'
      },
      autoReject: {
        label: 'Auto-reject Flagged Content',
        type: 'switch',
        defaultValue: false
      }
    }
  },
  {
    id: 'responseAutomation',
    name: 'AI Response Automation',
    description: 'Automatically respond to common comments and messages',
    icon: MessageSquare,
    category: 'automation',
    isPremium: true,
    enabled: false,
    settings: {
      responseStyle: {
        label: 'Response Style',
        type: 'select',
        options: ['Professional', 'Friendly', 'Brief', 'Detailed'],
        defaultValue: 'Friendly'
      },
      humanReview: {
        label: 'Require Human Review',
        type: 'switch',
        defaultValue: true
      }
    }
  }
];

// Feature category component
function AIFeatureCategory({ 
  title, 
  features, 
  settings, 
  onToggle, 
  onUpdateSetting, 
  disabled 
}: {
  title: string;
  features: AIFeature[];
  settings: any;
  onToggle: (featureId: string, enabled: boolean) => void;
  onUpdateSetting: (path: string, value: unknown) => void;
  disabled?: boolean;
}) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content': return <FileText className="h-5 w-5" />;
      case 'analytics': return <BarChart3 className="h-5 w-5" />;
      case 'optimization': return <Target className="h-5 w-5" />;
      case 'automation': return <Zap className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getCategoryIcon(features[0]?.category)}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {features.map((feature) => (
          <div key={feature.id} className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-lg bg-primary/10 mt-1">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{feature.name}</span>
                    {feature.isPremium && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
              
              <Switch
                checked={settings?.ai?.[feature.id]?.enabled ?? feature.enabled}
                onCheckedChange={(checked) => onToggle(feature.id, checked)}
                disabled={disabled || (feature.isPremium && !settings?.subscription?.isPremium)}
              />
            </div>
            
            {/* Feature-specific settings */}
            {feature.settings && (settings?.ai?.[feature.id]?.enabled ?? feature.enabled) && (
              <div className="ml-12 space-y-4 p-4 border-l-2 border-muted bg-muted/20 rounded-r">
                {Object.entries(feature.settings).map(([settingKey, setting]) => (
                  <div key={settingKey} className="space-y-2">
                    <Label className="text-sm">{setting.label}</Label>
                    
                    {setting.type === 'switch' && (
                      <Switch
                        checked={settings?.ai?.[feature.id]?.settings?.[settingKey] ?? setting.defaultValue}
                        onCheckedChange={(checked) => 
                          onUpdateSetting(`ai.${feature.id}.settings.${settingKey}`, checked)
                        }
                        disabled={disabled}
                      />
                    )}
                    
                    {setting.type === 'select' && (
                      <Select
                        value={settings?.ai?.[feature.id]?.settings?.[settingKey] ?? setting.defaultValue}
                        onValueChange={(value) => 
                          onUpdateSetting(`ai.${feature.id}.settings.${settingKey}`, value)
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {setting.type === 'slider' && (
                      <div className="space-y-2">
                        <Slider
                          value={[settings?.ai?.[feature.id]?.settings?.[settingKey] ?? setting.defaultValue]}
                          onValueChange={(value) => 
                            onUpdateSetting(`ai.${feature.id}.settings.${settingKey}`, value[0])
                          }
                          min={setting.min}
                          max={setting.max}
                          step={setting.max && setting.max <= 2 ? 0.1 : 1}
                          disabled={disabled}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{setting.min}</span>
                          <span>{settings?.ai?.[feature.id]?.settings?.[settingKey] ?? setting.defaultValue}</span>
                          <span>{setting.max}</span>
                        </div>
                      </div>
                    )}
                    
                    {setting.type === 'text' && (
                      <Textarea
                        value={settings?.ai?.[feature.id]?.settings?.[settingKey] ?? setting.defaultValue}
                        onChange={(e) => 
                          onUpdateSetting(`ai.${feature.id}.settings.${settingKey}`, e.target.value)
                        }
                        disabled={disabled}
                        className="min-h-[80px]"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <Separator />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Global AI settings
function GlobalAISettings({ settings, onUpdate, disabled }: {
  settings: any;
  onUpdate: (path: string, value: unknown) => void;
  disabled?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Global AI Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable AI Features</Label>
            <p className="text-sm text-muted-foreground">
              Master toggle for all AI-powered features
            </p>
          </div>
          <Switch
            checked={settings?.ai?.enabled ?? true}
            onCheckedChange={(checked) => onUpdate('ai.enabled', checked)}
            disabled={disabled}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <Label className="text-base">AI Model Preference</Label>
          <RadioGroup
            value={settings?.ai?.modelPreference ?? 'balanced'}
            onValueChange={(value) => onUpdate('ai.modelPreference', value)}
            disabled={disabled}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="fast" id="fast" />
                <div className="flex-1">
                  <Label htmlFor="fast" className="font-medium">Fast</Label>
                  <p className="text-sm text-muted-foreground">Quick responses, basic accuracy</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="balanced" id="balanced" />
                <div className="flex-1">
                  <Label htmlFor="balanced" className="font-medium">Balanced</Label>
                  <p className="text-sm text-muted-foreground">Good speed and accuracy</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="accurate" id="accurate" />
                <div className="flex-1">
                  <Label htmlFor="accurate" className="font-medium">Accurate</Label>
                  <p className="text-sm text-muted-foreground">Best quality, slower responses</p>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Data Usage for Training</Label>
              <p className="text-sm text-muted-foreground">
                Allow your data to help improve AI models (anonymized)
              </p>
            </div>
            <Switch
              checked={settings?.ai?.allowTraining ?? false}
              onCheckedChange={(checked) => onUpdate('ai.allowTraining', checked)}
              disabled={disabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Personalized Recommendations</Label>
              <p className="text-sm text-muted-foreground">
                Use your content history for better AI suggestions
              </p>
            </div>
            <Switch
              checked={settings?.ai?.personalizedRecommendations ?? true}
              onCheckedChange={(checked) => onUpdate('ai.personalizedRecommendations', checked)}
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main component
export default function AISettings() {
  const { settings, updateSetting, loading, saving, error } = useUserSettings();
  const [aiUsageStats, setAiUsageStats] = useState({
    totalRequests: 1247,
    monthlyLimit: 5000,
    contentGenerated: 89,
    tokensUsed: 245832
  });
  
  const handleToggleFeature = (featureId: string, enabled: boolean) => {
    updateSetting(`ai.${featureId}.enabled`, enabled);
  };
  
  const handleUpdateSetting = (path: string, value: unknown) => {
    updateSetting(path, value);
  };
  
  // Group features by category
  const featuresByCategory = AI_FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, AIFeature[]>);
  
  const categoryTitles = {
    content: 'Content Creation',
    analytics: 'Analytics & Insights',
    optimization: 'Optimization',
    automation: 'Automation'
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading AI settings...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* AI Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Usage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg bg-card">
              <div className="text-2xl font-bold text-primary mb-1">
                {aiUsageStats.totalRequests.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">AI Requests This Month</div>
              <div className="text-xs text-muted-foreground mt-1">
                {aiUsageStats.monthlyLimit.toLocaleString()} limit
              </div>
              <div className="w-full bg-muted/50 rounded-full h-1.5 mt-2">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((aiUsageStats.totalRequests / aiUsageStats.monthlyLimit) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-card">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {aiUsageStats.contentGenerated}
              </div>
              <div className="text-sm text-muted-foreground">Content Pieces Generated</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-card">
              <div className="text-2xl font-bold text-chart-2 mb-1">
                {Math.round((aiUsageStats.totalRequests / aiUsageStats.monthlyLimit) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Monthly Usage</div>
              <div className={cn(
                "text-xs font-medium mt-2",
                Math.round((aiUsageStats.totalRequests / aiUsageStats.monthlyLimit) * 100) > 80 
                  ? "text-destructive" 
                  : Math.round((aiUsageStats.totalRequests / aiUsageStats.monthlyLimit) * 100) > 60 
                  ? "text-amber-600 dark:text-amber-400" 
                  : "text-emerald-600 dark:text-emerald-400"
              )}>
                {Math.round((aiUsageStats.totalRequests / aiUsageStats.monthlyLimit) * 100) > 80 
                  ? "High Usage" 
                  : Math.round((aiUsageStats.totalRequests / aiUsageStats.monthlyLimit) * 100) > 60 
                  ? "Moderate Usage" 
                  : "Low Usage"}
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-card">
              <div className="text-2xl font-bold text-chart-4 mb-1">
                {(aiUsageStats.tokensUsed / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-muted-foreground">Tokens Consumed</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="h-1.5 w-1.5 rounded-full bg-chart-4"></div>
                <span className="text-xs text-chart-4 font-medium">Processing</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global AI Settings */}
      <GlobalAISettings 
        settings={settings} 
        onUpdate={handleUpdateSetting} 
        disabled={saving} 
      />

      {/* Premium Features Notice */}
      {!settings?.subscription?.isPremium && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Unlock advanced AI features with a Premium subscription. 
                Get unlimited AI content generation, voice synthesis, and more.
              </span>
              <Button size="sm" className="ml-4">
                Upgrade Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* AI Feature Categories */}
      <div className="space-y-6">
        {Object.entries(featuresByCategory).map(([category, features]) => (
          <AIFeatureCategory
            key={category}
            title={categoryTitles[category as keyof typeof categoryTitles]}
            features={features}
            settings={settings}
            onToggle={handleToggleFeature}
            onUpdateSetting={handleUpdateSetting}
            disabled={saving || !settings?.ai?.enabled}
          />
        ))}
      </div>

      {/* AI Safety & Ethics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            AI Safety & Ethics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Our AI Commitment:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Your data privacy is protected and never shared without consent</li>
                  <li>• AI-generated content is clearly marked and attributed</li>
                  <li>• We continuously monitor for bias and harmful outputs</li>
                  <li>• Human oversight is maintained for all automated actions</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Content Attribution</Label>
              <p className="text-sm text-muted-foreground">
                Automatically add attribution for AI-generated content
              </p>
            </div>
            <Switch
              checked={settings?.ai?.contentAttribution ?? true}
              onCheckedChange={(checked) => updateSetting('ai.contentAttribution', checked)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Saving Status */}
      {saving && (
        <Alert>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
          <AlertDescription>
            Saving AI preferences...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}