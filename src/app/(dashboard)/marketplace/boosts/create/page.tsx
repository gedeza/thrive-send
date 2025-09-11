'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  X, 
  Save, 
  Eye, 
  Send, 
  AlertCircle, 
  CheckCircle,
  Lightbulb,
  Target,
  DollarSign,
  Clock,
  Image,
  Video,
  Zap,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { 
  validateListing, 
  calculateRecommendedPricing, 
  generateSEOSuggestions, 
  LISTING_CATEGORIES 
} from '@/lib/services/marketplace';
import { formatCurrency, getUserCurrency, SUPPORTED_CURRENCIES } from '@/lib/utils/currency';
import { toast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';

const BOOST_TYPES = [
  { value: 'engagement', label: 'Engagement Boost', icon: '❤️', description: 'Increase likes, comments, and interactions' },
  { value: 'reach', label: 'Reach Boost', icon: '📢', description: 'Expand audience and visibility' },
  { value: 'conversion', label: 'Conversion Boost', icon: '🎯', description: 'Drive sales and actions' },
  { value: 'awareness', label: 'Awareness Boost', icon: '👁️', description: 'Build brand recognition' },
  { value: 'premium', label: 'Premium Boost', icon: '👑', description: 'Elite targeting and positioning' }
];

const CLIENT_TYPES = [
  'municipality', 'government', 'business', 'startup', 'nonprofit', 'enterprise', 'creator', 'executive'
];

const TARGET_AUDIENCES = [
  'small-business', 'ecommerce', 'b2b-companies', 'municipalities', 'government-agencies', 
  'civic-organizations', 'startups', 'tech-companies', 'nonprofits', 'social-causes',
  'enterprise', 'corporate', 'executives', 'professionals', 'creators', 'influencers'
];

export default function CreateBoostPage() {
  const router = useRouter();
  const { state: { organizationId } } = useServiceProvider();
  const userCurrency = getUserCurrency();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    category: '',
    basePrice: 0,
    currency: userCurrency,
    duration: '30 days',
    features: [''],
    targetAudience: [],
    clientTypes: [],
    tags: [''],
    images: [''],
    videoUrl: '',
    seoTitle: '',
    seoDescription: ''
  });

  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });
  const [recommendedPricing, setRecommendedPricing] = useState(null);
  const [seoSuggestions, setSeoSuggestions] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Add new feature input
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  // Remove feature
  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Update feature
  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  // Add/remove target audience
  const toggleTargetAudience = (audience: string) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(audience)
        ? prev.targetAudience.filter(a => a !== audience)
        : [...prev.targetAudience, audience]
    }));
  };

  // Add/remove client type
  const toggleClientType = (clientType: string) => {
    setFormData(prev => ({
      ...prev,
      clientTypes: prev.clientTypes.includes(clientType)
        ? prev.clientTypes.filter(c => c !== clientType)
        : [...prev.clientTypes, clientType]
    }));
  };

  // Add new tag
  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  // Remove tag
  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Update tag
  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value.toLowerCase().replace(/\s+/g, '-') : tag)
    }));
  };

  // Validate form
  const validateForm = () => {
    const cleanFormData = {
      ...formData,
      features: formData.features.filter(f => f.trim() !== ''),
      tags: formData.tags.filter(t => t.trim() !== '')
    };
    
    const result = validateListing(cleanFormData);
    setValidation(result);
    return result.isValid;
  };

  // Get recommended pricing
  const getRecommendedPricing = async () => {
    if (formData.category && formData.features.length > 0 && formData.targetAudience.length > 0) {
      try {
        const pricing = await calculateRecommendedPricing(
          formData.category,
          formData.features.filter(f => f.trim() !== ''),
          formData.targetAudience
        );
        setRecommendedPricing(pricing);
      } catch (_error) {
        console.error("", _error);
      }
    }
  };

  // Generate SEO suggestions
  const generateSEO = () => {
    if (formData.name && formData.category && formData.type) {
      const suggestions = generateSEOSuggestions({
        name: formData.name,
        category: formData.category,
        type: formData.type,
        features: formData.features.filter(f => f.trim() !== ''),
        metrics: { successRate: 90 } // Default for new listings
      });
      setSeoSuggestions(suggestions);
      setFormData(prev => ({
        ...prev,
        seoTitle: suggestions.title,
        seoDescription: suggestions.description,
        tags: [...new Set([...prev.tags.filter(t => t.trim() !== ''), ...suggestions.tags])]
      }));
    }
  };

  // Submit listing
  const handleSubmit = async (status: 'draft' | 'review') => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanFormData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== ''),
        tags: formData.tags.filter(t => t.trim() !== ''),
        images: formData.images.filter(i => i.trim() !== ''),
        isBoostProduct: true
      };

      const response = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanFormData)
      });

      if (!response.ok) {
        throw new Error('Failed to create boost product');
      }

      const listing = await response.json();
      
      toast({
        title: 'Success!',
        description: `Boost product ${status === 'draft' ? 'saved as draft' : 'submitted for review'}.`,
      });

      router.push('/marketplace');
    } catch (_error) {
      console.error("", _error);
      toast({
        title: 'Error',
        description: 'Failed to create boost product. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-validate when moving between steps
  useEffect(() => {
    validateForm();
  }, [formData]);

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/marketplace">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create Boost Product</h1>
            <p className="text-muted-foreground">
              Create a new boost product for the ThriveSend marketplace
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto">
          {[
            { step: 1, title: 'Basic Info', icon: <Target className="h-4 w-4" /> },
            { step: 2, title: 'Features & Targeting', icon: <Zap className="h-4 w-4" /> },
            { step: 3, title: 'Pricing & SEO', icon: <DollarSign className="h-4 w-4" /> },
            { step: 4, title: 'Review & Submit', icon: <CheckCircle className="h-4 w-4" /> }
          ].map(({ step, title, icon }, index) => (
            <div key={step} className="flex items-center gap-2 whitespace-nowrap">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {currentStep > step ? <CheckCircle className="h-4 w-4" /> : icon}
              </div>
              <span className={`text-sm ${
                currentStep >= step ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {title}
              </span>
              {index < 3 && <div className="w-8 h-0.5 bg-muted hidden md:block" />}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Municipal Engagement Pro"
                      className="mt-1"
                    />
                    {validation.errors.some(e => e.includes('name')) && (
                      <p className="text-sm text-red-500 mt-1">Product name is required</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Boost Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select boost type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BOOST_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {LISTING_CATEGORIES.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-xs text-muted-foreground">{category.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7 days">7 days</SelectItem>
                        <SelectItem value="14 days">14 days</SelectItem>
                        <SelectItem value="30 days">30 days</SelectItem>
                        <SelectItem value="45 days">45 days</SelectItem>
                        <SelectItem value="60 days">60 days</SelectItem>
                        <SelectItem value="90 days">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of your boost product, its benefits, and how it works..."
                    rows={4}
                    className="mt-1"
                  />
                  <div className={`text-xs mt-1 ${formData.description.length >= 50 ? 'text-muted-foreground' : 'text-red-500'}`}>
                    {formData.description.length}/2000 characters (minimum 50)
                  </div>
                  {validation.errors.some(e => e.includes('Description')) && (
                    <p className="text-sm text-red-500 mt-1">Description must be at least 50 characters</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.name || !formData.type || !formData.category || formData.description.length < 50}
                  >
                    Next: Features & Targeting
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Features & Targeting */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Features & Targeting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Features */}
                <div>
                  <Label>Features *</Label>
                  <div className="space-y-2 mt-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="Feature description"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                          disabled={formData.features.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFeature}
                      className="w-full"
                      disabled={formData.features.length >= 15}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature ({formData.features.length}/15)
                    </Button>
                  </div>
                  {validation.errors.some(e => e.includes('feature')) && (
                    <p className="text-sm text-red-500 mt-1">At least one feature is required</p>
                  )}
                </div>

                {/* Target Audience */}
                <div>
                  <Label>Target Audience *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {TARGET_AUDIENCES.map(audience => (
                      <div key={audience} className="flex items-center space-x-2">
                        <Checkbox
                          id={`audience-${audience}`}
                          checked={formData.targetAudience.includes(audience)}
                          onCheckedChange={() => toggleTargetAudience(audience)}
                        />
                        <Label
                          htmlFor={`audience-${audience}`}
                          className="text-sm capitalize cursor-pointer"
                        >
                          {audience.replace('-', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {validation.errors.some(e => e.includes('audience')) && (
                    <p className="text-sm text-red-500 mt-1">Target audience is required</p>
                  )}
                </div>

                {/* Client Types */}
                <div>
                  <Label>Client Types *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {CLIENT_TYPES.map(clientType => (
                      <div key={clientType} className="flex items-center space-x-2">
                        <Checkbox
                          id={`client-${clientType}`}
                          checked={formData.clientTypes.includes(clientType)}
                          onCheckedChange={() => toggleClientType(clientType)}
                        />
                        <Label
                          htmlFor={`client-${clientType}`}
                          className="text-sm capitalize cursor-pointer"
                        >
                          {clientType}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(3)}
                    disabled={formData.features.filter(f => f.trim()).length === 0 || formData.targetAudience.length === 0}
                  >
                    Next: Pricing & SEO
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Pricing & SEO */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing & SEO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Base Price *</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.basePrice || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                        placeholder="299.00"
                        className="flex-1"
                      />
                      <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SUPPORTED_CURRENCIES).map(([code, config]) => (
                            <SelectItem key={code} value={code}>
                              {config.symbol}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {validation.errors.some(e => e.includes('price')) && (
                      <p className="text-sm text-red-500 mt-1">Base price must be greater than 0</p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Recommended Pricing</Label>
                    <div className="mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={getRecommendedPricing}
                        disabled={!formData.category || formData.features.filter(f => f.trim()).length === 0}
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Get Suggestions
                      </Button>
                      {recommendedPricing && (
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium">
                            Recommended: {formatCurrency(recommendedPricing.recommendedPrice, formData.currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Range: {formatCurrency(recommendedPricing.priceRange.min, formData.currency)} - {formatCurrency(recommendedPricing.priceRange.max, formData.currency)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SEO */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>SEO Optimization</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSEO}
                      disabled={!formData.name || !formData.category}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Generate SEO
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input
                      id="seoTitle"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                      placeholder="Auto-generated or custom SEO title"
                      className="mt-1"
                      maxLength={60}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {formData.seoTitle.length}/60 characters
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Textarea
                      id="seoDescription"
                      value={formData.seoDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                      placeholder="Auto-generated or custom SEO description"
                      rows={2}
                      className="mt-1"
                      maxLength={160}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {formData.seoDescription.length}/160 characters
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="space-y-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          placeholder="tag-name"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTag(index)}
                          disabled={formData.tags.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                      className="w-full"
                      disabled={formData.tags.length >= 15}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tag ({formData.tags.length}/15)
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(4)}
                    disabled={formData.basePrice <= 0}
                  >
                    Next: Review & Submit
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Review & Submit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Validation Summary */}
                {validation.errors.length > 0 && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">Errors to Fix:</span>
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validation.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Recommendations:</span>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Product Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {formData.name || 'Not set'}</div>
                      <div><strong>Type:</strong> {BOOST_TYPES.find(t => t.value === formData.type)?.label || 'Not set'}</div>
                      <div><strong>Category:</strong> {LISTING_CATEGORIES.find(c => c.id === formData.category)?.name || 'Not set'}</div>
                      <div><strong>Price:</strong> {formatCurrency(formData.basePrice, formData.currency)}</div>
                      <div><strong>Duration:</strong> {formData.duration}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Features & Targeting</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Features:</strong> {formData.features.filter(f => f.trim()).length}</div>
                      <div><strong>Target Audiences:</strong> {formData.targetAudience.length}</div>
                      <div><strong>Client Types:</strong> {formData.clientTypes.length}</div>
                      <div><strong>Tags:</strong> {formData.tags.filter(t => t.trim()).length}</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleSubmit('draft')}
                      disabled={isSubmitting || !validation.isValid}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button
                      onClick={() => handleSubmit('review')}
                      disabled={isSubmitting || !validation.isValid}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}