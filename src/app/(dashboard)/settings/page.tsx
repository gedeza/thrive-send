"use client"

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RotateCcw, Settings, Check, Crown, Zap, CreditCard, Download, FileText, Upload, Users, Globe, MapPin, Palette, AlertTriangle, Trash2, UserPlus, Shield } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useBeforeUnload } from "@/hooks/use-before-unload";
import { useNavigationWarning } from "@/hooks/use-navigation-warning";
import { InvitationManagement } from "@/components/users/invitation-management";
import { TemplateApprovalWorkflow } from "@/components/templates/TemplateApprovalWorkflow";
import { useOrganization } from "@clerk/nextjs";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

const emailSettingsSchema = z.object({
  marketingEmails: z.boolean(),
  socialNotifications: z.boolean(),
  updatesNotifications: z.boolean(),
});

const campaignDefaultsSchema = z.object({
  fromName: z.string().min(2, "From name must be at least 2 characters"),
  replyToEmail: z.string().email("Invalid email address"),
  sendTime: z.enum(["immediate", "scheduled", "best-time"]),
});

const contentLibrarySchema = z.object({
  autoTagging: z.boolean(),
  defaultVisibility: z.enum(["private", "public", "team"]),
  thumbnailSize: z.enum(["small", "medium", "large"]),
});

const organizationSettingsSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  industry: z.string().optional(),
  timezone: z.string(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  location: z.string().optional(),
  brandColor: z.string().optional(),
});

const defaultEmailSettings = {
  marketingEmails: true,
  socialNotifications: false,
  updatesNotifications: true
} as const;

const defaultCampaignDefaults = {
  fromName: "ThriveSend Marketing",
  replyToEmail: "marketing@example.com",
  sendTime: "immediate" as const
} as const;

const defaultContentLibrarySettings = {
  autoTagging: true,
  defaultVisibility: "private" as const,
  thumbnailSize: "medium" as const
} as const;

const defaultOrganizationSettings = {
  name: "",
  description: "",
  industry: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  website: "",
  location: "",
  brandColor: "#3b82f6"
} as const;

// Industry options
const industryOptions = [
  "Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing",
  "Media & Entertainment", "Non-profit", "Government", "Consulting", "Other"
];

