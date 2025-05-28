/**
 * Application routes
 * 
 * This file centralizes all route definitions to ensure consistency
 * across the application. Use these constants whenever linking to routes.
 */

export const ROUTES = {
  // Main routes
  HOME: '/',
  
  // Dashboard - explicitly use '/dashboard' for all dashboard links
  // This will be handled by a redirect page that points to the actual implementation
  DASHBOARD: '/dashboard',
  
  // Feature routes
  CALENDAR: '/content/calendar',
  ANALYTICS: '/analytics',
  CLIENTS: '/clients',
  CREATORS: '/creators',
  MESSAGES: '/messages',
  SETTINGS: '/settings',
  PROJECTS: '/projects',
  
  // Demo pages
  DEMO: '/demo',
  
  // Campaign routes
  CAMPAIGNS_NEW: '/campaigns/new',
  
  // Client specific routes
  CLIENT_DETAILS: (id: string) => `/clients/${id}`,
};
