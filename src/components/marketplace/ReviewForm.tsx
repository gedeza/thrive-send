'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review must be less than 1000 characters').optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  listingId: string;
  listingTitle: string;
  listingType: string;
  onSubmit?: (reviewData: ReviewFormData) => Promise<void>;
  onCancel?: () => void;
  isOpen: boolean;
  existingReview?: {
    id: string;
    rating: number;
    comment?: string;
  };
}

export function ReviewForm({
  listingId,
  listingTitle,
  listingType,
  onSubmit,
  onCancel,
  isOpen,
  existingReview
}: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || ''
    }
  });

  const watchedRating = watch('rating');

  const handleRatingClick = (rating: number) => {
    setValue('rating', rating);
  };

  const handleFormSubmit = async (data: ReviewFormData) => {
    try {
      setIsSubmitting(true);

      // Submit review via API
      const response = await fetch(`/api/marketplace/listings/${listingId}/reviews`, {
        method: existingReview ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          ...(existingReview && { reviewId: existingReview.id })
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: existingReview 
          ? 'Your review has been updated successfully' 
          : 'Your review has been submitted successfully',
      });

      await onSubmit?.(data);
      reset();
      onCancel?.();

    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">
                {existingReview ? 'Edit Review' : 'Write a Review'}
              </CardTitle>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-1">{listingTitle}</p>
                <Badge variant="outline" className="text-xs">
                  {listingType}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Rating Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating *</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 rounded transition-colors hover:bg-gray-100"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        star <= (hoveredRating || watchedRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {watchedRating > 0 && (
                    <>
                      {watchedRating} star{watchedRating !== 1 ? 's' : ''}
                      {watchedRating === 1 && ' - Poor'}
                      {watchedRating === 2 && ' - Fair'}
                      {watchedRating === 3 && ' - Good'}
                      {watchedRating === 4 && ' - Very Good'}
                      {watchedRating === 5 && ' - Excellent'}
                    </>
                  )}
                </span>
              </div>
              {errors.rating && (
                <p className="text-sm text-red-500">{errors.rating.message}</p>
              )}
            </div>

            {/* Comment Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Review (Optional)</label>
              <Textarea
                {...register('comment')}
                placeholder="Share your experience with this listing..."
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {errors.comment ? (
                    <span className="text-red-500">{errors.comment.message}</span>
                  ) : (
                    'Help others by sharing your honest experience'
                  )}
                </span>
                <span>
                  {watch('comment')?.length || 0}/1000
                </span>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <h4 className="font-medium text-blue-900 mb-2">Review Guidelines</h4>
              <ul className="text-blue-800 space-y-1 text-xs">
                <li>• Be honest and constructive in your feedback</li>
                <li>• Focus on your experience with the listing</li>
                <li>• Avoid inappropriate language or personal attacks</li>
                <li>• Reviews are moderated and may take time to appear</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || watchedRating === 0}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {existingReview ? 'Update Review' : 'Submit Review'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}