'use client';

import React from 'react';
import { Plus, Users, BarChart3, FileText, Zap, Calendar, Settings, UserCog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();
  
  const actions = [
    {
      icon: Plus,
      label: 'New Campaign',
      description: 'Create multi-client campaign',
      color: 'blue',
      onClick: () => console.log('New Campaign'),
    },
    {
      icon: Users,
      label: 'Add Client',
      description: 'Onboard new client',
      color: 'green',
      onClick: () => router.push('/clients/new'),
    },
    {
      icon: UserCog,
      label: 'Manage Clients',
      description: 'Full client management',
      color: 'blue',
      onClick: () => router.push('/clients'),
    },
    {
      icon: Calendar,
      label: 'Schedule Content',
      description: 'Bulk content scheduling',
      color: 'purple',
      onClick: () => console.log('Schedule Content'),
    },
    {
      icon: Zap,
      label: 'Marketplace Boosts',
      description: 'Recommend performance boosts',
      color: 'orange',
      onClick: () => console.log('Marketplace Boosts'),
    },
    {
      icon: FileText,
      label: 'Generate Report',
      description: 'Cross-client performance report',
      color: 'gray',
      onClick: () => console.log('Generate Report'),
    },
    {
      icon: Settings,
      label: 'Team Settings',
      description: 'Manage team assignments',
      color: 'indigo',
      onClick: () => console.log('Team Settings'),
    },
  ];

  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    green: 'text-green-600 bg-green-50 hover:bg-green-100',
    purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
    orange: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
    gray: 'text-gray-600 bg-gray-50 hover:bg-gray-100',
    indigo: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={action.onClick}
              className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-gray-50"
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClasses[action.color as keyof typeof colorClasses]}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">{action.label}</div>
                <div className="text-sm text-gray-500">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}