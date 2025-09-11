'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MoreHorizontal, 
  Flag, 
  Edit,
  Calendar,
  Verified,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  helpful?: number;
  notHelpful?: number;
  isVerifiedPurchase?: boolean;
  isEdited?: boolean;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ReviewDisplayProps {
  listingId: string;
  currentUserId?: string;
  onEditReview?: (review: Review) => void;
}

export function ReviewDisplay({ listingId, currentUserId, onEditReview }: ReviewDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');

  useEffect(() => {
    fetchReviews();
  }, [listingId, sortBy]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/marketplace/listings/${listingId}/reviews?sort=${sortBy}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      
      const data = await response.json();
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (_error) {
      console.error("", _error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string, isHelpful: boolean) => {
    try {
      const response = await fetch(`/api/marketplace/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful: isHelpful }),
      });

      if (!response.ok) throw new Error('Failed to vote');

      // Refresh reviews to get updated vote counts
      fetchReviews();
      
      toast({
        title: 'Thank you!',
        description: 'Your feedback helps other users',
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to record your vote',
        variant: 'destructive',
      });
    }
  };

  const handleReportReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/marketplace/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'inappropriate' }),
      });

      if (!response.ok) throw new Error('Failed to report');

      toast({
        title: 'Review Reported',
        description: 'Thank you for helping us maintain quality reviews',
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to report review',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-gray-300 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/4" />
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-16 bg-gray-300 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Customer Reviews</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <div className="flex justify-center mb-1">
                  {renderStars(Math.round(stats.averageRating), 'md')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-4">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <Progress 
                      value={(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100}
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-muted-foreground w-8">
                      {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium">
          {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
        </h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="text-sm border rounded px-3 py-1"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
          <option value="helpful">Most helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-medium mb-2">No reviews yet</h4>
              <p className="text-muted-foreground">
                Be the first to share your experience with this listing
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onHelpfulVote={handleHelpfulVote}
              onReport={handleReportReview}
              onEdit={onEditReview}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  currentUserId,
  onHelpfulVote,
  onReport,
  onEdit
}: {
  review: Review;
  currentUserId?: string;
  onHelpfulVote: (reviewId: string, isHelpful: boolean) => void;
  onReport: (reviewId: string) => void;
  onEdit?: (review: Review) => void;
}) {
  const isOwnReview = currentUserId === review.reviewer.id;
  const reviewerInitials = `${review.reviewer.firstName[0]}${review.reviewer.lastName[0]}`;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.reviewer.avatar} />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {reviewerInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-medium">
                    {review.reviewer.firstName} {review.reviewer.lastName}
                  </h5>
                  {review.isVerifiedPurchase && (
                    <Badge variant="outline" className="text-xs">
                      <Verified className="h-3 w-3 mr-1" />
                      Verified Purchase
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(review.createdAt)}
                  </div>
                  {review.isEdited && (
                    <>
                      <span>•</span>
                      <span className="text-xs">Edited</span>
                    </>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwnReview ? (
                    <DropdownMenuItem onClick={() => onEdit?.(review)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Review
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onReport(review.id)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report Review
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {review.comment && (
              <p className="text-sm mb-4 leading-relaxed">{review.comment}</p>
            )}

            {/* Helpful votes */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Was this helpful?</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onHelpfulVote(review.id, true)}
                  disabled={isOwnReview}
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Yes ({review.helpful || 0})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onHelpfulVote(review.id, false)}
                  disabled={isOwnReview}
                >
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  No ({review.notHelpful || 0})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}