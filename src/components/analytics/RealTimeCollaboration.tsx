'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users,
  MessageCircle,
  Eye,
  MousePointer,
  Share2,
  Bell,
  Settings,
  Plus,
  Send,
  Edit3,
  Pin,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Flag,
  Heart,
  ThumbsUp,
  Reply,
  MoreHorizontal,
  X,
  Maximize2,
  Minimize2,
  Filter,
  Download,
  BookmarkPlus,
  Tag,
  Calendar,
  User,
  MapPin,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

// Collaboration Types
export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
  isOnline: boolean;
  lastSeen: Date;
  cursorPosition?: {
    x: number;
    y: number;
    section: string;
  };
  currentView?: string;
}

export interface Annotation {
  id: string;
  userId: string;
  position: {
    x: number;
    y: number;
    section: string; // which chart/section
  };
  type: 'note' | 'insight' | 'question' | 'action_item';
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isResolved: boolean;
  mentions: string[];
  reactions: Array<{
    userId: string;
    type: 'like' | 'love' | 'insight' | 'question';
  }>;
  replies: AnnotationReply[];
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface AnnotationReply {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  mentions: string[];
}

export interface CollaborationSession {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  participants: string[];
  isActive: boolean;
  settings: {
    allowAnnotations: boolean;
    allowFiltering: boolean;
    allowExport: boolean;
    notifications: boolean;
  };
}

interface RealTimeCollaborationProps {
  className?: string;
  dashboardId: string;
  currentUserId: string;
}

export function RealTimeCollaboration({ 
  className, 
  dashboardId, 
  currentUserId 
}: RealTimeCollaborationProps) {
  // State management
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isCreatingAnnotation, setIsCreatingAnnotation] = useState(false);
  const [newAnnotationPosition, setNewAnnotationPosition] = useState<{x: number, y: number, section: string} | null>(null);
  const [newAnnotation, setNewAnnotation] = useState({
    type: 'note' as const,
    title: '',
    content: '',
    priority: 'medium' as const,
    tags: [] as string[],
    mentions: [] as string[]
  });
  const [collaborationPanel, setCollaborationPanel] = useState<'users' | 'annotations' | 'activity' | 'settings'>('users');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [filterAnnotations, setFilterAnnotations] = useState({
    type: 'all',
    user: 'all',
    resolved: 'all',
    priority: 'all'
  });

  // Mock data generators
  const generateMockUsers = (): CollaborationUser[] => [
    {
      id: 'user-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      avatar: '/avatars/sarah.jpg',
      role: 'admin',
      isOnline: true,
      lastSeen: new Date(),
      cursorPosition: { x: 120, y: 340, section: 'metrics' },
      currentView: 'overview'
    },
    {
      id: 'user-2',
      name: 'Marcus Johnson',
      email: 'marcus.j@company.com',
      role: 'editor',
      isOnline: true,
      lastSeen: new Date(),
      cursorPosition: { x: 450, y: 200, section: 'charts' },
      currentView: 'engagement'
    },
    {
      id: 'user-3',
      name: 'Elena Rodriguez',
      email: 'elena.r@company.com',
      role: 'viewer',
      isOnline: false,
      lastSeen: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      currentView: 'revenue'
    },
    {
      id: 'user-4',
      name: 'David Kim',
      email: 'david.kim@company.com',
      role: 'editor',
      isOnline: true,
      lastSeen: new Date(),
      cursorPosition: { x: 680, y: 180, section: 'filters' },
      currentView: 'audience'
    }
  ];

