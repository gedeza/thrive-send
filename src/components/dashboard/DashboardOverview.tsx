import React from "react"

// --- InfoCard (reusable for metrics)
export function InfoCard({ title, value, icon, change }: { title: string, value: string | number, icon?: React.ReactNode, change?: string }) {
  return (
    <div className="bg-white/90 rounded-xl shadow p-4 flex items-center min-w-[180px]">
      <div className="flex-shrink-0 mr-4 text-primary">{icon}</div>
      <div>
        <div className="text-xs font-medium text-muted-foreground">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
        {change && <div className="text-xs text-green-600">{change}</div>}
      </div>
    </div>
  )
}

// --- Recent Campaigns List
export function RecentCampaigns({ campaigns }: { campaigns: { name: string, status: string, sentAt: string }[] }) {
  return (
    <div className="bg-white/95 rounded-xl shadow p-4">
      <div className="font-semibold mb-3">Recent Campaigns</div>
      <ul className="space-y-2">
        {campaigns.map((c, i) => (
          <li key={i} className="flex justify-between items-center border-b border-gray-100 py-2">
            <span className="font-medium">{c.name}</span>
            <span className={`text-xs px-2 py-1 rounded ${c.status === "Sent" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{c.status}</span>
            <span className="text-xs text-muted-foreground">{c.sentAt}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 text-right">
        <a href="/campaigns" className="text-primary hover:underline text-sm">View all</a>
      </div>
    </div>
  )
}

// --- Recent Subscribers List
export function RecentSubscribers({ subscribers }: { subscribers: { email: string, joinedAt: string }[] }) {
  return (
    <div className="bg-white/95 rounded-xl shadow p-4">
      <div className="font-semibold mb-3">Recent Subscribers</div>
      <ul className="space-y-2">
        {subscribers.map((s, i) => (
          <li key={i} className="flex justify-between items-center border-b border-gray-100 py-2">
            <span>{s.email}</span>
            <span className="text-xs text-muted-foreground">{s.joinedAt}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 text-right">
        <a href="/subscribers" className="text-primary hover:underline text-sm">Manage subscribers</a>
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
          fill="#3b82f6"
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
    { title: "Active Campaigns", value: 5, icon: "📧", change: "+8%" },
    { title: "Total Subscribers", value: 1820, icon: "👤", change: "+20" },
    { title: "Open Rate", value: "45%", icon: "📈", change: "+3%" },
    { title: "Click Rate", value: "12%", icon: "🖱️", change: null },
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
    <div className="space-y-6">
      {/* Grid of InfoCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <InfoCard key={i} {...m} />
        ))}
      </div>

      {/* Quick tiny bar chart */}
      <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">7-day Subscriber Growth</div>
          <TinyBarChart data={tinyData} />
        </div>
        <a href="/analytics" className="ml-6 text-primary hover:underline font-medium text-sm">
          Full analytics →
        </a>
      </div>

      {/* Recent Campaigns and Subscribers Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecentCampaigns campaigns={campaigns} />
        <RecentSubscribers subscribers={subscribers} />
      </div>
    </div>
  );
}