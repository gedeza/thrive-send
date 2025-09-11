'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { getUserCurrency, getUserCurrencyAsync, getUserLocale, SUPPORTED_CURRENCIES } from '@/lib/utils/currency';

// Types based on Settings TDD specification
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    digest: 'daily' | 'weekly' | 'monthly' | 'never';
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'connections';
    showActivity: boolean;
    allowSearchIndexing: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    colorScheme?: string;
    density: 'compact' | 'comfortable' | 'spacious';
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
    highContrast: boolean;
  };
  preferences: {
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
  };
}

export interface OrganizationSettings {
  branding: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    logoVariants: {
      light: string;
      dark: string;
      favicon: string;
    };
    customDomain?: string;
  };
  defaults: {
    timezone: string;
    currency: string;
    dateFormat: string;
    campaignDefaults: Record<string, any>;
  };
  features: {
    aiEnabled: boolean;
    advancedAnalytics: boolean;
    whiteLabeling: boolean;
    customIntegrations: boolean;
  };
  notifications: {
    systemUpdates: boolean;
    billingAlerts: boolean;
    securityAlerts: boolean;
    performanceReports: boolean;
  };
}

export interface SettingsState {
  // Data
  userSettings: UserSettings | null;
  organizationSettings: OrganizationSettings | null;
  
  // UI State
  loading: boolean;
  saving: boolean;
  error: string | null;
  activeSection: string;
  hasUnsavedChanges: boolean;
  
  // Cache
  lastFetch: number | null;
  cacheExpiry: number; // TTL in milliseconds
}

export type SettingsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_SECTION'; payload: string }
  | { type: 'SET_USER_SETTINGS'; payload: UserSettings }
  | { type: 'SET_ORGANIZATION_SETTINGS'; payload: OrganizationSettings }
  | { type: 'UPDATE_USER_SETTING'; payload: { path: string; value: unknown } }
  | { type: 'UPDATE_ORGANIZATION_SETTING'; payload: { path: string; value: unknown } }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'RESET_ERROR' }
  | { type: 'ROLLBACK_CHANGES' };

// Default settings values
const defaultUserSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    marketing: false,
    digest: 'weekly'
  },
  privacy: {
    profileVisibility: 'connections',
    showActivity: true,
    allowSearchIndexing: false
  },
  appearance: {
    theme: 'system',
    density: 'comfortable',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false
  },
  preferences: {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    currency: getUserCurrency() // Dynamic based on user's location/preference
  }
};

const defaultOrganizationSettings: OrganizationSettings = {
  branding: {
    colors: {
      primary: '#007BFF',
      secondary: '#6C757D',
      accent: '#28A745'
    },
    logoVariants: {
      light: '',
      dark: '',
      favicon: ''
    }
  },
  defaults: {
    timezone: 'UTC',
    currency: getUserCurrency(), // Dynamic based on organization's location
    dateFormat: 'MM/DD/YYYY',
    campaignDefaults: {}
  },
  features: {
    aiEnabled: true,
    advancedAnalytics: true,
    whiteLabeling: false,
    customIntegrations: false
  },
  notifications: {
    systemUpdates: true,
    billingAlerts: true,
    securityAlerts: true,
    performanceReports: true
  }
};

const initialState: SettingsState = {
  userSettings: null,
  organizationSettings: null,
  loading: false,
  saving: false,
  error: null,
  activeSection: 'profile',
  hasUnsavedChanges: false,
  lastFetch: null,
  cacheExpiry: 5 * 60 * 1000 // 5 minutes
};

// Reducer for settings state management
function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_SAVING':
      return { ...state, saving: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false, saving: false };
    
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
    
    case 'SET_USER_SETTINGS':
      return { 
        ...state, 
        userSettings: action.payload, 
        loading: false, 
        error: null,
        lastFetch: Date.now()
      };
    
    case 'SET_ORGANIZATION_SETTINGS':
      return { 
        ...state, 
        organizationSettings: action.payload, 
        loading: false, 
        error: null,
        lastFetch: Date.now()
      };
    
    case 'UPDATE_USER_SETTING': {
      if (!state.userSettings) return state;
      
      const updatedSettings = { ...state.userSettings };
      const pathParts = action.payload.path.split('.');
      let current: Record<string, unknown> = updatedSettings;
      
      // Navigate to the parent of the target property
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      // Set the value
      current[pathParts[pathParts.length - 1]] = action.payload.value;
      
      return {
        ...state,
        userSettings: updatedSettings,
        hasUnsavedChanges: true,
        error: null
      };
    }
    
    case 'UPDATE_ORGANIZATION_SETTING': {
      if (!state.organizationSettings) return state;
      
      const updatedSettings = { ...state.organizationSettings };
      const pathParts = action.payload.path.split('.');
      let current: Record<string, unknown> = updatedSettings;
      
      // Navigate to the parent of the target property
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      // Set the value
      current[pathParts[pathParts.length - 1]] = action.payload.value;
      
      return {
        ...state,
        organizationSettings: updatedSettings,
        hasUnsavedChanges: true,
        error: null
      };
    }
    
    case 'SET_UNSAVED_CHANGES':
      return { ...state, hasUnsavedChanges: action.payload };
    
    case 'RESET_ERROR':
      return { ...state, error: null };
    
    case 'ROLLBACK_CHANGES':
      // This would require keeping a backup of original settings
      // For now, we'll reload from server
      return { ...state, hasUnsavedChanges: false };
    
    default:
      return state;
  }
}

