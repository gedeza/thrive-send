"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/components/ui/use-toast';
import { useOrganization } from "@clerk/nextjs";
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, User, Mail, Phone, Globe, MapPin, Building, Briefcase } from 'lucide-react';
import { CLIENT_TYPES, INDUSTRY_SECTORS, getIndustryDescription } from '@/lib/client-categories';

// Form validation schema
const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  type: z.string().min(1, "Client type is required"),
  website: z.string()
    .transform(val => {
      if (!val) return "";
      // Check if URL starts with http:// or https://
      if (!/^https?:\/\//i.test(val)) {
        return `https://${val}`;
      }
      return val;
    })
    .refine(val => {
      if (!val) return true;
      try {
        new URL(val);
        return true;
      } catch (e) {
        return false;
      }
    }, "Invalid URL")
    .optional()
    .or(z.literal("")),
  industry: z.string().optional(),
  logoUrl: z.string()
    .transform(val => {
      if (!val) return "";
      if (!/^https?:\/\//i.test(val)) {
        return `https://${val}`;
      }
      return val;
    })
    .refine(val => {
      if (!val) return true;
      try {
        new URL(val);
        return true;
      } catch (e) {
        return false;
      }
    }, "Invalid URL format")
    .optional()
    .or(z.literal("")),
  organizationId: z.string().min(1, "Organization is required"),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function AddClientPage() {
  const router = useRouter();
  const { organization } = useOrganization();
  const { state: { organizationId: serviceProviderOrgId } } = useServiceProvider();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<'idle' | 'validating' | 'submitting' | 'success'>('idle');
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      type: "",
      website: "",
      industry: "",
      logoUrl: "",
      organizationId: "",
    },
  });

  // Update organization ID when it becomes available - prioritize ServiceProviderContext
  useEffect(() => {
    if (serviceProviderOrgId) {
      setValue('organizationId', serviceProviderOrgId);
    } else if (organization?.id) {
      setValue('organizationId', organization.id);
    }
  }, [serviceProviderOrgId, organization?.id, setValue]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);
      setFormState('validating');
      
      const effectiveOrgId = serviceProviderOrgId || organization?.id;
      if (!effectiveOrgId) {
        toast({
          title: "Organization Required",
          description: "No organization selected. Please select an organization first.",
          variant: "destructive",
        });
        return;
      }
      
      // Clean up the data before sending
      const cleanData = {
        ...data,
        website: data.website || null,
        phone: data.phone || null,
        industry: data.industry || null,
        address: data.address || null,
        logoUrl: data.logoUrl || null,
        organizationId: effectiveOrgId,
      };

      setFormState('submitting');
      const response = await fetch("/api/service-provider/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanData),
      });
      let responseData;
      const textData = await response.text();
      
      try {
        responseData = textData ? JSON.parse(textData) : {};
      } catch (_error) {
        throw new Error("Server returned an invalid response");
      }

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to create client (${response.status})`);
      }

      setFormState('success');
      const successMessage = responseData.message || "Client created successfully!";
      toast({
        title: "Success",
        description: responseData.demoMode 
          ? `${successMessage} (Running in demo mode)`
          : successMessage,
      });
      
      // Add a small delay to ensure API state is updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the client list with a cache-busting parameter
      const redirectUrl = `/clients?refresh=${Date.now()}`;
      router.push(redirectUrl);
      
      // Force a refresh of the client list
      router.refresh();
      
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: _error instanceof Error ? _error.message : "Failed to create client",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      if (formState !== 'success') {
        setFormState('idle');
      }
    }
  };

  if (!serviceProviderOrgId && !organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Organization Selected</h1>
          <p className="text-muted-foreground mb-6">
            Please select an organization to create a client.
          </p>
          <Link
            href="/organization"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          >
            Select Organization
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
            <p className="text-muted-foreground">Create a new client profile for your organization</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            Organization: {organization?.name || 'Demo Service Provider'}
          </p>
          <p className="text-xs text-muted-foreground">
            ID: {serviceProviderOrgId || organization?.id}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Essential details about your client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Client Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter client's business name"
                  {...register("name")}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">
                  Client Type <span className="text-destructive">*</span>
                </Label>
                <Select 
                  onValueChange={(value) => setValue('type', value)} 
                  disabled={isSubmitting}
                  {...register("type")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              How to reach your client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="client@example.com"
                    className="pl-10"
                    {...register("email")}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="pl-10"
                    {...register("phone")}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Additional Details
            </CardTitle>
            <CardDescription>
              Optional information to better understand your client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.example.com"
                    className="pl-10"
                    {...register("website")}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.website && (
                  <p className="text-sm text-destructive">{errors.website.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">
                  <Briefcase className="inline h-4 w-4 mr-1" />
                  Industry Sector
                </Label>
                <Select 
                  onValueChange={(value) => setValue('industry', value)} 
                  disabled={isSubmitting}
                  {...register("industry")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry sector" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {Object.entries(INDUSTRY_SECTORS).map(([sectorName, industries]) => (
                      <SelectGroup key={sectorName}>
                        <SelectLabel className="font-semibold text-primary">{sectorName}</SelectLabel>
                        {industries.map((industry) => (
                          <SelectItem 
                            key={industry.value} 
                            value={industry.value}
                            className="pl-6"
                          >
                            <div>
                              <div className="font-medium">{industry.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {industry.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-sm text-destructive">{errors.industry.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                placeholder="https://example.com/logo.png"
                {...register("logoUrl")}
                disabled={isSubmitting}
              />
              {errors.logoUrl && (
                <p className="text-sm text-destructive">{errors.logoUrl.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">
                <MapPin className="inline h-4 w-4 mr-1" />
                Address
              </Label>
              <Textarea
                id="address"
                placeholder="Enter client's business address"
                rows={3}
                {...register("address")}
                disabled={isSubmitting}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild disabled={isSubmitting}>
            <Link href="/clients">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {formState === 'validating' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : formState === 'submitting' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Client...
              </>
            ) : formState === 'success' ? (
              'Client Created!'
            ) : (
              'Create Client'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}