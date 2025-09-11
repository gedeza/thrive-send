'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  FileText, 
  BarChart3, 
  CheckCircle, 
  Zap, 
  Clock,
  TrendingUp,
  Target,
  ArrowRight,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useServiceProvider } from '@/context/ServiceProviderContext';

export default function ServiceProviderDashboard() {
  const { state } = useServiceProvider();

  const features = [
    {
      title: 'Template Library',
      description: 'Cross-client template sharing with advanced customization',
      icon: <FileText className="h-8 w-8" />,
      href: '/service-provider/templates',
      color: 'bg-blue-500',
      stats: '45 shared templates',
      completed: true
    },
    {
      title: 'Client Analytics',
      description: 'Advanced analytics dashboard with cross-client insights',
      icon: <BarChart3 className="h-8 w-8" />,
      href: '/service-provider/analytics',
      color: 'bg-green-500',
      stats: '94% performance increase',
      completed: true
    },
    {
      title: 'Approval Workflows',
      description: 'Enhanced multi-step approval processes',
      icon: <CheckCircle className="h-8 w-8" />,
      href: '/service-provider/approvals',
      color: 'bg-purple-500',
      stats: '127 items processed',
      completed: true
    },
    {
      title: 'Bulk Operations',
      description: 'Execute operations across multiple clients simultaneously',
      icon: <Zap className="h-8 w-8" />,
      href: '/service-provider/bulk-operations',
      color: 'bg-orange-500',
      stats: '87.5% success rate',
      completed: true
    },
    {
      title: 'Content Scheduler',
      description: 'Advanced scheduling with timezone optimization',
      icon: <Clock className="h-8 w-8" />,
      href: '/service-provider/scheduling',
      color: 'bg-teal-500',
      stats: '156 scheduled posts',
      completed: true
    }
  ];

  const quickStats = [
    { label: 'Active Clients', value: '3', icon: <Users className="h-5 w-5" />, color: 'text-blue-600' },
    { label: 'Templates Shared', value: '45', icon: <FileText className="h-5 w-5" />, color: 'text-green-600' },
    { label: 'Success Rate', value: '94.2%', icon: <Target className="h-5 w-5" />, color: 'text-purple-600' },
    { label: 'Monthly Growth', value: '+23%', icon: <TrendingUp className="h-5 w-5" />, color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            Service Provider Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage content operations across multiple clients with advanced B2B2G features
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Star className="h-3 w-3 mr-1" />
            Week 2 Complete
          </Badge>
          <Badge variant="secondary">
            Enhanced Content Features
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Overview */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">B2B2G Service Provider Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Icon and Status */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg text-white ${feature.color}`}>
                      {feature.icon}
                    </div>
                    {feature.completed && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {feature.description}
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      {feature.stats}
                    </p>
                  </div>
                  
                  {/* Action */}
                  <Link href={feature.href}>
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      Access {feature.title}
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Implementation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Week 2 Implementation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800">Day 1 Complete</h4>
                <p className="text-sm text-green-600 mt-1">Cross-client template sharing system</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800">Day 2 Complete</h4>
                <p className="text-sm text-green-600 mt-1">Advanced analytics & performance metrics</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800">Day 3 Complete</h4>
                <p className="text-sm text-green-600 mt-1">Approval workflows, bulk ops & scheduling</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                🚀 All Week 2 Enhanced Content Features have been successfully implemented with full B2B2G service provider architecture.
                Each feature includes comprehensive APIs, service layers, and interactive UI components with demo data for immediate testing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/service-provider/templates">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-sm">Browse Templates</span>
              </Button>
            </Link>
            <Link href="/service-provider/analytics">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm">View Analytics</span>
              </Button>
            </Link>
            <Link href="/service-provider/bulk-operations">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Zap className="h-5 w-5" />
                <span className="text-sm">Bulk Operations</span>
              </Button>
            </Link>
            <Link href="/service-provider/scheduling">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Schedule Content</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}