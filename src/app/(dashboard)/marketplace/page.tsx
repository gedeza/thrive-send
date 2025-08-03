'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Star, 
  Zap,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Target,
  Users,
  Clock,
  CheckCircle,
  Filter,
  Search,
  BarChart3,
  Package,
  Sparkles,
  Crown,
  Rocket,
  Award
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { cn } from '@/lib/utils';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types for marketplace
interface BoostProduct {
  id: string;
  name: string;
  type: 'engagement' | 'reach' | 'conversion' | 'awareness' | 'premium';
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  metrics: {
    averageIncrease: string;
    successRate: number;
    clientsUsed: number;
  };
  clientTypes: string[];
  popularity: 'hot' | 'trending' | 'new' | 'bestseller';
  rating: number;
  reviews: number;
  estimatedROI: string;
  isRecommended?: boolean;
}

interface PurchaseHistory {
  id: string;
  productId: string;
  productName: string;
  clientId: string;
  clientName: string;
  purchaseDate: string;
  price: number;
  status: 'active' | 'completed' | 'cancelled';
  performance: {
    impressions: number;
    engagements: number;
    conversions: number;
    roi: number;
  };
}

interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeBoosts: number;
  totalPurchases: number;
  averageROI: number;
  topPerformingBoost: string;
}

// Demo boost products
const demoBoosts: BoostProduct[] = [
  {
    id: 'boost-1',
    name: 'Municipal Engagement Pro',
    type: 'engagement',
    category: 'Government',
    description: 'Specialized boost for government communications with citizen engagement focus',
    price: 299,
    originalPrice: 399,
    duration: '30 days',
    features: [
      'Targeted citizen demographics',
      'Peak hour optimization',
      'Community event promotion',
      'Public notice amplification',
      'Feedback collection boost'
    ],
    metrics: {
      averageIncrease: '+285%',
      successRate: 94,
      clientsUsed: 127
    },
    clientTypes: ['municipality', 'government'],
    popularity: 'bestseller',
    rating: 4.9,
    reviews: 89,
    estimatedROI: '340%',
    isRecommended: true
  },
  {
    id: 'boost-2',
    name: 'Business Growth Accelerator',
    type: 'conversion',
    category: 'Business',
    description: 'Drive conversions and sales for business clients with advanced targeting',
    price: 459,
    duration: '45 days',
    features: [
      'Purchase intent targeting',
      'Competitor audience reach',
      'Shopping behavior optimization',
      'Local business promotion',
      'Call-to-action enhancement'
    ],
    metrics: {
      averageIncrease: '+420%',
      successRate: 89,
      clientsUsed: 203
    },
    clientTypes: ['business', 'startup'],
    popularity: 'hot',
    rating: 4.7,
    reviews: 156,
    estimatedROI: '520%'
  },
  {
    id: 'boost-3',
    name: 'Startup Viral Launch',
    type: 'reach',
    category: 'Startup',
    description: 'Maximum exposure for startup launches and product announcements',
    price: 199,
    originalPrice: 249,
    duration: '14 days',
    features: [
      'Viral content optimization',
      'Influencer network reach',
      'Trending hashtag boost',
      'Launch event promotion',
      'Investor audience targeting'
    ],
    metrics: {
      averageIncrease: '+650%',
      successRate: 91,
      clientsUsed: 78
    },
    clientTypes: ['startup', 'creator'],
    popularity: 'trending',
    rating: 4.8,
    reviews: 67,
    estimatedROI: '280%'
  },
  {
    id: 'boost-4',
    name: 'Premium Brand Authority',
    type: 'premium',
    category: 'Branding',
    description: 'Elite positioning for high-end clients requiring luxury market reach',
    price: 899,
    duration: '60 days',
    features: [
      'Premium audience targeting',
      'Luxury market positioning',
      'Thought leadership boost',
      'Executive network reach',
      'Brand authority signals'
    ],
    metrics: {
      averageIncrease: '+180%',
      successRate: 96,
      clientsUsed: 34
    },
    clientTypes: ['business', 'executive'],
    popularity: 'new',
    rating: 4.9,
    reviews: 23,
    estimatedROI: '450%'
  },
  {
    id: 'boost-5',
    name: 'Community Awareness Campaign',
    type: 'awareness',
    category: 'Social Impact',
    description: 'Build awareness for community initiatives and social causes',
    price: 149,
    duration: '21 days',
    features: [
      'Community targeting',
      'Social cause alignment',
      'Local media boost',
      'Volunteer recruitment',
      'Donation drive support'
    ],
    metrics: {
      averageIncrease: '+320%',
      successRate: 87,
      clientsUsed: 165
    },
    clientTypes: ['municipality', 'nonprofit'],
    popularity: 'hot',
    rating: 4.6,
    reviews: 112,
    estimatedROI: '210%'
  }
];

