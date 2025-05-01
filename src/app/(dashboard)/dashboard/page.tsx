import { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export const metadata: Metadata = {
  title: "Dashboard | ThriveSend",
  description: "ThriveSend dashboard overview",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your ThriveSend dashboard
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
