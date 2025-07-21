"use client";

import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Zap, 
  Send, 
  ArrowLeft, 
  CheckCircle, 
  TrendingUp,
  Users,
  Target,
  Hash,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { ContentData } from '../NewContentCreator';
import { useRouter } from 'next/navigation';

interface OptimizeScheduleStepProps {
  contentData: Partial<ContentData>;
  onUpdate: (updates: Partial<ContentData>) => void;
  onPrevious: () => void;
  mode?: 'create' | 'edit';
  contentId?: string;
}

const scheduleOptions = [
  {
    id: 'now',
    label: 'Publish Now',
    description: 'Send immediately',
    icon: Send,
    recommended: false
  },
  {
    id: 'optimal',
    label: 'Optimal Time',
    description: 'AI-powered best time (recommended)',
    icon: TrendingUp,
    recommended: true
  },
  {
    id: 'later',
    label: 'Schedule for Later',
    description: 'Choose specific date and time',
    icon: Calendar,
    recommended: false
  }
];

const suggestedTags = [
  '#marketing', '#socialmedia', '#business', '#growth', '#tips',
  '#strategy', '#content', '#digital', '#brand', '#engagement'
];

export function OptimizeScheduleStep({ contentData, onUpdate, onPrevious, mode = 'create', contentId }: OptimizeScheduleStepProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [customTag, setCustomTag] = useState('');
  
  // Publishing Options State
  const [publishingOptions, setPublishingOptions] = useState({
    crossPost: true,
    autoOptimize: true,
    trackAnalytics: true
  });
  
  const scheduleType = contentData.scheduleType || 'optimal';
  const tags = contentData.tags || [];
  const platforms = contentData.platforms || [];

  const handleScheduleChange = (value: 'now' | 'later' | 'optimal') => {
    onUpdate({ scheduleType: value });
  };

  const handleDateTimeChange = (date: string, time: string) => {
    const scheduledDate = new Date(`${date}T${time}`);
    onUpdate({ scheduledDate });
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      onUpdate({ tags: [...tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    onUpdate({ tags: tags.filter(t => t !== tag) });
  };

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      const formattedTag = customTag.trim().startsWith('#') ? customTag.trim() : `#${customTag.trim()}`;
      addTag(formattedTag);
      setCustomTag('');
    }
  };

  const handlePublish = async () => {
    // Validate required fields
    if (!contentData.title?.trim()) {
      alert('Please add a title to your content');
      return;
    }
    
    if (!contentData.content?.trim()) {
      alert('Please add content before publishing');
      return;
    }

    setIsPublishing(true);
    
    try {
      // Map content types to simple API format
      const mapContentType = (type: string) => {
        const typeMap: Record<string, string> = {
          'social-post': 'SOCIAL',
          'email': 'EMAIL',
          'blog': 'BLOG',
          'video': 'SOCIAL',
          'newsletter': 'EMAIL',
          'announcement': 'SOCIAL'
        };
        return typeMap[type] || 'SOCIAL';
      };

      // Prepare simple content data
      const simplePayload = {
        title: contentData.title,
        content: contentData.content,
        type: mapContentType(contentData.type || 'social-post'),
        scheduledAt: scheduleType === 'later' && contentData.scheduledDate 
          ? contentData.scheduledDate.toISOString()
          : scheduleType === 'optimal' 
            ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow 9 AM
            : undefined
      };

      console.log('🚀 Using simple content API for:', simplePayload);

      // Use the simple, reliable API
      const response = await fetch('/api/simple-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simplePayload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to create content');
      }

      const createdContent = await response.json();

      // Simple API automatically handles calendar events - no extra work needed!
      console.log('✅ Content created with simple API - calendar event handled automatically');

      // Dispatch custom event to refresh content list
      window.dispatchEvent(new CustomEvent('content-created'));
      
      // Show success message and redirect
      const successMessage = mode === 'edit' ? 'updated' : 
                             scheduleType === 'now' ? 'published' : 'scheduled';
      router.push(`/content?success=${successMessage}`);
    } catch (error) {
      console.error('Error publishing content:', error);
      setIsPublishing(false);
      // You could add a toast notification here for better UX
      alert(error instanceof Error ? error.message : 'Failed to publish content');
    }
  };

  const getOptimalTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    return tomorrow.toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Optimize & Schedule</h2>
        <p className="text-gray-600">
          Fine-tune your content and choose when to publish
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Content Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{contentData.title}</h3>
                <p className="text-gray-700 leading-relaxed">{contentData.content}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {contentData.tone} tone
                </Badge>
                <div className="flex gap-1">
                  {platforms.map(platform => (
                    <Badge key={platform} variant="outline" className="text-xs capitalize">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags & Hashtags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Tags & Hashtags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add Custom Tag */}
              <div className="flex gap-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add custom tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                  className="flex-1"
                />
                <Button onClick={addCustomTag} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggested Tags */}
              <div className="space-y-2">
                <Label className="text-sm">Suggested tags:</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter(tag => !tags.includes(tag))
                    .slice(0, 6)
                    .map(tag => (
                      <Button
                        key={tag}
                        variant="ghost"
                        size="sm"
                        onClick={() => addTag(tag)}
                        className="text-xs h-auto px-2 py-1"
                      >
                        {tag}
                      </Button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                When to Publish
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={scheduleType} onValueChange={handleScheduleChange} className="space-y-4">
                {scheduleOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <div key={option.id} className="flex items-start space-x-3">
                      <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                      <div className="flex-1 space-y-1">
                        <label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{option.label}</span>
                          {option.recommended && (
                            <Badge variant="default" className="text-xs">Recommended</Badge>
                          )}
                        </label>
                        <p className="text-sm text-gray-600">{option.description}</p>
                        
                        {option.id === 'optimal' && scheduleType === 'optimal' && (
                          <p className="text-sm text-blue-600 font-medium">
                            Best time: {getOptimalTime()}
                          </p>
                        )}
                        
                        {option.id === 'later' && scheduleType === 'later' && (
                          <div className="grid grid-cols-2 gap-2 mt-2 max-w-sm">
                            <Input
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => {
                                const time = (document.getElementById('time-input') as HTMLInputElement)?.value || '09:00';
                                handleDateTimeChange(e.target.value, time);
                              }}
                            />
                            <Input
                              id="time-input"
                              type="time"
                              defaultValue="09:00"
                              onChange={(e) => {
                                const date = (document.querySelector('input[type="date"]') as HTMLInputElement)?.value || new Date().toISOString().split('T')[0];
                                handleDateTimeChange(date, e.target.value);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Expected Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estimated Reach</span>
                <span className="font-semibold">2.3K - 4.1K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement Rate</span>
                <span className="font-semibold">3.2% - 5.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Best Platform</span>
                <Badge variant="outline" className="capitalize">
                  {platforms[0] || 'N/A'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Publishing Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Publishing Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="cross-post" className="text-sm">Cross-post to all platforms</Label>
                <Switch 
                  id="cross-post" 
                  checked={publishingOptions.crossPost}
                  onCheckedChange={(checked) => 
                    setPublishingOptions(prev => ({ ...prev, crossPost: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-optimize" className="text-sm">Auto-optimize for each platform</Label>
                <Switch 
                  id="auto-optimize" 
                  checked={publishingOptions.autoOptimize}
                  onCheckedChange={(checked) => 
                    setPublishingOptions(prev => ({ ...prev, autoOptimize: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="track-analytics" className="text-sm">Track performance</Label>
                <Switch 
                  id="track-analytics" 
                  checked={publishingOptions.trackAnalytics}
                  onCheckedChange={(checked) => 
                    setPublishingOptions(prev => ({ ...prev, trackAnalytics: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Platform Insights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Platform Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {platforms.map(platform => (
                <div key={platform} className="text-xs text-gray-600">
                  <span className="capitalize font-medium">{platform}</span>: Best time 9-11 AM
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrevious} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Content
        </Button>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={async () => {
              // Validate required fields
              if (!contentData.title?.trim()) {
                alert('Please add a title to save as draft');
                return;
              }
              
              if (!contentData.content?.trim()) {
                alert('Please add content to save as draft');
                return;
              }

              try {
                // Use the same simple API mapping
                const mapContentType = (type: string) => {
                  const typeMap: Record<string, string> = {
                    'social-post': 'SOCIAL',
                    'email': 'EMAIL',
                    'blog': 'BLOG',
                    'video': 'SOCIAL',
                    'newsletter': 'EMAIL',
                    'announcement': 'SOCIAL'
                  };
                  return typeMap[type] || 'SOCIAL';
                };

                const draftPayload = {
                  title: contentData.title,
                  content: contentData.content,
                  type: mapContentType(contentData.type || 'social-post'),
                  // No scheduledAt for drafts
                };

                console.log('💾 Saving draft with simple API:', draftPayload);

                const response = await fetch('/api/simple-content', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(draftPayload),
                });

                if (response.ok) {
                  window.dispatchEvent(new CustomEvent('content-created'));
                  router.push('/content?success=saved');
                } else {
                  const error = await response.json();
                  console.error('Draft save failed:', error);
                  alert(error.details || error.error || 'Failed to save draft');
                }
              } catch (error) {
                console.error('Error saving draft:', error);
                alert('Failed to save draft');
              }
            }}
          >
            Save Draft
          </Button>
          <Button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="gap-2 min-w-[120px]"
          >
            {isPublishing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {scheduleType === 'now' ? 'Publish Now' : 'Schedule Post'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}