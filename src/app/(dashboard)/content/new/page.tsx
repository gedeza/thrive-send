"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Sparkles, 
  Send, 
  Globe, 
  Hash, 
  Tag, 
  Users, 
  TrendingUp, 
  Eye, 
  Lightbulb, 
  Upload, 
  X, 
  Image, 
  Video, 
  FileText, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Youtube, 
  Mail, 
  MessageSquare, 
  Music, 
  Zap, 
  Bot 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TemplateQuickPicker, useTemplateSelection } from '@/components/templates/TemplateQuickPicker';

const contentTypes = [
  { 
    value: 'SOCIAL', 
    label: 'Social Media Post', 
    icon: Globe,
    description: 'Share updates, engage your audience',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    tips: 'Keep it engaging, use hashtags, add visuals'
  },
  { 
    value: 'BLOG', 
    label: 'Blog Post', 
    icon: Send,
    description: 'Long-form content for your blog',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    tips: 'Start with a strong headline, structure with headings'
  },
  { 
    value: 'EMAIL', 
    label: 'Email Campaign', 
    icon: Users,
    description: 'Newsletter or marketing email',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    tips: 'Clear subject line, personal tone, strong CTA'
  },
  { 
    value: 'ARTICLE', 
    label: 'Article', 
    icon: TrendingUp,
    description: 'Educational or informational piece',
    color: 'bg-green-100 text-green-800 border-green-200',
    tips: 'Research thoroughly, cite sources, provide value'
  }
];

