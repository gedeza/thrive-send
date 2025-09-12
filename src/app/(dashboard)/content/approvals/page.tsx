'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  Filter,
  Search,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface ContentApproval {
  id: string;
  contentId: string;
  status: string;
  currentStep: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
  content: {
    id: string;
    title: string;
    type: string;
    excerpt?: string;
    createdAt: string;
    createdBy?: {
      id: string;
      firstName: string;
      lastName: string;
      imageUrl?: string;
    };
  };
  history: Array<{
    id: string;
    status: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function ContentApprovalsPage() {
  const { userId } = useAuth();
  const [approvals, setApprovals] = useState<ContentApproval[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<ContentApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stepFilter, setStepFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    inReview: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchApprovals();
  }, []);

  useEffect(() => {
    filterApprovals();
  }, [approvals, statusFilter, stepFilter, searchQuery]);

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you'd have an API endpoint for this
      // For now, we'll simulate the data structure
      const mockApprovals: ContentApproval[] = [
        {
          id: '1',
          contentId: 'content-1',
          status: 'PENDING_REVIEW',
          currentStep: 'REVIEW',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          content: {
            id: 'content-1',
            title: 'Ultimate Guide to Email Marketing',
            type: 'blog',
            excerpt: 'Learn how to create effective email marketing campaigns...',
            createdAt: '2024-01-15T09:00:00Z',
            createdBy: {
              id: 'user-1',
              firstName: 'John',
              lastName: 'Doe',
              imageUrl: '/api/placeholder/32/32'
            }
          },
          history: [
            {
              id: 'h1',
              status: 'PENDING_REVIEW',
              createdAt: '2024-01-15T10:00:00Z',
              user: { firstName: 'John', lastName: 'Doe' }
            }
          ]
        },
        {
          id: '2',
          contentId: 'content-2',
          status: 'IN_REVIEW',
          currentStep: 'REVIEW',
          createdAt: '2024-01-14T14:30:00Z',
          updatedAt: '2024-01-15T09:15:00Z',
          assignedTo: 'reviewer-1',
          assignee: {
            id: 'reviewer-1',
            firstName: 'Sarah',
            lastName: 'Wilson',
            imageUrl: '/api/placeholder/32/32'
          },
          content: {
            id: 'content-2',
            title: 'Social Media Strategy for 2024',
            type: 'social',
            excerpt: 'Discover the latest trends in social media marketing...',
            createdAt: '2024-01-14T14:00:00Z',
            createdBy: {
              id: 'user-2',
              firstName: 'Jane',
              lastName: 'Smith',
              imageUrl: '/api/placeholder/32/32'
            }
          },
          history: [
            {
              id: 'h2',
              status: 'IN_REVIEW',
              createdAt: '2024-01-15T09:15:00Z',
              user: { firstName: 'Sarah', lastName: 'Wilson' }
            }
          ]
        },
        {
          id: '3',
          contentId: 'content-3',
          status: 'APPROVED',
          currentStep: 'PUBLISH',
          createdAt: '2024-01-13T11:00:00Z',
          updatedAt: '2024-01-15T08:30:00Z',
          content: {
            id: 'content-3',
            title: 'Email Template: Welcome Series',
            type: 'email',
            excerpt: 'Professional welcome email template series...',
            createdAt: '2024-01-13T10:30:00Z',
            createdBy: {
              id: 'user-3',
              firstName: 'Mike',
              lastName: 'Johnson',
              imageUrl: '/api/placeholder/32/32'
            }
          },
          history: [
            {
              id: 'h3',
              status: 'APPROVED',
              createdAt: '2024-01-15T08:30:00Z',
              user: { firstName: 'Admin', lastName: 'User' }
            }
          ]
        }
      ];

      setApprovals(mockApprovals);
      
      // Calculate stats
      const newStats = {
        pending: mockApprovals.filter(a => a.status === 'PENDING_REVIEW').length,
        inReview: mockApprovals.filter(a => a.status === 'IN_REVIEW').length,
        approved: mockApprovals.filter(a => a.status === 'APPROVED').length,
        rejected: mockApprovals.filter(a => a.status === 'REJECTED').length
      };
      setStats(newStats);
      
    } catch (_error) {
      console.error("", _error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterApprovals = () => {
    let filtered = approvals;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(approval => approval.status === statusFilter);
    }

    if (stepFilter !== 'all') {
      filtered = filtered.filter(approval => approval.currentStep === stepFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(approval =>
        approval.content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        approval.content.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredApprovals(filtered);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      DRAFT: { color: 'bg-gray-500', icon: Clock, label: 'Draft', variant: 'secondary' },
      PENDING_REVIEW: { color: 'bg-yellow-500', icon: Clock, label: 'Pending Review', variant: 'warning' },
      IN_REVIEW: { color: 'bg-blue-500', icon: Eye, label: 'In Review', variant: 'default' },
      CHANGES_REQUESTED: { color: 'bg-orange-500', icon: AlertCircle, label: 'Changes Requested', variant: 'warning' },
      APPROVED: { color: 'bg-green-500', icon: CheckCircle, label: 'Approved', variant: 'success' },
      REJECTED: { color: 'bg-red-500', icon: XCircle, label: 'Rejected', variant: 'destructive' },
      PUBLISHED: { color: 'bg-purple-500', icon: CheckCircle, label: 'Published', variant: 'success' },
      ARCHIVED: { color: 'bg-gray-400', icon: XCircle, label: 'Archived', variant: 'secondary' }
    };
    return configs[status as keyof typeof configs] || configs.DRAFT;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const myApprovals = filteredApprovals.filter(approval => 
    approval.assignedTo === userId || approval.content.createdBy?.id === userId
  );

  const allApprovals = filteredApprovals;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Approvals</h1>
        <p className="text-muted-foreground">
          Manage content approval workflows and review processes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inReview}</div>
            <p className="text-xs text-muted-foreground">Currently being reviewed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Ready for publishing</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Needs revision</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                <SelectItem value="IN_REVIEW">In Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={stepFilter} onValueChange={setStepFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by step" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Steps</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="APPROVAL">Approval</SelectItem>
                <SelectItem value="PUBLISH">Publish</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approval Lists */}
      <Tabs defaultValue="my-approvals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-approvals">My Tasks ({myApprovals.length})</TabsTrigger>
          <TabsTrigger value="all-approvals">All Approvals ({allApprovals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="my-approvals" className="space-y-4">
          {myApprovals.length > 0 ? (
            myApprovals.map((approval) => (
              <ApprovalCard key={approval.id} approval={approval} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No approvals assigned to you.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all-approvals" className="space-y-4">
          {allApprovals.length > 0 ? (
            allApprovals.map((approval) => (
              <ApprovalCard key={approval.id} approval={approval} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No approvals found.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ApprovalCard({ approval }: { approval: ContentApproval }) {
  const statusConfig = getStatusConfig(approval.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${statusConfig.color}`}></div>
              <h3 className="font-semibold text-lg truncate">{approval.content.title}</h3>
              <Badge variant="outline">{approval.content.type}</Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(approval.content.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Updated {formatDate(approval.updatedAt)}</span>
              </div>
            </div>

            {approval.content.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {approval.content.excerpt}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Badge variant={statusConfig.variant as any}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            {approval.content.createdBy && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={approval.content.createdBy.imageUrl} />
                  <AvatarFallback>
                    {approval.content.createdBy.firstName.charAt(0)}
                    {approval.content.createdBy.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">
                  by {approval.content.createdBy.firstName} {approval.content.createdBy.lastName}
                </span>
              </div>
            )}

            {approval.assignee && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Assigned to {approval.assignee.firstName} {approval.assignee.lastName}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Link href={`/content/${approval.contentId}`}>
              <Button variant="outline" size="sm">
                View Content
              </Button>
            </Link>
            <Link href={`/content/${approval.contentId}/approval`}>
              <Button size="sm">
                Manage Approval
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusConfig(status: string) {
  const configs = {
    DRAFT: { color: 'bg-gray-500', icon: Clock, label: 'Draft', variant: 'secondary' },
    PENDING_REVIEW: { color: 'bg-yellow-500', icon: Clock, label: 'Pending Review', variant: 'warning' },
    IN_REVIEW: { color: 'bg-blue-500', icon: Eye, label: 'In Review', variant: 'default' },
    CHANGES_REQUESTED: { color: 'bg-orange-500', icon: AlertCircle, label: 'Changes Requested', variant: 'warning' },
    APPROVED: { color: 'bg-green-500', icon: CheckCircle, label: 'Approved', variant: 'success' },
    REJECTED: { color: 'bg-red-500', icon: XCircle, label: 'Rejected', variant: 'destructive' },
    PUBLISHED: { color: 'bg-purple-500', icon: CheckCircle, label: 'Published', variant: 'success' },
    ARCHIVED: { color: 'bg-gray-400', icon: XCircle, label: 'Archived', variant: 'secondary' }
  };
  return configs[status as keyof typeof configs] || configs.DRAFT;
}