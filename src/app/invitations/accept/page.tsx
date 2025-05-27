"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { MainLayout } from "@/components/layout/main-layout";

export default function AcceptInvitationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      router.push("/");
    }
  }, [token, router]);

  const handleAccept = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: "Invitation accepted successfully",
      });

      router.push("/content/calendar");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="mx-auto max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-bold">Accept Invitation</h1>
          <p className="text-muted-foreground">
            You have been invited to join an organization. Click the button below to accept the invitation.
          </p>
          <Button onClick={handleAccept} disabled={isLoading}>
            {isLoading ? "Accepting..." : "Accept Invitation"}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
} 