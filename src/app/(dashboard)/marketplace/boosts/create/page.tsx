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
import { useUserSettings } from '@/contexts/SettingsContext';
import { 
  validateListing, 
  calculateRecommendedPricing, 
  generateSEOSuggestions, 
  LISTING_CATEGORIES 
} from '@/lib/services/marketplace';
import { formatCurrency, getUserCurrency, getUserCurrencyAsync, SUPPORTED_CURRENCIES, setUserCurrency } from '@/lib/utils/currency';
import { MARKETPLACE_TEXT, MARKETPLACE_COLORS, MARKETPLACE_CONSTANTS } from '@/constants/marketplace-text';
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
  const { settings: userSettings, loading: settingsLoading } = useUserSettings();
  const userCurrency = userSettings?.preferences?.currency || getUserCurrency();
  
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
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
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

  // Enhanced pricing recommendations with error handling
  const getRecommendedPricing = async () => {
    if (!formData.category || formData.features.length === 0 || formData.targetAudience.length === 0) {
      toast({
        title: MARKETPLACE_CONSTANTS.ERRORS.PRICING_MISSING_INFO_TITLE,
        description: MARKETPLACE_CONSTANTS.ERRORS.PRICING_MISSING_INFO_DESC,
        variant: 'destructive'
      });
      return;
    }

    setLoadingRecommendations(true);
    try {
      const pricing = await calculateRecommendedPricing(
        formData.category,
        formData.features.filter(f => f.trim() !== ''),
        formData.targetAudience
      );
      setRecommendedPricing(pricing);
      
      toast({
        title: MARKETPLACE_CONSTANTS.ERRORS.PRICING_UPDATED_TITLE,
        description: MARKETPLACE_CONSTANTS.ERRORS.PRICING_UPDATED_DESC,
      });
    } catch (error: any) {
      console.error('Pricing recommendation error:', error);
      toast({
        title: MARKETPLACE_CONSTANTS.ERRORS.PRICING_SERVICE_ERROR_TITLE,
        description: error.message || MARKETPLACE_CONSTANTS.ERRORS.PRICING_SERVICE_ERROR_DESC,
        variant: 'destructive'
      });
      
      // Set fallback pricing based on category
      const fallbackPricing = {
        recommended: formData.type === 'premium' ? 299 : 199,
        minimum: formData.type === 'premium' ? 199 : 99,
        maximum: formData.type === 'premium' ? 499 : 299,
        confidence: 'low'
      };
      setRecommendedPricing(fallbackPricing);
    } finally {
      setLoadingRecommendations(false);
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
  const submitWithRetry = async (payload: any, maxRetries = 2): Promise<Response> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        const response = await fetch('/api/marketplace/products/manage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn(`API call attempt ${attempt + 1} failed:`, error);
        
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

  // Enhanced submit handler with better error handling
  const handleSubmit = async (status: 'draft' | 'review') => {
    if (!validateForm()) {
      toast({
        title: MARKETPLACE_TEXT.CREATE_BOOST.MESSAGES.VALIDATION_ERROR,
        description: MARKETPLACE_TEXT.CREATE_BOOST.MESSAGES.FIX_ERRORS_BEFORE_SUBMIT,
        variant: 'destructive'
      });
      return;
    }

    if (!organizationId) {
      toast({
        title: MARKETPLACE_CONSTANTS.ERRORS.ORGANIZATION_REQUIRED_TITLE,
        description: MARKETPLACE_CONSTANTS.ERRORS.ORGANIZATION_REQUIRED_DESC,
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare API payload according to BoostProductSchema
      const apiPayload = {
        organizationId,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        price: formData.price,
        originalPrice: formData.originalPrice || undefined,
        duration: formData.duration,
        features: formData.features.filter(f => f.trim() !== ''),
        clientTypes: formData.clientTypes.filter(ct => ct.trim() !== ''),
        estimatedROI: formData.estimatedROI || undefined,
        isRecommended: formData.isRecommended,
        isActive: status === 'review' // Set active only if submitting for review
      };

      console.log('Creating boost product with payload:', apiPayload);
      
      const response = await submitWithRetry(apiPayload);
      
      // Handle response
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || errorData?.message || handleApiError(null, response);
        
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

      const result = await response.json();
      console.log('Boost product created successfully:', result);
      
      toast({
        title: MARKETPLACE_TEXT.CREATE_BOOST.MESSAGES.SUCCESS,
        description: `Boost product ${status === 'draft' ? MARKETPLACE_TEXT.CREATE_BOOST.MESSAGES.DRAFT_SAVED : MARKETPLACE_TEXT.CREATE_BOOST.MESSAGES.SUBMITTED_FOR_REVIEW}.`,
      });

      // Redirect after successful creation
      router.push('/marketplace');
      
    } catch (error: any) {
      console.error('Boost product creation failed:', error);
      
      const errorMessage = handleApiError(error);
      toast({
        title: MARKETPLACE_TEXT.CREATE_BOOST.MESSAGES.ERROR,
        description: errorMessage,
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

  // Enhanced currency detection with global settings integration
  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        // Priority: Global user settings > geolocation detection > fallback
        let targetCurrency = userSettings?.preferences?.currency;
        
        if (!targetCurrency || !SUPPORTED_CURRENCIES[targetCurrency]) {
          targetCurrency = await getUserCurrencyAsync();
        }
        
        if (targetCurrency && targetCurrency !== formData.currency) {
          setFormData(prev => ({
            ...prev,
            currency: targetCurrency
          }));
        }
      } catch (error) {
        // Fallback to synchronous detection - error logged by currency service
      }
    };
    initializeCurrency();
  }, [userSettings?.preferences?.currency]);

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/marketplace">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {MARKETPLACE_TEXT.CREATE_BOOST.BACK_TO_MARKETPLACE}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{MARKETPLACE_TEXT.CREATE_BOOST.TITLE}</h1>
            <p className="text-muted-foreground">
              {MARKETPLACE_TEXT.CREATE_BOOST.SUBTITLE}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto">
          {[
            { step: 1, title: MARKETPLACE_TEXT.CREATE_BOOST.STEPS.BASIC_INFO, icon: <Target className="h-4 w-4" /> },
            { step: 2, title: MARKETPLACE_TEXT.CREATE_BOOST.STEPS.FEATURES_TARGETING, icon: <Zap className="h-4 w-4" /> },
            { step: 3, title: MARKETPLACE_TEXT.CREATE_BOOST.STEPS.PRICING_SEO, icon: <DollarSign className="h-4 w-4" /> },
            { step: 4, title: MARKETPLACE_TEXT.CREATE_BOOST.STEPS.REVIEW_SUBMIT, icon: <CheckCircle className="h-4 w-4" /> }
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
                    <Label htmlFor="name">{MARKETPLACE_TEXT.CREATE_BOOST.FORM.PRODUCT_NAME} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={MARKETPLACE_TEXT.CREATE_BOOST.FORM.PRODUCT_NAME_PLACEHOLDER}
                      className="mt-1"
                    />
                    {validation.errors.some(e => e.includes('name')) && (
                      <p className="text-sm text-red-500 mt-1">{MARKETPLACE_CONSTANTS.VALIDATION.NAME_REQUIRED}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="type">{MARKETPLACE_TEXT.CREATE_BOOST.FORM.BOOST_TYPE} *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={MARKETPLACE_TEXT.CREATE_BOOST.FORM.SELECT_BOOST_TYPE} />
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
                    <Label htmlFor="category">{MARKETPLACE_TEXT.CREATE_BOOST.FORM.CATEGORY} *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={MARKETPLACE_TEXT.CREATE_BOOST.FORM.SELECT_CATEGORY} />
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
                    <Label htmlFor="duration">{MARKETPLACE_TEXT.CREATE_BOOST.FORM.DURATION}</Label>
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
                  <Label htmlFor="description">{MARKETPLACE_TEXT.CREATE_BOOST.FORM.DESCRIPTION} *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={MARKETPLACE_TEXT.CREATE_BOOST.FORM.DESCRIPTION_PLACEHOLDER}
                    rows={4}
                    className="mt-1"
                  />
                  <div className={`text-xs mt-1 ${formData.description.length >= 50 ? 'text-muted-foreground' : 'text-red-500'}`}>
                    {MARKETPLACE_TEXT.CREATE_BOOST.FORM.DESCRIPTION_LENGTH(formData.description.length, 50)}
                  </div>
                  {validation.errors.some(e => e.includes('Description')) && (
                    <p className="text-sm text-red-500 mt-1">{MARKETPLACE_CONSTANTS.VALIDATION.DESCRIPTION_REQUIRED}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.name || !formData.type || !formData.category || formData.description.length < 50}
                  >
                    {MARKETPLACE_TEXT.CREATE_BOOST.ACTIONS.NEXT_FEATURES}
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
                  <Label>{MARKETPLACE_TEXT.CREATE_BOOST.FORM.FEATURES} *</Label>
                  <div className="space-y-2 mt-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder={MARKETPLACE_TEXT.CREATE_BOOST.FORM.FEATURE_PLACEHOLDER}
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
                      {MARKETPLACE_TEXT.CREATE_BOOST.ACTIONS.ADD_FEATURE(formData.features.length, 15)}
                    </Button>
                  </div>
                  {validation.errors.some(e => e.includes('feature')) && (
                    <p className="text-sm text-red-500 mt-1">{MARKETPLACE_CONSTANTS.VALIDATION.FEATURES_REQUIRED}</p>
                  )}
                </div>

                {/* Target Audience */}
                <div>
                  <Label>{MARKETPLACE_TEXT.CREATE_BOOST.FORM.TARGET_AUDIENCE} *</Label>
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
                    <p className="text-sm text-red-500 mt-1">{MARKETPLACE_CONSTANTS.VALIDATION.AUDIENCE_REQUIRED}</p>
                  )}
                </div>

                {/* Client Types */}
                <div>
                  <Label>{MARKETPLACE_TEXT.CREATE_BOOST.FORM.CLIENT_TYPES} *</Label>
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
                    {MARKETPLACE_TEXT.CREATE_BOOST.ACTIONS.PREVIOUS}
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(3)}
                    disabled={formData.features.filter(f => f.trim()).length === 0 || formData.targetAudience.length === 0}
                  >
                    {MARKETPLACE_TEXT.CREATE_BOOST.ACTIONS.NEXT_PRICING}
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
                    <Label htmlFor="price">{MARKETPLACE_TEXT.CREATE_BOOST.FORM.BASE_PRICE} *</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.basePrice || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                        placeholder={MARKETPLACE_TEXT.CREATE_BOOST.FORM.PRICE_PLACEHOLDER}
                        className="flex-1"
                      />
                      <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SUPPORTED_CURRENCIES).map(([code, config]) => (
                            <SelectItem key={code} value={code}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{config.symbol}</span>
                                <span>{code}</span>
                                <span className="text-muted-foreground">- {config.code === 'ZAR' ? 'South African Rand' : config.code === 'USD' ? 'US Dollar' : config.code === 'EUR' ? 'Euro' : config.code === 'GBP' ? 'British Pound' : config.code === 'CAD' ? 'Canadian Dollar' : config.code === 'AUD' ? 'Australian Dollar' : config.code === 'JPY' ? 'Japanese Yen' : config.code === 'NGN' ? 'Nigerian Naira' : config.code === 'INR' ? 'Indian Rupee' : config.code === 'BRL' ? 'Brazilian Real' : 'Currency'}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {validation.errors.some(e => e.includes('price')) && (
                      <p className="text-sm text-red-500 mt-1">{MARKETPLACE_CONSTANTS.VALIDATION.PRICE_REQUIRED}</p>
                    )}
                    {/* Currency preference indicator */}
                    {formData.currency && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Preview: {formatCurrency(29.99, formData.currency)}
                        {userSettings?.preferences?.currency === formData.currency && (
                          <span className="ml-2 text-blue-600 font-medium">
                            ✓ Matches your account preferences
                          </span>
                        )}
                        {formData.currency === 'ZAR' && (
                          <span className="ml-2 text-green-600 font-medium">🇿🇦 South African market</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label>{MARKETPLACE_TEXT.CREATE_BOOST.FORM.RECOMMENDED_PRICING}</Label>
                    <div className="mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={getRecommendedPricing}
                        disabled={loadingRecommendations || !formData.category || formData.features.filter(f => f.trim()).length === 0}
                      >
                        {loadingRecommendations ? (
                          <>
                            <div className="h-4 w-4 mr-2 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="h-4 w-4 mr-2" />
                            {MARKETPLACE_TEXT.CREATE_BOOST.FORM.GET_SUGGESTIONS}
                          </>
                        )}
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
                    <Label>{MARKETPLACE_TEXT.CREATE_BOOST.FORM.SEO_OPTIMIZATION}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSEO}
                      disabled={!formData.name || !formData.category}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      {MARKETPLACE_TEXT.CREATE_BOOST.FORM.GENERATE_SEO}
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="seoTitle">{MARKETPLACE_TEXT.CREATE_BOOST.FORM.SEO_TITLE}</Label>
                    <Input
                      id="seoTitle"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                      placeholder={MARKETPLACE_TEXT.CREATE_BOOST.FORM.SEO_TITLE_PLACEHOLDER}
                      className="mt-1"
                      maxLength={60}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {formData.seoTitle.length}/60 characters
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="seoDescription">{MARKETPLACE_TEXT.CREATE_BOOST.FORM.SEO_DESCRIPTION}</Label>
                    <Textarea
                      id="seoDescription"
                      value={formData.seoDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                      placeholder={MARKETPLACE_TEXT.CREATE_BOOST.FORM.SEO_DESCRIPTION_PLACEHOLDER}
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
                  <Label>{MARKETPLACE_TEXT.CREATE_BOOST.FORM.TAGS}</Label>
                  <div className="space-y-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          placeholder={MARKETPLACE_TEXT.CREATE_BOOST.FORM.TAG_PLACEHOLDER}
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
                      {MARKETPLACE_TEXT.CREATE_BOOST.ACTIONS.ADD_TAG(formData.tags.length, 15)}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {MARKETPLACE_TEXT.CREATE_BOOST.ACTIONS.PREVIOUS}
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(4)}
                    disabled={formData.basePrice <= 0}
                  >
                    {MARKETPLACE_TEXT.CREATE_BOOST.ACTIONS.NEXT_REVIEW}
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
                  {MARKETPLACE_TEXT.CREATE_BOOST.STEPS.REVIEW_SUBMIT}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Validation Summary */}
                {validation.errors.length > 0 && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">{MARKETPLACE_TEXT.CREATE_BOOST.VALIDATION.ERRORS_TO_FIX}</span>
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
                      <span className="font-medium text-yellow-800">{MARKETPLACE_TEXT.CREATE_BOOST.VALIDATION.RECOMMENDATIONS}</span>
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
                    <h3 className="font-semibold mb-3">{MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.PRODUCT_SUMMARY}</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>{MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.NAME}</strong> {formData.name || MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.NOT_SET}</div>
                      <div><strong>{MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.TYPE}</strong> {BOOST_TYPES.find(t => t.value === formData.type)?.label || MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.NOT_SET}</div>
                      <div><strong>{MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.CATEGORY}</strong> {LISTING_CATEGORIES.find(c => c.id === formData.category)?.name || MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.NOT_SET}</div>
                      <div><strong>{MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.PRICE}</strong> {formatCurrency(formData.basePrice, formData.currency)}</div>
                      <div><strong>{MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.DURATION}</strong> {formData.duration}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">{MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.FEATURES_TARGETING}</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>{MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.FEATURES}</strong> {formData.features.filter(f => f.trim()).length}</div>
                      <div><strong>{MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.TARGET_AUDIENCES}</strong> {formData.targetAudience.length}</div>
                      <div><strong>{MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.CLIENT_TYPES}</strong> {formData.clientTypes.length}</div>
                      <div><strong>{MARKETPLACE_TEXT.CREATE_BOOST.SUMMARY.TAGS}</strong> {formData.tags.filter(t => t.trim()).length}</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {MARKETPLACE_TEXT.CREATE_BOOST.ACTIONS.PREVIOUS}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleSubmit('draft')}
                      disabled={isSubmitting || !validation.isValid || !organizationId}
                      className={!validation.isValid ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 mr-2 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                          {MARKETPLACE_TEXT.CREATE_BOOST.ACTIONS.SAVING}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {MARKETPLACE_TEXT.CREATE_BOOST.ACTIONS.SAVE_DRAFT}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleSubmit('review')}
                      disabled={isSubmitting || !validation.isValid || !organizationId}
                      className={`${!validation.isValid ? 'opacity-50 cursor-not-allowed' : ''} ${MARKETPLACE_COLORS.BUTTONS.PRIMARY}`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {MARKETPLACE_TEXT.CREATE_BOOST.ACTIONS.SUBMITTING}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {MARKETPLACE_TEXT.CREATE_BOOST.ACTIONS.SUBMIT_FOR_REVIEW}
                        </>
                      )}
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