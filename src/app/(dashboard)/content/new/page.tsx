"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Clock, Calendar, Sparkles, Send, Globe, Hash, Tag, Users, TrendingUp, Eye, Lightbulb } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function NewContentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(contentTypes[0]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'SOCIAL' as const,
    scheduledAt: ''
  });
  const [publishNow, setPublishNow] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

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
    }
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
                      className="mt-2 min-h-40 border-gray-300 focus:border-purple-500"
                      required
                    />
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
            {/* Content Tips */}
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
                  </div>
                )}
                
                {selectedType.value === 'BLOG' && (
                  <div className="space-y-2">
                    <p>• Include a compelling introduction</p>
                    <p>• Use subheadings for better readability</p>
                    <p>• Add a clear call-to-action</p>
                  </div>
                )}
                
                {selectedType.value === 'EMAIL' && (
                  <div className="space-y-2">
                    <p>• Keep subject lines under 50 characters</p>
                    <p>• Personalize when possible</p>
                    <p>• Include social media links</p>
                  </div>
                )}
                
                {selectedType.value === 'ARTICLE' && (
                  <div className="space-y-2">
                    <p>• Start with a strong hook</p>
                    <p>• Support claims with data</p>
                    <p>• End with key takeaways</p>
                  </div>
                )}
              </CardContent>
            </Card>

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