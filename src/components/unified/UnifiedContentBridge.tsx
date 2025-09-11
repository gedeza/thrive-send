"use client";

/**
 * Unified Content Bridge Component
 * Provides seamless transitions between calendar and content management workflows
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  FileText, 
  ArrowRight, 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Settings,
  Shuffle,
  Target,
  Workflow
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUnifiedContent, useContentWorkflowState } from '@/context/unified-content-context';
import { UnifiedContentItem, ContentWorkflowState } from '@/lib/services/unified-content-service';
import { CalendarEvent } from '@/components/content/types';
import { ContentData } from '@/lib/api/content-service';

// Bridge Action Types
type BridgeAction = 
  | 'calendar-to-content'
  | 'content-to-calendar'
  | 'migrate-to-unified'
  | 'create-unified'
  | 'sync-systems';

interface BridgeActionConfig {
  id: BridgeAction;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requiresConfirmation: boolean;
}

const BRIDGE_ACTIONS: BridgeActionConfig[] = [
  {
    id: 'calendar-to-content',
    label: 'Calendar → Content Manager',
    description: 'Move calendar event to full content management workflow',
    icon: <ArrowRight className="h-4 w-4" />,
    color: 'blue',
    requiresConfirmation: false
  },
  {
    id: 'content-to-calendar',
    label: 'Content → Calendar',
    description: 'Schedule content item in calendar for publication',
    icon: <Calendar className="h-4 w-4" />,
    color: 'green',
    requiresConfirmation: false
  },
  {
    id: 'migrate-to-unified',
    label: 'Create Unified Workflow',
    description: 'Merge into unified workflow with both calendar and content features',
    icon: <Shuffle className="h-4 w-4" />,
    color: 'purple',
    requiresConfirmation: true
  },
  {
    id: 'create-unified',
    label: 'New Unified Content',
    description: 'Create new content that exists in both systems',
    icon: <Zap className="h-4 w-4" />,
    color: 'orange',
    requiresConfirmation: false
  },
  {
    id: 'sync-systems',
    label: 'Sync All Systems',
    description: 'Synchronize data between calendar and content management',
    icon: <Workflow className="h-4 w-4" />,
    color: 'gray',
    requiresConfirmation: true
  }
];

// Workflow Status Component
function WorkflowStatus({ item }: { item: UnifiedContentItem }) {
  const workflowState = useContentWorkflowState(item.id);
  
  if (!workflowState) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Loading...
      </Badge>
    );
  }

  const getStatusColor = (stage: ContentWorkflowState['stage']) => {
    switch (stage) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'creation': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-gray-100 text-gray-800';
      case 'analyzed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (stage: ContentWorkflowState['stage']) => {
    switch (stage) {
      case 'planning': return <Target className="h-3 w-3" />;
      case 'creation': return <FileText className="h-3 w-3" />;
      case 'review': return <AlertCircle className="h-3 w-3" />;
      case 'scheduled': return <Clock className="h-3 w-3" />;
      case 'published': return <CheckCircle className="h-3 w-3" />;
      case 'analyzed': return <CheckCircle className="h-3 w-3" />;
      default: return <Settings className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-2">
      <Badge className={cn("flex items-center gap-1", getStatusColor(workflowState.stage))}>
        {getStatusIcon(workflowState.stage)}
        {workflowState.stage.charAt(0).toUpperCase() + workflowState.stage.slice(1)}
      </Badge>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${workflowState.progress}%` }}
          />
        </div>
        <span className="text-xs font-medium">{workflowState.progress}%</span>
      </div>
      
      {workflowState.nextAction && (
        <p className="text-xs text-muted-foreground">
          Next: {workflowState.nextAction}
        </p>
      )}
    </div>
  );
}

// Content Item Card Component
function ContentItemCard({ 
  item, 
  onActionSelect 
}: { 
  item: UnifiedContentItem; 
  onActionSelect: (action: BridgeAction, item: UnifiedContentItem) => void;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'calendar-event': return <Calendar className="h-4 w-4" />;
      case 'content-item': return <FileText className="h-4 w-4" />;
      case 'unified': return <Workflow className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'calendar-event': return 'bg-blue-100 text-blue-800';
      case 'content-item': return 'bg-green-100 text-green-800';
      case 'unified': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableActions = (item: UnifiedContentItem): BridgeAction[] => {
    switch (item.type) {
      case 'calendar-event':
        return ['calendar-to-content', 'migrate-to-unified'];
      case 'content-item':
        return ['content-to-calendar', 'migrate-to-unified'];
      case 'unified':
        return ['sync-systems'];
      default:
        return ['create-unified'];
    }
  };

  const availableActions = getAvailableActions(item);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={cn("flex items-center gap-1", getTypeColor(item.type))}>
              {getTypeIcon(item.type)}
              {item.type.replace('-', ' ')}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {item.contentType}
            </Badge>
          </div>
          
          <Badge 
            variant={item.syncStatus === 'synced' ? 'default' : 'destructive'}
            className="text-xs"
          >
            {item.syncStatus}
          </Badge>
        </div>

        <h3 className="font-medium text-sm mb-1 line-clamp-1">
          {item.title || 'Untitled'}
        </h3>
        
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {item.description || 'No description'}
        </p>

        <WorkflowStatus item={item} />

        <div className="flex flex-wrap gap-1 mt-3">
          {availableActions.map(actionId => {
            const action = BRIDGE_ACTIONS.find(a => a.id === actionId);
            if (!action) return null;

            return (
              <Button
                key={actionId}
                size="sm"
                variant="outline"
                className="text-xs h-7 px-2"
                onClick={() => onActionSelect(actionId, item)}
              >
                {action.icon}
                <span className="ml-1 hidden sm:inline">{action.label.split(' → ')[0]}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Bridge Action Dialog Component
function BridgeActionDialog({
  action,
  item,
  isOpen,
  onClose,
  onConfirm
}: {
  action: BridgeActionConfig | null;
  item: UnifiedContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!action || !item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action.icon}
            {action.label}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {action.description}
          </p>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will {action.id === 'migrate-to-unified' ? 'merge' : 'move'} "{item.title}" 
              {action.id === 'sync-systems' ? ' and synchronize all related data' : ''}.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Content Details:</h4>
            <div className="space-y-1 text-xs">
              <div><span className="font-medium">Title:</span> {item.title}</div>
              <div><span className="font-medium">Type:</span> {item.contentType}</div>
              <div><span className="font-medium">Status:</span> {item.status}</div>
              {item.scheduledAt && (
                <div><span className="font-medium">Scheduled:</span> {new Date(item.scheduledAt).toLocaleDateString()}</div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onConfirm}>
              Confirm {action.label.split(' ')[1] || 'Action'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Bridge Component
export function UnifiedContentBridge() {
  const { state, actions } = useUnifiedContent();
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<{
    action: BridgeActionConfig;
    item: UnifiedContentItem;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter items by type for better organization
  const calendarItems = state.items.filter(item => item.type === 'calendar-event');
  const contentItems = state.items.filter(item => item.type === 'content-item');
  const unifiedItems = state.items.filter(item => item.type === 'unified');

  const handleActionSelect = (actionId: BridgeAction, item: UnifiedContentItem) => {
    const action = BRIDGE_ACTIONS.find(a => a.id === actionId);
    if (!action) return;

    if (action.requiresConfirmation) {
      setSelectedAction({ action, item });
    } else {
      executeAction(actionId, item);
    }
  };

  const executeAction = async (actionId: BridgeAction, item: UnifiedContentItem) => {
    setIsProcessing(true);
    
    try {
      switch (actionId) {
        case 'calendar-to-content':
          if (item.calendarEvent) {
            await actions.createFromCalendarEvent(item.calendarEvent);
          }
          break;
          
        case 'content-to-calendar':
          if (item.contentData) {
            await actions.createFromContentData(item.contentData);
          }
          break;
          
        case 'migrate-to-unified':
          const source = item.type === 'calendar-event' ? 'calendar' : 'content-manager';
          await actions.migrateToUnified(source, item.id);
          break;
          
        case 'create-unified':
          router.push('/dashboard/content/create?mode=unified');
          break;
          
        case 'sync-systems':
          await actions.syncAllContent();
          break;
      }
      
      // Close dialog if open
      setSelectedAction(null);
      
    } catch (_error) {
      console.error("", _error);
      // Error handling would be managed by the context
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = () => {
    if (selectedAction) {
      executeAction(selectedAction.action.id, selectedAction.item);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Unified Content Workflow</h2>
          <p className="text-muted-foreground">
            Seamlessly manage content across calendar and content management systems
          </p>
        </div>
        
        <Button 
          onClick={() => handleActionSelect('create-unified', {} as UnifiedContentItem)}
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          Create Unified Content
        </Button>
      </div>

      {/* Sync Status */}
      {state.syncStatus !== 'idle' && (
        <Alert>
          <Workflow className="h-4 w-4" />
          <AlertDescription>
            {state.syncStatus === 'syncing' ? 'Synchronizing systems...' : 'Sync completed'}
            {state.lastSyncAt && ` (Last sync: ${new Date(state.lastSyncAt).toLocaleTimeString()})`}
          </AlertDescription>
        </Alert>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="unified" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="unified" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Unified ({unifiedItems.length})
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar ({calendarItems.length})
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content ({contentItems.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            All ({state.items.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unified" className="space-y-4">
          {unifiedItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No Unified Content</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create unified content that exists in both calendar and content management systems
                </p>
                <Button onClick={() => handleActionSelect('create-unified', {} as UnifiedContentItem)}>
                  Create Unified Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unifiedItems.map(item => (
                <ContentItemCard
                  key={item.id}
                  item={item}
                  onActionSelect={handleActionSelect}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          {calendarItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No Calendar Events</h3>
                <p className="text-sm text-muted-foreground">
                  Calendar events will appear here when available
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calendarItems.map(item => (
                <ContentItemCard
                  key={item.id}
                  item={item}
                  onActionSelect={handleActionSelect}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {contentItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No Content Items</h3>
                <p className="text-sm text-muted-foreground">
                  Content management items will appear here when available
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentItems.map(item => (
                <ContentItemCard
                  key={item.id}
                  item={item}
                  onActionSelect={handleActionSelect}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.items.map(item => (
              <ContentItemCard
                key={item.id}
                item={item}
                onActionSelect={handleActionSelect}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Confirmation Dialog */}
      <BridgeActionDialog
        action={selectedAction?.action || null}
        item={selectedAction?.item || null}
        isOpen={!!selectedAction}
        onClose={() => setSelectedAction(null)}
        onConfirm={handleConfirmAction}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
          >
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-sm">Processing action...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}