import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, Users, FileText, DollarSign, Activity } from "lucide-react";
import { format } from "date-fns";

interface ClientAnalyticsProps {
  clientId: string;
}

interface AnalyticsData {
  date: string;
  projectCount: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  usedBudget: number;
  engagementRate: number;
  contentCount: number;
  reachCount: number;
  interactionCount: number;
  conversionRate: number;
  roi: number;
  healthScore: number;
}

interface ProjectMetrics {
  total: number;
  active: number;
  completed: number;
  planned: number;
}

interface ContentMetrics {
  _count: {
    id: number;
  };
}

export default function ClientAnalytics({ clientId }: ClientAnalyticsProps) {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    analytics: AnalyticsData[];
    projectMetrics: ProjectMetrics;
    contentMetrics: ContentMetrics;
    healthScore: number;
  } | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/clients/${clientId}/analytics?period=${period}`);
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const data = await response.json();
        // Handle both old direct data format and new standardized format
        const analyticsData = data.data ? data.data : data;
        setData(analyticsData);
      } catch (_error) {
        console.error("", _error);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [clientId, period]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="card-enhanced border-l-2 border-destructive/20">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 mb-4">
            <Activity className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-center text-destructive font-medium">
            {error || "Unable to load analytics"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { analytics, projectMetrics, contentMetrics, healthScore } = data;

  const getHealthScoreColor = (score: number) => {
    if (score > 70) return 'text-success';
    if (score > 40) return 'text-primary';
    return 'text-destructive';
  };

  const getHealthScoreCardStyle = (score: number) => {
    if (score > 70) return 'card-enhanced border-l-2 border-success/20';
    if (score > 40) return 'card-enhanced border-l-2 border-primary/20';
    return 'card-enhanced border-l-2 border-destructive/20';
  };

  const getHealthScoreIconBg = (score: number) => {
    if (score > 70) return 'p-2 bg-success/10 rounded-lg border border-success/20';
    if (score > 40) return 'p-2 bg-primary/10 rounded-lg border border-primary/20';
    return 'p-2 bg-destructive/10 rounded-lg border border-destructive/20';
  };

  const metrics = [
    {
      title: "Health Score",
      value: `${Math.round(healthScore)}%`,
      icon: Activity,
      description: "Overall client health",
      color: getHealthScoreColor(healthScore),
      cardStyle: getHealthScoreCardStyle(healthScore),
      iconBg: getHealthScoreIconBg(healthScore),
    },
    {
      title: "Active Projects",
      value: projectMetrics.active,
      icon: TrendingUp,
      description: "Currently running",
      color: "text-primary",
      cardStyle: "card-enhanced border-l-2 border-primary/20",
      iconBg: "p-2 bg-primary/10 rounded-lg border border-primary/20",
    },
    {
      title: "Total Content",
      value: contentMetrics._count.id,
      icon: FileText,
      description: "Pieces created",
      color: "text-muted-foreground",
      cardStyle: "card-enhanced border-l-2 border-muted/20",
      iconBg: "p-2 bg-muted/10 rounded-lg border border-muted/20",
    },
    {
      title: "ROI",
      value: `${analytics[analytics.length - 1]?.roi.toFixed(2)}%`,
      icon: DollarSign,
      description: "Return on investment",
      color: "text-success",
      cardStyle: "card-enhanced border-l-2 border-success/20",
      iconBg: "p-2 bg-success/10 rounded-lg border border-success/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Overview</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className={metric.cardStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={metric.iconBg}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold tracking-tight ${metric.color}`}>{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="card-enhanced border-l-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date), "MMM d, yyyy")}
                />
                <Line
                  type="monotone"
                  dataKey="engagementRate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Engagement Rate"
                />
                <Line
                  type="monotone"
                  dataKey="conversionRate"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  name="Conversion Rate"
                />
                <Line
                  type="monotone"
                  dataKey="healthScore"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  name="Health Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="card-enhanced border-l-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Project Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Active</span>
                <span className="font-bold text-primary">
                  {projectMetrics.active}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Completed</span>
                <span className="font-bold text-success">
                  {projectMetrics.completed}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Planned</span>
                <span className="font-bold text-muted-foreground">
                  {projectMetrics.planned}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-bold">Total</span>
                <span className="font-bold">
                  {projectMetrics.total}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced border-l-2 border-success/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Budget</span>
                <span className="font-bold">
                  ${analytics[analytics.length - 1]?.totalBudget.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Used Budget</span>
                <span className="font-bold text-primary">
                  ${analytics[analytics.length - 1]?.usedBudget.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span>Remaining</span>
                <span className="font-bold text-success">
                  ${(
                    analytics[analytics.length - 1]?.totalBudget -
                    analytics[analytics.length - 1]?.usedBudget
                  ).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-muted/20 rounded-full h-2.5 border border-muted/10">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${(analytics[analytics.length - 1]?.usedBudget /
                      analytics[analytics.length - 1]?.totalBudget) *
                      100}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 