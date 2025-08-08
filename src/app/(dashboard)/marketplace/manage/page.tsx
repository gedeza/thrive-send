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
import { MARKETPLACE_CONSTANTS } from '@/constants/marketplace-text';

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
  const [products, setProducts] = useState<BoostProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BoostProduct | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [clientTypeInput, setClientTypeInput] = useState('');
  
  // For demo purposes, using a placeholder organization ID
  const organizationId = 'org_placeholder';

  useEffect(() => {
    if (userId) {
      fetchProducts();
    }
  }, [userId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `/api/marketplace/products/manage?organizationId=${organizationId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: MARKETPLACE_CONSTANTS.ERRORS.GENERIC,
        description: 'Failed to load your products.',
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
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.features.length === 0) {
      toast({
        title: MARKETPLACE_CONSTANTS.VALIDATION.REQUIRED_FIELD,
        description: 'Please add at least one feature.',
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

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      toast({
        title: MARKETPLACE_CONSTANTS.SUCCESS.PRODUCT_SAVED,
        description: `Product ${editingProduct ? 'updated' : 'created'} successfully.`
      });

      setShowCreateModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: MARKETPLACE_CONSTANTS.ERRORS.GENERIC,
        description: error instanceof Error ? error.message : 'Failed to save product.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/marketplace/products/manage?productId=${productId}&organizationId=${organizationId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      toast({
        title: MARKETPLACE_CONSTANTS.SUCCESS.PRODUCT_DELETED,
        description: 'Product deleted successfully.'
      });

      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: MARKETPLACE_CONSTANTS.ERRORS.GENERIC,
        description: error instanceof Error ? error.message : 'Failed to delete product.',
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
          <p className="text-semantic-muted-foreground">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-semantic-foreground">
            {MARKETPLACE_CONSTANTS.HEADERS.MANAGE_PRODUCTS}
          </h1>
          <p className="text-semantic-muted-foreground">
            Manage your boost products and track their performance
          </p>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-semantic-primary hover:bg-semantic-primary/90 text-custom-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Product
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-semantic-muted-foreground">Total Products</p>
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
                <p className="text-sm text-semantic-muted-foreground">Active Products</p>
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
                <p className="text-sm text-semantic-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-semantic-foreground">
                  ${products.reduce((sum, p) => sum + p.analytics.totalRevenue, 0).toLocaleString()}
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
                <p className="text-sm text-semantic-muted-foreground">Total Sales</p>
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
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-semantic-muted-foreground">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No products yet</h3>
              <p className="mb-4">Create your first boost product to start selling in the marketplace.</p>
              <Button 
                onClick={handleCreate}
                className="bg-semantic-primary hover:bg-semantic-primary/90 text-custom-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Product
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
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
                          Recommended
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
                      ${product.price}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-semantic-muted-foreground line-through ml-2">
                        ${product.originalPrice}
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
                    <p className="text-semantic-muted-foreground">Sales</p>
                    <p className="font-semibold text-semantic-foreground">
                      {product.analytics.totalPurchases}
                    </p>
                  </div>
                  <div>
                    <p className="text-semantic-muted-foreground">Revenue</p>
                    <p className="font-semibold text-semantic-foreground">
                      ${product.analytics.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-semantic-muted-foreground">Active</p>
                    <p className="font-semibold text-semantic-foreground">
                      {product.analytics.activePurchases}
                    </p>
                  </div>
                  <div>
                    <p className="text-semantic-muted-foreground">Monthly</p>
                    <p className="font-semibold text-semantic-foreground">
                      ${product.analytics.monthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(product.id)}
                    className="text-semantic-destructive hover:text-semantic-destructive"
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
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your boost product"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
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
                  <Label htmlFor="category">Category</Label>
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
              <h4 className="font-medium text-semantic-foreground">Pricing & Duration</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
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
                  <Label htmlFor="originalPrice">Original Price</Label>
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
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 30 days"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="estimatedROI">Estimated ROI</Label>
                <Input
                  id="estimatedROI"
                  value={formData.estimatedROI}
                  onChange={(e) => setFormData({ ...formData, estimatedROI: e.target.value })}
                  placeholder="e.g. 200-300%"
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h4 className="font-medium text-semantic-foreground">Features *</h4>
              
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add a feature"
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <Button type="button" onClick={addFeature} variant="outline">
                  Add
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
              <h4 className="font-medium text-semantic-foreground">Target Client Types</h4>
              
              <div className="flex gap-2">
                <Input
                  value={clientTypeInput}
                  onChange={(e) => setClientTypeInput(e.target.value)}
                  placeholder="Add a client type"
                  onKeyPress={(e) => e.key === 'Enter' && addClientType()}
                />
                <Button type="button" onClick={addClientType} variant="outline">
                  Add
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
              <h4 className="font-medium text-semantic-foreground">Settings</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isRecommended">Recommended Product</Label>
                  <p className="text-sm text-semantic-muted-foreground">
                    Mark as recommended for higher visibility
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
                  <Label htmlFor="isActive">Active Product</Label>
                  <p className="text-sm text-semantic-muted-foreground">
                    Active products are visible in the marketplace
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
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-semantic-primary hover:bg-semantic-primary/90 text-custom-white"
              >
                {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}