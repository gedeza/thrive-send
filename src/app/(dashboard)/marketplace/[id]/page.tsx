'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Star, 
  Share2, 
  Heart, 
  ShoppingCart,
  Shield,
  Clock,
  Download,
  MessageSquare,
  TrendingUp,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewForm } from '@/components/marketplace/ReviewForm';
import { ReviewDisplay } from '@/components/marketplace/ReviewDisplay';
import Link from 'next/link';

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  type: 'TEMPLATE' | 'CONTENT' | 'SERVICE';
  price: number;
  currency: string;
  status: string;
  rating: number;
  reviewCount: number;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  features: string[];
  includesFiles: string[];
  createdAt: string;
  totalSales: number;
}

export default function MarketplaceListingPage() {
  const { userId } = useAuth();
  const params = useParams();
  const listingId = params.id as string;

  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    fetchListing();
    checkUserReview();
  }, [listingId, userId]);

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration
      const mockListing: MarketplaceListing = {
        id: listingId,
        title: 'Professional Email Template Pack',
        description: `A comprehensive collection of 20+ professionally designed email templates perfect for marketing campaigns, newsletters, and transactional emails. Each template is fully responsive and tested across major email clients.

Features include:
- Modern, clean designs that convert
- Fully responsive across all devices
- HTML and plain text versions
- Compatible with all major email services
- Easy customization with clear documentation
- Bonus: 10 subject line templates included

Perfect for marketers, agencies, and businesses looking to improve their email marketing results without the design overhead.`,
        type: 'TEMPLATE',
        price: 29.99,
        currency: 'USD',
        status: 'ACTIVE',
        rating: 4.8,
        reviewCount: 124,
        createdBy: {
          id: 'creator1',
          name: 'John Doe',
          avatar: '/api/placeholder/40/40'
        },
        tags: ['Email', 'Marketing', 'Professional', 'Templates', 'Responsive'],
        features: [
          '20+ Professional Email Templates',
          'Fully Responsive Design',
          'HTML & Plain Text Versions',
          'Cross-Client Compatibility',
          'Easy Customization',
          'Bonus Subject Lines'
        ],
        includesFiles: [
          'HTML Templates (20 files)',
          'Plain Text Versions (20 files)',
          'Documentation (PDF)',
          'Customization Guide (PDF)',
          'Subject Line Templates (TXT)'
        ],
        createdAt: '2024-01-15T10:00:00Z',
        totalSales: 856
      };

      setListing(mockListing);
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserReview = async () => {
    if (!userId) return;

    try {
      // Check if user has already reviewed this listing
      const response = await fetch(`/api/marketplace/listings/${listingId}/reviews/user`);
      if (response.ok) {
        const userReviewData = await response.json();
        if (userReviewData.review) {
          setHasUserReviewed(true);
          setUserReview(userReviewData.review);
        }
      }
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  };

  const handlePurchase = async () => {
    // Handle purchase logic
    console.log('Purchase listing:', listingId);
  };

  const handleReviewSubmit = (reviewData: any) => {
    setShowReviewForm(false);
    setHasUserReviewed(true);
    // Refresh the listing to get updated review stats
    fetchListing();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading || !listing) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-300 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-300 rounded"></div>
              <div className="h-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/marketplace">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Listing Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{listing.type}</Badge>
              <Badge variant={listing.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {listing.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
            
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                {renderStars(listing.rating)}
                <span className="font-medium">{listing.rating}</span>
                <span className="text-muted-foreground">
                  ({listing.reviewCount} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                <span>{listing.totalSales} sales</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Created {formatDate(listing.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="font-medium">by {listing.createdBy.name}</span>
            </div>
          </div>

          {/* Listing Image/Preview */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Download className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-lg font-semibold">{listing.type} Preview</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Description, Features, Reviews */}
          <Tabs defaultValue="description" className="space-y-6">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="features">What's Included</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({listing.reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About this {listing.type.toLowerCase()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {listing.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {listing.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Files Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {listing.includesFiles.map((file, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span>{file}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              {userId && (
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Customer Reviews</h3>
                  {!hasUserReviewed && (
                    <Button onClick={() => setShowReviewForm(true)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Write a Review
                    </Button>
                  )}
                </div>
              )}
              
              <ReviewDisplay 
                listingId={listingId}
                currentUserId={userId || undefined}
                onEditReview={(review) => {
                  setUserReview(review);
                  setShowReviewForm(true);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold mb-2">
                  ${listing.price} {listing.currency}
                </div>
                <p className="text-muted-foreground">One-time purchase</p>
              </div>

              <div className="space-y-3 mb-6">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePurchase}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase Now
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <Separator className="mb-4" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-blue-500" />
                  <span>Instant download after purchase</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span>Lifetime updates included</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Listing Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {listing.totalSales}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Sales</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {listing.reviewCount}
                  </div>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {listing.rating}/5
                </div>
                <div className="flex justify-center mb-1">
                  {renderStars(listing.rating)}
                </div>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Form Modal */}
      <ReviewForm
        listingId={listingId}
        listingTitle={listing.title}
        listingType={listing.type}
        isOpen={showReviewForm}
        existingReview={userReview}
        onSubmit={handleReviewSubmit}
        onCancel={() => setShowReviewForm(false)}
      />
    </div>
  );
}