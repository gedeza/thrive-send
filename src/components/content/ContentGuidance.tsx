import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Info, AlertCircle, CheckCircle, Image, File, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Content type validation rules
const contentTypeRules = {
  BLOG: {
    minLength: 500,
    maxLength: 5000,
    requiredFields: ['title', 'description'],
    mediaRequirements: {
      minImages: 1,
      maxImages: 10,
      supportedFormats: ['image/jpeg', 'image/png', 'image/gif']
    },
    bestPractices: [
      'Use descriptive headings and subheadings',
      'Include at least one high-quality image',
      'Break text into short paragraphs',
      'Include a strong call-to-action',
      'Optimize for SEO with relevant keywords'
    ]
  },
  SOCIAL: {
    minLength: 10,
    maxLength: 280,
    requiredFields: ['title', 'description', 'platforms'],
    mediaRequirements: {
      minImages: 0,
      maxImages: 4,
      supportedFormats: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
    },
    bestPractices: [
      'Keep messages concise and engaging',
      'Use relevant hashtags (max 3-5)',
      'Include a compelling image or video',
      'Ask questions to encourage engagement',
      'Add a clear call-to-action'
    ]
  },
  EMAIL: {
    minLength: 100,
    maxLength: 2000,
    requiredFields: ['title', 'description', 'content'],
    mediaRequirements: {
      minImages: 0,
      maxImages: 5,
      supportedFormats: ['image/jpeg', 'image/png']
    },
    bestPractices: [
      'Write a compelling subject line',
      'Keep paragraphs short and scannable',
      'Use a clear call-to-action button',
      'Personalize when possible',
      'Test on mobile devices'
    ]
  },
  ARTICLE: {
    minLength: 50,
    maxLength: 1000,
    requiredFields: ['title', 'description'],
    mediaRequirements: {
      minImages: 0,
      maxImages: 3,
      supportedFormats: ['image/jpeg', 'image/png']
    },
    bestPractices: [
      'Start with a strong hook',
      'Include quotes or statistics',
      'Use subheadings to break up text',
      'Incorporate relevant images',
      'End with a memorable conclusion'
    ]
  }
} as const;

interface ContentGuidanceProps {
  contentType: string;
  currentLength?: number;
  className?: string;
  expanded?: boolean;
}

export function ContentGuidance({ 
  contentType, 
  currentLength = 0, 
  className,
  expanded = false
}: ContentGuidanceProps) {
  const type = contentType.toUpperCase() as keyof typeof contentTypeRules;
  const rules = contentTypeRules[type];
  
  if (!rules) return null;
  
  // Calculate progress percentage
  const progress = Math.min(Math.round((currentLength / rules.maxLength) * 100), 100);
  const isUnderMinimum = currentLength < rules.minLength;
  const isOverMaximum = currentLength > rules.maxLength;
  
  const progressColor = 
    isOverMaximum ? 'bg-destructive' : 
    isUnderMinimum ? 'bg-amber-500' : 
    'bg-primary';
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Info className="h-4 w-4" />
          Content Guidelines for {contentType}
        </CardTitle>
        <CardDescription>
          Follow these guidelines to create effective {contentType.toLowerCase()} content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Character count section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Character count
            </span>
            <span className={cn(
              isOverMaximum ? 'text-destructive font-medium' : 
              isUnderMinimum ? 'text-amber-500' : 
              'text-muted-foreground'
            )}>
              {currentLength} / {rules.maxLength}
            </span>
          </div>
          <Progress value={progress} className={cn("h-2", progressColor)} />
          <p className="text-xs text-muted-foreground">
            {isUnderMinimum && `Minimum ${rules.minLength} characters required`}
            {!isUnderMinimum && isOverMaximum && `Maximum ${rules.maxLength} characters exceeded`}
            {!isUnderMinimum && !isOverMaximum && `Target: ${rules.minLength}-${rules.maxLength} characters`}
          </p>
        </div>
        
        {/* Media requirements */}
        <div className="space-y-1">
          <span className="text-sm flex items-center gap-1">
            <Image className="h-3 w-3" />
            Media requirements
          </span>
          <ul className="text-xs text-muted-foreground space-y-1">
            {rules.mediaRequirements.minImages > 0 ? (
              <li className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-amber-500" /> 
                Required: {rules.mediaRequirements.minImages} image(s)
              </li>
            ) : (
              <li className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-muted-foreground" /> 
                Images optional
              </li>
            )}
            <li className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-muted-foreground" /> 
              Maximum {rules.mediaRequirements.maxImages} media files
            </li>
            <li className="flex items-center gap-1">
              <File className="h-3 w-3 text-muted-foreground" /> 
              Supported: {rules.mediaRequirements.supportedFormats.join(', ')}
            </li>
          </ul>
        </div>
        
        {/* Best practices */}
        {expanded && (
          <div className="space-y-1">
            <span className="text-sm">Best practices</span>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              {rules.bestPractices.map((practice, i) => (
                <li key={i}>{practice}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      {!expanded && (
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">
            {type === 'SOCIAL' ? 'Social media character limits vary by platform' : ''}
            {type === 'BLOG' ? 'Longer blogs perform better for SEO' : ''}
            {type === 'EMAIL' ? 'Shorter emails typically have higher engagement' : ''}
            {type === 'ARTICLE' ? 'Focus on quality over quantity' : ''}
          </p>
        </CardFooter>
      )}
    </Card>
  );
} 