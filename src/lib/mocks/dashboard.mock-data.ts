// Dashboard statistic/summary cards

export interface StatCard {
  title: string;
  value: string;
  icon: "users" | "mail" | "click" | "activity";
  desc: string;
}

export const statCards: StatCard[] = [
  {
    title: 'Total Subscribers',
    value: '8,720',
    icon: "users",
    desc: "+18% from last month"
  },
  {
    title: 'Average Open Rate',
    value: '24.8%',
    icon: "mail",
    desc: "Industry avg: 21.5%"
  },
  {
    title: 'Average Click Rate',
    value: '3.2%',
    icon: "click",
    desc: "Industry avg: 2.8%"
  },
  {
    title: 'Active Campaigns',
    value: '4',
    icon: "activity",
    desc: "2 scheduled for next week"
  }
];

export interface CampaignPerf {
  id: number;
  name: string;
  sent: number;
  opened: number;
  clicked: number;
  status: string;
}
export const mockCampaignData: CampaignPerf[] = [
  { id: 1, name: 'Welcome Series', sent: 1247, opened: 876, clicked: 432, status: 'Active' },
  { id: 2, name: 'Monthly Newsletter', sent: 3500, opened: 2100, clicked: 980, status: 'Completed' },
  { id: 3, name: 'Product Launch', sent: 2800, opened: 1400, clicked: 750, status: 'Draft' },
];

export interface SubscriberGrowth {
  month: string;
  count: number;
}
export const mockSubscriberGrowth: SubscriberGrowth[] = [
  { month: 'Jan', count: 1200 },
  { month: 'Feb', count: 1350 },
  { month: 'Mar', count: 1500 },
  { month: 'Apr', count: 1720 },
  { month: 'May', count: 2100 },
];

// Mock for schedule/calendar preview
export interface ScheduleEvent {
  date: string;
  title: string;
  time: string;
}
export const upcomingSchedule: ScheduleEvent[] = [
  { date: "Today", title: "Team Meeting", time: "2:00 PM" },
  { date: "Tomorrow", title: "Content Publishing", time: "10:00 AM" },
  { date: "May 15", title: "Campaign Launch", time: "9:00 AM" }
];
