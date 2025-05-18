import React from "react"
import { Users, Mail, BarChart2, MousePointerClick, CheckCircle2, Clock } from "lucide-react"

// Standardized color mapping for metrics
const metricColorMap = [
  {
    iconClass: "text-[var(--color-chart-blue)] bg-[var(--color-chart-blue)]/10",
    numberClass: "text-[var(--color-chart-blue)]",
    icon: <Mail className="h-7 w-7" />,
  },
  {
    iconClass: "text-[var(--color-chart-green)] bg-[var(--color-chart-green)]/10",
    numberClass: "text-[var(--color-chart-green)]",
    icon: <Users className="h-7 w-7" />,
  },
  {
    iconClass: "text-[var(--color-chart-orange)] bg-[var(--color-chart-orange)]/10",
    numberClass: "text-[var(--color-chart-orange)]",
    icon: <BarChart2 className="h-7 w-7" />,
  },
  {
    iconClass: "text-[var(--color-chart-purple)] bg-[var(--color-chart-purple)]/10",
    numberClass: "text-[var(--color-chart-purple)]",
    icon: <MousePointerClick className="h-7 w-7" />,
  },
];

const statusIconMap = {
  Sent: <CheckCircle2 className="h-4 w-4 text-[var(--activity-success)] mr-1" />, // green
  Draft: <Clock className="h-4 w-4 text-[var(--activity-warning)] mr-1" /> // yellow
}
const statusColorMap = {
  Sent: "bg-[var(--activity-success)]/10 text-[var(--activity-success)]",
  Draft: "bg-[var(--activity-warning)]/10 text-[var(--activity-warning)]"
}

// --- InfoCard (reusable for metrics)
export function InfoCard({ title, value, icon, change, iconClass, numberClass }: { 
  title: string, 
  value: string | number, 
  icon: React.ReactNode, 
  change?: string | null,
  iconClass: string,
  numberClass: string
}) {
  return (
    <div className="rounded-xl shadow p-5 flex items-center min-w-[180px] bg-card relative overflow-hidden transition-transform hover:scale-[1.03]">
      <div className={`flex-shrink-0 mr-4 z-10 rounded-full p-2 ${iconClass}`}>{icon}</div>
      <div className="z-10">
        <div className="text-xs font-medium text-foreground/80 drop-shadow">{title}</div>
        <div className={`text-2xl font-bold drop-shadow ${numberClass}`}>{value}</div>
        {change && <div className="text-xs text-foreground/70 drop-shadow">{change}</div>}
      </div>
      {/* Decorative blurred circle */}
      <div className="absolute right-0 bottom-0 w-16 h-16 bg-card/10 rounded-full blur-2xl z-0" />
    </div>
  )
}

