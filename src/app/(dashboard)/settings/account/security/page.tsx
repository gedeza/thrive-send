"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Shield, Key } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SecuritySettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof passwordSchema>) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update password using Clerk
      await user.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      // Reset form
      form.reset();
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "Failed to update password. Please check your current password.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggle2FA = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (is2FAEnabled) {
        // Disable 2FA
        await user.disableTwoFactor();
        setIs2FAEnabled(false);
        toast({
          title: "Success",
          description: "Two-factor authentication disabled",
        });
      } else {
        // Enable 2FA
        await user.enableTwoFactor();
        setIs2FAEnabled(true);
        toast({
          title: "Success",
          description: "Two-factor authentication enabled",
        });
      }
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      toast({
        title: "Error",
        description: "Failed to update two-factor authentication",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...form.register("currentPassword")}
                disabled={isSubmitting}
              />
              {form.formState.errors.currentPassword && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...form.register("newPassword")}
                disabled={isSubmitting}
              />
              {form.formState.errors.newPassword && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register("confirmPassword")}
                disabled={isSubmitting}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                {is2FAEnabled ? "2FA is enabled" : "2FA is disabled"}
              </p>
              <p className="text-sm text-muted-foreground">
                {is2FAEnabled
                  ? "Your account is protected with two-factor authentication"
                  : "Enable two-factor authentication for additional security"}
              </p>
            </div>
            <Button
              onClick={toggle2FA}
              disabled={isSubmitting}
              variant={is2FAEnabled ? "destructive" : "default"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 