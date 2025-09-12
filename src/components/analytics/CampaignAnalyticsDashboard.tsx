/**
 * CampaignAnalyticsDashboard: A ready-to-add colorful analytics dashboard
 * - Multi-color metric cards for Overview
 * - Pie chart for Device Stats
 * - Bar chart for Links Clicked
 * - TailwindCSS styling and Chart.js integration
 *
 * Requirements:
 *   npm install react-chartjs-2 chart.js
 */

import React from "react";
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { ArrowUpRight, ArrowDownRight, MousePointerClick, Smartphone, Laptop } from "lucide-react";

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// --- Colorful Analytics Card Component (Tailwind) ---
type CardColor = "primary" | "success" | "warning" | "info" | "danger";
const colorSchemes: Record<CardColor, string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
};

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean; };
  labelColor?: CardColor;
  className?: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title, value, icon, trend, labelColor = "primary", className = "",
}) => (
  <div className={`flex flex-col rounded-xl border-2 shadow-sm p-4 ${colorSchemes[labelColor]} ${className} relative`}>
    <div className="flex items-center gap-2 mb-2">
      {icon && <span className="flex items-center">{icon}</span>}
      <span className="font-semibold uppercase tracking-wider text-xs">{title}</span>
    </div>
    <div className="flex items-end gap-2">
      <span className="text-3xl font-bold leading-none">{value}</span>
      {trend && (
        <span className={`flex items-center gap-1 text-sm font-semibold ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
          {trend.isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          {Math.abs(trend.value)}%
        </span>
      )}
    </div>
  </div>
);

// --- Overview Section Cards Data ---
const overviewMetrics = [
  {
    title: "Total Opens",
    value: "2,510",
    icon: <ArrowUpRight className="text-green-500" />,
    trend: { value: 4.2, isPositive: true },
    labelColor: "success" as CardColor
  },
  {
    title: "Device Clicks",
    value: "856",
    icon: <MousePointerClick className="text-indigo-600" />,
    trend: { value: -2.1, isPositive: false },
    labelColor: "primary" as CardColor
  },
  {
    title: "Conversions",
    value: "121",
    icon: <ArrowUpRight className="text-yellow-600" />,
    trend: { value: 0.9, isPositive: true },
    labelColor: "warning" as CardColor
  },
  {
    title: "Failures",
    value: "11",
    icon: <ArrowDownRight className="text-red-600" />,
    trend: { value: 1.2, isPositive: false },
    labelColor: "danger" as CardColor
  },
];

// --- Device Stats: Pie Chart Data ---
const deviceData = {
  labels: ["Mobile", "Desktop", "Tablet"],
  datasets: [
    {
      label: "Opens by Device",
      data: [65, 25, 10],
      backgroundColor: [
        "#6366F1", // indigo-500
        "#22D3EE", // cyan-400
        "#FB923C", // orange-400
      ],
      borderColor: [
        "#6366F1",
        "#22D3EE",
        "#FB923C",
      ],
      borderWidth: 2,
    }
  ]
};

// --- Links Clicked: Bar Chart Data ---
const linksClickedLabels = ["Homepage", "Signup", "View Offer", "Contact Us"];
const linksClickedDataArr = [430, 278, 191, 93];
const barColors = [
  "#6366F1", // indigo-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
];
const linksClickedData = {
  labels: linksClickedLabels,
  datasets: [
    {
      label: "Clicks",
      backgroundColor: barColors,
      data: linksClickedDataArr,
      borderRadius: 10,
      barPercentage: 0.6
    }
  ]
};

// --- Main Analytics Dashboard Component ---
export const CampaignAnalyticsDashboard: React.FC = () => (
  <section className="w-full max-w-4xl mx-auto space-y-10">
    {/* ---- OVERVIEW SECTION ---- */}
    <div>
      <h2 className="text-xl font-bold mb-4 text-indigo-900">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewMetrics.map((m, idx) => (
          <AnalyticsCard
            key={m.title}
            title={m.title}
            value={m.value}
            icon={m.icon}
            trend={m.trend}
            labelColor={m.labelColor}
          />
        ))}
      </div>
      <div className="text-xs mt-2 ml-1 text-slate-500 flex gap-4">
        <span><span className="inline-block w-4 h-2 bg-success/10 border-l-4 border-success rounded mr-1 align-middle"></span>Success</span>
        <span><span className="inline-block w-4 h-2 bg-indigo-100 border-l-4 border-indigo-400 rounded mr-1 align-middle"></span>Primary</span>
        <span><span className="inline-block w-4 h-2 bg-warning/10 border-l-4 border-warning rounded mr-1 align-middle"></span>Warning</span>
        <span><span className="inline-block w-4 h-2 bg-destructive/10 border-l-4 border-destructive rounded mr-1 align-middle"></span>Danger</span>
      </div>
    </div>
    {/* ---- DEVICE STATS ---- */}
    <div className="rounded-2xl bg-sky-50 border-l-4 border-sky-400 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <Smartphone className="text-sky-500" />
        <h3 className="text-lg font-bold text-sky-700">Device Stats</h3>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-[160px] h-[160px] -ml-4">
          <Pie data={deviceData} options={{
            plugins: {
              legend: { display: true, position: "bottom" }
            }
          }} />
        </div>
        <ul className="flex-1 space-y-1 mt-2 text-sky-900 text-sm">
          {deviceData.labels.map((device, idx) => (
            <li key={device} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: deviceData.datasets[0].backgroundColor[idx] as string }}
              ></span>
              <span className="font-semibold">{device}:</span>
              <span>{deviceData.datasets[0].data[idx]} opens</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    {/* ---- LINKS CLICKED ---- */}
    <div className="rounded-2xl bg-warning/10 border-l-4 border-warning p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <MousePointerClick className="text-yellow-500" />
        <h3 className="text-lg font-bold text-yellow-700">Links Clicked</h3>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-2/3 h-48">
          <Bar data={linksClickedData} options={{
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }} />
        </div>
        <ul className="flex-1 space-y-1 mt-2 text-yellow-900 text-sm">
          {linksClickedLabels.map((link, i) => (
            <li key={link} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: barColors[i] }}
              ></span>
              <span className="font-semibold">{link}:</span>
              <span>{linksClickedDataArr[i]} clicks</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    {/* ---- END ---- */}
  </section>
);

export default CampaignAnalyticsDashboard;
