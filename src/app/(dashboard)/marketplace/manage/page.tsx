'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Users, 
  DollarSign,
  Activity,
  Eye,
  EyeOff 
} from 'lucide-react';
import { MARKETPLACE_CONSTANTS, MARKETPLACE_TEXT, MARKETPLACE_COLORS } from '@/constants/marketplace-text';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { formatCurrency, getUserCurrency, getUserCurrencyAsync, SUPPORTED_CURRENCIES } from '@/lib/utils/currency';

interface BoostProduct {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  clientTypes: string[];
  popularity: string;
  rating: number;
  reviews: number;
  estimatedROI?: string;
  isRecommended: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  analytics: {
    totalPurchases: number;
    totalRevenue: number;
    activePurchases: number;
    monthlyRevenue: number;
    conversionRate: number;
  };
}

const defaultFormData = {
  name: '',
  description: '',
  type: 'engagement' as const,
  category: 'Business' as const,
  price: 0,
  originalPrice: undefined as number | undefined,
  duration: '',
  features: [] as string[],
  clientTypes: [] as string[],
  estimatedROI: '',
  isRecommended: false,
  isActive: true
};

export default function MarketplaceManagePage() {
  const { userId } = useAuth();
  const { state: { organizationId: contextOrgId } } = useServiceProvider();
  const [products, setProducts] = useState<BoostProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BoostProduct | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [clientTypeInput, setClientTypeInput] = useState('');
  
  // Use organization ID from context
  const organizationId = contextOrgId;

  // Enhanced API error handling
  const handleApiError = (error: any, response?: Response) => {
    if (response) {
      // Handle HTTP errors
      switch (response.status) {
        case 400:
          return MARKETPLACE_CONSTANTS.ERRORS.INVALID_DATA;
        case 401:
          return MARKETPLACE_CONSTANTS.ERRORS.UNAUTHORIZED;
        case 403:
          return MARKETPLACE_CONSTANTS.ERRORS.FORBIDDEN;
        case 409:
          return MARKETPLACE_CONSTANTS.ERRORS.CONFLICT;
        case 422:
          return MARKETPLACE_CONSTANTS.ERRORS.UNPROCESSABLE;
        case 429:
          return MARKETPLACE_CONSTANTS.ERRORS.RATE_LIMITED;
        case 500:
          return MARKETPLACE_CONSTANTS.ERRORS.SERVER_ERROR;
        default:
          return `Server returned error ${response.status}. Please try again.`;
      }
    }
    
    // Handle network/client errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return MARKETPLACE_CONSTANTS.ERRORS.NETWORK_ERROR;
    }
    
    if (error.message.includes('timeout')) {
      return MARKETPLACE_CONSTANTS.ERRORS.TIMEOUT_ERROR;
    }
    
    return error.message || MARKETPLACE_CONSTANTS.ERRORS.UNEXPECTED_ERROR;
  };

  // Retry logic for API calls
  const apiCallWithRetry = async (url: string, options: RequestInit, maxRetries = 2): Promise<Response> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx) or abort
        if (error.name === 'AbortError' || 
            (error instanceof TypeError && !error.message.includes('fetch'))) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError!;
  };

  useEffect(() => {
    if (userId) {
      fetchProducts();
    }
  }, [userId]);

  const fetchProducts = async () => {
    try {
      const response = await apiCallWithRetry(
        `/api/marketplace/products/manage?organizationId=${organizationId}`,
        { method: 'GET' }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || handleApiError(null, response);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      toast({
        title: MARKETPLACE_CONSTANTS.ERRORS.GENERIC,
        description: MARKETPLACE_CONSTANTS.MANAGE.FAILED_TO_LOAD,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData(defaultFormData);
    setEditingProduct(null);
    setShowCreateModal(true);
  };

  const handleEdit = (product: BoostProduct) => {
    setFormData({
      name: product.name,
      description: product.description,
      type: product.type as any,
      category: product.category as any,
      price: product.price,
      originalPrice: product.originalPrice,
      duration: product.duration,
      features: product.features,
      clientTypes: product.clientTypes,
      estimatedROI: product.estimatedROI || '',
      isRecommended: product.isRecommended,
      isActive: product.isActive
    });
    setEditingProduct(product);
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: MARKETPLACE_CONSTANTS.VALIDATION.REQUIRED_FIELD,
        description: MARKETPLACE_CONSTANTS.MANAGE.FILL_REQUIRED_FIELDS,
        variant: 'destructive'
      });
      return;
    }

    if (formData.features.length === 0) {
      toast({
        title: MARKETPLACE_CONSTANTS.VALIDATION.REQUIRED_FIELD,
        description: MARKETPLACE_CONSTANTS.MANAGE.ADD_AT_LEAST_ONE_FEATURE,
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    
    try {
      const url = '/api/marketplace/products/manage';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        organizationId,
        ...(editingProduct && { productId: editingProduct.id })
      };

      const response = await apiCallWithRetry(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || handleApiError(null, response);
        
        // Handle validation errors specifically
        if (response.status === 400 && errorData?.details) {
          const validationErrors = Array.isArray(errorData.details) 
            ? errorData.details.map((err: any) => err.message || err).join(', ')
            : errorData.details.toString();
          
          toast({
            title: MARKETPLACE_CONSTANTS.ERRORS.VALIDATION_FAILED_TITLE,
            description: `${MARKETPLACE_CONSTANTS.ERRORS.VALIDATION_FAILED_PREFIX}${validationErrors}`,
            variant: 'destructive'
          });
          return;
        }
        
        throw new Error(errorMessage);
      }

      toast({
        title: MARKETPLACE_CONSTANTS.SUCCESS.PRODUCT_SAVED,
        description: `Product ${editingProduct ? MARKETPLACE_CONSTANTS.MANAGE.PRODUCT_UPDATED_SUCCESS : MARKETPLACE_CONSTANTS.MANAGE.PRODUCT_CREATED_SUCCESS} successfully.`
      });

      setShowCreateModal(false);
      fetchProducts();
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      toast({
        title: MARKETPLACE_CONSTANTS.ERRORS.GENERIC,
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm(MARKETPLACE_CONSTANTS.MANAGE.DELETE_CONFIRMATION)) {
      return;
    }

    try {
      const response = await apiCallWithRetry(
        `/api/marketplace/products/manage?productId=${productId}&organizationId=${organizationId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || handleApiError(null, response);
        throw new Error(errorMessage);
      }

      toast({
        title: MARKETPLACE_CONSTANTS.SUCCESS.PRODUCT_DELETED,
        description: 'Product deleted successfully.'
      });

      fetchProducts();
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      toast({
        title: MARKETPLACE_CONSTANTS.ERRORS.GENERIC,
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter(f => f !== feature)
    });
  };

  const addClientType = () => {
    if (clientTypeInput.trim() && !formData.clientTypes.includes(clientTypeInput.trim())) {
      setFormData({
        ...formData,
        clientTypes: [...formData.clientTypes, clientTypeInput.trim()]
      });
      setClientTypeInput('');
    }
  };

  const removeClientType = (clientType: string) => {
    setFormData({
      ...formData,
      clientTypes: formData.clientTypes.filter(ct => ct !== clientType)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-semantic-primary mx-auto mb-4"></div>
          <p className="text-semantic-muted-foreground">{MARKETPLACE_TEXT.LOADING.LOADING_PRODUCTS}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" role="main" aria-label="Marketplace product management">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-semantic-foreground">
            {MARKETPLACE_CONSTANTS.HEADERS.MANAGE_PRODUCTS}
          </h1>
          <p className="text-semantic-muted-foreground">
            {MARKETPLACE_CONSTANTS.MANAGE.PAGE_SUBTITLE}
          </p>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-semantic-primary hover:bg-semantic-primary/90 text-custom-white"
          aria-label="Create new boost product"
        >
          <Plus className="w-4 h-4 mr-2" />
          {MARKETPLACE_CONSTANTS.ACTIONS.CREATE_PRODUCT}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" role="region" aria-label="Product statistics overview">
        <Card role="region" aria-label="Total products statistics">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-semantic-muted-foreground">{MARKETPLACE_CONSTANTS.MANAGE.TOTAL_PRODUCTS}</p>
                <p className="text-2xl font-bold text-semantic-foreground">
                  {products.length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-semantic-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-semantic-muted-foreground">{MARKETPLACE_CONSTANTS.MANAGE.ACTIVE_PRODUCTS}</p>
                <p className="text-2xl font-bold text-semantic-foreground">
                  {products.filter(p => p.isActive).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-semantic-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-semantic-muted-foreground">{MARKETPLACE_CONSTANTS.MANAGE.TOTAL_REVENUE}</p>
                <p className="text-2xl font-bold text-semantic-foreground">
                  {formatCurrency(products.reduce((sum, p) => sum + p.analytics.totalRevenue, 0), getUserCurrency())}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-semantic-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-semantic-muted-foreground">{MARKETPLACE_CONSTANTS.MANAGE.TOTAL_SALES}</p>
                <p className="text-2xl font-bold text-semantic-foreground">
                  {products.reduce((sum, p) => sum + p.analytics.totalPurchases, 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-semantic-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card role="region" aria-label="Empty state - no products created">
          <CardContent className="p-12 text-center">
            <div className="text-semantic-muted-foreground">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">{MARKETPLACE_CONSTANTS.EMPTY_STATES.NO_PRODUCTS}</h3>
              <p className="mb-4">{MARKETPLACE_CONSTANTS.EMPTY_STATES.CREATE_FIRST_PRODUCT}</p>
              <Button 
                onClick={handleCreate}
                className="bg-semantic-primary hover:bg-semantic-primary/90 text-custom-white"
                aria-label="Create your first boost product"
              >
                <Plus className="w-4 h-4 mr-2" />
                {MARKETPLACE_CONSTANTS.ACTIONS.CREATE_YOUR_FIRST_PRODUCT}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" role="region" aria-label="Products list">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow" role="article" aria-label={`Product: ${product.name}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-semantic-foreground">
                      {product.name}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      {product.isRecommended && (
                        <Badge className="text-xs bg-semantic-warning/10 text-semantic-warning border-semantic-warning">
                          {MARKETPLACE_CONSTANTS.MANAGE.RECOMMENDED_BADGE}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {product.isActive ? (
                      <Eye className="w-4 h-4 text-semantic-success" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-semantic-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-semantic-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-semantic-foreground">
                      {formatCurrency(product.price, getUserCurrency())}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-semantic-muted-foreground line-through ml-2">
                        {formatCurrency(product.originalPrice, getUserCurrency())}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {product.duration}
                  </Badge>
                </div>
                
                {/* Analytics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-semantic-muted-foreground">{MARKETPLACE_CONSTANTS.MANAGE.SALES_LABEL}</p>
                    <p className="font-semibold text-semantic-foreground">
                      {product.analytics.totalPurchases}
                    </p>
                  </div>
                  <div>
                    <p className="text-semantic-muted-foreground">{MARKETPLACE_CONSTANTS.MANAGE.REVENUE_LABEL}</p>
                    <p className="font-semibold text-semantic-foreground">
                      {formatCurrency(product.analytics.totalRevenue, getUserCurrency())}
                    </p>
                  </div>
                  <div>
                    <p className="text-semantic-muted-foreground">{MARKETPLACE_CONSTANTS.MANAGE.ACTIVE_LABEL}</p>
                    <p className="font-semibold text-semantic-foreground">
                      {product.analytics.activePurchases}
                    </p>
                  </div>
                  <div>
                    <p className="text-semantic-muted-foreground">{MARKETPLACE_CONSTANTS.MANAGE.MONTHLY_LABEL}</p>
                    <p className="font-semibold text-semantic-foreground">
                      {formatCurrency(product.analytics.monthlyRevenue, getUserCurrency())}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                    aria-label={`Edit ${product.name} product`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {MARKETPLACE_CONSTANTS.MANAGE.EDIT_BUTTON}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(product.id)}
                    className="text-semantic-destructive hover:text-semantic-destructive"
                    aria-label={`Delete ${product.name} product`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Product Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal} aria-describedby="create-product-description">
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? MARKETPLACE_CONSTANTS.MANAGE.EDIT_MODAL_TITLE : MARKETPLACE_CONSTANTS.MANAGE.CREATE_MODAL_TITLE}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6" id="create-product-description">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{MARKETPLACE_CONSTANTS.MANAGE.PRODUCT_NAME_REQUIRED}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={MARKETPLACE_CONSTANTS.MANAGE.ENTER_PRODUCT_NAME}
                  aria-required="true"
                  aria-invalid={!formData.name.trim()}
                />
              </div>
              
              <div>
                <Label htmlFor="description">{MARKETPLACE_CONSTANTS.MANAGE.DESCRIPTION_REQUIRED}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={MARKETPLACE_CONSTANTS.MANAGE.DESCRIBE_PRODUCT}
                  rows={3}
                  aria-required="true"
                  aria-invalid={!formData.description.trim()}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">{MARKETPLACE_CONSTANTS.MANAGE.TYPE_LABEL}</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="conversion">Conversion</SelectItem>
                      <SelectItem value="reach">Reach</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="awareness">Awareness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="category">{MARKETPLACE_CONSTANTS.MANAGE.CATEGORY_LABEL}</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Startup">Startup</SelectItem>
                      <SelectItem value="Branding">Branding</SelectItem>
                      <SelectItem value="Social Impact">Social Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h4 className="font-medium text-semantic-foreground">{MARKETPLACE_CONSTANTS.MANAGE.PRICING_DURATION}</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">{MARKETPLACE_CONSTANTS.MANAGE.PRICE_REQUIRED}</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="originalPrice">{MARKETPLACE_CONSTANTS.MANAGE.ORIGINAL_PRICE}</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || undefined })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">{MARKETPLACE_CONSTANTS.MANAGE.DURATION_REQUIRED}</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder={MARKETPLACE_CONSTANTS.MANAGE.DURATION_EXAMPLE}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="estimatedROI">{MARKETPLACE_CONSTANTS.MANAGE.ESTIMATED_ROI}</Label>
                <Input
                  id="estimatedROI"
                  value={formData.estimatedROI}
                  onChange={(e) => setFormData({ ...formData, estimatedROI: e.target.value })}
                  placeholder={MARKETPLACE_CONSTANTS.MANAGE.ROI_EXAMPLE}
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h4 className="font-medium text-semantic-foreground">{MARKETPLACE_CONSTANTS.MANAGE.FEATURES_REQUIRED}</h4>
              
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder={MARKETPLACE_CONSTANTS.MANAGE.ADD_FEATURE}
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  aria-label="Add new product feature"
                />
                <Button type="button" onClick={addFeature} variant="outline">
                  {MARKETPLACE_CONSTANTS.MANAGE.ADD_BUTTON}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeFeature(feature)}
                  >
                    {feature} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Client Types */}
            <div className="space-y-4">
              <h4 className="font-medium text-semantic-foreground">{MARKETPLACE_CONSTANTS.MANAGE.TARGET_CLIENT_TYPES}</h4>
              
              <div className="flex gap-2">
                <Input
                  value={clientTypeInput}
                  onChange={(e) => setClientTypeInput(e.target.value)}
                  placeholder={MARKETPLACE_CONSTANTS.MANAGE.ADD_CLIENT_TYPE}
                  onKeyPress={(e) => e.key === 'Enter' && addClientType()}
                />
                <Button type="button" onClick={addClientType} variant="outline">
                  {MARKETPLACE_CONSTANTS.MANAGE.ADD_BUTTON}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.clientTypes.map((clientType, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => removeClientType(clientType)}
                  >
                    {clientType} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-semantic-foreground">{MARKETPLACE_CONSTANTS.MANAGE.SETTINGS_SECTION}</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isRecommended">{MARKETPLACE_CONSTANTS.MANAGE.RECOMMENDED_PRODUCT}</Label>
                  <p className="text-sm text-semantic-muted-foreground">
                    {MARKETPLACE_CONSTANTS.MANAGE.RECOMMENDED_DESCRIPTION}
                  </p>
                </div>
                <Switch
                  id="isRecommended"
                  checked={formData.isRecommended}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRecommended: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">{MARKETPLACE_CONSTANTS.MANAGE.ACTIVE_PRODUCT}</Label>
                  <p className="text-sm text-semantic-muted-foreground">
                    {MARKETPLACE_CONSTANTS.MANAGE.ACTIVE_DESCRIPTION}
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
                disabled={saving}
              >
                {MARKETPLACE_CONSTANTS.MANAGE.CANCEL_BUTTON}
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-semantic-primary hover:bg-semantic-primary/90 text-custom-white"
              >
                {saving ? MARKETPLACE_CONSTANTS.MANAGE.SAVING_BUTTON : editingProduct ? MARKETPLACE_CONSTANTS.MANAGE.UPDATE_PRODUCT : MARKETPLACE_CONSTANTS.MANAGE.CREATE_PRODUCT_BUTTON}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}