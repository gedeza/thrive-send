"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  isPopular?: boolean;
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    interval: "month",
    features: [
      "Up to 5 team members",
      "Basic analytics",
      "Email support",
      "1GB storage",
    ],
  },
  {
    id: "pro",
    name: "Professional",
    price: 99,
    interval: "month",
    features: [
      "Up to 20 team members",
      "Advanced analytics",
      "Priority support",
      "10GB storage",
      "Custom branding",
    ],
    isPopular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    interval: "month",
    features: [
      "Unlimited team members",
      "Enterprise analytics",
      "24/7 support",
      "Unlimited storage",
      "Custom branding",
      "API access",
      "Dedicated account manager",
    ],
  },
];

export function OrganizationBilling() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);

  const currentPlan = plans.find(plan => plan.id === selectedPlan);
  const isCurrentPlan = selectedPlan === "pro"; // This would come from your API

  const handleUpgrade = async () => {
    try {
      // TODO: Add API call to upgrade subscription
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      setIsUpgradeDialogOpen(false);
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the Professional plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">$99/month</p>
              <p className="text-sm text-muted-foreground">Billed monthly</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsUpgradeDialogOpen(true)}
            >
              Change Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View your past invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* This would be populated from your API */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">March 2024</p>
                <p className="text-sm text-muted-foreground">Professional Plan</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-medium">$99.00</p>
                <Badge>Paid</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">February 2024</p>
                <p className="text-sm text-muted-foreground">Professional Plan</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-medium">$99.00</p>
                <Badge>Paid</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Choose a plan that best fits your needs
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant={billingInterval === "month" ? "default" : "outline"}
              onClick={() => setBillingInterval("month")}
            >
              Monthly
            </Button>
            <Button
              variant={billingInterval === "year" ? "default" : "outline"}
              onClick={() => setBillingInterval("year")}
            >
              Yearly
              <Badge className="ml-2" variant="secondary">Save 20%</Badge>
            </Button>
          </div>

          <RadioGroup
            value={selectedPlan}
            onValueChange={setSelectedPlan}
            className="grid gap-4"
          >
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`flex items-start space-x-4 rounded-lg border p-4 ${
                  plan.isPopular ? "border-primary" : ""
                }`}
              >
                <RadioGroupItem
                  value={plan.id}
                  id={plan.id}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={plan.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${plan.price}/{billingInterval}
                      </p>
                    </div>
                    {plan.isPopular && (
                      <Badge>Popular</Badge>
                    )}
                  </Label>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </RadioGroup>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpgradeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={isCurrentPlan}
            >
              {isCurrentPlan ? "Current Plan" : "Upgrade Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 