  const generateMockAnnotations = (): Annotation[] => [
    {
      id: 'ann-1',
      userId: 'user-1',
      position: { x: 200, y: 150, section: 'metrics' },
      type: 'insight',
      title: 'Engagement Spike Analysis',
      content: 'The 34% increase in engagement aligns with our new content strategy rollout. We should maintain this approach and consider scaling.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isResolved: false,
      mentions: ['user-2', 'user-4'],
      reactions: [
        { userId: 'user-2', type: 'insight' },
        { userId: 'user-4', type: 'like' }
      ],
      replies: [
        {
          id: 'reply-1',
          userId: 'user-2',
          content: 'Great observation! Should we create a case study on this success?',
          createdAt: new Date(Date.now() - 90 * 60 * 1000),
          mentions: []
        }
      ],
      priority: 'high',
      tags: ['strategy', 'content', 'engagement']
    },
    {
      id: 'ann-2',
      userId: 'user-4',
      position: { x: 500, y: 300, section: 'charts' },
      type: 'question',
      title: 'Platform Performance Discrepancy',
      content: 'Why is Instagram performing significantly better than Facebook this quarter? Should we investigate algorithm changes?',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isResolved: false,
      mentions: ['user-1'],
      reactions: [
        { userId: 'user-1', type: 'question' }
      ],
      replies: [],
      priority: 'medium',
      tags: ['platforms', 'investigation', 'performance']
    },
    {
      id: 'ann-3',
      userId: 'user-2',
      position: { x: 350, y: 450, section: 'revenue' },
      type: 'action_item',
      title: 'Revenue Goal Tracking',
      content: 'Set up automated alerts for when we hit 75% of monthly revenue target to optimize final week campaigns.',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isResolved: true,
      mentions: [],
      reactions: [
        { userId: 'user-1', type: 'like' },
        { userId: 'user-4', type: 'like' }
      ],
      replies: [
        {
          id: 'reply-2',
          userId: 'user-1',
          content: 'Implemented! Alerts are now active in our monitoring system.',
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          mentions: []
        }
      ],
      priority: 'high',
      tags: ['automation', 'revenue', 'alerts']
    }
  ];

  // Initialize mock data
  useEffect(() => {
    setActiveUsers(generateMockUsers());
    setAnnotations(generateMockAnnotations());
  }, []);

  // Handle annotation creation
  const handleCreateAnnotation = () => {
    if (!newAnnotationPosition || !newAnnotation.title.trim()) return;

    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      userId: currentUserId,
      position: newAnnotationPosition,
      type: newAnnotation.type,
      title: newAnnotation.title,
      content: newAnnotation.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      isResolved: false,
      mentions: newAnnotation.mentions,
      reactions: [],
      replies: [],
      priority: newAnnotation.priority,
      tags: newAnnotation.tags
    };

