"use client";

import React, { useState, useCallback } from 'react';
import { 
  Type, 
  Image, 
  Smile, 
  Zap, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ContentData } from '../NewContentCreator';

interface CreateContentStepProps {
  contentData: Partial<ContentData>;
  onUpdate: (updates: Partial<ContentData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const toneOptions = [
  { id: 'professional', label: 'Professional', emoji: '👔', description: 'Formal and business-focused' },
  { id: 'casual', label: 'Casual', emoji: '😊', description: 'Relaxed and conversational' },
  { id: 'friendly', label: 'Friendly', emoji: '🤝', description: 'Warm and approachable' },
  { id: 'urgent', label: 'Urgent', emoji: '⚡', description: 'Important and time-sensitive' },
  { id: 'educational', label: 'Educational', emoji: '📚', description: 'Informative and helpful' }
] as const;

const platformLimits: Record<string, { min: number; max: number; optimal: number }> = {
  twitter: { min: 10, max: 280, optimal: 100 },
  linkedin: { min: 30, max: 3000, optimal: 150 },
  facebook: { min: 40, max: 8000, optimal: 200 },
  instagram: { min: 20, max: 2200, optimal: 125 },
  email: { min: 50, max: 10000, optimal: 300 },
  blog: { min: 100, max: 50000, optimal: 1000 }
};

export function CreateContentStep({ contentData, onUpdate, onNext, onPrevious }: CreateContentStepProps) {
  const [showTips, setShowTips] = useState(false);
  
  const title = contentData.title || '';
  const content = contentData.content || '';
  const tone = contentData.tone || 'professional';
  const platforms = contentData.platforms || [];

  // Calculate content metrics
  const contentLength = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  
  // Get platform-specific limits
  const getPlatformStatus = useCallback(() => {
    if (platforms.length === 0) return { status: 'neutral', message: 'No platforms selected' };
    
    const statuses = platforms.map(platform => {
      const limits = platformLimits[platform];
      if (!limits) return { platform, status: 'neutral' };
      
      if (contentLength === 0) return { platform, status: 'empty' };
      if (contentLength < limits.min) return { platform, status: 'too-short' };
      if (contentLength > limits.max) return { platform, status: 'too-long' };
      if (contentLength <= limits.optimal) return { platform, status: 'optimal' };
      return { platform, status: 'good' };
    });
    
    const hasErrors = statuses.some(s => s.status === 'too-long');
    const hasWarnings = statuses.some(s => s.status === 'too-short');
    const isEmpty = statuses.every(s => s.status === 'empty');
    
    if (isEmpty) return { status: 'empty', message: 'Start writing your content' };
    if (hasErrors) return { status: 'error', message: 'Content too long for some platforms' };
    if (hasWarnings) return { status: 'warning', message: 'Content might be too short' };
    return { status: 'success', message: 'Perfect length for all platforms' };
  }, [platforms, contentLength]);

  const platformStatus = getPlatformStatus();

  const handleContentChange = (value: string) => {
    onUpdate({ content: value });
  };

  const handleTitleChange = (value: string) => {
    onUpdate({ title: value });
  };

  const handleToneChange = (newTone: typeof tone) => {
    onUpdate({ tone: newTone });
  };

  const canProceed = content.trim().length > 0 && title.trim().length > 0;

  const getContentTips = () => {
    const tips = [];
    
    if (platforms.includes('twitter')) {
      tips.push('Keep it concise for Twitter - aim for 100-150 characters for better engagement');
    }
    if (platforms.includes('linkedin')) {
      tips.push('LinkedIn users prefer professional insights and industry knowledge');
    }
    if (platforms.includes('instagram')) {
      tips.push('Instagram content should be visual-first with engaging captions');
    }
    if (platforms.includes('email')) {
      tips.push('Email content should have a clear call-to-action and personal touch');
    }
    
    return tips;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Create Your Content</h2>
        <p className="text-gray-600">
          Write your content and we'll optimize it for each platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title or Subject Line
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter a compelling title..."
              className="text-lg"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-sm font-medium">
                Content
              </Label>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">{wordCount} words</span>
                <span className="text-gray-300">•</span>
                <span className={`${
                  platformStatus.status === 'success' ? 'text-green-600' :
                  platformStatus.status === 'warning' ? 'text-yellow-600' :
                  platformStatus.status === 'error' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {contentLength} characters
                </span>
              </div>
            </div>
            
            <Textarea
              id="content"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing your content here..."
              className="min-h-[200px] text-base leading-relaxed"
            />
            
            {/* Content Status */}
            <div className={`flex items-center gap-2 text-sm ${
              platformStatus.status === 'success' ? 'text-green-600' :
              platformStatus.status === 'warning' ? 'text-yellow-600' :
              platformStatus.status === 'error' ? 'text-red-600' :
              'text-gray-500'
            }`}>
              {platformStatus.status === 'success' && <CheckCircle className="h-4 w-4" />}
              {platformStatus.status === 'warning' && <AlertCircle className="h-4 w-4" />}
              {platformStatus.status === 'error' && <AlertCircle className="h-4 w-4" />}
              <span>{platformStatus.message}</span>
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tone & Style</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {toneOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={tone === option.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToneChange(option.id)}
                  className="justify-start gap-2 h-auto p-3"
                >
                  <span>{option.emoji}</span>
                  <span className="text-xs">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Platform Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Platform Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {platforms.map(platform => {
                const limits = platformLimits[platform];
                if (!limits) return null;
                
                const percentage = Math.min((contentLength / limits.max) * 100, 100);
                const status = 
                  contentLength === 0 ? 'empty' :
                  contentLength < limits.min ? 'warning' :
                  contentLength > limits.max ? 'error' :
                  'success';
                
                return (
                  <div key={platform} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{platform}</span>
                      <Badge 
                        variant={status === 'error' ? 'destructive' : status === 'warning' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {contentLength}/{limits.max}
                      </Badge>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${
                        status === 'error' ? '[&>div]:bg-red-500' :
                        status === 'warning' ? '[&>div]:bg-yellow-500' :
                        '[&>div]:bg-green-500'
                      }`}
                    />
                    <p className="text-xs text-gray-500">
                      Optimal: {limits.optimal} characters
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Content Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Writing Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {getContentTips().map((tip, index) => (
                <p key={index} className="text-xs text-gray-600 leading-relaxed">
                  {tip}
                </p>
              ))}
              {getContentTips().length === 0 && (
                <p className="text-xs text-gray-500">
                  Select platforms to see specific writing tips
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2"
                onClick={async () => {
                  if (!content.trim()) return;
                  
                  try {
                    // Simple AI enhancement - add engaging hooks and improve clarity
                    const enhancedContent = content
                      .replace(/^(.+)/, (match) => {
                        if (!match.includes('🔥') && !match.includes('💡') && !match.includes('✨')) {
                          return `✨ ${match}`;
                        }
                        return match;
                      })
                      .replace(/\.$/, ' 🎯')
                      .replace(/\?$/, ' 🤔');
                    
                    handleContentChange(enhancedContent);
                  } catch (error) {
                    console.error('AI enhancement failed:', error);
                  }
                }}
              >
                <Zap className="h-4 w-4" />
                AI Enhance
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2"
                onClick={() => {
                  const emojis = ['😊', '🎉', '💪', '🚀', '✨', '🔥', '💡', '🎯', '👍', '💯'];
                  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                  
                  // Add emoji at the end of content if it doesn't already have emojis
                  if (content && !content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u)) {
                    handleContentChange(content + ` ${randomEmoji}`);
                  }
                }}
              >
                <Smile className="h-4 w-4" />
                Add Emoji
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2"
                onClick={() => {
                  // Create a file input element
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*,video/*';
                  input.multiple = true;
                  
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && files.length > 0) {
                      // For now, just add a placeholder for media
                      const mediaText = Array.from(files)
                        .map(file => `[${file.type.startsWith('image/') ? '📷 Image' : '🎥 Video'}: ${file.name}]`)
                        .join(' ');
                      
                      handleContentChange(content ? `${content}\n\n${mediaText}` : mediaText);
                    }
                  };
                  
                  input.click();
                }}
              >
                <Image className="h-4 w-4" />
                Add Media
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrevious} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Quick Start
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={!canProceed}
          className="gap-2"
        >
          Continue to Optimize
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}