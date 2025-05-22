import { CalendarEvent, SocialPlatform } from '@/components/content/content-calendar';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, Image, Link, Share2, ThumbsUp, X, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, BarChart2, Eye, MessageSquare, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface EventDetailsProps {
  event: CalendarEvent;
  onEdit?: () => void;
  onDelete?: () => void;
  onRefreshAnalytics?: () => Promise<void>;
}

const platformIcons: Record<SocialPlatform, React.ReactNode> = {
  FACEBOOK: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  TWITTER: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>,
  INSTAGRAM: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>,
  LINKEDIN: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
};

const statusColors = {
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  sent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const platformColors = {
  FACEBOOK: 'bg-blue-50 border-blue-200',
  TWITTER: 'bg-sky-50 border-sky-200',
  INSTAGRAM: 'bg-pink-50 border-pink-200',
  LINKEDIN: 'bg-blue-50 border-blue-200'
};

const platformMaxChars = {
  FACEBOOK: 63206,
  TWITTER: 280,
  INSTAGRAM: 2200,
  LINKEDIN: 3000
};

const contentTypeIcons: Record<string, React.ReactNode> = {
  article: <FileText className="h-4 w-4" />,
  blog: <FileText className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />
};

const contentTypeColors = {
  article: 'bg-purple-50 border-purple-200',
  blog: 'bg-blue-50 border-blue-200',
  social: 'bg-green-50 border-green-200',
  email: 'bg-orange-50 border-orange-200'
};

const SocialMediaPreview = ({ platform, content }: { platform: SocialPlatform; content: any }) => {
  const previewStyle = platformColors[platform];
  
  return (
    <div className={cn("rounded-lg border p-4", previewStyle)}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-muted-foreground" aria-hidden="true">
          {platformIcons[platform]}
        </span>
        <span className="font-medium">{platform}</span>
      </div>
      
      {content?.text && (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {content.text}
          </ReactMarkdown>
        </div>
      )}
      
      {content?.mediaUrls && content.mediaUrls.length > 0 && (
        <div className={cn(
          "mt-3 grid gap-2",
          content.mediaUrls.length === 1 ? "grid-cols-1" :
          content.mediaUrls.length === 2 ? "grid-cols-2" :
          content.mediaUrls.length === 3 ? "grid-cols-3" :
          "grid-cols-2"
        )}>
          {content.mediaUrls.map((url: string, index: number) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={url}
                alt={`Media ${index + 1} for ${platform}`}
                className="rounded-md object-cover w-full h-full"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.png';
                }}
              />
            </div>
          ))}
        </div>
      )}
      
      {content?.text && (
        <div className="mt-2 text-xs text-muted-foreground">
          {content.text.length} / {platformMaxChars[platform]} characters
        </div>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-64" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export function EventDetails({ event, onEdit, onDelete, onRefreshAnalytics }: EventDetailsProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const formattedDate = useMemo(() => 
    event.scheduledDate ? format(new Date(event.scheduledDate), 'MMMM d, yyyy') : 'Not scheduled',
    [event.scheduledDate]
  );

  const formattedTime = useMemo(() => 
    event.scheduledDate ? format(new Date(event.scheduledDate), 'h:mm a') : null,
    [event.scheduledDate]
  );

  const handleRefreshAnalytics = useCallback(async () => {
    if (!onRefreshAnalytics) return;
    
    setIsRefreshing(true);
    try {
      await onRefreshAnalytics();
      toast({
        title: "Analytics refreshed",
        description: "The latest analytics data has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error refreshing analytics",
        description: error instanceof Error ? error.message : "Failed to refresh analytics",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefreshAnalytics, toast]);

  const totalEngagement = useMemo(() => 
    (event.analytics?.engagement?.likes ?? 0) +
    (event.analytics?.engagement?.shares ?? 0) +
    (event.analytics?.engagement?.comments ?? 0),
    [event.analytics?.engagement]
  );

  if (!event) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6" role="region" aria-label="Event Details">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{event.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={cn("capitalize", statusColors[event.status])}>
              {event.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formattedDate}
              {formattedTime && ` at ${formattedTime}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRefreshAnalytics && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefreshAnalytics}
                    disabled={isRefreshing}
                    aria-label="Refresh analytics"
                  >
                    {isRefreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh analytics data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {onEdit && (
            <Button variant="outline" onClick={onEdit} aria-label="Edit event">
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="destructive" 
              onClick={onDelete}
              aria-label="Delete event"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
        aria-label="Event content tabs"
      >
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {event.description}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {event.type === "social" && event.socialMediaContent ? (
            <Card>
              <CardHeader>
                <CardTitle>Social Media Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {event.socialMediaContent.platforms.map((platform) => {
                    const content = event.socialMediaContent?.platformSpecificContent?.[platform];
                    return (
                      <div key={platform} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground" aria-hidden="true">
                            {platformIcons[platform]}
                          </span>
                          <span className="font-medium">{platform}</span>
                        </div>
                        {content?.text && (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                            >
                              {content.text}
                            </ReactMarkdown>
                          </div>
                        )}
                        {content?.mediaUrls && content.mediaUrls.length > 0 && (
                          <div className={cn(
                            "grid gap-2",
                            content.mediaUrls.length === 1 ? "grid-cols-1" :
                            content.mediaUrls.length === 2 ? "grid-cols-2" :
                            content.mediaUrls.length === 3 ? "grid-cols-3" :
                            "grid-cols-2"
                          )}>
                            {content.mediaUrls.map((url: string, index: number) => (
                              <div key={index} className="relative aspect-square group">
                                <img
                                  src={url}
                                  alt={`Media ${index + 1} for ${platform}`}
                                  className="rounded-md object-cover w-full h-full"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-image.png';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        {content?.text && (
                          <div className="text-xs text-muted-foreground">
                            {content.text.length} / {platformMaxChars[platform]} characters
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground" aria-hidden="true">
                    {contentTypeIcons[event.type] || <FileText className="h-4 w-4" />}
                  </span>
                  <CardTitle>{event.type.charAt(0).toUpperCase() + event.type.slice(1)} Content</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className={cn("rounded-lg border p-4", contentTypeColors[event.type] || 'bg-gray-50 border-gray-200')}>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {event.content}
                    </ReactMarkdown>
                  </div>
                  {event.mediaUrls && event.mediaUrls.length > 0 && (
                    <div className={cn(
                      "mt-4 grid gap-2",
                      event.mediaUrls.length === 1 ? "grid-cols-1" :
                      event.mediaUrls.length === 2 ? "grid-cols-2" :
                      event.mediaUrls.length === 3 ? "grid-cols-3" :
                      "grid-cols-2"
                    )}>
                      {event.mediaUrls.map((url: string, index: number) => (
                        <div key={index} className="relative aspect-square group">
                          <img
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="rounded-md object-cover w-full h-full"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {event.type === "social" && event.socialMediaContent ? (
            <div className="space-y-6">
              {/* If no platforms are selected, show a message and a Back to Edit button */}
              {event.socialMediaContent.platforms.length === 0 && (
                <div className="space-y-4">
                  <div className="font-semibold text-lg">Social Media Content</div>
                  <div className="mb-2 text-destructive">
                    No platforms selected. Please go back to the previous step and select at least one social media platform.
                  </div>
                  {onEdit && (
                    <Button variant="outline" onClick={onEdit}>
                      Back to Edit
                    </Button>
                  )}
                </div>
              )}
              {/* Existing preview rendering for selected platforms */}
              {event.socialMediaContent.platforms.length > 0 &&
                event.socialMediaContent.platforms.map((platform) => {
                  const content = event.socialMediaContent?.platformSpecificContent?.[platform];
                  const preview = event.preview?.platformPreviews?.[platform];
                  return (
                    <Card key={platform}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground" aria-hidden="true">
                              {platformIcons[platform]}
                            </span>
                            <CardTitle>{platform} Preview</CardTitle>
                          </div>
                          {preview?.status && (
                            <Badge
                              variant="outline"
                              className={cn(
                                preview.status === 'approved' && "bg-green-100 text-green-800",
                                preview.status === 'rejected' && "bg-red-100 text-red-800",
                                preview.status === 'pending' && "bg-yellow-100 text-yellow-800"
                              )}
                            >
                              {preview.status}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {content ? (
                          <SocialMediaPreview platform={platform} content={content} />
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No content available for {platform}
                          </div>
                        )}
                        {preview?.rejectionReason && (
                          <Alert intent="error" style={{ marginTop: '1rem' }}>
                            <AlertCircle className="h-4 w-4" />
                            <div className="ml-2">
                              <h4 className="font-medium">Rejection Reason</h4>
                              <p className="text-sm text-muted-foreground">{preview.rejectionReason}</p>
                            </div>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground" aria-hidden="true">
                    {contentTypeIcons[event.type] || <FileText className="h-4 w-4" />}
                  </span>
                  <CardTitle>Content Preview</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className={cn("rounded-lg border p-4", contentTypeColors[event.type] || 'bg-gray-50 border-gray-200')}>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {event.content}
                    </ReactMarkdown>
                  </div>
                  {event.mediaUrls && event.mediaUrls.length > 0 && (
                    <div className={cn(
                      "mt-4 grid gap-2",
                      event.mediaUrls.length === 1 ? "grid-cols-1" :
                      event.mediaUrls.length === 2 ? "grid-cols-2" :
                      event.mediaUrls.length === 3 ? "grid-cols-3" :
                      "grid-cols-2"
                    )}>
                      {event.mediaUrls.map((url: string, index: number) => (
                        <div key={index} className="relative aspect-square group">
                          <img
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="rounded-md object-cover w-full h-full"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {event.analytics ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {event.analytics.views?.toLocaleString() ?? 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                  <BarChart2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalEngagement.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" aria-hidden="true" />
                      {event.analytics.engagement?.likes?.toLocaleString() ?? 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" aria-hidden="true" />
                      {event.analytics.engagement?.shares?.toLocaleString() ?? 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" aria-hidden="true" />
                      {event.analytics.engagement?.comments?.toLocaleString() ?? 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {event.analytics.clicks?.toLocaleString() ?? 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {event.analytics.lastUpdated
                      ? format(new Date(event.analytics.lastUpdated), "MMM d, yyyy 'at' h:mm a")
                      : "Never"}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No analytics available for this event
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 