const platforms = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    charLimit: 280,
    hashtagLimit: 3,
    mediaSpecs: { image: '1200x675px', video: '1280x720px, 2:20min' },
    bestPractices: [
      'Use 1-2 hashtags max',
      'Tweet during peak hours (9am-3pm)',
      'Add images for 150% more retweets'
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    charLimit: 3000,
    hashtagLimit: 5,
    mediaSpecs: { image: '1200x627px', video: '1280x720px, 10min' },
    bestPractices: [
      'Professional tone works best',
      'Post Tuesday-Thursday 8am-2pm',
      'Use 3-5 relevant hashtags'
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    charLimit: 2200,
    hashtagLimit: 30,
    mediaSpecs: { image: '1080x1080px', video: '1080x1080px, 60s' },
    bestPractices: [
      'High-quality visuals are essential',
      'Use all 30 hashtags for reach',
      'Post when followers are active'
    ]
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    charLimit: 63206,
    hashtagLimit: 3,
    mediaSpecs: { image: '1200x630px', video: '1280x720px, 240min' },
    bestPractices: [
      'Conversational tone works well',
      'Post 1-2pm and 3-4pm weekdays',
      'Ask questions to boost engagement'
    ]
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Music,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    charLimit: 4000,
    hashtagLimit: 20,
    mediaSpecs: { image: '1080x1920px', video: '1080x1920px, 10min' },
    bestPractices: [
      'Vertical video format is essential',
      'Hook viewers in first 3 seconds',
      'Use trending sounds and effects',
      'Post 6-10am and 7-9pm for best reach'
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-red-100 text-red-800 border-red-200',
    charLimit: 5000,
    hashtagLimit: 15,
    mediaSpecs: { image: '1280x720px', video: '1920x1080px, unlimited' },
    bestPractices: [
      'Compelling thumbnails are crucial',
      'Upload 2-5pm for best reach',
      'Use 10-15 hashtags in description'
    ]
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: 'bg-green-100 text-green-800 border-green-200',
    charLimit: 50000,
    hashtagLimit: 0,
    mediaSpecs: { image: '600px width', video: 'embedded links' },
    bestPractices: [
      'Subject line under 50 characters',
      'Send Tuesday-Thursday 10am-2pm',
      'Personalize when possible'
    ]
  }
];

const contentTemplates = {
  SOCIAL: [
    {
      id: 'question',
      name: 'Question Post',
      description: 'Boost engagement with thought-provoking questions',
      template: `What's your take on [TOPIC]? 🤔

I've been thinking about [YOUR_PERSPECTIVE] and would love to hear different viewpoints.

Drop your thoughts in the comments! 👇

#[HASHTAG1] #[HASHTAG2] #[HASHTAG3]`,
      platforms: ['twitter', 'linkedin', 'facebook', 'instagram']
    },
    {
      id: 'tip',
      name: 'Quick Tip',
      description: 'Share valuable insights in bite-sized format',
      template: `💡 Pro tip: [YOUR_TIP]

Here's why this works:
• [REASON_1]
• [REASON_2] 
• [REASON_3]

Try it out and let me know how it goes! ✨

#[HASHTAG1] #[HASHTAG2]`,
      platforms: ['twitter', 'linkedin', 'instagram', 'tiktok']
    },
    {
      id: 'behind_scenes',
      name: 'Behind the Scenes',
      description: 'Show the human side of your work',
      template: `Behind the scenes: [WHAT_YOU\'RE_WORKING_ON] 👀

The process:
1. [STEP_1]
2. [STEP_2]
3. [STEP_3]

Not always glamorous, but always worth it! 💪

#[HASHTAG1] #BehindTheScenes`,
      platforms: ['instagram', 'tiktok', 'linkedin', 'facebook']
    },
    {
      id: 'trend_reaction',
      name: 'Trend Reaction',
      description: 'Jump on trending topics with your unique perspective',
      template: `Okay, let's talk about [TRENDING_TOPIC] 🔥

My hot take: [YOUR_OPINION]

Here's why I think this matters:
[YOUR_REASONING]

What's your perspective? Are you team [OPTION_A] or [OPTION_B]?

#[TRENDING_HASHTAG] #[YOUR_HASHTAG]`,
      platforms: ['tiktok', 'twitter', 'instagram']
    }
  ],
  BLOG: [
    {
      id: 'how_to',
      name: 'How-To Guide',
      description: 'Step-by-step instructional content',
      template: `# How to [ACHIEVE_GOAL]: A Complete Guide

## Introduction
[WHY_THIS_MATTERS]

## What You'll Need
- [REQUIREMENT_1]
- [REQUIREMENT_2]
- [REQUIREMENT_3]

## Step-by-Step Process

### Step 1: [FIRST_STEP]
[DETAILED_EXPLANATION]

### Step 2: [SECOND_STEP]
[DETAILED_EXPLANATION]

### Step 3: [THIRD_STEP]
[DETAILED_EXPLANATION]

## Common Mistakes to Avoid
- [MISTAKE_1]
- [MISTAKE_2]

## Conclusion
[SUMMARY_AND_NEXT_STEPS]

---
What challenges have you faced with [TOPIC]? Share your experience in the comments!`,
      platforms: ['blog']
    },
    {
      id: 'listicle',
      name: 'List Article',
      description: 'Engaging numbered list format',
      template: `# [NUMBER] [ADJECTIVE] Ways to [ACHIEVE_SOMETHING]

## Introduction
[HOOK_ABOUT_TOPIC]

## 1. [FIRST_METHOD]
[EXPLANATION_AND_EXAMPLE]

## 2. [SECOND_METHOD]
[EXPLANATION_AND_EXAMPLE]

## 3. [THIRD_METHOD]
[EXPLANATION_AND_EXAMPLE]

## 4. [FOURTH_METHOD]
[EXPLANATION_AND_EXAMPLE]

## 5. [FIFTH_METHOD]
[EXPLANATION_AND_EXAMPLE]

## Conclusion
[RECAP_AND_ACTION_ITEMS]

Which of these strategies will you try first? Let me know in the comments!`,
      platforms: ['blog']
    }
  ],
  EMAIL: [
    {
      id: 'newsletter',
      name: 'Newsletter Template',
      description: 'Weekly/monthly newsletter format',
      template: `Subject: [COMPELLING_SUBJECT_LINE] 📧

Hi [FIRST_NAME],

Hope your [DAY_OF_WEEK] is going great! Here's what's new this week:

## 🔥 What's Hot
[MAIN_UPDATE_OR_NEWS]

## 💡 Quick Tip
[ACTIONABLE_ADVICE]

## 📖 Worth Reading
[INTERESTING_ARTICLE_OR_RESOURCE]

## 🎉 Community Spotlight
[HIGHLIGHT_CUSTOMER/COMMUNITY_MEMBER]

---

That's all for this week! Hit reply and let me know what you're working on.

Best,
[YOUR_NAME]

P.S. [PERSONAL_NOTE_OR_CTA]`,
      platforms: ['email']
    },
    {
      id: 'promotion',
      name: 'Product Promotion',
      description: 'Sales email that doesn\'t feel salesy',
      template: `Subject: [BENEFIT_FOCUSED_SUBJECT] ✨

Hi [FIRST_NAME],

I wanted to share something exciting with you...

[PERSONAL_STORY_OR_CONTEXT]

That's why I created [PRODUCT_NAME]. It helps you [PRIMARY_BENEFIT].

Here's what makes it special:
✅ [FEATURE_1]
✅ [FEATURE_2]
✅ [FEATURE_3]

[CUSTOMER_TESTIMONIAL_OR_RESULT]

Ready to [DESIRED_ACTION]?

[CALL_TO_ACTION_BUTTON]

Questions? Just hit reply - I read every email personally.

[YOUR_NAME]

P.S. [URGENCY_OR_BONUS_MENTION]`,
      platforms: ['email']
    }
  ],
  ARTICLE: [
    {
      id: 'opinion',
      name: 'Opinion Piece',
      description: 'Share your perspective on industry topics',
      template: `# [CONTROVERSIAL_OR_THOUGHT_PROVOKING_TITLE]

## The Current State
[DESCRIBE_THE_SITUATION_OR_PROBLEM]

## Why This Matters
[EXPLAIN_THE_IMPORTANCE]

## My Perspective
[SHARE_YOUR_UNIQUE_VIEWPOINT]

## The Evidence
[SUPPORTING_DATA_OR_EXAMPLES]

## What This Means for [AUDIENCE]
[PRACTICAL_IMPLICATIONS]

## Moving Forward
[RECOMMENDATIONS_OR_PREDICTIONS]

---

*What's your take on this? I'd love to hear your perspective in the comments below.*`,
      platforms: ['blog', 'linkedin']
    }
  ]
};

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video' | 'document';
  id: string;
}

