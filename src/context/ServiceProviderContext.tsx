'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
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

  // Initialize context when auth is ready
  useEffect(() => {
    if (isLoaded && userId && orgId) {
      initializeServiceProvider();
    }
  }, [isLoaded, userId, orgId]);

  // Initialize service provider data
  const initializeServiceProvider = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Fetch organization data
      const orgResponse = await fetch(`/api/service-provider/organization/${orgId}`);
      if (!orgResponse.ok) {
        // For demo/testing purposes, let's default to service provider
        // TODO: In production, this should be based on actual organization data
        console.log('📋 ServiceProvider: API failed, defaulting to service_provider for demo');
        dispatch({ 
          type: 'SET_ORGANIZATION', 
          payload: { 
            id: orgId!, 
            name: 'Demo Service Provider', 
            type: 'service_provider' 
          } 
        });
        
        // Set basic user data for demo
        dispatch({ 
          type: 'SET_USER', 
          payload: {
            id: 'demo-user',
            name: 'Demo User',
            email: 'demo@serviceprovider.com',
            role: 'ADMIN',
            permissions: [
              {
                resource: '*',
                actions: ['read', 'write', 'delete', 'admin'],
                scope: 'organization',
              }
            ]
          }
        });
        
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

      // Fetch clients - add some demo clients if API fails
      try {
        await refreshClients();
      } catch (error) {
        // Add demo clients for testing
        dispatch({
          type: 'SET_CLIENTS',
          payload: [
            {
              id: 'client-1',
              name: 'Municipal Corp',
              type: 'municipality',
              status: 'ACTIVE',
              logoUrl: undefined,
              performanceScore: 85,
              activeCampaigns: 12,
              engagementRate: 4.2,
              monthlyBudget: 5000,
              lastActivity: new Date(),
            },
            {
              id: 'client-2', 
              name: 'Tech Startup Inc',
              type: 'startup',
              status: 'ACTIVE',
              logoUrl: undefined,
              performanceScore: 92,
              activeCampaigns: 8,
              engagementRate: 6.8,
              monthlyBudget: 3000,
              lastActivity: new Date(),
            },
            {
              id: 'client-3',
              name: 'Local Coffee Shop',
              type: 'business', 
              status: 'ACTIVE',
              logoUrl: undefined,
              performanceScore: 76,
              activeCampaigns: 5,
              engagementRate: 3.9,
              monthlyBudget: 1500,
              lastActivity: new Date(),
            }
          ]
        });
      }
      
      // Fetch metrics - add demo metrics if API fails  
      try {
        await refreshMetrics();
      } catch (error) {
        // Add demo metrics for testing
        dispatch({
          type: 'SET_METRICS',
          payload: {
            totalClients: 3,
            activeClients: 3,
            activeCampaigns: 25,
            totalCampaigns: 45,
            totalRevenue: 9500,
            marketplaceRevenue: 1425,
            teamUtilization: 84,
            avgClientSatisfaction: 4.3,
          }
        });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      // For demo purposes, default to service provider even on error
      console.log('📋 ServiceProvider: Error occurred, defaulting to service_provider for demo');
      dispatch({
        type: 'SET_ORGANIZATION',
        payload: {
          id: orgId!,
          name: 'Demo Service Provider',
          type: 'service_provider',
        },
      });
      
      // Set basic user data for demo
      dispatch({ 
        type: 'SET_USER', 
        payload: {
          id: 'demo-user',
          name: 'Demo User', 
          email: 'demo@serviceprovider.com',
          role: 'ADMIN',
          permissions: [
            {
              resource: '*',
              actions: ['read', 'write', 'delete', 'admin'],
              scope: 'organization',
            }
          ]
        }
      });
      
      // Add demo clients and metrics for testing
      dispatch({
        type: 'SET_CLIENTS',
        payload: [
          {
            id: 'client-1',
            name: 'Municipal Corp',
            type: 'municipality',
            status: 'ACTIVE',
            logoUrl: undefined,
            performanceScore: 85,
            activeCampaigns: 12,
            engagementRate: 4.2,
            monthlyBudget: 5000,
            lastActivity: new Date(),
          },
          {
            id: 'client-2', 
            name: 'Tech Startup Inc',
            type: 'startup',
            status: 'ACTIVE',
            logoUrl: undefined,
            performanceScore: 92,
            activeCampaigns: 8,
            engagementRate: 6.8,
            monthlyBudget: 3000,
            lastActivity: new Date(),
          },
          {
            id: 'client-3',
            name: 'Local Coffee Shop',
            type: 'business', 
            status: 'ACTIVE',
            logoUrl: undefined,
            performanceScore: 76,
            activeCampaigns: 5,
            engagementRate: 3.9,
            monthlyBudget: 1500,
            lastActivity: new Date(),
          }
        ]
      });
      
      dispatch({
        type: 'SET_METRICS',
        payload: {
          totalClients: 3,
          activeClients: 3,
          activeCampaigns: 25,
          totalCampaigns: 45,
          totalRevenue: 9500,
          marketplaceRevenue: 1425,
          teamUtilization: 84,
          avgClientSatisfaction: 4.3,
        }
      });
      
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Refresh clients data
  const refreshClients = async () => {
    try {
      console.log('ServiceProviderContext refreshClients: using organizationId =', state.organizationId);
      const response = await fetch(`/api/service-provider/clients?organizationId=${state.organizationId}`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      const clients = await response.json();
      console.log('ServiceProviderContext refreshClients: fetched', clients.length, 'clients');
      dispatch({ type: 'SET_CLIENTS', payload: clients });
    } catch (error) {
      console.error('Failed to refresh clients:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to refresh client data',
      });
    }
  };

  // Refresh metrics data
  const refreshMetrics = async () => {
    try {
      const response = await fetch(`/api/service-provider/metrics?organizationId=${state.organizationId}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const metrics = await response.json();
      dispatch({ type: 'SET_METRICS', payload: metrics });
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
      // Don't set error for metrics failure, just log it
    }
  };

  // Switch client context
  const switchClient = async (client: ClientSummary | null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (client) {
        // Validate user has access to this client
        if (!hasPermission('client', 'read', client.id)) {
          throw new Error('Access denied to this client');
        }
        
        // Update context on server
        const response = await fetch('/api/context/switch-client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: client.id }),
        });
        
        if (!response.ok) throw new Error('Failed to switch client context');
      }
      
      dispatch({ type: 'SELECT_CLIENT', payload: client });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Failed to switch client:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to switch client',
      });
    }
  };

  // Set view mode
  const setViewMode = (mode: 'overview' | 'client-specific' | 'cross-client') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  // Check permissions
  const hasPermission = (resource: string, action: string, clientId?: string): boolean => {
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
  };

  // Get accessible clients based on permissions
  const getAccessibleClients = (): ClientSummary[] => {
    const user = state.currentUser;
    
    // Owners and admins can access all clients
    if (user.role === 'OWNER' || user.role === 'ADMIN') {
      return state.availableClients;
    }
    
    // Filter clients based on permissions
    return state.availableClients.filter(client =>
      hasPermission('client', 'read', client.id)
    );
  };

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