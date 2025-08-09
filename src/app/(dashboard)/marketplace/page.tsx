'use client';

import React, { useState, useEffect } from 'react';
import { MARKETPLACE_TEXT, MARKETPLACE_COLORS } from '@/constants/marketplace-text';
import { formatCurrency, getUserCurrency } from '@/lib/utils/currency';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { toast } from '@/components/ui/use-toast';
import { CampaignIntegrationModal } from '@/components/marketplace/CampaignIntegrationModal';
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
  Link as LinkIcon,
  Crown,
  Rocket,
  Award,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  expiresAt: string;
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
    case 'hot': return <Zap className={`h-4 w-4 ${MARKETPLACE_COLORS.POPULARITY.HOT}`} />;
    case 'trending': return <TrendingUp className={`h-4 w-4 ${MARKETPLACE_COLORS.POPULARITY.TRENDING}`} />;
    case 'new': return <Sparkles className={`h-4 w-4 ${MARKETPLACE_COLORS.POPULARITY.NEW}`} />;
    case 'bestseller': return <Crown className={`h-4 w-4 ${MARKETPLACE_COLORS.POPULARITY.BESTSELLER}`} />;
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
    )} role="article" aria-labelledby={`boost-${boost.id}`} aria-describedby={`boost-desc-${boost.id}`}>
      {boost.isRecommended && (
        <div className={`absolute top-0 right-0 ${MARKETPLACE_COLORS.POPULARITY.RECOMMENDED} px-3 py-1 text-xs font-medium rounded-bl-lg`}>
          {MARKETPLACE_TEXT.BOOST_CARD.RECOMMENDED}
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
        
        <CardTitle id={`boost-${boost.id}`} className="text-xl">{boost.name}</CardTitle>
        <p id={`boost-desc-${boost.id}`} className="text-sm text-muted-foreground">{boost.description}</p>
        
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
            <Badge className={`${MARKETPLACE_COLORS.BADGES.SALE} text-xs`}>
              {MARKETPLACE_TEXT.BOOST_CARD.SAVE(formatCurrency(boost.originalPrice! - boost.price))}
            </Badge>
          )}
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className={`text-lg font-bold ${MARKETPLACE_COLORS.METRICS.INCREASE}`}>{boost.metrics.averageIncrease}</p>
            <p className="text-xs text-muted-foreground">{MARKETPLACE_TEXT.BOOST_CARD.AVG_INCREASE}</p>
          </div>
          <div>
            <p className={`text-lg font-bold ${MARKETPLACE_COLORS.METRICS.SUCCESS_RATE}`}>{boost.metrics.successRate}%</p>
            <p className="text-xs text-muted-foreground">{MARKETPLACE_TEXT.BOOST_CARD.SUCCESS_RATE}</p>
          </div>
          <div>
            <p className={`text-lg font-bold ${MARKETPLACE_COLORS.METRICS.ROI}`}>{boost.estimatedROI}</p>
            <p className="text-xs text-muted-foreground">{MARKETPLACE_TEXT.BOOST_CARD.EST_ROI}</p>
          </div>
        </div>
        
        {/* Features (first 3) */}
        <div className="space-y-1" role="list" aria-labelledby={`boost-features-${boost.id}`}>
          <p id={`boost-features-${boost.id}`} className="text-sm font-medium">{MARKETPLACE_TEXT.BOOST_CARD.KEY_FEATURES}</p>
          {boost.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm" role="listitem">
              <CheckCircle className={`h-3 w-3 ${MARKETPLACE_COLORS.TEXT.SUCCESS} flex-shrink-0`} aria-hidden="true" />
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
          {boost.features.length > 3 && (
            <p className="text-xs text-muted-foreground">
              {MARKETPLACE_TEXT.BOOST_CARD.MORE_FEATURES(boost.features.length - 3)}
            </p>
          )}
        </div>
        
        {/* Rating and reviews */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className={`h-4 w-4 fill-yellow-400 ${MARKETPLACE_COLORS.POPULARITY.BESTSELLER}`} />
            <span className="font-medium">{boost.rating}</span>
            <span className="text-muted-foreground">{MARKETPLACE_TEXT.BOOST_CARD.REVIEWS(boost.reviews)}</span>
          </div>
          <span className="text-muted-foreground">
            {MARKETPLACE_TEXT.BOOST_CARD.CLIENTS(boost.metrics.clientsUsed)}
          </span>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onPurchase(boost)}
            className="flex-1"
            size="lg"
            aria-label={MARKETPLACE_TEXT.ARIA.PURCHASE_BOOST(boost.name)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" aria-hidden="true" />
            {MARKETPLACE_TEXT.ACTIONS.PURCHASE_BOOST}
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" aria-label={MARKETPLACE_TEXT.ARIA.VIEW_BOOST_DETAILS(boost.name)}>
                <Eye className="h-4 w-4" aria-hidden="true" />
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
  const [boosts, setBoosts] = useState<BoostProduct[]>([]);
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state: { organizationId } } = useServiceProvider();
  const userCurrency = getUserCurrency();

  // Client selection modal state
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedBoost, setSelectedBoost] = useState<BoostProduct | null>(null);
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // Campaign integration modal state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseHistory | null>(null);

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

  // Fetch marketplace data
  const fetchMarketplaceData = async () => {
    if (!organizationId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Temporarily use demo data to resolve runtime errors
      // TODO: Re-enable API calls once authentication issues are resolved
      console.log('Loading marketplace with demo data for org:', organizationId);
      
      setBoosts(demoBoosts);
      setPurchases([]);
      setRevenueStats(demoRevenueStats);
      
      /*
      // Real API calls (disabled due to 401 auth issues)
      const [boostsResponse, purchasesResponse, revenueResponse] = await Promise.all([
        fetch(`/api/marketplace/products?organizationId=${organizationId}&sortBy=${sortBy}&limit=50`),
        fetch(`/api/marketplace/purchases?organizationId=${organizationId}&limit=20`),
        fetch(`/api/marketplace/revenue?organizationId=${organizationId}`)
      ]);
      
      if (!boostsResponse.ok) {
        throw new Error('Failed to fetch boost products');
      }
      
      const boostsData = await boostsResponse.json();
      setBoosts(boostsData.boosts || []);
      
      // Handle purchases (might not exist yet)
      if (purchasesResponse.ok) {
        const purchasesData = await purchasesResponse.json();
        setPurchases(purchasesData.purchases || []);
      }
      
      // Handle revenue stats (might not exist yet)
      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        setRevenueStats(revenueData.revenueStats || {
          totalRevenue: 0,
          monthlyRevenue: 0,
          activeBoosts: 0,
          totalPurchases: 0,
          averageROI: 0,
          topPerformingBoost: 'N/A'
        });
      } else {
        // Set default revenue stats if none exist
        setRevenueStats({
          totalRevenue: 0,
          monthlyRevenue: 0,
          activeBoosts: 0,
          totalPurchases: 0,
          averageROI: 0,
          topPerformingBoost: 'N/A'
        });
      }
      */
      
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
      setError('Failed to load marketplace data');
      toast({
        title: 'Error',
        description: 'Failed to load marketplace data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on mount and when organizationId or sortBy changes
  useEffect(() => {
    fetchMarketplaceData();
  }, [organizationId, sortBy]);
  
  const handlePurchaseBoost = async (boost: BoostProduct) => {
    if (!organizationId) {
      toast({
        title: 'Error',
        description: 'No organization selected',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Temporarily use demo clients to resolve auth issues
      // TODO: Re-enable API call once authentication issues are resolved
      const clients = [
        {
          id: 'client-1',
          name: 'City of Cape Town',
          email: 'marketing@capetown.gov.za',
          type: 'municipality',
          industry: 'Government',
          monthlyBudget: 25000
        },
        {
          id: 'client-2',
          name: 'Metro Health Services',
          email: 'communications@metrohealth.gov',
          type: 'government',
          industry: 'Healthcare',
          monthlyBudget: 15000
        }
      ];
      
      if (clients.length === 0) {
        toast({
          title: 'No Clients Available',
          description: 'You need to have active clients to purchase boosts. Please add clients first.',
          variant: 'destructive'
        });
        return;
      }
      
      // Open client selection modal
      setSelectedBoost(boost);
      setAvailableClients(clients);
      setSelectedClient('');
      setShowClientModal(true);
      
    } catch (error) {
      console.error('Error initiating purchase:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate purchase flow',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePurchase = async () => {
    if (!selectedBoost || !selectedClient || !organizationId) {
      toast({
        title: 'Error',
        description: 'Please select a client to proceed with the purchase.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setPurchaseLoading(true);
      
      const purchaseData = {
        boostProductId: selectedBoost.id,
        clientId: selectedClient,
        organizationId,
        paymentMethod: 'credit_card', // Default for now
        notes: `Purchase of ${selectedBoost.name} boost for client`
      };

      const response = await fetch('/api/marketplace/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(purchaseData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Purchase failed');
      }

      const result = await response.json();
      
      toast({
        title: 'Purchase Successful!',
        description: `Successfully purchased ${selectedBoost.name} boost. Your campaign will begin shortly.`,
      });

      // Close modal and refresh data
      setShowClientModal(false);
      setSelectedBoost(null);
      setSelectedClient('');
      fetchMarketplaceData(); // Refresh to show new purchase
      
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: error instanceof Error ? error.message : 'Failed to complete purchase. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Handle campaign integration
  const handleCampaignIntegration = (purchase: PurchaseHistory) => {
    setSelectedPurchase(purchase);
    setShowCampaignModal(true);
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 space-y-8" role="main" aria-labelledby="marketplace-title">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 id="marketplace-title" className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {MARKETPLACE_TEXT.TITLE}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {MARKETPLACE_TEXT.SUBTITLE}
          </p>
        </div>

        {/* Revenue Overview Cards */}
        {revenueStats && !loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" role="region" aria-labelledby="revenue-overview">
          <Card className="hover:shadow-md transition-shadow" role="article" aria-labelledby="total-revenue-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p id="total-revenue-card" className="text-sm font-medium text-muted-foreground">{MARKETPLACE_TEXT.REVENUE_CARDS.TOTAL_REVENUE}</p>
                  <p className={`text-3xl font-bold ${MARKETPLACE_COLORS.REVENUE_CARDS.TOTAL.TEXT}`} aria-label={`Total revenue: ${formatCurrency(revenueStats.totalRevenue)}`}>{formatCurrency(revenueStats.totalRevenue)}</p>
                  <p className={`text-xs ${MARKETPLACE_COLORS.TEXT.SUCCESS} mt-1`}>+12% {MARKETPLACE_TEXT.REVENUE_CARDS.FROM_LAST_MONTH}</p>
                </div>
                <div className={`p-3 ${MARKETPLACE_COLORS.REVENUE_CARDS.TOTAL.BACKGROUND} rounded-full`}>
                  <DollarSign className={`h-6 w-6 ${MARKETPLACE_COLORS.REVENUE_CARDS.TOTAL.TEXT}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{MARKETPLACE_TEXT.REVENUE_CARDS.MONTHLY_REVENUE}</p>
                  <p className={`text-3xl font-bold ${MARKETPLACE_COLORS.REVENUE_CARDS.MONTHLY.TEXT}`}>{formatCurrency(revenueStats.monthlyRevenue)}</p>
                  <p className={`text-xs ${MARKETPLACE_COLORS.TEXT.SUCCESS} mt-1`}>+8% {MARKETPLACE_TEXT.REVENUE_CARDS.FROM_LAST_MONTH}</p>
                </div>
                <div className={`p-3 ${MARKETPLACE_COLORS.REVENUE_CARDS.MONTHLY.BACKGROUND} rounded-full`}>
                  <TrendingUp className={`h-6 w-6 ${MARKETPLACE_COLORS.REVENUE_CARDS.MONTHLY.TEXT}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{MARKETPLACE_TEXT.REVENUE_CARDS.ACTIVE_BOOSTS}</p>
                  <p className={`text-3xl font-bold ${MARKETPLACE_COLORS.REVENUE_CARDS.ACTIVE.TEXT}`}>{revenueStats.activeBoosts}</p>
                  <p className="text-xs text-muted-foreground mt-1">{revenueStats.totalPurchases} {MARKETPLACE_TEXT.REVENUE_CARDS.TOTAL_PURCHASES}</p>
                </div>
                <div className={`p-3 ${MARKETPLACE_COLORS.REVENUE_CARDS.ACTIVE.BACKGROUND} rounded-full`}>
                  <Rocket className={`h-6 w-6 ${MARKETPLACE_COLORS.REVENUE_CARDS.ACTIVE.TEXT}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{MARKETPLACE_TEXT.REVENUE_CARDS.AVERAGE_ROI}</p>
                  <p className={`text-3xl font-bold ${MARKETPLACE_COLORS.REVENUE_CARDS.ROI.TEXT}`}>{revenueStats.averageROI}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{MARKETPLACE_TEXT.REVENUE_CARDS.ACROSS_ALL_CLIENTS}</p>
                </div>
                <div className={`p-3 ${MARKETPLACE_COLORS.REVENUE_CARDS.ROI.BACKGROUND} rounded-full`}>
                  <BarChart3 className={`h-6 w-6 ${MARKETPLACE_COLORS.REVENUE_CARDS.ROI.TEXT}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading marketplace...</p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 font-medium">Error Loading Marketplace</p>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <Button 
              onClick={fetchMarketplaceData} 
              variant="outline" 
              size="sm" 
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Tabs */}
        {!loading && !error && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="marketplace">{MARKETPLACE_TEXT.TABS.MARKETPLACE}</TabsTrigger>
            <TabsTrigger value="purchases">{MARKETPLACE_TEXT.TABS.PURCHASES}</TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder={MARKETPLACE_TEXT.SEARCH.PLACEHOLDER}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background"
                      aria-label={MARKETPLACE_TEXT.ARIA.SEARCH_PRODUCTS}
                      role="searchbox"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Select value={typeFilter} onValueChange={setTypeFilter} aria-label={MARKETPLACE_TEXT.ARIA.FILTER_BY_TYPE}>
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
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter} aria-label={MARKETPLACE_TEXT.ARIA.FILTER_BY_CATEGORY}>
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
                  
                  <Select value={sortBy} onValueChange={setSortBy} aria-label={MARKETPLACE_TEXT.ARIA.SORT_PRODUCTS}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="region" aria-label="Available boost products">
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
                  <h3 className="text-lg font-semibold mb-2">{MARKETPLACE_TEXT.EMPTY_STATES.NO_BOOSTS_FOUND}</h3>
                  <p className="text-muted-foreground">
                    {MARKETPLACE_TEXT.EMPTY_STATES.ADJUST_SEARCH_CRITERIA}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="purchases" className="space-y-6">
            {/* Purchase History */}
            <div className="space-y-4" role="region" aria-label={MARKETPLACE_TEXT.ARIA.PURCHASE_HISTORY}>
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="hover:shadow-md transition-shadow" role="article" aria-labelledby={`purchase-${purchase.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 id={`purchase-${purchase.id}`} className="font-semibold text-lg">{purchase.productName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {purchase.clientName} • {formatDate(purchase.purchaseDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(purchase.price)}</p>
                        <Badge className={cn(
                          purchase.status === 'active' && MARKETPLACE_COLORS.STATUS.ACTIVE,
                          purchase.status === 'completed' && MARKETPLACE_COLORS.STATUS.COMPLETED,
                          purchase.status === 'cancelled' && MARKETPLACE_COLORS.STATUS.CANCELLED
                        )}>
                          {purchase.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{MARKETPLACE_TEXT.PURCHASE_HISTORY.IMPRESSIONS}</p>
                        <p className="text-lg font-bold">{purchase.performance.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{MARKETPLACE_TEXT.PURCHASE_HISTORY.ENGAGEMENTS}</p>
                        <p className="text-lg font-bold">{purchase.performance.engagements.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{MARKETPLACE_TEXT.PURCHASE_HISTORY.CONVERSIONS}</p>
                        <p className="text-lg font-bold">{purchase.performance.conversions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{MARKETPLACE_TEXT.PURCHASE_HISTORY.ROI}</p>
                        <p className={`text-lg font-bold ${MARKETPLACE_COLORS.TEXT.SUCCESS}`}>+{purchase.performance.roi}%</p>
                      </div>
                    </div>
                    
                    {/* Campaign Integration Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Expires: {new Date(purchase.expiresAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCampaignIntegration(purchase)}
                          className="flex items-center gap-2"
                          disabled={purchase.status !== 'active'}
                        >
                          <LinkIcon className="h-4 w-4" />
                          Link to Campaign
                        </Button>
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
                  <h3 className="text-lg font-semibold mb-2">{MARKETPLACE_TEXT.EMPTY_STATES.NO_PURCHASES_YET}</h3>
                  <p className="text-muted-foreground mb-4">
                    {MARKETPLACE_TEXT.EMPTY_STATES.START_BOOSTING}
                  </p>
                  <Button onClick={() => setActiveTab('marketplace')}>
                    {MARKETPLACE_TEXT.ACTIONS.BROWSE_MARKETPLACE}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        )}

        {/* Client Selection Modal */}
        <Dialog open={showClientModal} onOpenChange={setShowClientModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Purchase Boost: {selectedBoost?.name}
              </DialogTitle>
              <DialogDescription>
                Select a client for this boost campaign. The boost will be applied to the selected client's content and campaigns.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Boost Summary */}
              {selectedBoost && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{selectedBoost.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{selectedBoost.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(selectedBoost.price)}
                      </p>
                      {selectedBoost.originalPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          {formatCurrency(selectedBoost.originalPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedBoost.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{selectedBoost.estimatedROI} ROI</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Client Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Select Client</label>
                <div className="grid gap-3 max-h-64 overflow-y-auto">
                  {availableClients.map((client) => (
                    <div
                      key={client.id}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                        selectedClient === client.id 
                          ? "border-primary bg-primary/5" 
                          : "border-muted-foreground/20"
                      )}
                      onClick={() => setSelectedClient(client.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {client.logoUrl ? (
                              <img 
                                src={client.logoUrl} 
                                alt={client.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h5 className="font-medium">{client.name}</h5>
                            <p className="text-sm text-muted-foreground">{client.type} • {client.industry}</p>
                            {client.monthlyBudget && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Monthly Budget: {formatCurrency(client.monthlyBudget)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {selectedClient === client.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                          {client.performance && (
                            <div className="text-xs text-muted-foreground">
                              <p>Engagement: {client.performance.engagementRate.toFixed(1)}%</p>
                              <p>ROI: {client.performance.roi.toFixed(0)}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {selectedClient && selectedBoost ? (
                    <p>Ready to purchase {selectedBoost.name} for the selected client</p>
                  ) : (
                    <p>Please select a client to continue</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowClientModal(false)}
                    disabled={purchaseLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCompletePurchase}
                    disabled={!selectedClient || purchaseLoading}
                    className="min-w-[120px]"
                  >
                    {purchaseLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Purchase Now</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Campaign Integration Modal */}
        <CampaignIntegrationModal
          isOpen={showCampaignModal}
          onClose={() => {
            setShowCampaignModal(false);
            setSelectedPurchase(null);
          }}
          boostPurchase={selectedPurchase ? {
            id: selectedPurchase.id,
            productName: selectedPurchase.productName,
            clientId: selectedPurchase.clientId,
            clientName: selectedPurchase.clientName,
            expiresAt: selectedPurchase.expiresAt,
            status: selectedPurchase.status as 'active' | 'expired' | 'cancelled',
            performance: selectedPurchase.performance
          } : null}
          organizationId={organizationId || ''}
        />
      </div>
    </TooltipProvider>
  );
}