"use client";

/**
 * Unified Content Context
 * Provides shared state management between calendar and content management systems
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { UnifiedContentItem, UnifiedContentQuery, ContentWorkflowState, unifiedContentService } from '@/lib/services/unified-content-service';
import { CalendarEvent, ContentType, SocialPlatform } from '@/components/content/types';
import { ContentData } from '@/lib/api/content-service';

// Context State Interface
export interface UnifiedContentState {
  // Content items
  items: UnifiedContentItem[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Current selections
  selectedItem: UnifiedContentItem | null;
  activeView: 'calendar' | 'content-manager' | 'unified';
  
  // Filters and search
  currentQuery: UnifiedContentQuery;
  
  // Workflow state
  workflowStates: Record<string, ContentWorkflowState>;
  
  // Cross-system synchronization
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncAt: string | null;
  
  // Template integration
  templateUsage: Record<string, number>;
  
  // Real-time updates
  liveUpdates: boolean;
}

// Action Types
export type UnifiedContentAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: UnifiedContentItem[] }
  | { type: 'ADD_ITEM'; payload: UnifiedContentItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<UnifiedContentItem> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SELECT_ITEM'; payload: UnifiedContentItem | null }
  | { type: 'SET_ACTIVE_VIEW'; payload: 'calendar' | 'content-manager' | 'unified' }
  | { type: 'SET_QUERY'; payload: UnifiedContentQuery }
  | { type: 'SET_WORKFLOW_STATE'; payload: { id: string; state: ContentWorkflowState } }
  | { type: 'SET_SYNC_STATUS'; payload: 'idle' | 'syncing' | 'error' }
  | { type: 'UPDATE_TEMPLATE_USAGE'; payload: { templateId: string; count: number } }
  | { type: 'TOGGLE_LIVE_UPDATES'; payload: boolean }
  | { type: 'SYNC_COMPLETE'; payload: { items: UnifiedContentItem[]; timestamp: string } };

// Initial State
const initialState: UnifiedContentState = {
  items: [],
  isLoading: false,
  error: null,
  selectedItem: null,
  activeView: 'unified',
  currentQuery: {},
  workflowStates: {},
  syncStatus: 'idle',
  lastSyncAt: null,
  templateUsage: {},
  liveUpdates: true
};

// Reducer
function unifiedContentReducer(state: UnifiedContentState, action: UnifiedContentAction): UnifiedContentState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
      
    case 'SET_ITEMS':
      return { ...state, items: action.payload, isLoading: false, error: null };
      
    case 'ADD_ITEM':
      return { 
        ...state, 
        items: [action.payload, ...state.items],
        error: null
      };
      
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id 
            ? { ...item, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : item
        ),
        selectedItem: state.selectedItem?.id === action.payload.id 
          ? { ...state.selectedItem, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : state.selectedItem
      };
      
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        selectedItem: state.selectedItem?.id === action.payload ? null : state.selectedItem
      };
      
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.payload };
      
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
      
    case 'SET_QUERY':
      return { ...state, currentQuery: action.payload };
      
    case 'SET_WORKFLOW_STATE':
      return {
        ...state,
        workflowStates: {
          ...state.workflowStates,
          [action.payload.id]: action.payload.state
        }
      };
      
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.payload };
      
    case 'UPDATE_TEMPLATE_USAGE':
      return {
        ...state,
        templateUsage: {
          ...state.templateUsage,
          [action.payload.templateId]: action.payload.count
        }
      };
      
    case 'TOGGLE_LIVE_UPDATES':
      return { ...state, liveUpdates: action.payload };
      
    case 'SYNC_COMPLETE':
      return {
        ...state,
        items: action.payload.items,
        syncStatus: 'idle',
        lastSyncAt: action.payload.timestamp,
        error: null
      };
      
    default:
      return state;
  }
}

// Context Actions Interface
export interface UnifiedContentActions {
  // Content CRUD operations
  createContent: (data: Partial<UnifiedContentItem>, options?: any) => Promise<UnifiedContentItem>;
  updateContent: (id: string, updates: Partial<UnifiedContentItem>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  
  // Content queries
  loadContent: (query?: UnifiedContentQuery) => Promise<void>;
  searchContent: (query: string) => Promise<void>;
  filterContent: (filters: Partial<UnifiedContentQuery>) => Promise<void>;
  
  // Selection and navigation
  selectContent: (item: UnifiedContentItem | null) => void;
  switchView: (view: 'calendar' | 'content-manager' | 'unified') => void;
  
  // Workflow management
  scheduleContent: (id: string, scheduledAt?: string) => Promise<void>;
  publishContent: (id: string) => Promise<void>;
  getWorkflowState: (id: string) => Promise<ContentWorkflowState | null>;
  
  // Cross-system operations
  syncAllContent: () => Promise<void>;
  syncContentItem: (id: string) => Promise<void>;
  
  // Template integration
  applyTemplate: (templateId: string, itemId?: string) => Promise<UnifiedContentItem>;
  trackTemplateUsage: (templateId: string) => void;
  
  // Bridge functions for existing systems
  createFromCalendarEvent: (event: CalendarEvent) => Promise<UnifiedContentItem>;
  createFromContentData: (content: ContentData) => Promise<UnifiedContentItem>;
  migrateToUnified: (source: 'calendar' | 'content-manager', id: string) => Promise<UnifiedContentItem>;
  
  // Real-time updates
  enableLiveUpdates: () => void;
  disableLiveUpdates: () => void;
}

// Context Creation
const UnifiedContentContext = createContext<{
  state: UnifiedContentState;
  actions: UnifiedContentActions;
} | null>(null);

// Context Provider Props
interface UnifiedContentProviderProps {
  children: ReactNode;
  initialQuery?: UnifiedContentQuery;
  enableRealtime?: boolean;
}

// Context Provider
export function UnifiedContentProvider({ 
  children, 
  initialQuery = {},
  enableRealtime = true 
}: UnifiedContentProviderProps) {
  const [state, dispatch] = useReducer(unifiedContentReducer, {
    ...initialState,
    currentQuery: initialQuery,
    liveUpdates: enableRealtime
  });

  // Create actions object
  const actions: UnifiedContentActions = {
    // Content CRUD operations
    createContent: async (data, options = {}) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const item = await unifiedContentService.createUnifiedContent(data, options);
        dispatch({ type: 'ADD_ITEM', payload: item });
        
        // Update workflow state
        const workflowState = await unifiedContentService.getWorkflowState(item.id);
        if (workflowState) {
          dispatch({ type: 'SET_WORKFLOW_STATE', payload: { id: item.id, state: workflowState } });
        }
        
        return item;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create content' });
        throw error;
      }
    },

    updateContent: async (id, updates) => {
      try {
        const updatedItem = await unifiedContentService.updateUnifiedContent(id, updates);
        dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
        
        // Update workflow state
        const workflowState = await unifiedContentService.getWorkflowState(id);
        if (workflowState) {
          dispatch({ type: 'SET_WORKFLOW_STATE', payload: { id, state: workflowState } });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update content' });
        throw error;
      }
    },

    deleteContent: async (id) => {
      try {
        // Note: unifiedContentService would need a delete method
        dispatch({ type: 'REMOVE_ITEM', payload: id });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete content' });
        throw error;
      }
    },

    // Content queries
    loadContent: async (query = {}) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_QUERY', payload: query });
      
      try {
        const result = await unifiedContentService.listUnifiedContent(query);
        dispatch({ type: 'SET_ITEMS', payload: result.items });
        
        // Load workflow states for all items
        const workflowPromises = result.items.map(item => 
          unifiedContentService.getWorkflowState(item.id).then(state => ({ id: item.id, state }))
        );
        
        const workflowResults = await Promise.allSettled(workflowPromises);
        workflowResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value.state) {
            dispatch({ 
              type: 'SET_WORKFLOW_STATE', 
              payload: { id: result.value.id, state: result.value.state } 
            });
          }
        });
        
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load content' });
      }
    },

    searchContent: async (query) => {
      await actions.loadContent({ ...state.currentQuery, search: query });
    },

    filterContent: async (filters) => {
      await actions.loadContent({ ...state.currentQuery, ...filters });
    },

    // Selection and navigation
    selectContent: (item) => {
      dispatch({ type: 'SELECT_ITEM', payload: item });
    },

    switchView: (view) => {
      dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
    },

    // Workflow management
    scheduleContent: async (id, scheduledAt) => {
      try {
        await unifiedContentService.scheduleContent(id, scheduledAt);
        await actions.updateContent(id, { status: 'scheduled', scheduledAt });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to schedule content' });
        throw error;
      }
    },

    publishContent: async (id) => {
      try {
        await unifiedContentService.publishContent(id);
        await actions.updateContent(id, { 
          status: 'published', 
          publishedAt: new Date().toISOString() 
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to publish content' });
        throw error;
      }
    },

    getWorkflowState: async (id) => {
      try {
        const workflowState = await unifiedContentService.getWorkflowState(id);
        if (workflowState) {
          dispatch({ type: 'SET_WORKFLOW_STATE', payload: { id, state: workflowState } });
        }
        return workflowState;
      } catch (error) {
        // Failed to get workflow state
        return null;
      }
    },

    // Cross-system operations
    syncAllContent: async () => {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      try {
        await actions.loadContent(state.currentQuery);
        dispatch({ 
          type: 'SYNC_COMPLETE', 
          payload: { items: state.items, timestamp: new Date().toISOString() } 
        });
      } catch (error) {
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
        dispatch({ type: 'SET_ERROR', payload: 'Failed to sync content' });
      }
    },

    syncContentItem: async (id) => {
      try {
        const syncedItem = await unifiedContentService.syncContent(id);
        dispatch({ type: 'UPDATE_ITEM', payload: { id, updates: syncedItem } });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to sync content item' });
        throw error;
      }
    },

    // Template integration
    applyTemplate: async (templateId, itemId) => {
      try {
        // This would create new content or update existing based on itemId
        if (itemId) {
          const item = state.items.find(i => i.id === itemId);
          if (item) {
            // Apply template to existing item
            const updates = { templateMetadata: { templateId, appliedAt: new Date().toISOString() } };
            await actions.updateContent(itemId, updates);
            return { ...item, ...updates };
          }
        }
        
        // Create new content from template
        const item = await actions.createContent({ 
          templateMetadata: { templateId, appliedAt: new Date().toISOString() } 
        }, { templateId });
        
        actions.trackTemplateUsage(templateId);
        return item;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to apply template' });
        throw error;
      }
    },

    trackTemplateUsage: (templateId) => {
      const currentUsage = state.templateUsage[templateId] || 0;
      dispatch({ type: 'UPDATE_TEMPLATE_USAGE', payload: { templateId, count: currentUsage + 1 } });
    },

    // Bridge functions for existing systems
    createFromCalendarEvent: async (event) => {
      return await actions.createContent({
        title: event.title,
        description: event.description,
        contentType: event.type,
        scheduledAt: event.startTime,
        platforms: event.socialMediaContent?.platforms,
        mediaUrls: event.socialMediaContent?.mediaUrls,
        calendarEvent: event
      }, { createInCalendar: false, createInContentManager: true });
    },

    createFromContentData: async (content) => {
      return await actions.createContent({
        title: content.title,
        description: content.excerpt || content.content,
        contentType: content.type as ContentType,
        scheduledAt: content.scheduledAt,
        contentData: content
      }, { createInCalendar: true, createInContentManager: false });
    },

    migrateToUnified: async (source, id) => {
      if (source === 'calendar') {
        // Find calendar event and migrate
        const existingItem = state.items.find(item => item.calendarEvent?.id === id);
        if (existingItem && !existingItem.contentData) {
          return await actions.updateContent(existingItem.id, {}, { 
            updateContentManager: true 
          });
        }
      } else if (source === 'content-manager') {
        // Find content item and migrate
        const existingItem = state.items.find(item => item.contentData?.id === id);
        if (existingItem && !existingItem.calendarEvent) {
          return await actions.updateContent(existingItem.id, {}, { 
            updateCalendar: true 
          });
        }
      }
      
      throw new Error('Item not found or already unified');
    },

    // Real-time updates
    enableLiveUpdates: () => {
      dispatch({ type: 'TOGGLE_LIVE_UPDATES', payload: true });
    },

    disableLiveUpdates: () => {
      dispatch({ type: 'TOGGLE_LIVE_UPDATES', payload: false });
    }
  };

  // Set up real-time event listeners
  useEffect(() => {
    if (!state.liveUpdates) return;

    const handleContentCreated = (event: CustomEvent) => {
      dispatch({ type: 'ADD_ITEM', payload: event.detail });
    };

    const handleContentUpdated = (event: CustomEvent) => {
      dispatch({ type: 'UPDATE_ITEM', payload: { id: event.detail.id, updates: event.detail } });
    };

    const handleContentScheduled = (event: CustomEvent) => {
      dispatch({ type: 'UPDATE_ITEM', payload: { 
        id: event.detail.id, 
        updates: { status: 'scheduled', scheduledAt: event.detail.scheduledAt } 
      }});
    };

    const handleContentPublished = (event: CustomEvent) => {
      dispatch({ type: 'UPDATE_ITEM', payload: { 
        id: event.detail.id, 
        updates: { status: 'published', publishedAt: new Date().toISOString() } 
      }});
    };

    // Add event listeners
    window.addEventListener('content-created', handleContentCreated as EventListener);
    window.addEventListener('content-updated', handleContentUpdated as EventListener);
    window.addEventListener('content-scheduled', handleContentScheduled as EventListener);
    window.addEventListener('content-published', handleContentPublished as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('content-created', handleContentCreated as EventListener);
      window.removeEventListener('content-updated', handleContentUpdated as EventListener);
      window.removeEventListener('content-scheduled', handleContentScheduled as EventListener);
      window.removeEventListener('content-published', handleContentPublished as EventListener);
    };
  }, [state.liveUpdates]);

  // Initialize content loading
  useEffect(() => {
    actions.loadContent(initialQuery);
  }, []);

  return (
    <UnifiedContentContext.Provider value={{ state, actions }}>
      {children}
    </UnifiedContentContext.Provider>
  );
}

// Custom hook for using the context
export function useUnifiedContent() {
  const context = useContext(UnifiedContentContext);
  if (!context) {
    throw new Error('useUnifiedContent must be used within a UnifiedContentProvider');
  }
  return context;
}

// Selector hooks for specific data
export function useUnifiedContentItems() {
  const { state } = useUnifiedContent();
  return state.items;
}

export function useSelectedContent() {
  const { state } = useUnifiedContent();
  return state.selectedItem;
}

export function useContentWorkflowState(itemId: string) {
  const { state } = useUnifiedContent();
  return state.workflowStates[itemId] || null;
}

export function useContentSyncStatus() {
  const { state } = useUnifiedContent();
  return {
    status: state.syncStatus,
    lastSyncAt: state.lastSyncAt
  };
}