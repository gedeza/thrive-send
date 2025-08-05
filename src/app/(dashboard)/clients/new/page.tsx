"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useOrganization } from "@clerk/nextjs";
import { useServiceProvider } from '@/context/ServiceProviderContext';

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
      console.log('Using ServiceProvider organizationId:', serviceProviderOrgId);
      setValue('organizationId', serviceProviderOrgId);
    } else if (organization?.id) {
      console.log('Fallback to Clerk organization.id:', organization.id);
      setValue('organizationId', organization.id);
    }
  }, [serviceProviderOrgId, organization?.id, setValue]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Form submission started with data:", data);
      
      const effectiveOrgId = serviceProviderOrgId || organization?.id;
      if (!effectiveOrgId) {
        console.error("No organization found:", { serviceProviderOrgId, organization });
        toast.error("No organization selected. Please select an organization first.");
        return;
      }

      console.log("Using organizationId:", effectiveOrgId);
      
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

      console.log("Sending data to API:", cleanData);
      const response = await fetch("/api/service-provider/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanData),
      });

      console.log("API response status:", response.status);
      let responseData;
      const textData = await response.text();
      
      try {
        responseData = textData ? JSON.parse(textData) : {};
      } catch (error) {
        console.error("Error parsing response:", error);
        throw new Error("Server returned an invalid response");
      }

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to create client (${response.status})`);
      }

      console.log('Client creation successful:', responseData);
      
      const successMessage = responseData.message || "Client created successfully!";
      if (responseData.demoMode) {
        toast.success(`${successMessage} (Running in demo mode)`);
      } else {
        toast.success(successMessage);
      }
      
      console.log('Toast displayed, redirecting to client list...');
      
      // Add a small delay to ensure API state is updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the client list with a cache-busting parameter
      const redirectUrl = `/clients?refresh=${Date.now()}`;
      console.log('Redirecting to:', redirectUrl);
      router.push(redirectUrl);
      
      // Force a refresh of the client list
      router.refresh();
      
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create client");
    } finally {
      setIsSubmitting(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Client</h1>
          <p className="text-muted-foreground">Create a new client in ThriveSend</p>
          <p className="text-sm text-muted-foreground mt-2">
            Organization: {organization?.name || 'Demo Service Provider'} ({serviceProviderOrgId || organization?.id})
          </p>
        </div>
        <Link
          href="/clients"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          Cancel
        </Link>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <p className="text-sm text-muted-foreground">
                  Start with the essential details about your client.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label 
                    htmlFor="name"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Client Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter client's business or organization name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label 
                    htmlFor="type"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Client Type *
                  </label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    {...register("type")}
                  >
                    <option value="">Select client type...</option>
                    <option value="MUNICIPALITY">Municipality</option>
                    <option value="BUSINESS">Business</option>
                    <option value="STARTUP">Startup</option>
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="NONPROFIT">Nonprofit</option>
                  </select>
                  {errors.type && (
                    <p className="text-sm text-destructive">{errors.type.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <p className="text-sm text-muted-foreground">
                  Add your client's contact details for easy communication.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label 
                    htmlFor="email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="client@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label 
                    htmlFor="phone"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="+1 (555) 000-0000"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <p className="text-sm text-muted-foreground">
                  Add optional details to better understand your client.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label 
                    htmlFor="website"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Website
                  </label>
                  <input
                    id="website"
                    type="url"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="https://www.example.com"
                    {...register("website")}
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label 
                    htmlFor="industry"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Industry
                  </label>
                  <input
                    id="industry"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="e.g., Technology, Healthcare, Education"
                    {...register("industry")}
                  />
                  {errors.industry && (
                    <p className="text-sm text-destructive">{errors.industry.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label 
                  htmlFor="logoUrl"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Logo URL
                </label>
                <input
                  id="logoUrl"
                  type="url"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="https://example.com/logo.png"
                  {...register("logoUrl")}
                />
                {errors.logoUrl && (
                  <p className="text-sm text-destructive">{errors.logoUrl.message}</p>
                )}
              </div>
              
              <div className="space-y-2 col-span-2">
                <label htmlFor="address" className="text-sm font-medium">Address</label>
                <textarea
                  id="address"
                  {...register("address")}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Link
                href="/clients"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
              >
                {isSubmitting ? "Creating..." : "Create Client"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}