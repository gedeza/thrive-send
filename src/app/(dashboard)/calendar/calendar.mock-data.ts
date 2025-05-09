export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: "email" | "blog" | "social" | "facebook" | "twitter" | "linkedin" | "instagram";
  status: "scheduled" | "draft" | "sent" | "cancelled";
}

export const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Weekly Newsletter",
    description: "Send out weekly updates to subscribers",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    type: "email",
    status: "scheduled"
  },
  {
    id: "2",
    title: "Product Launch Tweet",
    description: "Announce new feature on Twitter",
    date: new Date().toISOString().split("T")[0],
    time: "12:00",
    type: "twitter",
    status: "draft"
  },
  {
    id: "3",
    title: "Blog Post: Marketing Tips",
    description: "Publish blog post about email marketing",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
    time: "10:00",
    type: "blog",
    status: "scheduled"
  },
  {
    id: "4",
    title: "Monthly Report",
    description: "Send monthly performance report",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Yesterday
    time: "14:00",
    type: "email",
    status: "sent"
  },
  {
    id: "5",
    title: "Share Campaign Analytics",
    description: "Share campaign analytics on LinkedIn",
    date: new Date(Date.now() + 2*86400000).toISOString().split("T")[0], // 2 days later
    time: "19:00",
    type: "linkedin",
    status: "scheduled"
  },
  {
    id: "6",
    title: "Facebook Live Q&A",
    description: "Host a Q&A session about new feature",
    date: new Date(Date.now() + 3*86400000).toISOString().split("T")[0], // 3 days later
    time: "20:00",
    type: "facebook",
    status: "scheduled"
  },
  {
    id: "7",
    title: "Instagram Story: Meet the Team",
    description: "Feature team members in an Instagram story",
    date: new Date(Date.now() + 4*86400000).toISOString().split("T")[0], // 4 days later
    time: "18:00",
    type: "instagram",
    status: "draft"
  }
];