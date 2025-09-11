'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Star,
  Calendar,
  User,
  Flag,
  MessageSquare,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

interface ReviewReport {
  id: string;
  reviewId: string;
  reason: string;
  description?: string;
  reportedAt: string;
  reportedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  review: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    reviewer: {
      id: string;
      firstName: string;
      lastName: string;
    };
    listing: {
      id: string;
      title: string;
    };
  };
  status: 'pending' | 'approved' | 'rejected';
}

interface ReviewModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  averageRating: number;
}

export function ReviewModerationDashboard() {
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [stats, setStats] = useState<ReviewModerationStats | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration
      const mockReports: ReviewReport[] = [
        {
          id: '1',
          reviewId: 'rev1',
          reason: 'inappropriate',
          description: 'Contains offensive language',
          reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          reportedBy: {
            id: 'user1',
            firstName: 'John',
            lastName: 'Doe'
          },
          review: {
            id: 'rev1',
            rating: 1,
            comment: 'This is a terrible listing with inappropriate content...',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            reviewer: {
              id: 'reviewer1',
              firstName: 'Jane',
              lastName: 'Smith'
            },
            listing: {
              id: 'listing1',
              title: 'Premium Content Template'
            }
          },
          status: 'pending'
        },
        {
          id: '2',
          reviewId: 'rev2',
          reason: 'fake',
          description: 'Suspicious review pattern, possible fake review',
          reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          reportedBy: {
            id: 'user2',
            firstName: 'Mike',
            lastName: 'Johnson'
          },
          review: {
            id: 'rev2',
            rating: 5,
            comment: 'Amazing! Best product ever! 10/10 would recommend!',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            reviewer: {
              id: 'reviewer2',
              firstName: 'Bob',
              lastName: 'Wilson'
            },
            listing: {
              id: 'listing2',
              title: 'Social Media Campaign Kit'
            }
          },
          status: 'pending'
        },
        {
          id: '3',
          reviewId: 'rev3',
          reason: 'spam',
          reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          reportedBy: {
            id: 'user3',
            firstName: 'Sarah',
            lastName: 'Brown'
          },
          review: {
            id: 'rev3',
            rating: 3,
            comment: 'Check out my website for better deals! www.example.com',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            reviewer: {
              id: 'reviewer3',
              firstName: 'Tom',
              lastName: 'Davis'
            },
            listing: {
              id: 'listing3',
              title: 'Email Marketing Templates'
            }
          },
          status: 'approved'
        }
      ];

      setReports(mockReports);
    } catch (_error) {
      console.error("", _error);
      toast({
        title: 'Error',
        description: 'Failed to load review reports',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const mockStats: ReviewModerationStats = {
        totalReports: 15,
        pendingReports: 7,
        resolvedToday: 3,
        averageRating: 4.2
      };

      setStats(mockStats);
    } catch (_error) {
      console.error("", _error);
    }
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      const response = await fetch(`/api/marketplace/reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error('Failed to process action');

      // Update local state
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: action === 'delete' ? 'approved' : action === 'approve' ? 'approved' : 'rejected' }
          : report
      ));

      toast({
        title: 'Success',
        description: `Report ${action}d successfully`,
      });

      setSelectedReport(null);
    } catch (_error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} report`,
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReasonBadge = (reason: string) => {
    const configs = {
      inappropriate: { variant: 'destructive', label: 'Inappropriate' },
      spam: { variant: 'secondary', label: 'Spam' },
      fake: { variant: 'outline', label: 'Fake Review' },
      offensive: { variant: 'destructive', label: 'Offensive' },
      other: { variant: 'secondary', label: 'Other' }
    };
    
    const config = configs[reason as keyof typeof configs] || configs.other;
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const filteredReports = reports.filter(report => {
    if (activeTab === 'all') return true;
    return report.status === activeTab;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/2" />
                  <div className="h-8 bg-gray-300 rounded w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Review Moderation</h1>
        <p className="text-muted-foreground">
          Manage and moderate marketplace review reports
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                </div>
                <Flag className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingReports}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolvedToday}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Rating</p>
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Review Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({reports.filter(r => r.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Review</TableHead>
                      <TableHead>Listing</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < report.review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                by {report.review.reviewer.firstName} {report.review.reviewer.lastName}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-32 truncate">
                              {report.review.listing.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getReasonBadge(report.reason)}
                          </TableCell>
                          <TableCell>
                            {report.reportedBy.firstName} {report.reportedBy.lastName}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(report.reportedAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                report.status === 'pending' ? 'secondary' :
                                report.status === 'approved' ? 'default' : 'outline'
                              }
                            >
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedReport(report)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {report.status === 'pending' && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem 
                                      onClick={() => handleReportAction(report.id, 'approve')}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve (Keep Review)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleReportAction(report.id, 'delete')}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Review
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleReportAction(report.id, 'reject')}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject Report
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Report Details Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Report Details</DialogTitle>
            <DialogDescription>
              Review the reported content and take appropriate action
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Report Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Report Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Reason:</span> {getReasonBadge(selectedReport.reason)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reported by:</span> {selectedReport.reportedBy.firstName} {selectedReport.reportedBy.lastName}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span> {formatDate(selectedReport.reportedAt)}
                    </div>
                  </div>
                  {selectedReport.description && (
                    <div className="mt-3">
                      <span className="text-muted-foreground text-sm">Description:</span>
                      <p className="text-sm bg-gray-50 p-2 rounded mt-1">{selectedReport.description}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Listing Info</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Title:</span> {selectedReport.review.listing.title}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Review Content */}
              <div>
                <h4 className="font-medium mb-3">Reported Review</h4>
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {selectedReport.review.reviewer.firstName} {selectedReport.review.reviewer.lastName}
                          </span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < selectedReport.review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(selectedReport.review.createdAt)}
                          </span>
                        </div>
                        {selectedReport.review.comment && (
                          <p className="text-sm">{selectedReport.review.comment}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              {selectedReport.status === 'pending' && (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleReportAction(selectedReport.id, 'reject')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Report
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReportAction(selectedReport.id, 'approve')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Keep Review
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReportAction(selectedReport.id, 'delete')}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Review
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}