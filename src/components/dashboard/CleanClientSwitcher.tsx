'use client';

import React, { useState, useRef, useEffect } from 'react';
import '@/lib/date-extensions';
import { ChevronDown, Search, Plus, BarChart3, Settings, Building, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useServiceProvider, type ClientSummary } from '@/context/ServiceProviderContext';
import { useRouter } from 'next/navigation';

// Enhanced interfaces from TDD
interface EnhancedClientSummary extends ClientSummary {
  performanceScore: number;
  trendDirection: 'up' | 'down' | 'stable';
  totalCampaigns?: number;
  monthlyBudget?: number;
  lastActivity?: Date;
}

interface CleanClientSwitcherProps {
  showCreateClient?: boolean;
  showQuickActions?: boolean;
  searchEnabled?: boolean;
  showClientStats?: boolean;
  onCreateClient?: () => void;
  onViewAllAnalytics?: () => void;
  onViewAllClients?: () => void;
  className?: string;
}

// Client type icons mapping
const getClientTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'municipality':
      return <Building className="h-4 w-4" />;
    case 'business':
      return <BarChart3 className="h-4 w-4" />;
    case 'startup':
      return <Zap className="h-4 w-4" />;
    case 'creator':
      return <Users className="h-4 w-4" />;
    default:
      return <Building className="h-4 w-4" />;
  }
};

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'INACTIVE':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'LEAD':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'ARCHIVED':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// Trend direction indicator
const getTrendIndicator = (direction: 'up' | 'down' | 'stable') => {
  switch (direction) {
    case 'up':
      return <span className="text-green-600">↗</span>;
    case 'down':
      return <span className="text-red-600">↘</span>;
    case 'stable':
      return <span className="text-gray-400">→</span>;
    default:
      return null;
  }
};

// Performance score color
const getPerformanceScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600 bg-green-50';
  if (score >= 80) return 'text-blue-600 bg-blue-50';
  if (score >= 70) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

