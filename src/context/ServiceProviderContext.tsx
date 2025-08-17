'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';

// Types based on our TDD specifications
export interface ClientSummary {
  id: string;
  name: string;
  type: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'ARCHIVED';
  logoUrl?: string;
  performanceScore?: number;
  activeCampaigns: number;
  engagementRate: number;
  monthlyBudget?: number;
  lastActivity?: Date;
}

export interface ServiceProviderUser {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'CONTENT_CREATOR' | 'REVIEWER' | 'APPROVER' | 'PUBLISHER' | 'ANALYST' | 'CLIENT_MANAGER';
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'admin')[];
  scope: 'organization' | 'client' | 'campaign' | 'content';
  clientId?: string;
}

export interface ServiceProviderMetrics {
  totalClients: number;
  activeClients: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalRevenue: number;
  marketplaceRevenue: number;
  teamUtilization: number;
  avgClientSatisfaction: number;
}

export interface ServiceProviderContext {
  organizationId: string;
  organizationName: string;
  organizationType: 'service_provider' | 'enterprise';
  currentUser: ServiceProviderUser;
  selectedClient: ClientSummary | null;
  availableClients: ClientSummary[];
  viewMode: 'overview' | 'client-specific' | 'cross-client';
  metrics: ServiceProviderMetrics | null;
  isLoading: boolean;
  error: string | null;
}

// Actions for context management
type ServiceProviderAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ORGANIZATION'; payload: { id: string; name: string; type: string } }
  | { type: 'SET_USER'; payload: ServiceProviderUser }
  | { type: 'SET_CLIENTS'; payload: ClientSummary[] }
  | { type: 'SELECT_CLIENT'; payload: ClientSummary | null }
  | { type: 'SET_VIEW_MODE'; payload: 'overview' | 'client-specific' | 'cross-client' }
  | { type: 'SET_METRICS'; payload: ServiceProviderMetrics }
  | { type: 'UPDATE_CLIENT_METRICS'; payload: { clientId: string; metrics: Partial<ClientSummary> } };

// Context reducer
function serviceProviderReducer(
  state: ServiceProviderContext,
  action: ServiceProviderAction
): ServiceProviderContext {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_ORGANIZATION':
      return {
        ...state,
        organizationId: action.payload.id,
        organizationName: action.payload.name,
        organizationType: action.payload.type as 'service_provider' | 'enterprise',
      };
    
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    
    case 'SET_CLIENTS':
      return { ...state, availableClients: action.payload };
    
    case 'SELECT_CLIENT':
      return {
        ...state,
        selectedClient: action.payload,
        viewMode: action.payload ? 'client-specific' : 'overview',
      };
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    
    case 'UPDATE_CLIENT_METRICS':
      return {
        ...state,
        availableClients: state.availableClients.map(client =>
          client.id === action.payload.clientId
            ? { ...client, ...action.payload.metrics }
            : client
        ),
        selectedClient: state.selectedClient?.id === action.payload.clientId
          ? { ...state.selectedClient, ...action.payload.metrics }
          : state.selectedClient,
      };
    
    default:
      return state;
  }
}

// Initial state
const initialState: ServiceProviderContext = {
  organizationId: '',
  organizationName: '',
  organizationType: 'service_provider',
  currentUser: {
    id: '',
    name: '',
    email: '',
    role: 'CONTENT_CREATOR',
    permissions: [],
  },
  selectedClient: null,
  availableClients: [],
  viewMode: 'overview',
  metrics: null,
  isLoading: true,
  error: null,
};

// Context creation
const ServiceProviderContextObj = createContext<{
  state: ServiceProviderContext;
  dispatch: React.Dispatch<ServiceProviderAction>;
  // Action creators
  switchClient: (client: ClientSummary | null) => void;
  setViewMode: (mode: 'overview' | 'client-specific' | 'cross-client') => void;
  refreshMetrics: () => Promise<void>;
  refreshClients: () => Promise<void>;
  hasPermission: (resource: string, action: string, clientId?: string) => boolean;
  getAccessibleClients: () => ClientSummary[];
} | null>(null);