    setAnnotations(prev => [...prev, annotation]);
    setIsCreatingAnnotation(false);
    setNewAnnotationPosition(null);
    setNewAnnotation({
      type: 'note',
      title: '',
      content: '',
      priority: 'medium',
      tags: [],
      mentions: []
    });
  };

  const handleAddReply = (annotationId: string) => {
    if (!replyText.trim()) return;

    const reply: AnnotationReply = {
      id: `reply-${Date.now()}`,
      userId: currentUserId,
      content: replyText,
      createdAt: new Date(),
      mentions: []
    };

    setAnnotations(prev => prev.map(ann => 
      ann.id === annotationId 
        ? { ...ann, replies: [...ann.replies, reply] }
        : ann
    ));
    setReplyText('');
  };

  const toggleAnnotationResolved = (annotationId: string) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === annotationId 
        ? { ...ann, isResolved: !ann.isResolved, updatedAt: new Date() }
        : ann
    ));
  };

  const addReaction = (annotationId: string, reactionType: 'like' | 'love' | 'insight' | 'question') => {
    setAnnotations(prev => prev.map(ann => {
      if (ann.id === annotationId) {
        const existingReaction = ann.reactions.find(r => r.userId === currentUserId);
        if (existingReaction) {
          return {
            ...ann,
            reactions: ann.reactions.map(r => 
              r.userId === currentUserId 
                ? { ...r, type: reactionType }
                : r
            )
          };
        } else {
          return {
            ...ann,
            reactions: [...ann.reactions, { userId: currentUserId, type: reactionType }]
          };
        }
      }
      return ann;
    }));
  };

  // Filter annotations
  const filteredAnnotations = useMemo(() => {
    return annotations.filter(ann => {
      if (filterAnnotations.type !== 'all' && ann.type !== filterAnnotations.type) return false;
      if (filterAnnotations.user !== 'all' && ann.userId !== filterAnnotations.user) return false;
      if (filterAnnotations.resolved === 'resolved' && !ann.isResolved) return false;
      if (filterAnnotations.resolved === 'unresolved' && ann.isResolved) return false;
      if (filterAnnotations.priority !== 'all' && ann.priority !== filterAnnotations.priority) return false;
      return true;
    });
  }, [annotations, filterAnnotations]);

  const getUserById = (userId: string) => {
    return activeUsers.find(user => user.id === userId);
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'insight': return <Lightbulb className="h-4 w-4" />;
      case 'question': return <AlertCircle className="h-4 w-4" />;
      case 'action_item': return <Flag className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'insight': return 'border-yellow-500 bg-yellow-50';
      case 'question': return 'border-blue-500 bg-blue-50';
      case 'action_item': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={cn('flex gap-6', className)}>
      {/* Main Content Area with Live Cursors */}
      <div className="flex-1 relative">
        {/* Live Cursors */}
        {activeUsers
          .filter(user => user.isOnline && user.cursorPosition && user.id !== currentUserId)
          .map(user => (
            <div
              key={user.id}
              className="absolute pointer-events-none z-50 transition-all duration-100"
              style={{
                left: user.cursorPosition!.x,
                top: user.cursorPosition!.y,
                transform: 'translate(-2px, -2px)'
              }}
            >
              <MousePointer className="h-5 w-5 text-primary" style={{ color: user.role === 'admin' ? '#ef4444' : user.role === 'editor' ? '#3b82f6' : '#10b981' }} />
              <div className="ml-4 -mt-1 px-2 py-1 rounded text-xs font-medium text-white shadow-lg" 
                   style={{ backgroundColor: user.role === 'admin' ? '#ef4444' : user.role === 'editor' ? '#3b82f6' : '#10b981' }}>
                {user.name}
              </div>
            </div>
          ))
        }

        {/* Annotation Markers */}
        {annotations.map(annotation => (
          <div
            key={annotation.id}
            className={cn(
              "absolute z-40 cursor-pointer transition-all duration-200 hover:scale-110",
              selectedAnnotation === annotation.id ? 'ring-2 ring-primary' : ''
            )}
            style={{
              left: annotation.position.x,
              top: annotation.position.y,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => setSelectedAnnotation(selectedAnnotation === annotation.id ? null : annotation.id)}
          >
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg",
              getTypeColor(annotation.type),
              annotation.isResolved ? 'opacity-60' : ''
            )}>
              {getAnnotationIcon(annotation.type)}
            </div>
            {annotation.replies.length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">{annotation.replies.length}</span>
              </div>
            )}
          </div>
        ))}

        {/* Selected Annotation Popup */}
        {selectedAnnotation && (() => {
          const annotation = annotations.find(ann => ann.id === selectedAnnotation);
          const user = annotation ? getUserById(annotation.userId) : null;
          
          if (!annotation || !user) return null;

          return (
            <div
              className="absolute z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200"
              style={{
                left: Math.min(annotation.position.x + 20, window.innerWidth - 340),
                top: Math.min(annotation.position.y, window.innerHeight - 400),
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getAnnotationIcon(annotation.type)}
                    <h4 className="font-semibold text-sm">{annotation.title}</h4>
                    <Badge className={getPriorityColor(annotation.priority)}>
                      {annotation.priority}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAnnotation(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(annotation.createdAt, { addSuffix: true })}</span>
                  {annotation.isResolved && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    </>
                  )}
                </div>

                <p className="text-sm text-gray-700 mb-3">{annotation.content}</p>

                {annotation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {annotation.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Reactions */}
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addReaction(annotation.id, 'like')}
                    className="h-6 px-2"
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {annotation.reactions.filter(r => r.type === 'like').length}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addReaction(annotation.id, 'insight')}
                    className="h-6 px-2"
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {annotation.reactions.filter(r => r.type === 'insight').length}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAnnotationResolved(annotation.id)}
                    className="h-6 px-2"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {annotation.isResolved ? 'Unresolve' : 'Resolve'}
                  </Button>
                </div>

                {/* Replies */}
                {annotation.replies.length > 0 && (
                  <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                    {annotation.replies.map(reply => {
                      const replyUser = getUserById(reply.userId);
                      return (
                        <div key={reply.id} className="flex gap-2 text-xs">
                          <Avatar className="h-4 w-4 mt-0.5">
                            <AvatarImage src={replyUser?.avatar} />
                            <AvatarFallback className="text-xs">
                              {replyUser?.name.split(' ').map(n => n[0]).join('') || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <span className="font-medium">{replyUser?.name || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(reply.createdAt, { addSuffix: true })}</span>
                            </div>
                            <p className="text-gray-700">{reply.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reply Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="text-xs"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddReply(annotation.id);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddReply(annotation.id)}
                    disabled={!replyText.trim()}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Collaboration Panel */}
      <div className={cn(
        "transition-all duration-300 bg-white border border-gray-200 rounded-lg shadow-sm",
        isPanelExpanded ? "w-80" : "w-12"
      )}>
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          {isPanelExpanded && (
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Collaboration</h3>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPanelExpanded(!isPanelExpanded)}
          >
            {isPanelExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        {isPanelExpanded && (
          <div className="p-3">
            <Tabs value={collaborationPanel} onValueChange={(value: unknown) => setCollaborationPanel(value)}>
              <TabsList className="grid w-full grid-cols-4 text-xs">
                <TabsTrigger value="users" className="p-1">
                  <Users className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="annotations" className="p-1">
                  <MessageCircle className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="activity" className="p-1">
                  <Clock className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="settings" className="p-1">
                  <Settings className="h-3 w-3" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-3 mt-4">
                <div className="space-y-2">
                  {activeUsers.map(user => (
                    <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                          user.isOnline ? "bg-green-500" : "bg-gray-400"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {user.isOnline ? `Viewing ${user.currentView}` : `Last seen ${formatDistanceToNow(user.lastSeen, { addSuffix: true })}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="annotations" className="space-y-3 mt-4">
                {/* Annotation Filters */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={filterAnnotations.type} onValueChange={(value) => setFilterAnnotations(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="note">Notes</SelectItem>
                        <SelectItem value="insight">Insights</SelectItem>
                        <SelectItem value="question">Questions</SelectItem>
                        <SelectItem value="action_item">Actions</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterAnnotations.resolved} onValueChange={(value) => setFilterAnnotations(prev => ({ ...prev, resolved: value }))}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="unresolved">Open</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Annotations List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredAnnotations.map(annotation => {
                    const user = getUserById(annotation.userId);
                    return (
                      <div
                        key={annotation.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md",
                          selectedAnnotation === annotation.id ? 'ring-2 ring-primary' : '',
                          getTypeColor(annotation.type),
                          annotation.isResolved ? 'opacity-60' : ''
                        )}
                        onClick={() => setSelectedAnnotation(selectedAnnotation === annotation.id ? null : annotation.id)}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0">
                            {getAnnotationIcon(annotation.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              <h4 className="text-sm font-medium truncate">{annotation.title}</h4>
                              <Badge className={cn('text-xs', getPriorityColor(annotation.priority))}>
                                {annotation.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {annotation.content}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <span>{user?.name}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(annotation.createdAt, { addSuffix: true })}</span>
                              {annotation.replies.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{annotation.replies.length} replies</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Annotation Button */}
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => {
                    setIsCreatingAnnotation(true);
                    setNewAnnotationPosition({ x: 300, y: 200, section: 'overview' });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Annotation
                </Button>
              </TabsContent>

              <TabsContent value="activity" className="space-y-3 mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Activity feed coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-3 mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Collaboration settings coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Create Annotation Modal */}
      {isCreatingAnnotation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Create Annotation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select value={newAnnotation.type} onValueChange={(value: unknown) => setNewAnnotation(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="insight">Insight</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="action_item">Action Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={newAnnotation.title}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter annotation title"
                />
              </div>

              <div>
                <Label>Content</Label>
                <Textarea
                  value={newAnnotation.content}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Describe your observation, insight, or question..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={newAnnotation.priority} onValueChange={(value: unknown) => setNewAnnotation(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateAnnotation} disabled={!newAnnotation.title.trim()}>
                  Create
                </Button>
                <Button variant="outline" onClick={() => setIsCreatingAnnotation(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}