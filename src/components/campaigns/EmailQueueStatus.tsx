'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Play, 
  Pause, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface CampaignStatusData {
  campaignId: string;
  campaignName: string;
  status: string;
  summary: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    processingJobs: number;
    totalSent: number;
    totalFailed: number;
    totalRecipients: number;
  };
  queueStats: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    total: number;
  };
  lastChecked: string;
}

interface EmailQueueStatusProps {
  campaignId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function EmailQueueStatus({ 
  campaignId, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: EmailQueueStatusProps) {
  const [status, setStatus] = useState<CampaignStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch(`/api/campaigns/${campaignId}/status`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaign status');
      }

      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to fetch campaign status');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSendCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchSize: 100,
          priority: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send campaign');
      }

      const data = await response.json();
      toast.success(`Campaign queued successfully! ${data.data.recipientCount} recipients`);
      
      // Refresh status after sending
      setTimeout(fetchStatus, 1000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send campaign');
    }
  };

  const handlePauseCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/pause`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to pause campaign');
      }

      toast.success('Campaign paused successfully');
      fetchStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to pause campaign');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [campaignId]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button onClick={fetchStatus} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED_WITH_ERRORS':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING_WITH_ERRORS':
        return 'bg-orange-100 text-orange-800';
      case 'NOT_SENT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PROCESSING':
        return <Clock className="h-4 w-4" />;
      case 'COMPLETED_WITH_ERRORS':
        return <AlertCircle className="h-4 w-4" />;
      case 'PROCESSING_WITH_ERRORS':
        return <AlertCircle className="h-4 w-4" />;
      case 'NOT_SENT':
        return <Mail className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  if (!status) return null;

  const completionPercentage = status.summary.totalRecipients > 0 
    ? (status.summary.totalSent / status.summary.totalRecipients) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Queue Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            {status.status === 'NOT_SENT' && (
              <Button onClick={handleSendCampaign} size="sm">
                <Play className="h-4 w-4 mr-2" />
                Send Campaign
              </Button>
            )}
            {status.status === 'PROCESSING' && (
              <Button onClick={handlePauseCampaign} variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campaign Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(status.status)}>
              {getStatusIcon(status.status)}
              {status.status.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-gray-600">
              {status.campaignName}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
          </span>
        </div>

        {/* Progress Bar */}
        {status.summary.totalRecipients > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Email Delivery Progress</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {status.summary.totalSent}
            </div>
            <div className="text-sm text-gray-500">Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {status.summary.totalFailed}
            </div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {status.summary.processingJobs}
            </div>
            <div className="text-sm text-gray-500">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {status.summary.totalRecipients}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>

        {/* Queue Statistics */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Queue Statistics
          </h4>
          <div className="grid grid-cols-5 gap-2 text-sm">
            <div className="text-center">
              <div className="font-medium text-yellow-600">
                {status.queueStats.waiting}
              </div>
              <div className="text-gray-500">Waiting</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-blue-600">
                {status.queueStats.active}
              </div>
              <div className="text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600">
                {status.queueStats.completed}
              </div>
              <div className="text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-red-600">
                {status.queueStats.failed}
              </div>
              <div className="text-gray-500">Failed</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-600">
                {status.queueStats.total}
              </div>
              <div className="text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}