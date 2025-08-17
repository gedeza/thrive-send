"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/components/ui/use-toast';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { CLIENT_TYPES, INDUSTRY_SECTORS } from '@/lib/client-categories';

// Form validation schema
const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(["MUNICIPALITY", "BUSINESS", "STARTUP", "INDIVIDUAL", "NONPROFIT"], {
    required_error: "Client type is required",
  }),
  website: z.string()
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
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const { state: { organizationId } } = useServiceProvider();
  const { toast } = useToast();

  useEffect(() => {
    const fetchClient = async () => {
      try {
        if (!organizationId) {
          throw new Error('No organization ID');
        }
        
        const response = await fetch(`/api/service-provider/clients/${params.id}?organizationId=${organizationId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch client");
        }
        const data = await response.json();
        reset(data); // This will populate the form with client data
      } catch (error) {
        console.error("Error fetching client:", error);
        toast({
          title: "Error",
          description: "Failed to load client data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (organizationId) {
      fetchClient();
    }
  }, [params.id, reset, organizationId, toast]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);

      // Clean up the data before sending
      const cleanData = {
        ...data,
        website: data.website || null,
        phone: data.phone || null,
        industry: data.industry || null,
        address: data.address || null,
        logoUrl: data.logoUrl || null,
      };

      if (!organizationId) {
        throw new Error('No organization ID');
      }

      const response = await fetch(`/api/service-provider/clients/${params.id}?organizationId=${organizationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        throw new Error("Failed to update client");
      }

      toast({
        title: "Success",
        description: "Client updated successfully!"
      });
      router.push(`/clients/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Client</h1>
        <p className="text-muted-foreground">
          Update client information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <input
              id="name"
              {...register("name")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Phone</label>
            <input
              id="phone"
              type="tel"
              {...register("phone")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">Type</label>
            <Select onValueChange={(value) => setValue('type', value)} disabled={isSubmitting}>
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
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="website" className="text-sm font-medium">Website</label>
            <input
              id="website"
              type="url"
              {...register("website")}
              placeholder="https://example.com"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="industry" className="text-sm font-medium">Industry Sector</label>
            <Select onValueChange={(value) => setValue('industry', value)} disabled={isSubmitting}>
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
              <p className="text-sm text-red-500">{errors.industry.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="logoUrl" className="text-sm font-medium">Logo URL</label>
            <input
              id="logoUrl"
              type="url"
              {...register("logoUrl")}
              placeholder="https://example.com/logo.png"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.logoUrl && (
              <p className="text-sm text-red-500">{errors.logoUrl.message}</p>
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

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href={`/clients/${params.id}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
} 