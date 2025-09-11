/**
 * Mobile API Configuration
 * Handles API endpoint resolution for mobile device access
 */

// Get the appropriate API base URL based on environment
export function getApiBaseUrl(): string {
  // If running in browser and NEXT_PUBLIC_API_URL is set, use it
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // If running in browser, try to detect if we're on mobile/external network
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port || '3000';
    
    // If accessing via IP address (mobile device), use the same IP for API calls
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:${port}/api`;
    }
  }
  
  // Default to localhost for server-side or local development
  return '/api';
}

// Get WebSocket URL for real-time features
export function getWebSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // If accessing via IP address, use the same IP for WebSocket
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:3001/analytics`;
    }
  }
  
  return 'ws://localhost:3001/analytics';
}

// Create a fetch wrapper that handles mobile network requests
export async function mobileFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Add credentials for CORS requests
    credentials: 'include',
    ...options,
  };
  
  try {
    const response = await fetch(fullUrl, defaultOptions);
    
    // Log errors in development for debugging
    if (!response.ok && process.env.NODE_ENV === 'development') {
      console.error(`Mobile fetch error: ${response.status} ${response.statusText}`, {
        url: fullUrl,
        options: defaultOptions,
      });
    }
    
    return response;
  } catch (_error) {
    console.error('Mobile fetch network error:', error, {
      url: fullUrl,
      baseUrl,
      originalUrl: url,
    });
    throw _error;
  }
}

// Debug helper to log network configuration
export function logMobileNetworkConfig() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Mobile Network Configuration:', {
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
      port: typeof window !== 'undefined' ? window.location.port : 'N/A',
      apiBaseUrl: getApiBaseUrl(),
      wsUrl: getWebSocketUrl(),
      environment: process.env.NODE_ENV,
      isClient: typeof window !== 'undefined',
    });
  }
}