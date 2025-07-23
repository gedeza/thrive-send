'use client';

import React, { useState } from 'react';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { Plus, Search, Filter, TrendingUp, DollarSign, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

// Mock data for marketplace listings
const mockListings = [
  {
    id: '1',
    title: 'Professional Email Template Pack',
    description: 'A collection of 20+ professional email templates for marketing campaigns',
    type: 'TEMPLATE',
    price: 29.99,
    currency: 'USD',
    status: 'ACTIVE',
    rating: 4.8,
    reviewCount: 124,
    image: '/api/placeholder/300/200',
    createdBy: { name: 'John Doe', avatar: '/api/placeholder/40/40' },
    tags: ['Email', 'Marketing', 'Professional']
  },
  {
    id: '2',
    title: 'Social Media Content Calendar',
    description: 'Complete 30-day social media content calendar with engaging posts',
    type: 'CONTENT',
    price: 49.99,
    currency: 'USD',
    status: 'ACTIVE',
    rating: 4.9,
    reviewCount: 87,
    image: '/api/placeholder/300/200',
    createdBy: { name: 'Sarah Smith', avatar: '/api/placeholder/40/40' },
    tags: ['Social Media', 'Content', 'Calendar']
  },
  {
    id: '3',
    title: 'Blog SEO Optimization Service',
    description: 'Professional SEO optimization for your blog posts and articles',
    type: 'SERVICE',
    price: 99.99,
    currency: 'USD',
    status: 'ACTIVE',
    rating: 4.7,
    reviewCount: 203,
    image: '/api/placeholder/300/200',
    createdBy: { name: 'Mike Johnson', avatar: '/api/placeholder/40/40' },
    tags: ['SEO', 'Blog', 'Optimization']
  }
];

const mockStats = {
  totalListings: 156,
  totalRevenue: 12450.50,
  averageRating: 4.6,
  totalViews: 8940
};

export default function MarketplacePage() {
  const { userId } = useAuth();
  const { organization } = useOrganization();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || listing.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and share content, templates, and services
          </p>
        </div>
        <Link href="/marketplace/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalListings}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.averageRating}</div>
            <p className="text-xs text-muted-foreground">⭐⭐⭐⭐⭐</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Marketplace Tabs */}
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="my-listings">My Listings</TabsTrigger>
          <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="service">Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="group hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-semibold">{listing.type}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                    <Badge variant={listing.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      ${listing.price}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {listing.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-muted rounded-full"></div>
                      <span className="text-sm font-medium">{listing.createdBy.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{listing.rating}</span>
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-xs text-muted-foreground">({listing.reviewCount})</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {listing.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {listing.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{listing.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/marketplace/${listing.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button className="flex-1">
                      Purchase
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-listings">
          <Card>
            <CardHeader>
              <CardTitle>My Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't created any listings yet.</p>
                <Link href="/marketplace/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Listing
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>My Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No purchases yet.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Analytics coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}