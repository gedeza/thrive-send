'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard, 
  Receipt, 
  Calendar,
  Download,
  Crown,
  Shield,
  AlertTriangle,
  Check,
  X,
  Plus,
  MoreVertical,
  Zap,
  TrendingUp,
  Users,
  FileText,
  Clock,
  DollarSign,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useOrganizationSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

// Types
interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  email?: string; // For PayPal
  bankName?: string; // For bank accounts
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  downloadUrl?: string;
}

interface Subscription {
  id: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  current?: boolean;
}

// Mock data
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  },
  {
    id: '2',
    type: 'paypal',
    email: 'user@example.com',
    isDefault: false
  }
];

const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    date: '2024-03-01T00:00:00Z',
    amount: 29.99,
    currency: 'USD',
    status: 'paid',
    description: 'ThriveSend Pro - March 2024',
    downloadUrl: '#'
  },
  {
    id: 'inv_002',
    date: '2024-02-01T00:00:00Z',
    amount: 29.99,
    currency: 'USD',
    status: 'paid',
    description: 'ThriveSend Pro - February 2024',
    downloadUrl: '#'
  },
  {
    id: 'inv_003',
    date: '2024-01-01T00:00:00Z',
    amount: 29.99,
    currency: 'USD',
    status: 'paid',
    description: 'ThriveSend Pro - January 2024',
    downloadUrl: '#'
  }
];

const mockSubscription: Subscription = {
  id: 'sub_001',
  plan: 'pro',
  status: 'active',
  currentPeriodStart: '2024-03-01T00:00:00Z',
  currentPeriodEnd: '2024-04-01T00:00:00Z',
  cancelAtPeriodEnd: false
};

const availablePlans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      '5 content pieces per month',
      'Basic analytics',
      '1 team member',
      'Email support'
    ],
    current: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited content',
      'Advanced analytics',
      '10 team members',
      'Priority support',
      'AI content generation',
      'Social media scheduling'
    ],
    popular: true,
    current: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom integrations',
      'Dedicated support',
      'White-labeling',
      'Advanced security'
    ],
    current: false
  }
];

