import React, { useState } from "react"
import { Users, Mail, BarChart2, MousePointerClick, CheckCircle2, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Line } from "react-chartjs-2"
import { ErrorBoundary } from "@/components/error/ErrorBoundary"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
)

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

interface DashboardOverviewProps {
  dateRange: '1d' | '7d' | '30d' | 'custom';
  customRange?: { from: string; to: string } | null;
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl shadow p-5 flex items-center min-w-[180px] bg-card relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg"
      role="region"
      aria-label={`${title} metric`}
    >
      <div className={`flex-shrink-0 mr-4 z-10 rounded-full p-2 ${iconClass}`} aria-hidden="true">{icon}</div>
      <div className="z-10">
        <div className="text-xs font-medium text-foreground/80 drop-shadow">{title}</div>
        <div className={`text-2xl font-bold drop-shadow ${numberClass}`}>{value}</div>
        {change && (
          <div className="text-xs text-foreground/70 drop-shadow" aria-label={`Change: ${change}`}>
            {change}
          </div>
        )}
      </div>
      <div className="absolute right-0 bottom-0 w-16 h-16 bg-card/10 rounded-full blur-2xl z-0" aria-hidden="true" />
    </motion.div>
  )
}

// --- Growth Chart Component
function GrowthChart({ data, dateRange }: { data: number[], dateRange: '1d' | '7d' | '30d' | 'custom' }) {
  const labels = Array.from({ length: data.length }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (data.length - 1 - i))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Subscriber Growth',
        data: data,
        borderColor: '#3b82f6', // Hardcoded blue
        backgroundColor: 'rgba(59,130,246,0.10)', // Soft blue gradient fill
        pointBackgroundColor: '#3b82f6', // Blue points
        pointBorderColor: '#3b82f6',
        pointRadius: 5,
        pointHoverRadius: 7,
        pointLabelColor: '#fff', // White text for contrast if needed
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#3b82f6', // Blue tooltip background for contrast
        titleColor: '#fff', // White text
        bodyColor: '#fff', // White text
        borderColor: 'var(--border)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'var(--muted-foreground)',
          font: { family: 'inherit', size: 12 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: dateRange === '7d' ? 7 : dateRange === '30d' ? 10 : 15,
        },
      },
      y: {
        grid: {
          color: 'var(--border)', // Lighter grid lines
        },
        ticks: {
          color: 'var(--muted-foreground)',
          font: { family: 'inherit', size: 12 },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  }

  return (
    <div className="h-[200px] w-full">
      <Line data={chartData} options={options} />
    </div>
  )
}

// Safe version of RecentCampaigns with error handling
const SafeRecentCampaigns: React.FC<{ campaigns: { name: string, status: string, sentAt: string }[] }> = (props) => (
  <ErrorBoundary
    fallback={
      <div className="bg-card rounded-xl shadow p-6">
        <div className="text-sm text-muted-foreground">Failed to load campaigns</div>
      </div>
    }
  >
    <RecentCampaigns {...props} />
  </ErrorBoundary>
)

