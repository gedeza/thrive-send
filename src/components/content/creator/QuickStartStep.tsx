"use client";

import React from 'react';
import { 
  MessageSquare, 
  Mail, 
  FileText, 
  Video, 
  Newspaper, 
  Megaphone,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContentData, ContentType, Platform } from '../NewContentCreator';

interface QuickStartStepProps {
  contentData: Partial<ContentData>;
  onUpdate: (updates: Partial<ContentData>) => void;
  onNext: () => void;
}

const contentTypes = [
  {
    id: 'social-post' as ContentType,
    label: 'Social Media Post',
    description: 'Quick posts for social platforms',
    icon: MessageSquare,
    color: 'bg-blue-500',
    popular: true,
    estimatedTime: '2-5 minutes'
  },
  {
    id: 'email' as ContentType,
    label: 'Email Campaign',
    description: 'Newsletters and promotional emails',
    icon: Mail,
    color: 'bg-green-500',
    popular: true,
    estimatedTime: '10-15 minutes'
  },
  {
    id: 'blog' as ContentType,
    label: 'Blog Article',
    description: 'Long-form content and articles',
    icon: FileText,
    color: 'bg-purple-500',
    popular: false,
    estimatedTime: '30-60 minutes'
  },
  {
    id: 'video' as ContentType,
    label: 'Video Content',
    description: 'Video posts and stories',
    icon: Video,
    color: 'bg-red-500',
    popular: false,
    estimatedTime: '15-30 minutes'
  },
  {
    id: 'newsletter' as ContentType,
    label: 'Newsletter',
    description: 'Regular updates and newsletters',
    icon: Newspaper,
    color: 'bg-orange-500',
    popular: true,
    estimatedTime: '15-20 minutes'
  },
  {
    id: 'announcement' as ContentType,
    label: 'Announcement',
    description: 'Important updates and news',
    icon: Megaphone,
    color: 'bg-yellow-500',
    popular: false,
    estimatedTime: '5-10 minutes'
  }
];

const platformGroups = [
  {
    label: 'Social Media',
    platforms: [
      { id: 'twitter' as Platform, label: 'Twitter/X', icon: Twitter, color: 'text-black' },
      { id: 'linkedin' as Platform, label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
      { id: 'facebook' as Platform, label: 'Facebook', icon: Facebook, color: 'text-blue-500' },
      { id: 'instagram' as Platform, label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
      { id: 'tiktok' as Platform, label: 'TikTok', icon: TrendingUp, color: 'text-black' }
    ]
  },
  {
    label: 'Direct Communication',
    platforms: [
      { id: 'email' as Platform, label: 'Email', icon: Mail, color: 'text-green-600' },
      { id: 'blog' as Platform, label: 'Blog/Website', icon: FileText, color: 'text-purple-600' }
    ]
  }
];

export function QuickStartStep({ contentData, onUpdate, onNext }: QuickStartStepProps) {
  const selectedType = contentData.type;
  const selectedPlatforms = contentData.platforms || [];

  const handleTypeSelect = (type: ContentType) => {
    onUpdate({ type });
    
    // Auto-suggest platforms based on content type
    let suggestedPlatforms: Platform[] = [];
    switch (type) {
      case 'social-post':
        suggestedPlatforms = ['twitter', 'linkedin', 'facebook'];
        break;
      case 'email':
      case 'newsletter':
        suggestedPlatforms = ['email'];
        break;
      case 'blog':
        suggestedPlatforms = ['blog'];
        break;
      case 'video':
        suggestedPlatforms = ['instagram', 'tiktok'];
        break;
      case 'announcement':
        suggestedPlatforms = ['twitter', 'linkedin', 'email'];
        break;
    }
    
    if (suggestedPlatforms.length > 0) {
      onUpdate({ platforms: suggestedPlatforms });
    }
  };

  const togglePlatform = (platform: Platform) => {
    const updated = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter(p => p !== platform)
      : [...selectedPlatforms, platform];
    
    onUpdate({ platforms: updated });
  };

  const canProceed = selectedType && selectedPlatforms.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">What would you like to create?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose your content type and where you'd like to share it. We'll optimize the format for each platform.
        </p>
      </div>

      {/* Content Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          Content Type
          {selectedType && (
            <Badge variant="secondary" className="ml-2">
              {contentTypes.find(t => t.id === selectedType)?.estimatedTime}
            </Badge>
          )}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contentTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'hover:shadow-sm'
                }`}
                onClick={() => handleTypeSelect(type.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${type.color} bg-opacity-10`}>
                      <Icon className={`h-5 w-5 ${type.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{type.label}</h4>
                        {type.popular && (
                          <Badge variant="secondary" className="text-xs">Popular</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Platform Selection */}
      {selectedType && (
        <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
          <h3 className="text-lg font-semibold text-gray-900">
            Where would you like to share this?
          </h3>
          
          {platformGroups.map((group) => (
            <div key={group.label} className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">{group.label}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {group.platforms.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  
                  return (
                    <Button
                      key={platform.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePlatform(platform.id)}
                      className={`justify-start gap-2 h-auto p-3 ${
                        isSelected ? '' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : platform.color}`} />
                      <span className="text-sm">{platform.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Continue Button */}
      {selectedType && (
        <div className="flex justify-center pt-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            size="lg"
            className="px-8 gap-2"
          >
            Continue to Content Creation
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}