// Context interfaces
interface SettingsContextType {
  // State
  state: SettingsState;
  
  // Actions
  setActiveSection: (section: string) => void;
  updateUserSetting: (path: string, value: unknown) => void;
  updateOrganizationSetting: (path: string, value: unknown) => void;
  saveUserSettings: () => Promise<void>;
  saveOrganizationSettings: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  resetError: () => void;
  
  // Utilities
  isCacheValid: () => boolean;
  hasPermission: (permission: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Settings Provider Component
interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const { user } = useUser();
  const { organization } = useOrganization();

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    if (!state.lastFetch) return false;
    return Date.now() - state.lastFetch < state.cacheExpiry;
  }, [state.lastFetch, state.cacheExpiry]);

  // Check user permissions
  const hasPermission = useCallback((permission: string) => {
    // Basic permission checking - in production this would be more sophisticated
    if (!user) return false;
    
    const userRole = user.publicMetadata?.role as string;
    
    switch (permission) {
      case 'manage_organization':
        return userRole === 'admin' || userRole === 'owner';
      case 'manage_integrations':
        return userRole === 'admin' || userRole === 'owner' || userRole === 'manager';
      case 'manage_profile':
        return true; // All users can manage their own profile
      default:
        return false;
    }
  }, [user]);

  // Fetch user settings from API
  const fetchUserSettings = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/settings/profile');
      if (response.ok) {
        const settings = await response.json();
        dispatch({ type: 'SET_USER_SETTINGS', payload: settings });
      } else {
        // Use default settings if API fails
        dispatch({ type: 'SET_USER_SETTINGS', payload: defaultUserSettings });
      }
    } catch (_error) {
      console.error("", _error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load user settings' });
      // Use default settings as fallback
      dispatch({ type: 'SET_USER_SETTINGS', payload: defaultUserSettings });
    }
  }, [user?.id]);

  // Fetch organization settings from API
  const fetchOrganizationSettings = useCallback(async () => {
    if (!organization?.id) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`/api/settings/organization?orgId=${organization.id}`);
      if (response.ok) {
        const settings = await response.json();
        dispatch({ type: 'SET_ORGANIZATION_SETTINGS', payload: settings });
      } else {
        // Use default settings if API fails
        dispatch({ type: 'SET_ORGANIZATION_SETTINGS', payload: defaultOrganizationSettings });
      }
    } catch (_error) {
      console.error("", _error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load organization settings' });
      // Use default settings as fallback
      dispatch({ type: 'SET_ORGANIZATION_SETTINGS', payload: defaultOrganizationSettings });
    }
  }, [organization?.id]);

  // Save user settings to API
  const saveUserSettings = useCallback(async () => {
    if (!state.userSettings || !user?.id) return;
    
    try {
      dispatch({ type: 'SET_SAVING', payload: true });
      
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state.userSettings),
      });

      if (response.ok) {
        dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
        dispatch({ type: 'SET_SAVING', payload: false });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (_error) {
      console.error("", _error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save settings. Please try again.' });
    }
  }, [state.userSettings, user?.id]);

  // Save organization settings to API
  const saveOrganizationSettings = useCallback(async () => {
    if (!state.organizationSettings || !organization?.id) return;
    
    if (!hasPermission('manage_organization')) {
      dispatch({ type: 'SET_ERROR', payload: 'You do not have permission to modify organization settings' });
      return;
    }
    
    try {
      dispatch({ type: 'SET_SAVING', payload: true });
      
      const response = await fetch('/api/settings/organization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...state.organizationSettings,
          organizationId: organization.id
        }),
      });

      if (response.ok) {
        dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
        dispatch({ type: 'SET_SAVING', payload: false });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (_error) {
      console.error("", _error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save organization settings. Please try again.' });
    }
  }, [state.organizationSettings, organization?.id, hasPermission]);

  // Refresh all settings from server
  const refreshSettings = useCallback(async () => {
    await Promise.all([
      fetchUserSettings(),
      fetchOrganizationSettings()
    ]);
  }, [fetchUserSettings, fetchOrganizationSettings]);

  // Action creators
  const setActiveSection = useCallback((section: string) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  }, []);

  const updateUserSetting = useCallback((path: string, value: unknown) => {
    dispatch({ type: 'UPDATE_USER_SETTING', payload: { path, value } });
  }, []);

  const updateOrganizationSetting = useCallback((path: string, value: unknown) => {
    if (!hasPermission('manage_organization')) {
      dispatch({ type: 'SET_ERROR', payload: 'You do not have permission to modify organization settings' });
      return;
    }
    dispatch({ type: 'UPDATE_ORGANIZATION_SETTING', payload: { path, value } });
  }, [hasPermission]);

  const resetError = useCallback(() => {
    dispatch({ type: 'RESET_ERROR' });
  }, []);

  // Auto-detect currency on first load (Amazon-style)
  useEffect(() => {
    let mounted = true;

    async function initializeCurrency() {
      try {
        const detectedCurrency = await getUserCurrencyAsync();
        
        if (mounted && detectedCurrency && SUPPORTED_CURRENCIES[detectedCurrency]) {
          // Update default settings with detected currency
          const updatedDefaults = {
            ...defaultUserSettings,
            preferences: {
              ...defaultUserSettings.preferences,
              currency: detectedCurrency
            }
          };
          
          // Only update if we don't have user settings yet
          if (!state.userSettings) {
            dispatch({ type: 'SET_USER_SETTINGS', payload: updatedDefaults });
          }
          
          console.log(`🌍 ThriveSend: Auto-detected currency ${detectedCurrency} for your region`);
        }
      } catch (_error) {
        console.warn('Currency auto-detection failed:', error);
      }
    }

    // Run auto-detection on first load
    if (!state.userSettings) {
      initializeCurrency();
    }

    return () => {
      mounted = false;
    };
  }, [state.userSettings]);

  // Load settings on mount or when user/organization changes
  useEffect(() => {
    if (user?.id && (!state.userSettings || !isCacheValid())) {
      fetchUserSettings();
    }
  }, [user?.id, fetchUserSettings, state.userSettings, isCacheValid]);

  useEffect(() => {
    if (organization?.id && (!state.organizationSettings || !isCacheValid())) {
      fetchOrganizationSettings();
    }
  }, [organization?.id, fetchOrganizationSettings, state.organizationSettings, isCacheValid]);

  // Warn about unsaved changes before page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges]);

  const contextValue: SettingsContextType = {
    state,
    setActiveSection,
    updateUserSetting,
    updateOrganizationSetting,
    saveUserSettings,
    saveOrganizationSettings,
    refreshSettings,
    resetError,
    isCacheValid,
    hasPermission
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook to use settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Utility hooks for specific settings
export function useUserSettings() {
  const { state, updateUserSetting, saveUserSettings } = useSettings();
  return {
    settings: state.userSettings,
    updateSetting: updateUserSetting,
    saveSettings: saveUserSettings,
    loading: state.loading,
    saving: state.saving,
    error: state.error
  };
}

export function useOrganizationSettings() {
  const { state, updateOrganizationSetting, saveOrganizationSettings, hasPermission } = useSettings();
  return {
    settings: state.organizationSettings,
    updateSetting: updateOrganizationSetting,
    saveSettings: saveOrganizationSettings,
    loading: state.loading,
    saving: state.saving,
    error: state.error,
    canManage: hasPermission('manage_organization')
  };
}

export function useThemeSettings() {
  const { state, updateUserSetting } = useSettings();
  
  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    updateUserSetting('appearance.theme', theme);
  }, [updateUserSetting]);

  const setColorScheme = useCallback((colorScheme: string) => {
    updateUserSetting('appearance.colorScheme', colorScheme);
  }, [updateUserSetting]);

  const setDensity = useCallback((density: 'compact' | 'comfortable' | 'spacious') => {
    updateUserSetting('appearance.density', density);
  }, [updateUserSetting]);

  return {
    theme: state.userSettings?.appearance.theme || 'system',
    colorScheme: state.userSettings?.appearance.colorScheme,
    density: state.userSettings?.appearance.density || 'comfortable',
    fontSize: state.userSettings?.appearance.fontSize || 'medium',
    reducedMotion: state.userSettings?.appearance.reducedMotion || false,
    highContrast: state.userSettings?.appearance.highContrast || false,
    setTheme,
    setColorScheme,
    setDensity
  };
}