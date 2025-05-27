"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useOrganization } from "@clerk/nextjs";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

const plans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic features for small teams",
    price: 0,
    features: [
      "Up to 5 team members",
      "Basic analytics",
      "Email support",
      "1GB storage",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Advanced features for growing teams",
    price: 29,
    features: [
      "Unlimited team members",
      "Advanced analytics",
      "Priority support",
      "10GB storage",
      "Custom branding",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    price: 99,
    features: [
      "Unlimited everything",
      "Dedicated support",
      "Custom integrations",
      "Unlimited storage",
      "SLA guarantee",
    ],
  },
];

export default function BillingSettingsPage() {
  const { organization, isLoaded } = useOrganization();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (organization) {
      setIsLoading(true);
      fetch(`/api/organizations/${organization.id}/billing`)
        .then((res) => res.json())
        .then((data) => {
          if (data.plan) {
            setCurrentPlan(data.plan);
          }
        })
        .catch((error) => {
          console.error("Error fetching subscription:", error);
          toast({
            title: "Error",
            description: "Failed to load subscription details",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [organization, toast]);

  const handleUpgrade = async (planId: string) => {
    if (!organization) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/organizations/${organization.id}/billing`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update subscription");
      }

      const data = await response.json();
      setCurrentPlan(data.plan);
      toast({
        title: "Success",
        description: "Subscription plan updated successfully",
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription plan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentPlanDetails = plans.find((plan) => plan.id === currentPlan);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Manage your organization's subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">
                {currentPlanDetails?.name || "Free"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentPlanDetails?.description}
              </p>
            </div>
            <Button variant="outline" disabled={isSubmitting}>
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={currentPlan === plan.id ? "outline" : "default"}
                disabled={isSubmitting || currentPlan === plan.id}
                onClick={() => handleUpgrade(plan.id)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : currentPlan === plan.id ? (
                  "Current Plan"
                ) : (
                  "Upgrade"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 