export function CleanClientSwitcher({
  showCreateClient = true,
  showQuickActions = true,
  searchEnabled = true,
  showClientStats = true,
  onCreateClient,
  onViewAllAnalytics,
  onViewAllClients,
  className = '',
}: CleanClientSwitcherProps) {
  const { selectedClient, availableClients, switchClient, isLoading } = useServiceProvider();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced client filtering with search
  const filteredClients = availableClients.filter(client => {
    if (!searchEnabled || !searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.type.toLowerCase().includes(searchLower) ||
      client.status.toLowerCase().includes(searchLower)
    );
  });

  // Handle client selection
  const handleClientSelect = async (client: ClientSummary | null) => {
    setIsOpen(false);
    setSearchTerm('');
    await switchClient(client);
  };

  // Handle quick actions
  const handleQuickAction = (action: string, clientId?: string) => {
    setIsOpen(false);
    
    switch (action) {
      case 'analytics':
        if (clientId) {
          router.push(`/analytics?client=${clientId}`);
        }
        break;
      case 'campaigns':
        if (clientId) {
          router.push(`/campaigns?client=${clientId}`);
        }
        break;
      case 'settings':
        if (clientId) {
          router.push(`/clients/${clientId}/settings`);
        }
        break;
      default:
        console.log(`Quick action: ${action}`, clientId);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Enhanced Client Switcher Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full max-w-md justify-between h-12 px-4 border-gray-200 hover:border-gray-300 bg-white shadow-sm"
      >
        <div className="flex items-center space-x-3 truncate">
          {selectedClient ? (
            <>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {selectedClient.logoUrl ? (
                  <img 
                    src={selectedClient.logoUrl} 
                    alt={selectedClient.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getClientTypeIcon(selectedClient.type)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{selectedClient.name}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-0.5 ${getStatusColor(selectedClient.status)}`}
                  >
                    {selectedClient.status}
                  </Badge>
                </div>
                {showClientStats && (
                  <div className="text-xs text-muted-foreground">
                    {selectedClient.activeCampaigns} campaigns • {selectedClient.engagementRate.toFixed(1)}% engagement
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <span className="font-medium">All Clients Overview</span>
                <div className="text-xs text-muted-foreground">
                  {availableClients.length} clients • Cross-client analytics
                </div>
              </div>
            </>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Enhanced Dropdown Menu */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border border-gray-200 bg-white max-h-96 overflow-hidden">
          {/* Search Section */}
          {searchEnabled && (
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-gray-200 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto">
            {/* All Clients Overview Option */}
            <button
              onClick={() => handleClientSelect(null)}
              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                !selectedClient ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">All Clients Overview</div>
                    <div className="text-sm text-gray-500">
                      {availableClients.length} clients • Cross-client analytics
                    </div>
                  </div>
                </div>
                {!selectedClient && (
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                )}
              </div>
            </button>

            {/* Individual Clients */}
            {filteredClients.map((client) => {
              const enhancedClient = client as EnhancedClientSummary;
              
              return (
                <div
                  key={client.id}
                  className={`border-b border-gray-100 last:border-b-0 ${
                    selectedClient?.id === client.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <button
                    onClick={() => handleClientSelect(client)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {client.logoUrl ? (
                            <img 
                              src={client.logoUrl} 
                              alt={client.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getClientTypeIcon(client.type)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 truncate">{client.name}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-2 py-0.5 ${getStatusColor(client.status)}`}
                            >
                              {client.status}
                            </Badge>
                          </div>
                          
                          {showClientStats && (
                            <div className="text-sm text-gray-500 flex items-center space-x-4">
                              <span>{client.activeCampaigns} campaigns</span>
                              <span>{client.engagementRate.toFixed(1)}% engagement</span>
                              {enhancedClient.performanceScore && (
                                <div className="flex items-center gap-1">
                                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPerformanceScoreColor(enhancedClient.performanceScore)}`}>
                                    {enhancedClient.performanceScore.toFixed(1)}
                                  </span>
                                  {enhancedClient.trendDirection && getTrendIndicator(enhancedClient.trendDirection)}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {enhancedClient.lastActivity && (
                            <div className="text-xs text-gray-400 mt-1">
                              Last active: {new Date(enhancedClient.lastActivity).toRelativeTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {selectedClient?.id === client.id && (
                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        )}
                        
                        {showQuickActions && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAction('analytics', client.id);
                              }}
                              className="h-6 w-6 p-0 hover:bg-gray-200"
                            >
                              <BarChart3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAction('settings', client.id);
                              }}
                              className="h-6 w-6 p-0 hover:bg-gray-200"
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}

            {/* No results message */}
            {searchEnabled && searchTerm && filteredClients.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <div className="text-sm">No clients found matching "{searchTerm}"</div>
                <div className="text-xs mt-1">Try adjusting your search terms</div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 p-4 space-y-2">
            {showCreateClient && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  onCreateClient?.() || router.push('/clients/new');
                }}
                className="w-full justify-start h-10 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                onViewAllAnalytics?.() || router.push('/analytics');
              }}
              className="w-full justify-start h-10 text-sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View All Analytics
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                onViewAllClients?.() || router.push('/clients');
              }}
              className="w-full justify-start h-10 text-sm"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage All Clients
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// Enhanced Quick Client Stats Component
export function EnhancedClientQuickStats({ client }: { client: EnhancedClientSummary }) {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
        {client.logoUrl ? (
          <img 
            src={client.logoUrl} 
            alt={client.name}
            className="h-full w-full object-cover"
          />
        ) : (
          getClientTypeIcon(client.type)
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-900">{client.name}</h3>
          <Badge 
            variant="outline" 
            className={`text-xs px-2 py-0.5 ${getStatusColor(client.status)}`}
          >
            {client.status}
          </Badge>
        </div>
        
        <div className="text-sm text-gray-500 flex items-center space-x-4">
          <span>{client.activeCampaigns} campaigns</span>
          <span>{client.engagementRate.toFixed(1)}% engagement</span>
          {client.monthlyBudget && (
            <span>${client.monthlyBudget.toLocaleString()} budget</span>
          )}
        </div>
      </div>
      
      {client.performanceScore && (
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <div className={`text-sm font-medium px-2 py-1 rounded ${getPerformanceScoreColor(client.performanceScore)}`}>
              {client.performanceScore.toFixed(1)}
            </div>
            {client.trendDirection && getTrendIndicator(client.trendDirection)}
          </div>
          <div className="text-xs text-gray-500">Performance</div>
        </div>
      )}
    </div>
  );
}

export default CleanClientSwitcher;