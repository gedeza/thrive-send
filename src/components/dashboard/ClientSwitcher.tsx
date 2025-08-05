'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus, BarChart3, Settings, Building, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useClientSwitcher, type ClientSummary } from '@/context/ServiceProviderContext';
import { useRouter } from 'next/navigation';

interface ClientSwitcherProps {
  showCreateClient?: boolean;
  onCreateClient?: () => void;
  onViewAllAnalytics?: () => void;
  onViewAllClients?: () => void;
  className?: string;
}

export function ClientSwitcher({
  showCreateClient = true,
  onCreateClient,
  onViewAllAnalytics,
  onViewAllClients,
  className = '',
}: ClientSwitcherProps) {
  const { selectedClient, availableClients, switchClient, isLoading } = useClientSwitcher();
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

  // Filter clients based on search
  const filteredClients = availableClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle client selection
  const handleClientSelect = async (client: ClientSummary | null) => {
    setIsOpen(false);
    setSearchTerm('');
    await switchClient(client);
  };

  // Get client type icon
  const getClientTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'municipality':
        return <Building className="h-4 w-4" />;
      case 'business':
        return <BarChart3 className="h-4 w-4" />;
      case 'startup':
        return <Users className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50';
      case 'INACTIVE':
        return 'text-gray-600 bg-gray-50';
      case 'LEAD':
        return 'text-blue-600 bg-blue-50';
      case 'ARCHIVED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Client Switcher Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full max-w-md justify-between h-10 px-3 border-gray-200 hover:border-gray-300 bg-white"
      >
        <div className="flex items-center space-x-2 truncate">
          {selectedClient ? (
            <>
              {getClientTypeIcon(selectedClient.type)}
              <span className="truncate font-medium">{selectedClient.name}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedClient.status)}`}>
                {selectedClient.status}
              </span>
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">All Clients Overview</span>
            </>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border border-gray-200 bg-white max-h-96 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 border-gray-200 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* All Clients Overview Option */}
            <button
              onClick={() => handleClientSelect(null)}
              className={`w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                !selectedClient ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
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
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleClientSelect(client)}
                className={`w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  selectedClient?.id === client.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
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
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 truncate">{client.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-4">
                        <span>{client.activeCampaigns} campaigns</span>
                        <span>{client.engagementRate.toFixed(1)}% engagement</span>
                        {client.performanceScore && (
                          <span className="text-green-600">
                            Score: {client.performanceScore.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedClient?.id === client.id && (
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle quick actions
                      }}
                      className="h-6 w-6 p-0 hover:bg-gray-200"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </button>
            ))}

            {/* No results message */}
            {searchTerm && filteredClients.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <div className="text-sm">No clients found matching "{searchTerm}"</div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 p-3 space-y-2">
            {showCreateClient && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  onCreateClient?.();
                }}
                className="w-full justify-start h-9 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                onViewAllAnalytics?.();
              }}
              className="w-full justify-start h-9 text-sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View All Analytics
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                if (onViewAllClients) {
                  onViewAllClients();
                } else {
                  router.push('/clients');
                }
              }}
              className="w-full justify-start h-9 text-sm"
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

// Quick Client Stats Component for use in other places
export function ClientQuickStats({ client }: { client: ClientSummary }) {
  const getClientTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'municipality':
        return <Building className="h-4 w-4" />;
      case 'business':
        return <BarChart3 className="h-4 w-4" />;
      case 'startup':
        return <Users className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
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
      <div className="flex-1">
        <div className="font-medium text-gray-900">{client.name}</div>
        <div className="text-sm text-gray-500 flex items-center space-x-3">
          <span>{client.activeCampaigns} campaigns</span>
          <span>{client.engagementRate.toFixed(1)}% engagement</span>
        </div>
      </div>
      {client.performanceScore && (
        <div className="text-right">
          <div className="text-sm font-medium text-green-600">
            {client.performanceScore.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
      )}
    </div>
  );
}