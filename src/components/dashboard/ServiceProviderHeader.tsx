'use client';

import React from 'react';
import { RefreshCw, Bell, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { ServiceProviderUser, ClientSummary } from '@/context/ServiceProviderContext';

interface ServiceProviderHeaderProps {
  organizationName: string;
  currentUser: ServiceProviderUser;
  selectedClient?: ClientSummary | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ServiceProviderHeader({
  organizationName,
  currentUser,
  selectedClient,
  onRefresh,
  isRefreshing = false,
}: ServiceProviderHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left side - Logo and context */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            {/* ThriveSend Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">T</span>
              </div>
              <span className="font-bold text-lg sm:text-xl text-gray-900 hidden sm:block">ThriveSend</span>
            </div>

            {/* Separator */}
            <div className="h-4 sm:h-6 w-px bg-gray-300 hidden sm:block"></div>

            {/* Organization and Context */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{organizationName}</div>
                <div className="text-xs text-gray-500 truncate">
                  {selectedClient ? (
                    <span className="truncate">Client: {selectedClient.name}</span>
                  ) : (
                    <span>Service Provider</span>
                  )}
                </div>
              </div>
              {selectedClient && (
                <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                  {selectedClient.type}
                </Badge>
              )}
            </div>
          </div>

          {/* Right side - Actions and user menu */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Refresh button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 relative">
                  <Bell className="h-4 w-4" />
                  {/* Notification badge */}
                  <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 sm:w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="space-y-1">
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="font-medium">Campaign needs approval</div>
                    <div className="text-sm text-gray-500">Municipal Corp • 2 minutes ago</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="font-medium">New client inquiry</div>
                    <div className="text-sm text-gray-500">Lead from contact form • 1 hour ago</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="font-medium">Performance milestone reached</div>
                    <div className="text-sm text-gray-500">Tech Startup Inc • 3 hours ago</div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-blue-600">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings - Hidden on mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 hidden sm:flex">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Organization Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Team Management
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Preferences
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 sm:h-9 px-1 sm:px-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`} />
                      <AvatarFallback className="text-xs">
                        {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-24">{currentUser.name}</div>
                      <div className="text-xs text-gray-500">{currentUser.role}</div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <div className="font-medium">{currentUser.name}</div>
                    <div className="text-sm text-gray-500">{currentUser.email}</div>
                    <div className="text-xs text-blue-600 mt-1">{currentUser.role}</div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Account Preferences
                </DropdownMenuItem>
                {/* Mobile-only settings access */}
                <DropdownMenuItem className="sm:hidden">
                  <Settings className="h-4 w-4 mr-2" />
                  Organization Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}