// Demo purchase history
const demoPurchases: PurchaseHistory[] = [
  {
    id: 'purchase-1',
    productId: 'boost-1',
    productName: 'Municipal Engagement Pro',
    clientId: 'demo-client-1',
    clientName: 'City of Springfield',
    purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    price: 299,
    status: 'active',
    performance: {
      impressions: 45200,
      engagements: 3840,
      conversions: 127,
      roi: 285
    }
  },
  {
    id: 'purchase-2',
    productId: 'boost-3',
    productName: 'Startup Viral Launch',
    clientId: 'demo-client-3',
    clientName: 'TechFlow Innovations',
    purchaseDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    price: 199,
    status: 'completed',
    performance: {
      impressions: 128900,
      engagements: 8760,
      conversions: 456,
      roi: 650
    }
  }
];

// Demo revenue stats
const demoRevenueStats: RevenueStats = {
  totalRevenue: 12840,
  monthlyRevenue: 4250,
  activeBoosts: 8,
  totalPurchases: 23,
  averageROI: 385,
  topPerformingBoost: 'Municipal Engagement Pro'
};

function getPopularityIcon(popularity: string) {
  switch (popularity) {
    case 'hot': return <Zap className="h-4 w-4 text-orange-500" />;
    case 'trending': return <TrendingUp className="h-4 w-4 text-blue-500" />;
    case 'new': return <Sparkles className="h-4 w-4 text-green-500" />;
    case 'bestseller': return <Crown className="h-4 w-4 text-yellow-500" />;
    default: return null;
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'engagement': return <Heart className="h-5 w-5" />;
    case 'reach': return <Users className="h-5 w-5" />;
    case 'conversion': return <Target className="h-5 w-5" />;
    case 'awareness': return <Eye className="h-5 w-5" />;
    case 'premium': return <Crown className="h-5 w-5" />;
    default: return <Rocket className="h-5 w-5" />;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Boost product card component
interface BoostCardProps {
  boost: BoostProduct;
  onPurchase: (boost: BoostProduct) => void;
}

function BoostCard({ boost, onPurchase }: BoostCardProps) {
  const typeIcon = getTypeIcon(boost.type);
  const popularityIcon = getPopularityIcon(boost.popularity);
  const isOnSale = boost.originalPrice && boost.originalPrice > boost.price;

  return (
    <Card className={cn(
      "hover:shadow-xl transition-all duration-300 relative overflow-hidden",
      boost.isRecommended && "ring-2 ring-primary/20 shadow-lg"
    )}>
      {boost.isRecommended && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
          Recommended
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              {typeIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {popularityIcon}
                <Badge variant="outline" className="text-xs capitalize">
                  {boost.popularity}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <CardTitle className="text-xl">{boost.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{boost.description}</p>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {boost.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {boost.duration}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pricing */}
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-primary">
            {formatCurrency(boost.price)}
          </span>
          {isOnSale && (
            <span className="text-lg text-muted-foreground line-through">
              {formatCurrency(boost.originalPrice!)}
            </span>
          )}
          {isOnSale && (
            <Badge className="bg-red-500 text-white text-xs">
              SAVE {formatCurrency(boost.originalPrice! - boost.price)}
            </Badge>
          )}
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-green-600">{boost.metrics.averageIncrease}</p>
            <p className="text-xs text-muted-foreground">Avg Increase</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600">{boost.metrics.successRate}%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
          <div>
            <p className="text-lg font-bold text-purple-600">{boost.estimatedROI}</p>
            <p className="text-xs text-muted-foreground">Est. ROI</p>
          </div>
        </div>
        
        {/* Features (first 3) */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Key Features:</p>
          {boost.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
          {boost.features.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{boost.features.length - 3} more features
            </p>
          )}
        </div>
        
        {/* Rating and reviews */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{boost.rating}</span>
            <span className="text-muted-foreground">({boost.reviews} reviews)</span>
          </div>
          <span className="text-muted-foreground">
            {boost.metrics.clientsUsed} clients
          </span>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onPurchase(boost)}
            className="flex-1"
            size="lg"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Purchase Boost
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {typeIcon}
                  {boost.name}
                </DialogTitle>
                <DialogDescription>
                  Complete details and features for this boost package
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div>
                  <h4 className="font-semibold mb-2">All Features</h4>
                  <div className="grid gap-2">
                    {boost.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{boost.metrics.averageIncrease}</p>
                      <p className="text-sm text-muted-foreground">Average Increase</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{boost.metrics.successRate}%</p>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Compatible Client Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {boost.clientTypes.map((type) => (
                      <Badge key={type} variant="outline" className="capitalize">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [boosts] = useState<BoostProduct[]>(demoBoosts);
  const [purchases] = useState<PurchaseHistory[]>(demoPurchases);
  const [revenueStats] = useState<RevenueStats>(demoRevenueStats);
  const { state: { organizationId } } = useServiceProvider();

  // Filter and sort boosts
  const filteredBoosts = boosts
    .filter(boost => {
      const matchesSearch = searchQuery === '' || 
        boost.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        boost.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || boost.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || boost.category === categoryFilter;
      
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'popularity':
        default:
          const popularityOrder = { bestseller: 4, hot: 3, trending: 2, new: 1 };
          return popularityOrder[b.popularity as keyof typeof popularityOrder] - 
                 popularityOrder[a.popularity as keyof typeof popularityOrder];
      }
    });

  const handlePurchaseBoost = (boost: BoostProduct) => {
    // TODO: Implement purchase flow
    console.log('Purchasing boost:', boost);
    // This would open a client selection modal and payment flow
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Marketplace
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Supercharge your clients' social media performance with premium boosts and track your revenue growth
          </p>
        </div>

        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(revenueStats.totalRevenue)}</p>
                  <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(revenueStats.monthlyRevenue)}</p>
                  <p className="text-xs text-green-600 mt-1">+8% from last month</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Boosts</p>
                  <p className="text-3xl font-bold text-blue-600">{revenueStats.activeBoosts}</p>
                  <p className="text-xs text-muted-foreground mt-1">{revenueStats.totalPurchases} total purchases</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Rocket className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average ROI</p>
                  <p className="text-3xl font-bold text-purple-600">{revenueStats.averageROI}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Across all clients</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="marketplace">Browse Marketplace</TabsTrigger>
            <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search boost products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px] bg-background">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="reach">Reach</SelectItem>
                      <SelectItem value="conversion">Conversion</SelectItem>
                      <SelectItem value="awareness">Awareness</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px] bg-background">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Startup">Startup</SelectItem>
                      <SelectItem value="Branding">Branding</SelectItem>
                      <SelectItem value="Social Impact">Social Impact</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px] bg-background">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Popularity</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Boost Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBoosts.map((boost) => (
                <BoostCard
                  key={boost.id}
                  boost={boost}
                  onPurchase={handlePurchaseBoost}
                />
              ))}
            </div>

            {filteredBoosts.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No boosts found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="purchases" className="space-y-6">
            {/* Purchase History */}
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{purchase.productName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {purchase.clientName} • {formatDate(purchase.purchaseDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(purchase.price)}</p>
                        <Badge className={cn(
                          purchase.status === 'active' && "bg-green-100 text-green-800",
                          purchase.status === 'completed' && "bg-blue-100 text-blue-800",
                          purchase.status === 'cancelled' && "bg-red-100 text-red-800"
                        )}>
                          {purchase.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Impressions</p>
                        <p className="text-lg font-bold">{purchase.performance.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Engagements</p>
                        <p className="text-lg font-bold">{purchase.performance.engagements.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversions</p>
                        <p className="text-lg font-bold">{purchase.performance.conversions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className="text-lg font-bold text-green-600">+{purchase.performance.roi}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {purchases.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start boosting your clients' performance with our marketplace products
                  </p>
                  <Button onClick={() => setActiveTab('marketplace')}>
                    Browse Marketplace
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}