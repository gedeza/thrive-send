"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Form validation schema
const socialAccountSchema = z.object({
  platform: z.enum(["FACEBOOK", "TWITTER", "INSTAGRAM", "LINKEDIN"], {
    required_error: "Platform is required",
  }),
  handle: z.string()
    .min(1, "Handle is required")
    .refine(val => !val.includes(" "), "Handle cannot contain spaces")
    .transform(val => {
      // Remove @ if present at start
      return val.startsWith("@") ? val.slice(1) : val;
    }),
});

type SocialAccountFormData = z.infer<typeof socialAccountSchema>;

export default function AddSocialAccountPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SocialAccountFormData>({
    resolver: zodResolver(socialAccountSchema),
  });

  const onSubmit = async (data: SocialAccountFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/clients/${params.id}/social-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add social account");
      }

      toast.success("Social account added successfully!");
      router.push(`/clients/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error adding social account:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add social account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Social Account</h1>
          <p className="text-muted-foreground">
            Connect a new social media account to this client
          </p>
        </div>
        <Link
          href={`/clients/${params.id}`}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          Cancel
        </Link>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="platform"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Platform *
                  </label>
                  <select
                    id="platform"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("platform")}
                  >
                    <option value="">Select platform...</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="TWITTER">Twitter</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="LINKEDIN">LinkedIn</option>
                  </select>
                  {errors.platform && (
                    <p className="text-sm text-destructive">{errors.platform.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="handle"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Handle *
                  </label>
                  <input
                    id="handle"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="@username"
                    {...register("handle")}
                  />
                  {errors.handle && (
                    <p className="text-sm text-destructive">{errors.handle.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href={`/clients/${params.id}`}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
              >
                {isSubmitting ? "Adding..." : "Add Social Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 