// Provider component
export function ServiceProviderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(serviceProviderReducer, initialState);
  const { userId, orgId, isLoaded } = useAuth();

  // Initialize context when auth is ready OR for development testing
  useEffect(() => {
    if (isLoaded && userId) {
      // Use orgId if available, otherwise create a default organization for the user
      const organizationId = orgId || `user-org-${userId}`;
      // ServiceProvider: Initializing with organizationId
      initializeServiceProvider(organizationId);
    } else if (isLoaded && !userId) {
      // DEVELOPMENT MODE: Initialize with demo data when no authentication
      // ServiceProvider: DEV MODE - Initializing without auth
      const demoOrgId = 'org_2xhH7xfnNAWnpvKl5gNd4ZGRP5t'; // Use the test org ID
      initializeServiceProvider(demoOrgId);
    }
  }, [isLoaded, userId, orgId]);

  // Helper functions for fetching data with organizationId parameter
  const fetchClients = async (organizationId: string) => {
    // ServiceProviderContext fetchClients: using organizationId
    const response = await fetch(`/api/service-provider/clients?organizationId=${organizationId}`);
    if (!response.ok) throw new Error('Failed to fetch clients');
    const clients = await response.json();
    // ServiceProviderContext fetchClients: fetched clients
    dispatch({ type: 'SET_CLIENTS', payload: clients });
  };

  const fetchMetrics = async (organizationId: string) => {
    const response = await fetch(`/api/service-provider/metrics?organizationId=${organizationId}`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    const metrics = await response.json();
    dispatch({ type: 'SET_METRICS', payload: metrics });
  };

  // Initialize service provider data
  const initializeServiceProvider = async (organizationId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Fetch organization data
      const orgResponse = await fetch(`/api/service-provider/organization/${organizationId}`);
      if (!orgResponse.ok) {
        console.log('🔧 Organization API failed, creating with real user data...');
        
        // Fetch real user data via API
        try {
          const userResponse = await fetch(`/api/service-provider/user/${userId}`);
          if (userResponse.ok) {
            const realUser = await userResponse.json();
            
            // Create organization based on real user
            const defaultOrgName = realUser.name || realUser.email || 'My Organization';
            dispatch({ 
              type: 'SET_ORGANIZATION', 
              payload: { 
                id: organizationId, 
                name: defaultOrgName, 
                type: 'service_provider' 
              } 
            });
            
            // Set REAL user data with proper permissions
            dispatch({ 
              type: 'SET_USER', 
              payload: {
                id: realUser.id,
                name: realUser.name || `${realUser.firstName} ${realUser.lastName}`.trim() || realUser.email,
                email: realUser.email,
                role: realUser.role || 'ADMIN',
                permissions: [
                  {
                    resource: '*',
                    actions: ['read', 'write', 'delete', 'admin'],
                    scope: 'organization',
                  }
                ]
              }
            });
            
            console.log('✅ Real user context set:', {
              id: realUser.id,
              name: realUser.name || realUser.email,
              email: realUser.email
            });
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (userError) {
          console.error('Failed to fetch real user data:', userError);
          // Fallback to basic organization setup
          dispatch({ 
            type: 'SET_ORGANIZATION', 
            payload: { 
              id: organizationId, 
              name: 'My Organization', 
              type: 'service_provider' 
            } 
          });
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      const orgData = await orgResponse.json();
      
      dispatch({
        type: 'SET_ORGANIZATION',
        payload: {
          id: orgData.id,
          name: orgData.name,
          type: orgData.type || 'service_provider',
        },
      });

      // Fetch user data with permissions
      const userResponse = await fetch(`/api/service-provider/user/${userId}`);
      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      const userData = await userResponse.json();
      
      dispatch({ type: 'SET_USER', payload: userData });

      // Fetch clients from database only - no more demo/mock data
      try {
        await fetchClients(organizationId);
      } catch (error) {
        // No fallback demo clients - just show empty list if API fails
        console.warn('Failed to fetch clients from API:', error);
        dispatch({ type: 'SET_CLIENTS', payload: [] });
      }
      
      // Fetch metrics - use zero values if API fails (no demo data in production)
      try {
        await fetchMetrics(organizationId);
      } catch (error) {
        console.warn('Failed to fetch metrics from API:', error);
        // Use zero values instead of demo data in production
        dispatch({
          type: 'SET_METRICS',
          payload: {
            totalClients: 0,
            activeClients: 0,
            activeCampaigns: 0,
            totalCampaigns: 0,
            totalRevenue: 0,
            marketplaceRevenue: 0,
            teamUtilization: 0,
            avgClientSatisfaction: 0,
          }
        });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('🚨 Service Provider initialization error:', error);
      
      try {
        // Even on error, try to get real user data via API
        try {
          const userResponse = await fetch(`/api/service-provider/user/${userId}`);
          if (userResponse.ok) {
            const realUser = await userResponse.json();
            
            dispatch({
              type: 'SET_ORGANIZATION',
              payload: {
                id: organizationId,
                name: realUser.name || realUser.email || 'My Organization',
                type: 'service_provider',
              },
            });
            
            // Set REAL user data even in error state
            dispatch({ 
              type: 'SET_USER', 
              payload: {
                id: realUser.id,
                name: realUser.name || `${realUser.firstName} ${realUser.lastName}`.trim() || realUser.email,
                email: realUser.email,
                role: realUser.role || 'ADMIN',
                permissions: [
                  {
                    resource: '*',
                    actions: ['read', 'write', 'delete', 'admin'],
                    scope: 'organization',
                  }
                ]
              }
            });
            
            console.log('✅ Real user context set in error recovery:', {
              id: realUser.id,
              name: realUser.name || realUser.email,
              email: realUser.email
            });
          } else {
            throw new Error('User API failed');
          }
        } catch (apiError) {
          console.error('Failed to fetch user via API in error recovery:', apiError);
          // Final fallback - basic setup
          dispatch({
            type: 'SET_ORGANIZATION',
            payload: {
              id: organizationId,
              name: 'My Organization',
              type: 'service_provider',
            },
          });
        }
      } catch (userError) {
        console.error('🚨 CRITICAL: Failed to get real user data:', userError);
        // Log this as a critical error for monitoring
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize user context' });
      }
      
      // No demo clients - only real database clients
      dispatch({ type: 'SET_CLIENTS', payload: [] });
      
      // Use zero values for metrics in error state (no demo data)
      dispatch({
        type: 'SET_METRICS',
        payload: {
          totalClients: 0,
          activeClients: 0,
          activeCampaigns: 0,
          totalCampaigns: 0,
          totalRevenue: 0,
          marketplaceRevenue: 0,
          teamUtilization: 0,
          avgClientSatisfaction: 0,
        }
      });
      
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Refresh clients data (memoized)
  const refreshClients = useCallback(async () => {
    try {
      if (!state.organizationId) {
        return;
      }
      const response = await fetch(`/api/service-provider/clients?organizationId=${state.organizationId}`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      const clients = await response.json();
      dispatch({ type: 'SET_CLIENTS', payload: clients });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to refresh client data',
      });
    }
  }, [state.organizationId]);

  // Refresh metrics data (memoized)
  const refreshMetrics = useCallback(async () => {
    try {
      if (!state.organizationId) {
        return;
      }
      const response = await fetch(`/api/service-provider/metrics?organizationId=${state.organizationId}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const metrics = await response.json();
      dispatch({ type: 'SET_METRICS', payload: metrics });
    } catch (error) {
      // Don't set error for metrics failure, just log it
      console.warn('Failed to refresh metrics:', error);
    }
  }, [state.organizationId]);

  // Set view mode
  const setViewMode = (mode: 'overview' | 'client-specific' | 'cross-client') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  // Check permissions (memoized to prevent infinite loops)
  const hasPermission = useCallback((resource: string, action: string, clientId?: string): boolean => {
    const user = state.currentUser;
    
    // Owners and admins have all permissions
    if (user.role === 'OWNER' || user.role === 'ADMIN') {
      return true;
    }
    
    // Check specific permissions
    return user.permissions.some(permission => {
      const resourceMatch = permission.resource === resource || permission.resource === '*';
      const actionMatch = permission.actions.includes(action as any) || permission.actions.includes('admin');
      const scopeMatch = !clientId || permission.scope === 'organization' || permission.clientId === clientId;
      
      return resourceMatch && actionMatch && scopeMatch;
    });
  }, [state.currentUser.role, state.currentUser.permissions]);

  // Switch client context (memoized to prevent infinite loops)
  const switchClient = useCallback(async (client: ClientSummary | null) => {
    // Skip if already selected
    if (client && state.selectedClient?.id === client.id) {
      return;
    }
    if (!client && !state.selectedClient) {
      return;
    }

    try {
      if (client) {
        // Validate user has access to this client
        if (!hasPermission('client', 'read', client.id)) {
          throw new Error('Access denied to this client');
        }
        
        // Update context on server (optional - don't fail if this fails)
        try {
          const response = await fetch('/api/context/switch-client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId: client.id }),
          });
          
          if (!response.ok) {
            console.warn('Failed to update server context, continuing with local update');
          }
        } catch (serverError) {
          console.warn('Server context update failed:', serverError);
        }
      }
      
      dispatch({ type: 'SELECT_CLIENT', payload: client });
    } catch (error) {
      console.error('Error switching client:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to switch client',
      });
    }
  }, [state.selectedClient?.id, hasPermission]);

  // Get accessible clients based on permissions (memoized)
  const getAccessibleClients = useCallback((): ClientSummary[] => {
    const user = state.currentUser;
    
    // Owners and admins can access all clients
    if (user.role === 'OWNER' || user.role === 'ADMIN') {
      return state.availableClients;
    }
    
    // Filter clients based on permissions
    return state.availableClients.filter(client =>
      hasPermission('client', 'read', client.id)
    );
  }, [state.currentUser.role, state.availableClients, hasPermission]);

  const value = {
    state,
    dispatch,
    switchClient,
    setViewMode,
    refreshMetrics,
    refreshClients,
    hasPermission,
    getAccessibleClients,
  };

  return (
    <ServiceProviderContextObj.Provider value={value}>
      {children}
    </ServiceProviderContextObj.Provider>
  );
}

// Hook to use service provider context
export function useServiceProvider() {
  const context = useContext(ServiceProviderContextObj);
  if (!context) {
    throw new Error('useServiceProvider must be used within a ServiceProviderProvider');
  }
  return context;
}

// Helper hooks for common operations
export function useClientSwitcher() {
  const { state, switchClient, getAccessibleClients } = useServiceProvider();
  
  return {
    selectedClient: state.selectedClient,
    availableClients: getAccessibleClients(),
    switchClient,
    isLoading: state.isLoading,
  };
}

export function useServiceProviderMetrics() {
  const { state, refreshMetrics } = useServiceProvider();
  
  return {
    metrics: state.metrics,
    refreshMetrics,
    isLoading: state.isLoading,
  };
}

export function useClientContext() {
  const { state, hasPermission } = useServiceProvider();
  
  return {
    currentClient: state.selectedClient,
    hasClientAccess: (action: string) => 
      state.selectedClient ? hasPermission('client', action, state.selectedClient.id) : false,
    isClientView: state.viewMode === 'client-specific',
  };
}