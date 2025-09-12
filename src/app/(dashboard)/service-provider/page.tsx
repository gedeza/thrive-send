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
      stats: '45 shared templates',
      completed: true,
      priority: 1
    },
    {
      title: 'Client Analytics',
      description: 'Advanced analytics dashboard with cross-client insights',
      icon: <BarChart3 className="h-8 w-8" />,
      href: '/service-provider/analytics',
      stats: '94% performance increase',
      completed: true,
      priority: 2
    },
    {
      title: 'Approval Workflows',
      description: 'Enhanced multi-step approval processes',
      icon: <CheckCircle className="h-8 w-8" />,
      href: '/service-provider/approvals',
      stats: '127 items processed',
      completed: true,
      priority: 3
    },
    {
      title: 'Bulk Operations',
      description: 'Execute operations across multiple clients simultaneously',
      icon: <Zap className="h-8 w-8" />,
      href: '/service-provider/bulk-operations',
      stats: '87.5% success rate',
      completed: true,
      priority: 4
    },
    {
      title: 'Content Scheduler',
      description: 'Advanced scheduling with timezone optimization',
      icon: <Clock className="h-8 w-8" />,
      href: '/service-provider/scheduling',
      stats: '156 scheduled posts',
      completed: true,
      priority: 5
    }
  ];

  const quickStats = [
    { label: 'Active Clients', value: '3', icon: <Users className="h-5 w-5" /> },
    { label: 'Templates Shared', value: '45', icon: <FileText className="h-5 w-5" /> },
    { label: 'Success Rate', value: '94.2%', icon: <Target className="h-5 w-5" /> },
    { label: 'Monthly Growth', value: '+23%', icon: <TrendingUp className="h-5 w-5" /> }
  ];

  return (
    <div className="container mx-auto py-4 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <Card className="border border-primary bg-gradient-to-r from-primary/5 to-transparent hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Service Provider Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                      Manage content operations across multiple clients with advanced B2B2G features
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-success border-success/20 bg-success/5">
                    <Star className="h-3 w-3 mr-1" />
                    Week 2 Complete
                  </Badge>
                  <Badge variant="secondary" className="border">
                    Enhanced Content Features
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="border hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/10 text-muted-foreground">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Overview */}
        <div>
          <Card className="mb-6 border border-primary bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">B2B2G Service Provider Features</h2>
                  <p className="text-sm text-muted-foreground mt-1">Advanced tools for multi-client content management</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 group border">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Icon and Status */}
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary shadow-md">
                        {feature.icon}
                      </div>
                      {feature.completed && (
                        <Badge variant="outline" className="text-success border-success/20 bg-success/5">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ready
                        </Badge>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                        <span className="text-xs font-medium text-muted-foreground bg-muted/10 px-2 py-1 rounded">
                          Priority {feature.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                      <div className="p-2 bg-muted/5 rounded border-l-2 border-primary">
                        <p className="text-sm font-medium text-foreground">
                          {feature.stats}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action */}
                    <Link href={feature.href}>
                      <Button variant="outline" className="w-full group-hover:bg-primary/10 group-hover:border-primary transition-all duration-300">
                        Access {feature.title}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Implementation Status */}
        <Card className="border border-primary bg-gradient-to-r from-primary/5 to-transparent hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              Week 2 Implementation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <h4 className="font-semibold">Day 1 Complete</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Cross-client template sharing system</p>
                </Card>
                <Card className="p-4 border hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <h4 className="font-semibold">Day 2 Complete</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Advanced analytics & performance metrics</p>
                </Card>
                <Card className="p-4 border hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <h4 className="font-semibold">Day 3 Complete</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Approval workflows, bulk ops & scheduling</p>
                </Card>
              </div>
              
              <div className="pt-4 border-t">
                <Card className="p-4 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🚀</div>
                    <p className="text-sm text-muted-foreground">
                      All Week 2 Enhanced Content Features have been successfully implemented with full B2B2G service provider architecture.
                      Each feature includes comprehensive APIs, service layers, and interactive UI components with demo data for immediate testing.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-primary bg-gradient-to-r from-primary/5 to-transparent hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              Quick Actions
              <Badge variant="outline" className="ml-2 border">
                4 Available
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/service-provider/templates">
                <Card className="h-20 hover:shadow-md transition-all duration-300 border group">
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-2 h-full">
                    <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                    <span className="text-sm font-medium">Browse Templates</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/service-provider/analytics">
                <Card className="h-20 hover:shadow-md transition-all duration-300 border group">
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-2 h-full">
                    <BarChart3 className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                    <span className="text-sm font-medium">View Analytics</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/service-provider/bulk-operations">
                <Card className="h-20 hover:shadow-md transition-all duration-300 border group">
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-2 h-full">
                    <Zap className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                    <span className="text-sm font-medium">Bulk Operations</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/service-provider/scheduling">
                <Card className="h-20 hover:shadow-md transition-all duration-300 border group">
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-2 h-full">
                    <Clock className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                    <span className="text-sm font-medium">Schedule Content</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}