import { BarChart, PieChart, Activity, Users } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type Metric = {
  title: string;
  value: string;
  icon: IconType;
  comparison: string;
};

// This data can later be fetched from an API or server!
export const metricsData: Metric[] = [
  {
    title: "Total Views",
    value: "21,120",
    icon: Activity,
    comparison: "+12% from last month",
  },
  {
    title: "Engagement Rate",
    value: "63%",
    icon: Users,
    comparison: "+8% from last month",
  },
  {
    title: "Conversion Rate",
    value: "49%",
    icon: PieChart,
    comparison: "+4% from last month",
  },
  {
    title: "Revenue",
    value: "$12,500",
    icon: BarChart,
    comparison: "+2% from last month",
  },
];
