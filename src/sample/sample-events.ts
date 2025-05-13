import { CalendarEvent } from "@/components/content/content-calendar";

/**
 * A reusable set of fake events for development and testing.
 */
export const FAKE_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Design Newsletter",
    description: "Monthly newsletter for design team",
    date: "2025-06-01",
    time: "09:30",
    type: "email",
    status: "scheduled",
    campaignId: "c1"
  },
  {
    id: "2",
    title: "Social Campaign Launch",
    description: "Kickoff for summer social media campaign",
    date: "2025-06-03",
    time: "14:00",
    type: "social",
    status: "draft"
  },
  {
    id: "3",
    title: "Blog: Productivity Tips",
    description: "Content outline for productivity blog post",
    date: "2025-06-02",
    time: "08:00",
    type: "blog",
    status: "sent"
  },
  {
    id: "4",
    title: "Internal Review Meeting",
    description: "Discuss Q2 progress",
    date: "2025-06-01",
    time: "15:00",
    type: "other",
    status: "scheduled"
  },
  {
    id: "5",
    title: "Marketing Recap Email",
    description: "Summary for all marketing stakeholders",
    date: "2025-06-04",
    type: "email",
    status: "failed"
  }
];