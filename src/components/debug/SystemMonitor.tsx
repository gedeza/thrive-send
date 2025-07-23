'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Eye, Database, Calendar, List } from 'lucide-react';

interface SystemStatus {
  timestamp: string;
  user: {
    id: string;
    email: string;
    clerkId: string;
    organizationId?: string;
  };
  recentContent: Array<{
    id: string;
    title: string;
    status: string;
    type: string;
    createdAt: string;
    scheduledAt?: string;
    authorId: string;
  }>;
  calendarEvents: Array<{
    id: string;
    title: string;
    contentId?: string;
    status: string;
    startTime: string;
    organizationId: string;
  }>;
  organizationContent?: Array<{
    id: string;
    title: string;
    status: string;
    authorId: string;
    createdAt: string;
  }>;
  summary: {
    totalUserContent: number;
    totalCalendarEvents: number;
    totalOrgContent?: number;
    contentWithEvents?: number;
  };
}

export function SystemMonitor() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchSystemStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/debug/system-status');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setSystemStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchSystemStatus();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
        >
          <Eye className="h-4 w-4 mr-2" />
          Debug Monitor
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <Card className="bg-white border-2 border-yellow-300 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              System Monitor
            </span>
            <div className="flex gap-1">
              <Button
                onClick={fetchSystemStatus}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="outline"
                size="sm"
              >
                ✕
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-3">
          {error && (
            <div className="text-red-600 bg-red-50 p-2 rounded">
              Error: {error}
            </div>
          )}

          {systemStatus && (
            <>
              {/* User Info */}
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-semibold">User: {systemStatus.user.email}</div>
                <div className="text-gray-600">
                  ID: {systemStatus.user.id}<br/>
                  Org: {systemStatus.user.organizationId || 'None'}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-semibold mb-1">Summary</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div>Content: {systemStatus.summary.totalUserContent}</div>
                  <div>Calendar: {systemStatus.summary.totalCalendarEvents}</div>
                  {systemStatus.summary.totalOrgContent !== undefined && (
                    <div>Org Content: {systemStatus.summary.totalOrgContent}</div>
                  )}
                  {systemStatus.summary.contentWithEvents !== undefined && (
                    <div>With Events: {systemStatus.summary.contentWithEvents}</div>
                  )}
                </div>
              </div>

              {/* Recent Content */}
              <div className="bg-green-50 p-2 rounded">
                <div className="font-semibold mb-1 flex items-center">
                  <List className="h-3 w-3 mr-1" />
                  Recent Content ({systemStatus.recentContent.length})
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {systemStatus.recentContent.slice(0, 5).map((content) => (
                    <div key={content.id} className="text-xs border-l-2 border-green-300 pl-2">
                      <div className="font-medium truncate">{content.title}</div>
                      <div className="text-gray-600 flex gap-2">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {content.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {content.type}
                        </Badge>
                      </div>
                      <div className="text-gray-500">
                        {new Date(content.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Events */}
              <div className="bg-purple-50 p-2 rounded">
                <div className="font-semibold mb-1 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Calendar Events ({systemStatus.calendarEvents.length})
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {systemStatus.calendarEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="text-xs border-l-2 border-purple-300 pl-2">
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-gray-600">
                        Content ID: {event.contentId || 'None'}
                      </div>
                      <div className="text-gray-500">
                        {new Date(event.startTime).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-gray-500 text-xs">
                Last updated: {new Date(systemStatus.timestamp).toLocaleTimeString()}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}