// Common timezones
const timezoneOptions = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", 
  "Asia/Shanghai", "Australia/Sydney", "Africa/Johannesburg", "UTC"
];

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'email', label: 'Email Preferences' },
  { id: 'campaign', label: 'Campaign Defaults' },
  { id: 'content', label: 'Content Library' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'users', label: 'Users' },
  { id: 'billing', label: 'Billing & Subscription' },
  { id: 'organization', label: 'Organization' },
];

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isDirty, setIsDirty] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [usageData, setUsageData] = useState<any>(null);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [isLoadingBilling, setIsLoadingBilling] = useState(true);
  const [isBillingManagementOpen, setIsBillingManagementOpen] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  
  // Billing data state
  const [paymentMethod, setPaymentMethod] = useState({
    type: 'visa',
    last4: '4242',
    expMonth: '12',
    expYear: '2026',
    brand: 'VISA'
  });
  
  const [billingAddress, setBillingAddress] = useState({
    name: user?.firstName + ' ' + user?.lastName || 'John Doe',
    line1: '123 Main Street',
    line2: '',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    country: 'United States'
  });
  
  // Form data for editing
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    name: ''
  });
  
  const [addressForm, setAddressForm] = useState({ ...billingAddress });
  
  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [currencyRates, setCurrencyRates] = useState<{[key: string]: number}>({});
  
  // Supported currencies with their symbols and names
  const supportedCurrencies = {
    USD: { symbol: '$', name: 'US Dollar', country: 'United States' },
    EUR: { symbol: '€', name: 'Euro', country: 'Europe' },
    GBP: { symbol: '£', name: 'British Pound', country: 'United Kingdom' },
    ZAR: { symbol: 'R', name: 'South African Rand', country: 'South Africa' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', country: 'Canada' },
    AUD: { symbol: 'A$', name: 'Australian Dollar', country: 'Australia' },
    JPY: { symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
    INR: { symbol: '₹', name: 'Indian Rupee', country: 'India' },
    BRL: { symbol: 'R$', name: 'Brazilian Real', country: 'Brazil' },
    MXN: { symbol: '$', name: 'Mexican Peso', country: 'Mexico' }
  };
  
  // Base prices in USD
  const basePrices = {
    starter: 29,
    professional: 79,
    enterprise: 149
  };
  
  // Currency conversion and formatting functions
  const formatCurrencyPrice = (usdPrice: number, currency: string): string => {
    const rate = currencyRates[currency] || 1;
    const convertedPrice = Math.round(usdPrice * rate);
    const currencyInfo = supportedCurrencies[currency as keyof typeof supportedCurrencies];
    return `${currencyInfo?.symbol || '$'}${convertedPrice}`;
  };
  
  const getCurrencyDisplayPrice = (planId: string): string => {
    const basePrice = basePrices[planId as keyof typeof basePrices] || 0;
    // Ensure currency rates are loaded before formatting
    if (Object.keys(currencyRates).length === 0) {
      // Fallback: show USD price if rates not loaded yet
      return `$${basePrice}`;
    }
    return formatCurrencyPrice(basePrice, selectedCurrency);
  };
  
  // Save currency preference when changed
  const handleCurrencyChange = async (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency: newCurrency }),
      });
      
      toast({
        title: "Currency Updated",
        description: `Billing currency changed to ${supportedCurrencies[newCurrency as keyof typeof supportedCurrencies]?.name}`,
      });
    } catch (_error) {
      console.error("", _error);
    }
  };
  
  // Get current plan from subscription data
  const currentPlan = subscriptionData?.plan || 'professional';

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "29",
      period: "/month",
      description: "Perfect for individuals getting started",
      features: [
        "100 campaigns per month",
        "Up to 1,000 contacts",
        "Basic templates",
        "Email support",
        "1GB storage"
      ],
      icon: Zap,
      popular: false
    },
    {
      id: "professional",
      name: "Professional", 
      price: "79",
      period: "/month",
      description: "Advanced features for growing teams",
      features: [
        "1,000 campaigns per month",
        "Up to 10,000 contacts",
        "Advanced templates & AI",
        "Priority support",
        "10GB storage",
        "Team collaboration",
        "Analytics & reporting"
      ],
      icon: Crown,
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "149",
      period: "/month",
      description: "Complete solution for large organizations",
      features: [
        "Unlimited campaigns",
        "Unlimited contacts",
        "Custom templates & branding",
        "24/7 dedicated support",
        "100GB storage",
        "Advanced team management",
        "Custom integrations",
        "White-label options"
      ],
      icon: Settings,
      popular: false
    }
  ];

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  // Email settings form
  const emailForm = useForm({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: defaultEmailSettings,
  });

  // Campaign defaults form
  const campaignForm = useForm({
    resolver: zodResolver(campaignDefaultsSchema),
    defaultValues: defaultCampaignDefaults,
  });

  // Content library form
  const contentForm = useForm({
    resolver: zodResolver(contentLibrarySchema),
    defaultValues: defaultContentLibrarySettings,
  });

  // Organization settings form
  const organizationForm = useForm({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      ...defaultOrganizationSettings,
      name: organization?.name || "",
    },
  });

  // Organization management state
  const [organizationStats, setOrganizationStats] = useState<any>(null);
  const [isLoadingOrgStats, setIsLoadingOrgStats] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Track form changes
  useEffect(() => {
    const subscription = profileForm.watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [profileForm]);

  useEffect(() => {
    const subscription = emailForm.watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [emailForm]);

  useEffect(() => {
    const subscription = campaignForm.watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [campaignForm]);

  useEffect(() => {
    const subscription = contentForm.watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [contentForm]);

  useEffect(() => {
    const subscription = organizationForm.watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [organizationForm]);

  // Warn before leaving with unsaved changes
  useBeforeUnload(isDirty);
  useNavigationWarning(isDirty);
  
  // Fetch currency rates and user preferences
  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        // Set currency rates (in production, use a real API)
        const rates = {
          USD: 1.00,
          EUR: 0.85,
          GBP: 0.73,
          ZAR: 18.50, // South African Rand
          CAD: 1.35,
          AUD: 1.45,
          JPY: 110.0,
          INR: 83.0,
          BRL: 5.20,
          MXN: 18.0
        };
        setCurrencyRates(rates);
        
        // Load user's saved currency preference
        const prefsResponse = await fetch('/api/user/preferences');
        if (prefsResponse.ok) {
          const prefs = await prefsResponse.json();
          setSelectedCurrency(prefs.currency || 'USD');
        } else {
          // Fallback: Try to detect user's currency based on locale
          const userLocale = Intl.DateTimeFormat().resolvedOptions().locale;
          if (userLocale.includes('ZA') || userLocale.includes('za')) {
            setSelectedCurrency('ZAR');
          } else if (userLocale.includes('GB') || userLocale.includes('gb')) {
            setSelectedCurrency('GBP');
          } else if (userLocale.includes('CA') || userLocale.includes('ca')) {
            setSelectedCurrency('CAD');
          }
        }
      } catch (_error) {
        console.error("", _error);
      }
    };
    
    fetchCurrencyData();
  }, []);

  // Fetch billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      if (!organization?.id || Object.keys(currencyRates).length === 0) return;
      
      setIsLoadingBilling(true);
      try {
        const [subscriptionRes, usageRes, historyRes] = await Promise.all([
          fetch(`/api/organizations/${organization.id}/billing?currency=${selectedCurrency}`),
          fetch(`/api/organizations/${organization.id}/usage?currency=${selectedCurrency}`),
          fetch(`/api/organizations/${organization.id}/billing/history?currency=${selectedCurrency}`)
        ]);

        if (subscriptionRes.ok) {
          const subscription = await subscriptionRes.json();
          setSubscriptionData(subscription);
          // Set selectedPlan to current plan by default
          setSelectedPlan(subscription?.plan || 'professional');
        }

        if (usageRes.ok) {
          const usage = await usageRes.json();
          setUsageData(usage);
        }

        if (historyRes.ok) {
          const history = await historyRes.json();
          setBillingHistory(history);
        }
      } catch (_error) {
        console.error("", _error);
      } finally {
        setIsLoadingBilling(false);
      }
    };

    fetchBillingData();
  }, [organization?.id, selectedCurrency, currencyRates]); // Refetch when currency changes or rates load

  // Load organization settings
  useEffect(() => {
    const loadOrganizationSettings = async () => {
      if (!organization?.id) return;
      
      try {
        const response = await fetch(`/api/organizations/${organization.id}/settings`);
        if (response.ok) {
          const settings = await response.json();
          
          // Update form with loaded settings
          organizationForm.reset({
            name: settings.name || organization.name || "",
            description: settings.description || "",
            industry: settings.industry || "",
            timezone: settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            website: settings.website || "",
            location: settings.location || "",
            brandColor: settings.brandColor || "#3b82f6"
          });
        }
      } catch (_error) {
        console.error("", _error);
      }
    };

    loadOrganizationSettings();
  }, [organization?.id, organizationForm]);

  const handleProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!user) return;
    try {
      await user.update({ firstName: data.firstName, lastName: data.lastName });
      setIsDirty(false);
      toast({
        title: "Success",
        description: "Profile settings updated successfully",
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to update profile settings",
        variant: "destructive",
      });
    }
  };

  const handleEmailSubmit = async (data: z.infer<typeof emailSettingsSchema>) => {
    try {
      const response = await fetch('/api/user/email-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update email preferences');
      }

      setIsDirty(false);
      toast({
        title: "Success",
        description: "Email preferences updated successfully",
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to update email preferences",
        variant: "destructive",
      });
    }
  };

  const handleCampaignSubmit = async (data: z.infer<typeof campaignDefaultsSchema>) => {
    if (!organization?.id) return;
    
    try {
      const response = await fetch(`/api/organizations/${organization.id}/campaign-defaults`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update campaign defaults');
      }

      setIsDirty(false);
      toast({
        title: "Success",
        description: "Campaign defaults updated successfully",
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to update campaign defaults",
        variant: "destructive",
      });
    }
  };

  const handleContentSubmit = async (data: z.infer<typeof contentLibrarySchema>) => {
    if (!organization?.id) return;
    
    try {
      const response = await fetch(`/api/organizations/${organization.id}/content-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update content library settings');
      }

      setIsDirty(false);
      toast({
        title: "Success",
        description: "Content library settings updated successfully",
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to update content library settings",
        variant: "destructive",
      });
    }
  };

  const handleOrganizationSubmit = async (data: z.infer<typeof organizationSettingsSchema>) => {
    if (!organization?.id) return;
    
    try {
      const response = await fetch(`/api/organizations/${organization.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update organization settings');
      }

      setIsDirty(false);
      toast({
        title: "Success",
        description: "Organization settings updated successfully",
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to update organization settings",
        variant: "destructive",
      });
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlanChange = async () => {
    if (!organization?.id || selectedPlan === currentPlan) return;
    
    setIsUpgrading(true);
    try {
      const response = await fetch(`/api/organizations/${organization.id}/billing`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription plan');
      }

      const updatedSubscription = await response.json();
      setSubscriptionData(updatedSubscription);
      
      toast({
        title: "Plan Updated",
        description: `Successfully updated to ${plans.find(p => p.id === selectedPlan)?.name} plan`,
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to update subscription plan",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const loadBillingData = async () => {
    if (!organization?.id) return;
    
    try {
      const response = await fetch(`/api/organizations/${organization.id}/billing/details`);
      if (response.ok) {
        const data = await response.json();
        
        // Update payment method if exists
        if (data.paymentMethod) {
          setPaymentMethod({
            type: data.paymentMethod.brand || 'visa',
            last4: data.paymentMethod.last4 || '4242',
            expMonth: data.paymentMethod.expMonth || '12',
            expYear: data.paymentMethod.expYear || '2026',
            brand: data.paymentMethod.brand?.toUpperCase() || 'VISA'
          });
        }
        
        // Update billing address if exists
        if (data.billingAddress) {
          setBillingAddress({
            name: data.billingAddress.name || user?.firstName + ' ' + user?.lastName || 'John Doe',
            line1: data.billingAddress.line1 || '123 Main Street',
            line2: data.billingAddress.line2 || '',
            city: data.billingAddress.city || 'San Francisco',
            state: data.billingAddress.state || 'CA',
            postalCode: data.billingAddress.postalCode || '94102',
            country: data.billingAddress.country || 'United States'
          });
        }
      }
    } catch (_error) {
      console.error("", _error);
    }
  };

  const handleBillingManagement = () => {
    // In a real application, this would redirect to Stripe Customer Portal
    if (process.env.NODE_ENV === 'production') {
      // Redirect to actual Stripe Customer Portal
      window.open('https://billing.stripe.com/p/login/your_actual_link', '_blank');
    } else {
      // Load existing billing data and open dialog
      loadBillingData();
      setIsBillingManagementOpen(true);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    if (!organization?.id) return;
    
    setIsUpdatingPayment(true);
    try {
      const response = await fetch(`/api/organizations/${organization.id}/billing/payment-method`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentForm),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update payment method');
      }
      
      const updatedMethod = await response.json();
      setPaymentMethod({
        type: updatedMethod.type || 'visa',
        last4: paymentForm.cardNumber.slice(-4),
        expMonth: paymentForm.expMonth,
        expYear: paymentForm.expYear,
        brand: paymentForm.cardNumber.startsWith('4') ? 'VISA' : 'CARD'
      });
      
      setIsEditingPayment(false);
      setPaymentForm({ cardNumber: '', expMonth: '', expYear: '', cvc: '', name: '' });
      
      toast({
        title: "Payment Method Updated",
        description: "Your payment method has been successfully updated.",
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to update payment method. Please check your card details.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleUpdateBillingAddress = async () => {
    if (!organization?.id) return;
    
    setIsUpdatingAddress(true);
    try {
      const response = await fetch(`/api/organizations/${organization.id}/billing/address`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressForm),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update billing address');
      }
      
      setBillingAddress(addressForm);
      setIsEditingAddress(false);
      
      toast({
        title: "Billing Address Updated",
        description: "Your billing address has been successfully updated.",
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to update billing address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      if (window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled. You will have access until the end of your billing period.",
        });
      }
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAllInvoices = async () => {
    if (!organization?.id) return;
    
    try {
      // First try the ZIP download
      let response = await fetch(`/api/organizations/${organization.id}/billing/invoices/download-all`, {
        method: 'POST',
      });
      
      // If ZIP fails, fallback to CSV download
      if (!response.ok) {
        response = await fetch(`/api/organizations/${organization.id}/billing/invoices/download-simple`, {
          method: 'POST',
        });
      }
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Determine file extension based on content type
        const contentType = response.headers.get('content-type') || '';
        const extension = contentType.includes('zip') ? 'zip' : 'csv';
        a.download = `invoices-${organization.slug || 'org'}.${extension}`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Download Started",
          description: `Your invoices are being downloaded as a ${extension.toUpperCase()} file.`,
        });
      } else {
        throw new Error('Failed to download invoices');
      }
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Download Failed",
        description: "Could not download invoices. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleResetDefaults = (form: any, defaultValues: any) => {
    form.reset(defaultValues);
    setIsDirty(false);
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to default values",
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-primary to-primary/80 rounded-xl">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Settings
            </h2>
            <p className="text-muted-foreground text-lg">
              Manage your account preferences and configurations
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Profile</TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-success data-[state=active]:text-success-foreground">Email</TabsTrigger>
          <TabsTrigger value="campaign" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Campaign</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-warning data-[state=active]:text-warning-foreground">Content</TabsTrigger>
          <TabsTrigger value="workflows" className="data-[state=active]:bg-muted data-[state=active]:text-muted-foreground">Workflows</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Users</TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-success data-[state=active]:text-success-foreground">Billing</TabsTrigger>
          <TabsTrigger value="organization" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...profileForm.register("firstName")}
                  />
                  {profileForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...profileForm.register("lastName")}
                  />
                  {profileForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.primaryEmailAddress?.emailAddress || ""}
                    disabled
                  />
                </div>
                <div className="flex justify-between">
                  <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                    {profileForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleResetDefaults(profileForm, {
                      firstName: user?.firstName || "",
                      lastName: user?.lastName || "",
                    })}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Preferences</CardTitle>
              <CardDescription>
                Manage your email notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <Switch
                    checked={emailForm.watch("marketingEmails")}
                    onCheckedChange={(checked) => emailForm.setValue("marketingEmails", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Social Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about social media interactions
                    </p>
                  </div>
                  <Switch
                    checked={emailForm.watch("socialNotifications")}
                    onCheckedChange={(checked) => emailForm.setValue("socialNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Updates Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about system updates
                    </p>
                  </div>
                  <Switch
                    checked={emailForm.watch("updatesNotifications")}
                    onCheckedChange={(checked) => emailForm.setValue("updatesNotifications", checked)}
                  />
                </div>
                <div className="flex justify-between">
                  <Button type="submit" disabled={emailForm.formState.isSubmitting}>
                    {emailForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleResetDefaults(emailForm, defaultEmailSettings)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaign">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Defaults</CardTitle>
              <CardDescription>
                Set default values for new campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={campaignForm.handleSubmit(handleCampaignSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fromName">Default From Name</Label>
                  <Input
                    id="fromName"
                    {...campaignForm.register("fromName")}
                  />
                  {campaignForm.formState.errors.fromName && (
                    <p className="text-sm text-destructive">
                      {campaignForm.formState.errors.fromName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replyToEmail">Default Reply-To Email</Label>
                  <Input
                    id="replyToEmail"
                    type="email"
                    {...campaignForm.register("replyToEmail")}
                  />
                  {campaignForm.formState.errors.replyToEmail && (
                    <p className="text-sm text-destructive">
                      {campaignForm.formState.errors.replyToEmail.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sendTime">Default Send Time</Label>
                  <Select
                    value={campaignForm.watch("sendTime")}
                    onValueChange={(value: "immediate" | "scheduled" | "best-time") => 
                      campaignForm.setValue("sendTime", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select send time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Send Immediately</SelectItem>
                      <SelectItem value="scheduled">Schedule for Later</SelectItem>
                      <SelectItem value="best-time">Best Time to Send</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between">
                  <Button type="submit" disabled={campaignForm.formState.isSubmitting}>
                    {campaignForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleResetDefaults(campaignForm, defaultCampaignDefaults)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Library Settings</CardTitle>
              <CardDescription>
                Configure your content library preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={contentForm.handleSubmit(handleContentSubmit)} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Tagging</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically tag content based on AI analysis
                    </p>
                  </div>
                  <Switch
                    checked={contentForm.watch("autoTagging")}
                    onCheckedChange={(checked) => contentForm.setValue("autoTagging", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultVisibility">Default Visibility</Label>
                  <Select
                    value={contentForm.watch("defaultVisibility")}
                    onValueChange={(value: "private" | "public" | "team") => 
                      contentForm.setValue("defaultVisibility", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="team">Team Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thumbnailSize">Thumbnail Size</Label>
                  <Select
                    value={contentForm.watch("thumbnailSize")}
                    onValueChange={(value: "small" | "medium" | "large") => 
                      contentForm.setValue("thumbnailSize", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select thumbnail size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between">
                  <Button type="submit" disabled={contentForm.formState.isSubmitting}>
                    {contentForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleResetDefaults(contentForm, defaultContentLibrarySettings)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Settings className="h-5 w-5" />
                Template Approval Workflows
              </CardTitle>
              <CardDescription>
                Manage team collaboration and approval processes for templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateApprovalWorkflow 
                organizationId={organization?.id || ''}
                currentUserId={user?.id || ''}
                userRole="ADMIN" // You can derive this from membership
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage team members and invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription, billing details, and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isLoadingBilling ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Current Plan */}
                    <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-success rounded-full">
                            <Crown className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-success">Your Current Plan</h3>
                        </div>
                        <span className="px-4 py-2 text-sm font-semibold bg-success text-success-foreground rounded-full capitalize shadow-sm">
                          {subscriptionData?.plan || 'Professional'}
                        </span>
                      </div>
                      <p className="text-success mb-4">
                        {plans.find(p => p.id === currentPlan)?.description || 'Advanced features for growing teams'}
                      </p>
                      <div className="flex items-center gap-6 text-success">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-success">
                            {getCurrencyDisplayPrice(currentPlan)}
                          </span>
                          <span className="text-sm">/month</span>
                        </div>
                        <span className="w-1 h-1 bg-success/60 rounded-full" />
                        <span className="text-sm">
                          Next billing: {subscriptionData?.nextBilling ? 
                            new Date(subscriptionData.nextBilling).toLocaleDateString() : 
                            'Feb 15, 2025'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Campaigns Sent</div>
                        <div className="text-2xl font-bold">{usageData?.campaigns?.used || 0}</div>
                        <div className="text-xs text-muted-foreground">
                          of {usageData?.campaigns?.limit === -1 ? 'unlimited' : usageData?.campaigns?.limit || '1,000'} monthly
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Team Members</div>
                        <div className="text-2xl font-bold">{usageData?.members?.used || organization?.membersCount || 0}</div>
                        <div className="text-xs text-muted-foreground">
                          of {usageData?.members?.limit === -1 ? 'unlimited' : usageData?.members?.limit || '10'} seats
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Storage Used</div>
                        <div className="text-2xl font-bold">
                          {usageData?.storage?.used ? `${(usageData.storage.used / 1024 / 1024 / 1024).toFixed(1)}GB` : '0GB'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          of {usageData?.storage?.limit === -1 ? 'unlimited' : `${(usageData?.storage?.limit || 10737418240) / 1024 / 1024 / 1024}GB`} total
                        </div>
                      </div>
                    </div>

                {/* Actions */}
                <div className="space-y-4">
                  {/* Plan Change Call-to-Action */}
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-primary">Want to change your plan?</h4>
                        <p className="text-sm text-primary mt-1">
                          Choose from Starter ({getCurrencyDisplayPrice('starter')}), Professional ({getCurrencyDisplayPrice('professional')}), or Enterprise ({getCurrencyDisplayPrice('enterprise')})
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Crown className="mr-2 h-4 w-4" />
                            Select Plan
                          </Button>
                        </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold">Choose Your Plan</DialogTitle>
                        <DialogDescription className="text-center text-base space-y-2">
                          <p>Select the plan that best fits your needs. You can change or cancel anytime.</p>
                          <div className="bg-primary/10 p-3 rounded-lg mt-3">
                            <p className="text-primary font-medium text-sm">
                              💡 <strong>How to select:</strong> Click on any plan card below to choose it, then click the action button
                            </p>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-6">
                        <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {plans.map((plan) => {
                              const IconComponent = plan.icon;
                              return (
                                <div key={plan.id} className="relative">
                                  {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                                        Most Popular
                                      </span>
                                    </div>
                                  )}
                                  <Label 
                                    htmlFor={plan.id} 
                                    className={`cursor-pointer block p-6 border-2 rounded-lg transition-all hover:border-primary/50 hover:shadow-md ${
                                      selectedPlan === plan.id 
                                        ? 'border-primary bg-primary/10 shadow-lg' 
                                        : 'border-border hover:border-primary/30'
                                    } ${plan.id === currentPlan ? 'ring-2 ring-success/20 bg-success/10' : ''}`}
                                  >
                                    <div className="flex items-center space-x-2 mb-4">
                                      <RadioGroupItem value={plan.id} id={plan.id} className="text-primary" />
                                      <div className="flex items-center gap-2">
                                        {selectedPlan === plan.id && (
                                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                        )}
                                        <div className={`p-2 rounded-lg ${
                                          plan.id === 'starter' ? 'bg-primary/10 text-primary' :
                                          plan.id === 'professional' ? 'bg-success/10 text-success' :
                                          'bg-accent/10 text-accent'
                                        }`}>
                                          <IconComponent className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                                          {plan.id === currentPlan && (
                                            <span className="text-xs text-success font-medium">
                                              Current Plan
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mb-4">
                                      <div className="flex items-baseline gap-1 mb-2">
                                        <span className={`text-3xl font-bold ${
                                          selectedPlan === plan.id ? 'text-primary' : 'text-foreground'
                                        }`}>{getCurrencyDisplayPrice(plan.id)}</span>
                                        <span className="text-muted-foreground">{plan.period}</span>
                                        {selectedPlan === plan.id && (
                                          <span className="ml-2 text-sm bg-primary text-white px-2 py-1 rounded-full">
                                            Selected
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                                    </div>
                                    <ul className="space-y-2">
                                      {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm">
                                          <Check className="h-4 w-4 text-success flex-shrink-0" />
                                          <span>{feature}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </RadioGroup>
                      </div>
                      <DialogFooter className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {selectedPlan !== currentPlan && (
                            <span>
                              {selectedPlan === 'starter' ? 'Downgrade to' : 'Upgrade to'} {plans.find(p => p.id === selectedPlan)?.name}
                              {selectedPlan === 'enterprise' && ' - Contact sales for custom pricing'}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                          </DialogTrigger>
                          <Button 
                            onClick={handlePlanChange}
                            disabled={selectedPlan === currentPlan || isUpgrading}
                            className="w-full sm:w-auto"
                          >
                            {isUpgrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {selectedPlan === currentPlan ? 'Current Plan' : 
                             selectedPlan === 'starter' ? 'Downgrade' : 
                             selectedPlan === 'enterprise' ? 'Contact Sales' : 
                             selectedPlan === 'professional' ? 'Upgrade' : 'Change Plan'}
                          </Button>
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Billing Management Dialog */}
                  <Dialog open={isBillingManagementOpen} onOpenChange={setIsBillingManagementOpen}>
                    <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Billing Management
                        </DialogTitle>
                        <DialogDescription>
                          Manage your payment methods, billing address, and subscription settings.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="flex-1 overflow-y-auto px-1">
                        <div className="space-y-6 py-4 pr-4">
                        
                        {/* Currency Selection */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-success">Billing Currency</h3>
                          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Current Currency: {supportedCurrencies[selectedCurrency as keyof typeof supportedCurrencies]?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  All prices are converted from USD at current exchange rates
                                </p>
                              </div>
                              <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                                <SelectTrigger className="w-48">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(supportedCurrencies).map(([code, info]) => (
                                    <SelectItem key={code} value={code}>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{info.symbol}</span>
                                        <span>{code}</span>
                                        <span className="text-muted-foreground">- {info.country}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {selectedCurrency === 'ZAR' && (
                              <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                <p className="text-sm text-primary">
                                  🇿🇦 <strong>South African pricing:</strong> Professional plan is {getCurrencyDisplayPrice('professional')} per month
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Payment Method */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Payment Method</h3>
                            {!isEditingPayment && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsEditingPayment(true)}
                              >
                                Edit
                              </Button>
                            )}
                          </div>
                          
                          {isEditingPayment ? (
                            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="cardNumber">Card Number</Label>
                                  <Input
                                    id="cardNumber"
                                    placeholder="1234 5678 9012 3456"
                                    value={paymentForm.cardNumber}
                                    onChange={(e) => setPaymentForm(prev => ({...prev, cardNumber: e.target.value}))}
                                    maxLength={19}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="cardName">Cardholder Name</Label>
                                  <Input
                                    id="cardName"
                                    placeholder="John Doe"
                                    value={paymentForm.name}
                                    onChange={(e) => setPaymentForm(prev => ({...prev, name: e.target.value}))}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                  <Label htmlFor="expMonth" className="text-sm">Month</Label>
                                  <Select
                                    value={paymentForm.expMonth}
                                    onValueChange={(value) => setPaymentForm(prev => ({...prev, expMonth: value}))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="MM" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                                        <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                          {month.toString().padStart(2, '0')}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="expYear" className="text-sm">Year</Label>
                                  <Select
                                    value={paymentForm.expYear}
                                    onValueChange={(value) => setPaymentForm(prev => ({...prev, expYear: value}))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="YYYY" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(year => (
                                        <SelectItem key={year} value={year.toString()}>
                                          {year}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="cvc" className="text-sm">CVC</Label>
                                  <Input
                                    id="cvc"
                                    placeholder="123"
                                    value={paymentForm.cvc}
                                    onChange={(e) => setPaymentForm(prev => ({...prev, cvc: e.target.value}))}
                                    maxLength={4}
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <Button 
                                  onClick={handleUpdatePaymentMethod}
                                  disabled={isUpdatingPayment || !paymentForm.cardNumber || !paymentForm.expMonth || !paymentForm.expYear || !paymentForm.cvc}
                                  className="flex-1"
                                >
                                  {isUpdatingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Save Card
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setIsEditingPayment(false);
                                    setPaymentForm({ cardNumber: '', expMonth: '', expYear: '', cvc: '', name: '' });
                                  }}
                                  disabled={isUpdatingPayment}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${
                                  paymentMethod.brand === 'VISA' ? 'bg-primary' : 'bg-muted'
                                }`}>
                                  {paymentMethod.brand}
                                </div>
                                <div>
                                  <p className="font-medium">•••• •••• •••• {paymentMethod.last4}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Billing Address */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Billing Address</h3>
                            {!isEditingAddress && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setAddressForm({...billingAddress});
                                  setIsEditingAddress(true);
                                }}
                              >
                                Edit
                              </Button>
                            )}
                          </div>
                          
                          {isEditingAddress ? (
                            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="addressName">Full Name</Label>
                                  <Input
                                    id="addressName"
                                    value={addressForm.name}
                                    onChange={(e) => setAddressForm(prev => ({...prev, name: e.target.value}))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="country">Country</Label>
                                  <Select
                                    value={addressForm.country}
                                    onValueChange={(value) => setAddressForm(prev => ({...prev, country: value}))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="United States">United States</SelectItem>
                                      <SelectItem value="Canada">Canada</SelectItem>
                                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                      <SelectItem value="Germany">Germany</SelectItem>
                                      <SelectItem value="France">France</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="line1">Address Line 1</Label>
                                <Input
                                  id="line1"
                                  value={addressForm.line1}
                                  onChange={(e) => setAddressForm(prev => ({...prev, line1: e.target.value}))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                                <Input
                                  id="line2"
                                  value={addressForm.line2}
                                  onChange={(e) => setAddressForm(prev => ({...prev, line2: e.target.value}))}
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-2">
                                  <Label htmlFor="city" className="text-sm">City</Label>
                                  <Input
                                    id="city"
                                    value={addressForm.city}
                                    onChange={(e) => setAddressForm(prev => ({...prev, city: e.target.value}))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="state" className="text-sm">State/Province</Label>
                                  <Input
                                    id="state"
                                    value={addressForm.state}
                                    onChange={(e) => setAddressForm(prev => ({...prev, state: e.target.value}))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="postalCode" className="text-sm">Postal Code</Label>
                                  <Input
                                    id="postalCode"
                                    value={addressForm.postalCode}
                                    onChange={(e) => setAddressForm(prev => ({...prev, postalCode: e.target.value}))}
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <Button 
                                  onClick={handleUpdateBillingAddress}
                                  disabled={isUpdatingAddress || !addressForm.name || !addressForm.line1 || !addressForm.city || !addressForm.postalCode}
                                  className="flex-1"
                                >
                                  {isUpdatingAddress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Save Address
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setIsEditingAddress(false);
                                    setAddressForm({...billingAddress});
                                  }}
                                  disabled={isUpdatingAddress}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 border rounded-lg">
                              <p className="font-medium">{billingAddress.name}</p>
                              <p className="text-sm text-muted-foreground">{billingAddress.line1}</p>
                              {billingAddress.line2 && <p className="text-sm text-muted-foreground">{billingAddress.line2}</p>}
                              <p className="text-sm text-muted-foreground">
                                {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
                              </p>
                              <p className="text-sm text-muted-foreground">{billingAddress.country}</p>
                            </div>
                          )}
                        </div>

                        {/* Subscription Controls */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-warning">Subscription Management</h3>
                          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Button variant="outline" className="justify-start hover:bg-warning/10">
                                <Settings className="mr-2 h-4 w-4" />
                                Pause Subscription
                              </Button>
                              <Button 
                                variant="outline" 
                                className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                onClick={handleCancelSubscription}
                              >
                                <Loader2 className="mr-2 h-4 w-4" />
                                Cancel Subscription
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-primary">Quick Actions</h3>
                          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Button 
                                variant="outline" 
                                className="justify-start hover:bg-primary/10"
                                onClick={handleDownloadAllInvoices}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download Invoices
                              </Button>
                              <Button 
                                variant="outline" 
                                className="justify-start hover:bg-primary/10"
                                onClick={() => {
                                  toast({
                                    title: "Tax Information",
                                    description: "Tax information management will be available soon.",
                                  });
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Update Tax Info
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      </div>
                      
                      <DialogFooter className="border-t pt-4 mt-4 bg-background">
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                          <div className="flex-1" />
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsBillingManagementOpen(false);
                              setIsEditingPayment(false);
                              setIsEditingAddress(false);
                              setPaymentForm({ cardNumber: '', expMonth: '', expYear: '', cvc: '', name: '' });
                              setAddressForm({...billingAddress});
                            }}
                            className="w-full sm:w-auto"
                          >
                            Close
                          </Button>
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                    </div>
                  </div>
                  
                  {/* Other Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 w-full"
                      onClick={handleBillingManagement}
                    >
                      Manage Billing
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 w-full"
                      onClick={handleDownloadAllInvoices}
                    >
                      Download Invoices
                    </Button>
                  </div>
                </div>

                    {/* Billing History */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Recent Billing History</h3>
                      <div className="space-y-2">
                        {billingHistory.length > 0 ? billingHistory.map((bill, index) => {
                          const currencyInfo = supportedCurrencies[bill.currency as keyof typeof supportedCurrencies] || supportedCurrencies.USD;
                          return (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-medium">{new Date(bill.date).toLocaleDateString()}</div>
                                <div className="text-sm text-muted-foreground">{bill.invoiceId}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">
                                {currencyInfo.symbol}{bill.amount.toFixed(2)}
                                {bill.currency !== 'USD' && (
                                  <span className="text-xs text-muted-foreground ml-1">({bill.currency})</span>
                                )}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                bill.status === 'paid' ? 'bg-success/10 text-success' :
                                bill.status === 'pending' ? 'bg-warning/10 text-warning' :
                                'bg-destructive/10 text-destructive'
                              }`}>
                                {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  if (bill.invoiceUrl && bill.invoiceUrl !== '#') {
                                    window.open(bill.invoiceUrl, '_blank');
                                  } else {
                                    toast({
                                      title: "Download Not Available",
                                      description: "This invoice is not yet available for download.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                Download
                              </Button>
                            </div>
                          </div>
                          );
                        }) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No billing history available
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <div className="space-y-6">
            {/* Organization Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Organization Details
                </CardTitle>
                <CardDescription>
                  Manage your organization's basic information and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={organizationForm.handleSubmit(handleOrganizationSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input
                        id="orgName"
                        {...organizationForm.register("name")}
                        placeholder="Enter organization name"
                      />
                      {organizationForm.formState.errors.name && (
                        <p className="text-sm text-destructive">
                          {organizationForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgSlug">Organization Slug</Label>
                      <Input
                        id="orgSlug"
                        value={organization?.slug || ''}
                        placeholder="organization-slug"
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">URL identifier - contact support to change</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      {...organizationForm.register("description")}
                      placeholder="Brief description of your organization"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                    />
                    {organizationForm.formState.errors.description && (
                      <p className="text-sm text-destructive">
                        {organizationForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={organizationForm.watch("industry")}
                        onValueChange={(value) => organizationForm.setValue("industry", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industryOptions.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={organizationForm.watch("timezone")}
                        onValueChange={(value) => organizationForm.setValue("timezone", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezoneOptions.map((tz) => (
                            <SelectItem key={tz} value={tz}>
                              {tz.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        {...organizationForm.register("website")}
                        placeholder="https://example.com"
                        type="url"
                      />
                      {organizationForm.formState.errors.website && (
                        <p className="text-sm text-destructive">
                          {organizationForm.formState.errors.website.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        {...organizationForm.register("location")}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="submit" disabled={organizationForm.formState.isSubmitting}>
                      {organizationForm.formState.isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleResetDefaults(organizationForm, {
                        ...defaultOrganizationSettings,
                        name: organization?.name || "",
                      })}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset to Default
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Organization Branding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Branding & Appearance
                </CardTitle>
                <CardDescription>
                  Customize your organization's visual identity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label>Organization Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" asChild>
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Logo
                            </span>
                          </Button>
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Recommended: 64x64px, PNG or JPG, max 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandColor">Brand Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="brandColor"
                        type="color"
                        {...organizationForm.register("brandColor")}
                        className="w-20 h-10 rounded border"
                      />
                      <Input
                        value={organizationForm.watch("brandColor")}
                        onChange={(e) => organizationForm.setValue("brandColor", e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organization Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Organization Statistics
                </CardTitle>
                <CardDescription>
                  Overview of your organization's activity and growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Total Members</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">{organization?.membersCount || 0}</div>
                    <p className="text-xs text-primary mt-1">Active team members</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-success/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-success">Campaigns</span>
                    </div>
                    <div className="text-2xl font-bold text-success">{usageData?.campaigns?.used || 0}</div>
                    <p className="text-xs text-success mt-1">This month</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-accent/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-accent">Storage</span>
                    </div>
                    <div className="text-2xl font-bold text-accent">
                      {usageData?.storage?.used ? `${(usageData.storage.used / 1024 / 1024 / 1024).toFixed(1)}GB` : '0GB'}
                    </div>
                    <p className="text-xs text-accent mt-1">Content & media</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-warning/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium text-warning">Created</span>
                    </div>
                    <div className="text-2xl font-bold text-warning">
                      {organization?.createdAt ? new Date(organization.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </div>
                    <p className="text-xs text-warning mt-1">Organization age</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Team Management
                </CardTitle>
                <CardDescription>
                  Manage team members, roles, and invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1" onClick={() => setActiveTab('users')}>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Team Members
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Shield className="mr-2 h-4 w-4" />
                      Role Permissions
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Quick Actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <p>• Invite new team members</p>
                      <p>• Assign roles and permissions</p>
                      <p>• Manage pending invitations</p>
                      <p>• Remove inactive members</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that affect your entire organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-destructive">Transfer Organization</h4>
                        <p className="text-sm text-destructive mt-1">
                          Transfer ownership of this organization to another member
                        </p>
                      </div>
                      <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                        Transfer
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-destructive">Delete Organization</h4>
                        <p className="text-sm text-destructive mt-1">
                          Permanently delete this organization and all its data
                        </p>
                      </div>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