// Payment method component
function PaymentMethodCard({ 
  method, 
  onSetDefault, 
  onRemove, 
  disabled 
}: {
  method: PaymentMethod;
  onSetDefault: (methodId: string) => void;
  onRemove: (methodId: string) => void;
  disabled?: boolean;
}) {
  const getMethodIcon = () => {
    switch (method.type) {
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      case 'paypal':
        return <div className="h-5 w-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">P</div>;
      case 'bank':
        return <div className="h-5 w-5 bg-green-600 rounded text-white text-xs flex items-center justify-center">🏦</div>;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };
  
  const getMethodDescription = () => {
    switch (method.type) {
      case 'card':
        return `•••• •••• •••• ${method.last4} • ${method.expiryMonth}/${method.expiryYear}`;
      case 'paypal':
        return method.email;
      case 'bank':
        return `${method.bankName} •••• ${method.last4}`;
      default:
        return 'Unknown payment method';
    }
  };
  
  const getBrandName = () => {
    if (method.type === 'card' && method.brand) {
      return method.brand.charAt(0).toUpperCase() + method.brand.slice(1);
    }
    return method.type.charAt(0).toUpperCase() + method.type.slice(1);
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        {getMethodIcon()}
        
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{getBrandName()}</span>
            {method.isDefault && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                Default
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{getMethodDescription()}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!method.isDefault && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(method.id)}
            disabled={disabled}
          >
            Set Default
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemove(method.id)}
          disabled={disabled || method.isDefault}
          className="text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Invoice row component
function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'Failed', className: 'bg-red-100 text-red-800' },
      refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{invoice.description}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(invoice.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-medium">
            ${invoice.amount.toFixed(2)} {invoice.currency}
          </div>
          {getStatusBadge(invoice.status)}
        </div>
        
        {invoice.downloadUrl && invoice.status === 'paid' && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Plan card component
function PlanCard({ 
  plan, 
  onSelect, 
  disabled 
}: {
  plan: Plan;
  onSelect: (planId: string) => void;
  disabled?: boolean;
}) {
  return (
    <Card className={cn(
      'relative transition-all duration-200',
      plan.current && 'border-primary bg-primary/5',
      plan.popular && 'border-amber-200 bg-amber-50'
    )}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-amber-100 text-amber-800">
            <Crown className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="text-3xl font-bold">
          ${plan.price}
          <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600" />
              {feature}
            </div>
          ))}
        </div>
        
        <Button
          variant={plan.current ? "secondary" : "default"}
          className="w-full"
          onClick={() => onSelect(plan.id)}
          disabled={disabled || plan.current}
        >
          {plan.current ? 'Current Plan' : 'Select Plan'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Main component
export default function BillingSettings() {
  const { canManage } = useOrganizationSettings();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [subscription] = useState<Subscription>(mockSubscription);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  
  const handleSetDefaultPayment = (methodId: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
  };
  
  const handleRemovePayment = (methodId: string) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== methodId));
  };
  
  const handleSelectPlan = (planId: string) => {
    console.log('Selecting plan:', planId);
    // In production, this would initiate plan change flow
  };
  
  const handleCancelSubscription = () => {
    if (confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      console.log('Canceling subscription');
      // In production, this would call the cancel API
    }
  };
  
  const currentPlan = availablePlans.find(plan => plan.current);
  const nextBillingDate = new Date(subscription.currentPeriodEnd);
  
  if (!canManage) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to manage billing settings. Please contact an administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Billing Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {currentPlan?.name || 'Unknown'}
              </div>
              <div className="text-sm text-muted-foreground">Current Plan</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                ${currentPlan?.price || 0}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Cost</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {nextBillingDate.getDate()}
              </div>
              <div className="text-sm text-muted-foreground">
                Next Billing ({nextBillingDate.toLocaleDateString('en-US', { month: 'short' })})
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-amber-600 mb-1">
                {subscription.status === 'active' ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Current Subscription
            </CardTitle>
            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{currentPlan?.name} Plan</h3>
              <p className="text-muted-foreground">
                ${currentPlan?.price}/{currentPlan?.interval} • 
                Next billing: {nextBillingDate.toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold">${currentPlan?.price}</div>
              <div className="text-sm text-muted-foreground">per {currentPlan?.interval}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-renew subscription</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically renew your subscription each billing period
                </p>
              </div>
              <Switch
                checked={autoRenew}
                onCheckedChange={setAutoRenew}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              Change Plan
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancelSubscription}
              className="text-destructive hover:text-destructive"
            >
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Available Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={handleSelectPlan}
                disabled={false}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddPayment(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onSetDefault={handleSetDefaultPayment}
              onRemove={handleRemovePayment}
              disabled={false}
            />
          ))}
          
          {paymentMethods.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No payment methods configured
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Method Form */}
      {showAddPayment && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Add Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                <div className="space-y-2">
                  <Label>Cardholder Name</Label>
                  <Input placeholder="John Smith" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Expiry Month</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Expiry Year</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i} value={String(new Date().getFullYear() + i)}>
                          {new Date().getFullYear() + i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>CVC</Label>
                  <Input placeholder="123" maxLength={4} />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button>Add Payment Method</Button>
                <Button variant="outline" onClick={() => setShowAddPayment(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Billing History
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {invoices.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} />
            ))}
          </div>
          
          {invoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No billing history available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Billing Email</Label>
              <Input defaultValue="billing@acmecorp.com" />
            </div>
            
            <div className="space-y-2">
              <Label>Tax ID</Label>
              <Input placeholder="Enter your tax ID" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Billing Address</Label>
            <Input placeholder="Street address" className="mb-2" />
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="City" />
              <Input placeholder="State" />
              <Input placeholder="ZIP" />
            </div>
          </div>
          
          <Button>Update Billing Information</Button>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Billing FAQ
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
            
            <Button variant="outline" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              Contact Support
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
          
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Need help with billing? Our support team is available 24/7 to assist with payment issues, 
              plan changes, and billing questions. Contact us at billing@thrivesend.com.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}