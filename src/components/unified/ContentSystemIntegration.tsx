"use client";

/**
 * Content System Integration Component
 * Preserves existing content management architecture while enabling unified workflows
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  FileText, 
  Workflow, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Zap,
  Settings,
  Database,
  Sync,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnifiedContent } from '@/context/unified-content-context';
import { UnifiedContentItem } from '@/lib/services/unified-content-service';

// Integration status types
type IntegrationStatus = 'connected' | 'partial' | 'disconnected' | 'error';

interface SystemStatus {
  name: string;
  status: IntegrationStatus;
  description: string;
  lastSync?: string;
  itemCount: number;
  features: string[];
  preservedFeatures: string[];
}

// Architecture preservation component
function ArchitecturePreservationPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Architecture Preservation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            The unified system preserves all existing functionality while adding cross-system capabilities.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Content Management System</h4>
              <p className="text-sm text-green-700">
                All existing content creation, editing, approval workflows, and analytics remain unchanged.
                The system continues to function independently while gaining unified capabilities.
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {[
                  'Content Creation',
                  'Approval Workflows', 
                  'Analytics Dashboard',
                  'User Permissions',
                  'Content Categories',
                  'Publishing Options'
                ].map(feature => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Calendar System</h4>
              <p className="text-sm text-blue-700">
                Calendar scheduling, event management, and social media integration remain fully functional.
                All existing calendar features are preserved and enhanced with content management integration.
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {[
                  'Event Scheduling',
                  'Social Platforms',
                  'Template System',
                  'Drag & Drop',
                  'Time Management',
                  'Publishing Queue'
                ].map(feature => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900">Unified Enhancements</h4>
              <p className="text-sm text-purple-700">
                New unified capabilities are added as an overlay, providing cross-system workflows
                without modifying existing system architectures.
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {[
                  'Cross-System Sync',
                  'Unified Content View',
                  'Workflow Bridges',
                  'Shared Templates',
                  'Combined Analytics',
                  'Smart Navigation'
                ].map(feature => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// System status component
function SystemStatusPanel() {
  const { state } = useUnifiedContent();
  
  const getSystemStatuses = (): SystemStatus[] => {
    const calendarItems = state.items.filter(item => item.type === 'calendar-event' || item.type === 'unified');
    const contentItems = state.items.filter(item => item.type === 'content-item' || item.type === 'unified');
    const unifiedItems = state.items.filter(item => item.type === 'unified');

    return [
      {
        name: 'Content Management System',
        status: contentItems.length > 0 ? 'connected' : 'partial',
        description: 'Core content creation and management system',
        lastSync: state.lastSyncAt || undefined,
        itemCount: contentItems.length,
        features: [
          'Content Creation & Editing',
          'Approval Workflows',
          'User Management',
          'Analytics Dashboard',
          'Media Management',
          'SEO Optimization'
        ],
        preservedFeatures: [
          'All existing API endpoints',
          'Database schema unchanged',
          'User interfaces preserved',
          'Existing workflows maintained'
        ]
      },
      {
        name: 'Calendar System',
        status: calendarItems.length > 0 ? 'connected' : 'partial',
        description: 'Content scheduling and calendar management',
        lastSync: state.lastSyncAt || undefined,
        itemCount: calendarItems.length,
        features: [
          'Event Scheduling',
          'Calendar Views',
          'Social Media Integration',
          'Template Application',
          'Drag & Drop Interface',
          'Time Zone Handling'
        ],
        preservedFeatures: [
          'Calendar UI unchanged',
          'Event creation flow preserved',
          'Social platform integrations intact',
          'Template system enhanced'
        ]
      },
      {
        name: 'Unified Workflow System',
        status: unifiedItems.length > 0 ? 'connected' : 'partial',
        description: 'Cross-system integration and unified workflows',
        lastSync: state.lastSyncAt || undefined,
        itemCount: unifiedItems.length,
        features: [
          'Cross-System Synchronization',
          'Unified Content View',
          'Workflow Bridging',
          'Shared State Management',
          'Real-time Updates',
          'Analytics Integration'
        ],
        preservedFeatures: [
          'Non-intrusive integration',
          'Optional unified workflows',
          'Backward compatibility',
          'Independent system operation'
        ]
      }
    ];
  };

  const systemStatuses = getSystemStatuses();

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
    }
  };

  const getStatusIcon = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'partial': return <AlertTriangle className="h-4 w-4" />;
      case 'disconnected': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systemStatuses.map((system) => (
            <div key={system.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={cn("flex items-center gap-1", getStatusColor(system.status))}>
                    {getStatusIcon(system.status)}
                    {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                  </Badge>
                  <h3 className="font-medium">{system.name}</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {system.itemCount} items
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {system.description}
              </p>

              <Tabs defaultValue="features" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="preserved">Preserved</TabsTrigger>
                </TabsList>
                
                <TabsContent value="features" className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {system.features.map(feature => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="preserved" className="mt-3">
                  <div className="space-y-1">
                    {system.preservedFeatures.map(feature => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {system.lastSync && (
                <div className="text-xs text-muted-foreground mt-2">
                  Last sync: {new Date(system.lastSync).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Data flow visualization component
function DataFlowVisualization() {
  const { state } = useUnifiedContent();

  const getDataFlowStats = () => {
    const totalItems = state.items.length;
    const calendarOnly = state.items.filter(item => item.type === 'calendar-event').length;
    const contentOnly = state.items.filter(item => item.type === 'content-item').length;
    const unified = state.items.filter(item => item.type === 'unified').length;
    const synced = state.items.filter(item => item.syncStatus === 'synced').length;

    return { totalItems, calendarOnly, contentOnly, unified, synced };
  };

  const { totalItems, calendarOnly, contentOnly, unified, synced } = getDataFlowStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sync className="h-5 w-5" />
          Data Flow & Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Flow Diagram */}
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-sm font-medium">Calendar</div>
              <div className="text-xs text-muted-foreground">{calendarOnly} items</div>
            </div>

            <div className="flex items-center space-x-2">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Workflow className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-xs font-medium mt-1">Unified</div>
                <div className="text-xs text-muted-foreground">{unified} items</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-sm font-medium">Content</div>
              <div className="text-xs text-muted-foreground">{contentOnly} items</div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
              <div className="text-xs text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{unified}</div>
              <div className="text-xs text-muted-foreground">Unified</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{synced}</div>
              <div className="text-xs text-muted-foreground">Synced</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {totalItems > 0 ? Math.round((synced / totalItems) * 100) : 0}%
              </div>
              <div className="text-xs text-muted-foreground">Sync Rate</div>
            </div>
          </div>

          {/* Data Preservation Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Data Integrity:</strong> All existing data remains in its original systems. 
              The unified layer creates references and maintains synchronization without data migration.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}

// Main integration component
export function ContentSystemIntegration() {
  const { state, actions } = useUnifiedContent();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize integration on mount
  useEffect(() => {
    const initializeIntegration = async () => {
      try {
        // Load existing content from all systems
        await actions.loadContent();
        setIsInitialized(true);
      } catch (_error) {
        console.error("", _error);
      }
    };

    initializeIntegration();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Initializing content system integration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content System Integration</h2>
          <p className="text-muted-foreground">
            Unified workflow while preserving existing system architectures
          </p>
        </div>
        
        <Button 
          onClick={() => actions.syncAllContent()}
          disabled={state.syncStatus === 'syncing'}
          className="flex items-center gap-2"
        >
          <Sync className={cn("h-4 w-4", state.syncStatus === 'syncing' && "animate-spin")} />
          {state.syncStatus === 'syncing' ? 'Syncing...' : 'Sync All'}
        </Button>
      </div>

      {/* Integration Status */}
      {state.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Integration Error: {state.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ArchitecturePreservationPanel />
          <DataFlowVisualization />
        </div>
        <div>
          <SystemStatusPanel />
        </div>
      </div>

      {/* Integration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Preserved Systems
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Content Management API</li>
                <li>• Calendar Event System</li>
                <li>• User Authentication</li>
                <li>• Existing Workflows</li>
                <li>• Database Schemas</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                Enhanced Features
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Cross-system synchronization</li>
                <li>• Unified content view</li>
                <li>• Workflow bridging</li>
                <li>• Shared templates</li>
                <li>• Combined analytics</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Data Protection
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• No data migration required</li>
                <li>• Original systems intact</li>
                <li>• Reference-based linking</li>
                <li>• Backward compatibility</li>
                <li>• Independent operation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}