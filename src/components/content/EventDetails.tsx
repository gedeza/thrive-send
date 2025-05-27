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
import { formatInTimeZone } from 'date-fns-tz';
import { useTimezone } from '@/hooks/use-timezone';
import { Facebook, Twitter, Instagram, Linkedin, Edit, Trash2 } from 'lucide-react';

interface EventDetailsProps {
  event: CalendarEvent;
  onEdit?: () => void;
  onDelete?: () => void;
  onRefreshAnalytics?: () => Promise<void>;
}

const platformIcons: Record<SocialPlatform, React.ReactNode> = {
  FACEBOOK: <Facebook className="h-4 w-4" />,
  TWITTER: <Twitter className="h-4 w-4" />,
  INSTAGRAM: <Instagram className="h-4 w-4" />,
  LINKEDIN: <Linkedin className="h-4 w-4" />
};

const statusColors = {
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  sent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const platformColors = {
  FACEBOOK: 'bg-[#1877F2]',
  TWITTER: 'bg-[#1DA1F2]',
  INSTAGRAM: 'bg-[#E4405F]',
  LINKEDIN: 'bg-[#0A66C2]'
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
  const userTimezone = useTimezone();

  const formattedDate = useMemo(() => 
    event.scheduledDate ? format(new Date(event.scheduledDate), 'MMMM d, yyyy') : 'Not scheduled',
    [event.scheduledDate]
  );

  const formattedTime = useMemo(() => 
    event.scheduledDate ? format(new Date(event.scheduledDate), 'h:mm a') : null,
    [event.scheduledDate]
  );

  const formatDate = (date: Date, format: string) => {
    return formatInTimeZone(date, userTimezone, format);
  };

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

  const renderSocialPreview = (platform: string) => {
    const content = event.socialMediaContent.platformSpecificContent[platform as keyof typeof event.socialMediaContent.platformSpecificContent];
    if (!content) return null;

    return (
      <Card className="overflow-hidden">
        <div className={cn("h-2", platformColors[platform as keyof typeof platformColors])} />
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn("p-2 rounded-full", platformColors[platform as keyof typeof platformColors])}>
              {platformIcons[platform as keyof typeof platformIcons]}
            </div>
            <div>
              <div className="font-medium">Your Organization</div>
              <div className="text-xs text-muted-foreground">Just now</div>
            </div>
          </div>
          <div className="text-sm whitespace-pre-wrap mb-3">{content.text}</div>
          {content.mediaUrls && content.mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {content.mediaUrls.map((url, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img src={url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>❤️</span>
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💬</span>
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔄</span>
              <span>0</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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