// --- Recent Campaigns List with sorting and filtering
export function RecentCampaigns({ campaigns }: { campaigns: { name: string, status: string, sentAt: string }[] }) {
  const { error, handleError } = useErrorHandler({
    fallbackMessage: 'Failed to load campaigns',
  });

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  try {
    const sortedAndFilteredCampaigns = campaigns
      .filter(c => filterStatus === 'all' || c.status === filterStatus)
      .sort((a, b) => {
        if (a.sentAt === '—' && b.sentAt === '—') return 0;
        if (a.sentAt === '—') return 1;
        if (b.sentAt === '—') return -1;
        return sortOrder === 'asc' 
          ? new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
          : new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
      });

    if (error.hasError) {
      return (
        <div className="bg-card rounded-xl shadow p-6">
          <div className="text-sm text-muted-foreground">{error.message}</div>
        </div>
      );
    }

    return (
      <div className="bg-card rounded-xl shadow p-6" role="region" aria-label="Recent Campaigns">
        <div className="flex justify-between items-center mb-4">
          <div className="font-semibold text-[var(--color-chart-green)]">Recent Campaigns</div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <ul className="space-y-2" role="list">
          {sortedAndFilteredCampaigns.map((c, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 py-2"
            >
              <span className="font-medium text-neutral-800 dark:text-neutral-100">{c.name}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`flex items-center text-xs px-2 py-1 rounded-full font-semibold gap-1 ${statusColorMap[c.status as keyof typeof statusColorMap] || "bg-[var(--activity-info)]/10 text-[var(--activity-info)]"}`}>
                      {statusIconMap[c.status as keyof typeof statusIconMap] || null}
                      {c.status}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Campaign status: {c.status}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{c.sentAt}</span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-3 text-right">
          <a 
            href="/campaigns" 
            className="text-[var(--color-chart-blue)] hover:text-[var(--color-chart-green)] text-sm transition-colors"
            aria-label="View all campaigns"
          >
            View all
          </a>
        </div>
      </div>
    );
  } catch (error) {
    handleError(error);
    return (
      <div className="bg-card rounded-xl shadow p-6">
        <div className="text-sm text-muted-foreground">Failed to load campaigns</div>
      </div>
    );
  }
}

// Safe version of RecentSubscribers with error handling
const SafeRecentSubscribers: React.FC<{ subscribers: { email: string, joinedAt: string }[] }> = (props) => (
  <ErrorBoundary
    fallback={
      <div className="bg-card rounded-xl shadow p-6">
        <div className="text-sm text-muted-foreground">Failed to load subscribers</div>
      </div>
    }
  >
    <RecentSubscribers {...props} />
  </ErrorBoundary>
)

// --- Recent Subscribers List with search and pagination
export function RecentSubscribers({ subscribers }: { subscribers: { email: string, joinedAt: string }[] }) {
  const { error, handleError } = useErrorHandler({
    fallbackMessage: 'Failed to load subscribers',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  try {
    const filteredSubscribers = subscribers.filter(s => 
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedSubscribers = filteredSubscribers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    if (error.hasError) {
      return (
        <div className="bg-card rounded-xl shadow p-6">
          <div className="text-sm text-muted-foreground">{error.message}</div>
        </div>
      );
    }

    return (
      <div className="bg-card rounded-xl shadow p-6" role="region" aria-label="Recent Subscribers">
        <div className="flex justify-between items-center mb-4">
          <div className="font-semibold text-[var(--color-chart-orange)]">Recent Subscribers</div>
          <input
            type="search"
            placeholder="Search subscribers..."
            className="px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-chart-orange)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search subscribers"
          />
        </div>
        <ul className="space-y-2" role="list">
          {paginatedSubscribers.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 py-2"
            >
              <span className="text-neutral-800 dark:text-neutral-100">{s.email}</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{s.joinedAt}</span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-neutral-500">
            Showing {paginatedSubscribers.length} of {filteredSubscribers.length} subscribers
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage * itemsPerPage >= filteredSubscribers.length}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    handleError(error);
    return (
      <div className="bg-card rounded-xl shadow p-6">
        <div className="text-sm text-muted-foreground">Failed to load subscribers</div>
      </div>
    );
  }
}

// Safe version of TinyBarChart with error handling
const SafeTinyBarChart: React.FC<{ data: number[] }> = (props) => (
  <ErrorBoundary
    fallback={
      <div className="h-[30px] w-[100px] flex items-center justify-center bg-card rounded">
        <div className="text-xs text-muted-foreground">Failed to load chart</div>
      </div>
    }
  >
    <TinyBarChart {...props} />
  </ErrorBoundary>
)

// --- Tiny Bar Chart for quick visuals
export function TinyBarChart({ data }: { data: number[] }) {
  const { error, handleError } = useErrorHandler({
    fallbackMessage: 'Failed to render chart',
  });

  try {
    // Validate data
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format: expected an array');
    }

    if (data.length === 0) {
      throw new Error('No data available');
    }

    if (data.some(val => typeof val !== 'number' || isNaN(val))) {
      throw new Error('Invalid data: all values must be numbers');
    }

    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    
    if (min < 0) {
      throw new Error('Invalid data: negative values are not supported');
    }

    if (error.hasError) {
      return (
        <div className="h-[30px] w-[100px] flex items-center justify-center bg-card rounded">
          <div className="text-xs text-muted-foreground">{error.message}</div>
        </div>
      );
    }

    return (
      <svg width={100} height={30} role="img" aria-label="Bar chart visualization">
        {data.map((val, i) => (
          <rect
            key={i}
            x={i * 12}
            y={30 - (val / max) * 28}
            width={8}
            height={(val / max) * 28}
            fill="var(--primary-500)"
            rx={2}
            aria-label={`Bar ${i + 1}: ${val}`}
          />
        ))}
      </svg>
    );
  } catch (error) {
    handleError(error);
    return (
      <div className="h-[30px] w-[100px] flex items-center justify-center bg-card rounded">
        <div className="text-xs text-muted-foreground">Failed to render chart</div>
      </div>
    );
  }
}

// Wrap InfoCard with ErrorBoundary
const SafeInfoCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string | null;
  iconClass: string;
  numberClass: string;
}> = (props) => (
  <ErrorBoundary
    fallback={
      <div className="rounded-xl shadow p-5 flex items-center min-w-[180px] bg-card">
        <div className="text-sm text-muted-foreground">Failed to load metric</div>
      </div>
    }
  >
    <InfoCard {...props} />
  </ErrorBoundary>
);

// Wrap GrowthChart with ErrorBoundary
const SafeGrowthChart: React.FC<{
  data: number[];
  dateRange: '1d' | '7d' | '30d' | 'custom';
}> = (props) => (
  <ErrorBoundary
    fallback={
      <div className="h-[200px] flex items-center justify-center bg-card rounded-lg">
        <div className="text-sm text-muted-foreground">Failed to load chart</div>
      </div>
    }
  >
    <GrowthChart {...props} />
  </ErrorBoundary>
);

// Main DashboardOverview component
export function DashboardOverview({ dateRange, customRange }: DashboardOverviewProps) {
  const { error, handleError, resetError } = useErrorHandler({
    fallbackMessage: 'Failed to load dashboard data',
  });

  // Demo data, integrate with backend/schema later
  const metrics = [
    { title: "Active Campaigns", value: 5, change: "+8%" },
    { title: "Total Subscribers", value: 1820, change: "+20" },
    { title: "Open Rate", value: "45%", change: "+3%" },
    { title: "Click Rate", value: "12%", change: null },
  ];

  // Generate data based on date range
  const getDataForRange = (range: '1d' | '7d' | '30d' | 'custom', custom?: { from: string; to: string } | null) => {
    try {
      if (range === '1d') return [Math.floor(Math.random() * 50) + 10];
      if (range === '7d') return Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10);
      if (range === '30d') return Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 10);
      if (range === 'custom' && custom && custom.from && custom.to) {
        const fromDate = new Date(custom.from);
        const toDate = new Date(custom.to);
        const days = Math.max(1, Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        return Array.from({ length: days }, () => Math.floor(Math.random() * 50) + 10);
      }
      return Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10);
    } catch (error) {
      handleError(error);
      return Array.from({ length: 7 }, () => 0);
    }
  };

  const growthData = getDataForRange(dateRange, customRange);
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

  if (error.hasError) {
    return (
      <div className="space-y-8 bg-transparent">
        <div className="bg-card rounded-xl shadow p-6">
          <div className="text-destructive mb-4">{error.message}</div>
          <Button onClick={resetError}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-transparent">
      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <SafeInfoCard
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
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl shadow p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-semibold text-[var(--color-chart-blue)]">
            Subscriber Growth
          </div>
          <a 
            href="/analytics" 
            className="text-[var(--color-chart-blue)] hover:text-[var(--color-chart-green)] font-medium text-sm transition-colors"
            aria-label="View full analytics"
          >
            Full analytics →
          </a>
        </div>
        <SafeGrowthChart data={growthData} dateRange={dateRange} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SafeRecentCampaigns campaigns={campaigns} />
        <SafeRecentSubscribers subscribers={subscribers} />
      </div>
    </div>
  );
}