export default function NewContentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(contentTypes[0]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'SOCIAL' as const,
    scheduledAt: ''
  });
  const { selectedTemplate, selectTemplate, clearSelection } = useTemplateSelection('content-creation');
  const [publishNow, setPublishNow] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showPlatformOptimization, setShowPlatformOptimization] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    const words = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setEstimatedReadTime(Math.ceil(words / 200)); // Average reading speed
  }, [formData.content]);

  const handleTypeChange = (value: string) => {
    const type = contentTypes.find(t => t.value === value);
    if (type) {
      setSelectedType(type);
      setFormData(prev => ({ ...prev, type: value as any }));
      
      // Clear template selection when type changes if it doesn't match
      if (selectedTemplate && selectedTemplate.type !== value.toLowerCase()) {
        clearSelection();
      }
      
      // Auto-select relevant platforms based on content type
      if (value === 'SOCIAL') {
        setSelectedPlatforms(['twitter', 'linkedin', 'instagram', 'tiktok']);
        setShowPlatformOptimization(true);
      } else if (value === 'EMAIL') {
        setSelectedPlatforms(['email']);
        setShowPlatformOptimization(true);
      } else {
        setSelectedPlatforms([]);
        setShowPlatformOptimization(false);
      }
      
      // Show templates for all content types
      setShowTemplates(true);
      clearSelection();
    }
  };

  const getAvailableTemplates = () => {
    return contentTemplates[selectedType.value as keyof typeof contentTemplates] || [];
  };

  const applyTemplate = (template: any) => {
    selectTemplate(template);
    setFormData(prev => ({
      ...prev,
      content: template.template
    }));
    
    // Show suggested platforms for this template
    if (template.platforms.length > 0 && selectedType.value === 'SOCIAL') {
      const suggestedPlatforms = template.platforms.filter((p: string) => 
        platforms.find(platform => platform.id === p)
      );
      setSelectedPlatforms(suggestedPlatforms);
    }
    
    toast({
      title: 'Template Applied!',
      description: `${template.name} template loaded. Customize the placeholders to make it yours.`,
    });
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const getCharacterLimits = () => {
    if (selectedPlatforms.length === 0) return null;
    
    const limits = selectedPlatforms.map(id => {
      const platform = platforms.find(p => p.id === id);
      return { name: platform?.name, limit: platform?.charLimit };
    }).filter(Boolean);

    return limits;
  };

  const getMostRestrictiveLimit = () => {
    const limits = getCharacterLimits();
    if (!limits || limits.length === 0) return null;
    
    return Math.min(...limits.map(l => l.limit || Infinity));
  };

  const getHashtagSuggestions = () => {
    if (selectedPlatforms.length === 0) return null;
    
    const maxHashtags = Math.max(...selectedPlatforms.map(id => {
      const platform = platforms.find(p => p.id === id);
      return platform?.hashtagLimit || 0;
    }));

    return maxHashtags;
  };

  const isContentOptimized = () => {
    const limit = getMostRestrictiveLimit();
    if (!limit) return true;
    
    return formData.content.length <= limit;
  };

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const validateFile = (file: File): string | null => {
    // Size limit: 10MB for images, 100MB for videos, 5MB for documents
    const maxSize = file.type.startsWith('image/') ? 10 * 1024 * 1024 :
                   file.type.startsWith('video/') ? 100 * 1024 * 1024 : 
                   5 * 1024 * 1024;
    
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      return `File size must be less than ${sizeMB}MB`;
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf', 'text/plain', 'application/msword'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported';
    }

    return null;
  };

  const processFiles = (files: File[]) => {
    const newMediaFiles: MediaFile[] = [];
    
    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        toast({
          title: 'Upload Error',
          description: `${file.name}: ${error}`,
          variant: 'destructive'
        });
        return;
      }

      const id = Math.random().toString(36).substring(7);
      const type = getFileType(file);
      
      // Create preview URL
      const preview = type === 'image' || type === 'video' 
        ? URL.createObjectURL(file) 
        : '';

      newMediaFiles.push({ file, preview, type, id });
    });

    setMediaFiles(prev => [...prev, ...newMediaFiles]);
    
    if (newMediaFiles.length > 0) {
      toast({
        title: 'Files Uploaded',
        description: `${newMediaFiles.length} file(s) added successfully`,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    // Reset input value to allow uploading same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      mediaFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🚀 Creating content:', formData);

      const response = await fetch('/api/simple-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to create content');
      }

      const result = await response.json();
      console.log('✅ Content created:', result);

      toast({
        title: 'Success!',
        description: 'Content created successfully',
      });

      // Navigate back to content dashboard
      router.push('/content');

    } catch (error) {
      console.error('❌ Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create content',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getOptimalPostingTime = () => {
    const now = new Date();
    const optimal = new Date();
    
    // Set to next optimal time based on content type
    switch (selectedType.value) {
      case 'SOCIAL':
        optimal.setHours(10, 30, 0, 0); // 10:30 AM - peak social engagement
        if (optimal < now) optimal.setDate(optimal.getDate() + 1);
        break;
      case 'EMAIL':
        optimal.setHours(9, 0, 0, 0); // 9:00 AM - email open rates peak
        if (optimal < now) optimal.setDate(optimal.getDate() + 1);
        break;
      case 'BLOG':
        optimal.setHours(14, 0, 0, 0); // 2:00 PM - blog reading peak
        if (optimal < now) optimal.setDate(optimal.getDate() + 1);
        break;
      default:
        optimal.setHours(11, 0, 0, 0);
        if (optimal < now) optimal.setDate(optimal.getDate() + 1);
    }
    
    return optimal.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/content')}
            className="mb-4 hover:bg-white/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Content Library
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Amazing Content
            </h1>
            <p className="text-muted-foreground mt-2">
              Choose your content type and craft something that resonates with your audience
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content Creation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Type Selection */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  What are you creating today?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contentTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType.value === type.value;
                    return (
                      <Card
                        key={type.value}
                        className={`cursor-pointer transition-all duration-200 border-2 ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-50 shadow-md' 
                            : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                        }`}
                        onClick={() => handleTypeChange(type.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${type.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{type.label}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Platform Selection */}
            {showPlatformOptimization && (
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    Target Platforms
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select platforms to optimize your content for better engagement
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {platforms.filter(platform => 
                      selectedType.value === 'SOCIAL' ? platform.id !== 'email' :
                      selectedType.value === 'EMAIL' ? platform.id === 'email' :
                      true
                    ).map((platform) => {
                      const Icon = platform.icon;
                      const isSelected = selectedPlatforms.includes(platform.id);
                      return (
                        <Card
                          key={platform.id}
                          className={`cursor-pointer transition-all duration-200 border-2 ${
                            isSelected 
                              ? 'border-green-500 bg-green-50 shadow-md' 
                              : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
                          }`}
                          onClick={() => togglePlatform(platform.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded ${platform.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{platform.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {platform.charLimit > 1000 ? 
                                    `${Math.round(platform.charLimit/1000)}k chars` : 
                                    `${platform.charLimit} chars`
                                  }
                                </p>
                              </div>
                              {isSelected && (
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {selectedPlatforms.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Selected:</strong> {selectedPlatforms.map(id => 
                          platforms.find(p => p.id === id)?.name
                        ).join(', ')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI-Powered Template Integration */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  AI Template Assistant
                  <Badge variant="outline" className="ml-auto bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Premium Feature
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Start with AI-optimized templates or create from scratch. Get content that performs 10x better.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Template Picker Button */}
                  <TemplateQuickPicker
                    context="content-creation"
                    onSelect={(template) => {
                      selectTemplate(template);
                      // Pre-fill form with template content
                      const templateData = typeof template.content === 'string' 
                        ? JSON.parse(template.content) 
                        : template.content || {};
                      
                      setFormData(prev => ({
                        ...prev,
                        title: templateData.subject_line || template.name,
                        content: templateData.body || templateData.content || '',
                      }));
                      
                      // Update content type to match template
                      const matchingType = contentTypes.find(t => 
                        t.value.toLowerCase() === template.type.toLowerCase()
                      );
                      if (matchingType) {
                        setSelectedType(matchingType);
                        handleTypeChange(matchingType.value);
                      }
                      
                      toast({
                        title: "Template Applied! 🎉",
                        description: `"${template.name}" is ready for customization`,
                      });
                    }}
                    filters={{
                      type: selectedType.value.toLowerCase() as 'email' | 'social' | 'blog'
                    }}
                    showAIRecommendations={true}
                    trigger={
                      <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Choose AI Template
                      </Button>
                    }
                  />
                  
                  {/* AI Generate Button */}
                  <Button 
                    variant="outline" 
                    className="flex-1 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all"
                    onClick={() => {
                      // TODO: Implement AI generation dialog
                      toast({
                        title: "AI Generation Coming Soon! 🤖",
                        description: "Create templates from prompts with GPT-4",
                      });
                    }}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Generate with AI
                  </Button>
                </div>
                
                {/* Show selected template info */}
                {selectedTemplate && (
                  <div className="mt-4 p-4 bg-white/80 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-900">Template Applied</span>
                        <Badge variant="outline" className="text-xs">{selectedTemplate.type}</Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          clearSelection();
                          setFormData(prev => ({ ...prev, title: '', content: '' }));
                          toast({
                            title: "Template Cleared",
                            description: "Starting fresh with empty content",
                          });
                        }}
                        className="h-6 px-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-blue-700">
                      <strong>{selectedTemplate.name}</strong> • {selectedTemplate.description}
                    </p>
                    {selectedTemplate.performanceScore && (
                      <p className="text-xs text-green-600 mt-1">
                        ⚡ {Math.round(selectedTemplate.performanceScore * 100)}% performance score
                      </p>
                    )}
                  </div>
                )}
                
                {/* Template benefits */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span>Higher engagement</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span>10x faster creation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-purple-500" />
                    <span>Proven formats</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Legacy Templates Section - Keep for compatibility */}
            {showTemplates && getAvailableTemplates().length > 0 && (
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Quick Templates
                    <Badge variant="outline" className="ml-auto">Basic</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Choose a basic template to kickstart your {selectedType.label.toLowerCase()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {getAvailableTemplates().map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all duration-200 border-2 ${
                          selectedTemplate?.id === template.id
                            ? 'border-yellow-500 bg-yellow-50 shadow-md'
                            : 'border-gray-200 hover:border-yellow-300 hover:shadow-sm'
                        }`}
                        onClick={() => applyTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-sm">{template.name}</h3>
                              {selectedTemplate?.id === template.id && (
                                <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {template.description}
                            </p>
                            
                            {/* Platform Compatibility */}
                            {template.platforms && template.platforms.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {template.platforms.slice(0, 3).map((platformId: string) => {
                                  const platform = platforms.find(p => p.id === platformId);
                                  if (!platform) return null;
                                  const Icon = platform.icon;
                                  return (
                                    <div key={platformId} className="flex items-center gap-1 bg-gray-100 rounded px-1.5 py-0.5">
                                      <Icon className="h-3 w-3" />
                                      <span className="text-xs">{platform.name.split('/')[0]}</span>
                                    </div>
                                  );
                                })}
                                {template.platforms.length > 3 && (
                                  <span className="text-xs text-muted-foreground">+{template.platforms.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {selectedTemplate && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Template Applied: {selectedTemplate.name}</p>
                          <p className="text-xs mt-1">
                            Replace the placeholders in [BRACKETS] with your own content. 
                            The template structure is optimized for engagement!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Main Form */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <selectedType.icon className="h-5 w-5" />
                  {selectedType.label}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={selectedType.color}>
                    {selectedType.label}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lightbulb className="h-3 w-3" />
                    <span>{selectedType.tips}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={`Enter your ${selectedType.label.toLowerCase()} title...`}
                      className="mt-2 border-gray-300 focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-sm font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Content
                      <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                        {wordCount > 0 && (
                          <>
                            <span>{wordCount} words</span>
                            {estimatedReadTime > 0 && <span>• {estimatedReadTime} min read</span>}
                          </>
                        )}
                      </div>
                    </Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder={`Write your ${selectedType.label.toLowerCase()} content here...`}
                      className={`mt-2 min-h-40 border-gray-300 focus:border-purple-500 ${
                        selectedPlatforms.length > 0 && !isContentOptimized() 
                          ? 'border-orange-400 focus:border-orange-500' 
                          : ''
                      }`}
                      required
                    />
                    
                    {/* Platform Optimization Feedback */}
                    {selectedPlatforms.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {/* Character Limits */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {getCharacterLimits()?.map(({ name, limit }) => {
                            const remaining = limit - formData.content.length;
                            const isOver = remaining < 0;
                            return (
                              <div 
                                key={name}
                                className={`px-2 py-1 rounded-full text-xs ${
                                  isOver 
                                    ? 'bg-red-100 text-red-700' 
                                    : remaining < 50 
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {name}: {remaining > 0 ? `${remaining} left` : `${Math.abs(remaining)} over`}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Hashtag Suggestions */}
                        {getHashtagSuggestions() && getHashtagSuggestions() > 0 && (
                          <div className="text-xs text-muted-foreground">
                            💡 You can use up to {getHashtagSuggestions()} hashtags for selected platforms
                          </div>
                        )}
                        
                        {/* Optimization Status */}
                        {!isContentOptimized() && (
                          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded text-xs text-orange-700">
                            <MessageSquare className="h-4 w-4" />
                            <span>Content exceeds character limit for some platforms. Consider shortening.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Media Upload */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Media Upload
                      <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
                    </Label>
                    
                    {/* Upload Area */}
                    <div
                      className={`
                        border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
                        ${isDragOver 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                        }
                      `}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drag and drop your files here, or{' '}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                          browse files
                        </button>
                      </p>
                      <p className="text-xs text-gray-500">
                        Images (10MB), Videos (100MB), Documents (5MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {/* Media Preview */}
                    {mediaFiles.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">
                          Uploaded Files ({mediaFiles.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {mediaFiles.map((media) => (
                            <Card key={media.id} className="border border-gray-200">
                              <CardContent className="p-3">
                                <div className="flex items-start gap-3">
                                  {/* Media Preview */}
                                  <div className="flex-shrink-0">
                                    {media.type === 'image' && (
                                      <div className="relative">
                                        <img
                                          src={media.preview}
                                          alt={media.file.name}
                                          className="w-12 h-12 object-cover rounded-lg border"
                                        />
                                        <div className="absolute -top-1 -right-1">
                                          <Image className="h-4 w-4 text-green-600 bg-white rounded-full p-0.5" />
                                        </div>
                                      </div>
                                    )}
                                    {media.type === 'video' && (
                                      <div className="relative">
                                        <video
                                          src={media.preview}
                                          className="w-12 h-12 object-cover rounded-lg border"
                                        />
                                        <div className="absolute -top-1 -right-1">
                                          <Video className="h-4 w-4 text-blue-600 bg-white rounded-full p-0.5" />
                                        </div>
                                      </div>
                                    )}
                                    {media.type === 'document' && (
                                      <div className="w-12 h-12 bg-gray-100 rounded-lg border flex items-center justify-center relative">
                                        <FileText className="h-6 w-6 text-gray-600" />
                                        <div className="absolute -top-1 -right-1">
                                          <FileText className="h-4 w-4 text-orange-600 bg-white rounded-full p-0.5" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* File Info */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {media.file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatFileSize(media.file.size)}
                                    </p>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {media.type}
                                    </Badge>
                                  </div>
                                  
                                  {/* Remove Button */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMediaFile(media.id)}
                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Publishing Options */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <Label htmlFor="publish-now" className="text-sm font-medium flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Publishing Options
                        </Label>
                        <Switch
                          id="publish-now"
                          checked={publishNow}
                          onCheckedChange={setPublishNow}
                        />
                      </div>
                      
                      {publishNow ? (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                          <Send className="h-4 w-4" />
                          <span>Will be created as draft and visible immediately</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setFormData(prev => ({ ...prev, scheduledAt: getOptimalPostingTime() }))}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Use Optimal Time
                            </Button>
                          </div>
                          <div>
                            <Label htmlFor="scheduled-date" className="text-sm">Schedule for later</Label>
                            <Input
                              id="scheduled-date"
                              type="datetime-local"
                              value={formData.scheduledAt}
                              onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                              className="mt-1"
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Create {selectedType.label}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform-Specific Tips */}
            {selectedPlatforms.length > 0 ? (
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-500" />
                    Platform Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {selectedPlatforms.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    if (!platform) return null;
                    
                    const Icon = platform.icon;
                    return (
                      <div key={platformId} className="border-l-4 border-green-400 pl-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-4 w-4" />
                          <h4 className="font-medium">{platform.name}</h4>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {platform.bestPractices.map((tip, index) => (
                            <p key={index}>• {tip}</p>
                          ))}
                          <p className="text-blue-600">
                            • Media: {platform.mediaSpecs.image}
                            {platform.mediaSpecs.video && ` | Video: ${platform.mediaSpecs.video}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ) : (
              /* General Content Tips */
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Tips for {selectedType.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">{selectedType.tips}</p>
                  
                  {selectedType.value === 'SOCIAL' && (
                    <div className="space-y-2">
                      <p>• Use 1-3 hashtags for better reach</p>
                      <p>• Ask questions to boost engagement</p>
                      <p>• Post when your audience is most active</p>
                      <p>• Add eye-catching visuals for 2x more engagement</p>
                    </div>
                  )}
                  
                  {selectedType.value === 'BLOG' && (
                    <div className="space-y-2">
                      <p>• Include a compelling introduction</p>
                      <p>• Use subheadings for better readability</p>
                      <p>• Add a clear call-to-action</p>
                      <p>• Include relevant images to break up text</p>
                    </div>
                  )}
                  
                  {selectedType.value === 'EMAIL' && (
                    <div className="space-y-2">
                      <p>• Keep subject lines under 50 characters</p>
                      <p>• Personalize when possible</p>
                      <p>• Include social media links</p>
                      <p>• Add images to increase click-through rates</p>
                    </div>
                  )}
                  
                  {selectedType.value === 'ARTICLE' && (
                    <div className="space-y-2">
                      <p>• Start with a strong hook</p>
                      <p>• Support claims with data</p>
                      <p>• End with key takeaways</p>
                      <p>• Use charts and diagrams for complex data</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Template Help */}
            {selectedTemplate && (
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Template Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="font-medium text-yellow-800 mb-2">Using: {selectedTemplate.name}</p>
                    <p className="text-yellow-700 text-xs">{selectedTemplate.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">How to customize:</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>• Look for text in [BRACKETS] - these are placeholders</p>
                      <p>• Replace placeholders with your specific content</p>
                      <p>• Keep the overall structure for best results</p>
                      <p>• Adjust emojis to match your brand voice</p>
                    </div>
                  </div>

                  {selectedType.value === 'SOCIAL' && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Engagement tips:</h4>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>• Ask questions to boost comments</p>
                        <p>• Use relevant hashtags for discovery</p>
                        <p>• Post at optimal times for your audience</p>
                        <p>• Include a clear call-to-action</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-2 rounded text-xs text-blue-700">
                    <strong>Pro tip:</strong> This template works great with the selected platforms: {selectedTemplate.platforms?.map((p: string) => 
                      platforms.find(platform => platform.id === p)?.name
                    ).filter(Boolean).join(', ')}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Media Upload Tips */}
            {mediaFiles.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Image className="h-5 w-5 text-green-500" />
                    Media Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <p>• <strong>Images:</strong> Use high-resolution (1080x1080px for social)</p>
                    <p>• <strong>Videos:</strong> Keep under 60 seconds for social media</p>
                    <p>• <strong>File formats:</strong> JPG, PNG, MP4, WebM recommended</p>
                    <p>• <strong>Accessibility:</strong> Add alt text for screen readers</p>
                  </div>
                  
                  <div className="bg-blue-50 p-2 rounded text-xs text-blue-700">
                    <strong>Pro tip:</strong> Visual content gets 94% more views than text-only posts!
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Publishing Stats */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Expected Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Optimal posting time:</span>
                  <span className="font-medium">
                    {selectedType.value === 'SOCIAL' && '10:30 AM'}
                    {selectedType.value === 'EMAIL' && '9:00 AM'}
                    {selectedType.value === 'BLOG' && '2:00 PM'}
                    {selectedType.value === 'ARTICLE' && '11:00 AM'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected reach:</span>
                  <span className="font-medium">2.1K - 4.3K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Engagement rate:</span>
                  <span className="font-medium">3.5% - 6.2%</span>
                </div>
              </CardContent>
            </Card>

            {/* What Happens Next */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  What Happens Next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                  <p>Content saved to your library</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                  <p>Automatic calendar event created</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2" />
                  <p>Available for editing anytime</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                  <p>Analytics tracking enabled</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}