// --- Recent Campaigns List
export function RecentCampaigns({ campaigns }: { campaigns: { name: string, status: string, sentAt: string }[] }) {
  return (
    <div className="bg-neutral-card rounded-xl shadow p-4">
      <div className="font-semibold mb-3 text-neutral-text">Recent Campaigns</div>
      <ul className="space-y-2">
        {campaigns.map((c, i) => (
          <li key={i} className="flex justify-between items-center border-b border-neutral-border py-2">
            <span className="font-medium text-neutral-text">{c.name}</span>
            <span className={`text-xs px-2 py-1 rounded ${c.status === "Sent" ? "bg-secondary-50 text-secondary-700" : "bg-accent-50 text-accent-700"}`}>{c.status}</span>
            <span className="text-xs text-neutral-text-light">{c.sentAt}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 text-right">
        <a href="/campaigns" className="text-primary-500 hover:text-primary-600 text-sm">View all</a>
      </div>
    </div>
  )
}

// --- Recent Subscribers List
export function RecentSubscribers({ subscribers }: { subscribers: { email: string, joinedAt: string }[] }) {
  return (
    <div className="bg-neutral-card rounded-xl shadow p-4">
      <div className="font-semibold mb-3 text-neutral-text">Recent Subscribers</div>
      <ul className="space-y-2">
        {subscribers.map((s, i) => (
          <li key={i} className="flex justify-between items-center border-b border-neutral-border py-2">
            <span className="text-neutral-text">{s.email}</span>
            <span className="text-xs text-neutral-text-light">{s.joinedAt}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 text-right">
        <a href="/subscribers" className="text-primary-500 hover:text-primary-600 text-sm">Manage subscribers</a>
      </div>
    </div>
  )
}

// --- (Stub) Tiny Area/Bar Chart for quick visuals
export function TinyBarChart({ data }: { data: number[] }) {
  // Real charts should use a lib, here is a stub
  const max = Math.max(...data, 1);
  return (
    <svg width={100} height={30}>
      {data.map((val, i) => (
        <rect
          key={i}
          x={i * 12}
          y={30 - (val / max) * 28}
          width={8}
          height={(val / max) * 28}
          fill="var(--primary-500)"
          rx={2}
        />
      ))}
    </svg>
  );
}

// --- Main DashboardOverview
export function DashboardOverview() {
  // Demo data, integrate with backend/schema later
  const metrics = [
    { title: "Active Campaigns", value: 5, change: "+8%" },
    { title: "Total Subscribers", value: 1820, change: "+20" },
    { title: "Open Rate", value: "45%", change: "+3%" },
    { title: "Click Rate", value: "12%", change: null },
  ];
  const tinyData = [3, 7, 5, 10, 6, 12, 8];
  const campaigns = [
    { name: "Spring Sale", status: "Sent", sentAt: "2024-06-01" },
    { name: "Newsletter May", status: "Draft", sentAt: "—" },
    { name: "Beta Invite", status: "Sent", sentAt: "2024-05-27" },
  ];
  const subscribers = [
    { email: "alice@email.com", joinedAt: "2024-06-01" },
    { email: "bob@email.com", joinedAt: "2024-05-30" },
    { email: "chris@email.com", joinedAt: "2024-05-29" },
  ];

  return (
    <div className="space-y-8 bg-transparent">
      {/* Grid of InfoCards with standardized color mapping */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <InfoCard
            key={i}
            title={m.title}
            value={m.value}
            change={m.change}
            icon={metricColorMap[i].icon}
            iconClass={metricColorMap[i].iconClass}
            numberClass={metricColorMap[i].numberClass}
          />
        ))}
      </div>

      {/* Quick tiny bar chart with color, neutral background */}
      <div className="bg-card rounded-xl shadow p-6 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-[var(--color-chart-blue)] mb-2">7-day Subscriber Growth</div>
          <svg width={100} height={30}>
            {tinyData.map((val, i) => (
              <rect
                key={i}
                x={i * 12}
                y={30 - (val / Math.max(...tinyData, 1)) * 28}
                width={8}
                height={(val / Math.max(...tinyData, 1)) * 28}
                fill="url(#barGradient)"
                rx={2}
              />
            ))}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-blue)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="var(--color-chart-green)" stopOpacity="0.7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <a href="/analytics" className="ml-6 text-[var(--color-chart-blue)] hover:text-[var(--color-chart-green)] font-medium text-sm">
          Full analytics →
        </a>
      </div>

      {/* Recent Campaigns and Subscribers Side by Side with colored headers and status icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-neutral-background-dark rounded-xl shadow p-6">
          <div className="font-semibold mb-3 text-[var(--color-chart-green)] dark:text-[var(--color-chart-green)]">Recent Campaigns</div>
          <ul className="space-y-2">
            {campaigns.map((c, i) => (
              <li key={i} className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 py-2">
                <span className="font-medium text-neutral-800 dark:text-neutral-100">{c.name}</span>
                <span className={`flex items-center text-xs px-2 py-1 rounded-full font-semibold gap-1 ${statusColorMap[c.status as keyof typeof statusColorMap] || "bg-[var(--activity-info)]/10 text-[var(--activity-info)]"}`}>
                  {statusIconMap[c.status as keyof typeof statusIconMap] || null}
                  {c.status}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{c.sentAt}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 text-right">
            <a href="/campaigns" className="text-[var(--color-chart-blue)] hover:text-[var(--color-chart-green)] text-sm">View all</a>
          </div>
        </div>
        <div className="bg-card dark:bg-neutral-background-dark rounded-xl shadow p-6">
          <div className="font-semibold mb-3 text-[var(--color-chart-orange)] dark:text-[var(--color-chart-orange)]">Recent Subscribers</div>
          <ul className="space-y-2">
            {subscribers.map((s, i) => (
              <li key={i} className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 py-2">
                <span className="text-neutral-800 dark:text-neutral-100">{s.email}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{s.joinedAt}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 text-right">
            <a href="/subscribers" className="text-[var(--color-chart-blue)] hover:text-[var(--color-chart-green)] text-sm">Manage subscribers</a>
          </div>
        </div>
      </div>
    </div>
  );
}