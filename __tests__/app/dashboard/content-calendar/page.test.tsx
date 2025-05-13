import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ContentCalendarPage from "@/app/dashboard/content-calendar/page";

// Mock the handlers that are provided to ContentCalendar in the page
const mockEvents = [
  {
    id: "abc123",
    title: "Sample Event",
    description: "Test event",
    date: "2024-07-01",
    time: "10:30",
    type: "email",
    status: "scheduled",
    campaignId: "proj42",
  },
];

const fetchEvents = jest.fn().mockResolvedValue(mockEvents);
const createEvent = jest.fn().mockResolvedValue({
  ...mockEvents[0],
  id: "new123",
  title: "Newly Created",
});
const updateEvent = jest.fn().mockResolvedValue({
  ...mockEvents[0],
  title: "Updated Event",
});
const deleteEvent = jest.fn().mockResolvedValue(true);

// Mock ContentCalendarPage to inject test handlers
jest.mock("@/components/content/content-calendar", () => ({
  ContentCalendar: (props: any) => {
    // Forward mock handlers
    React.useEffect(() => {
      props.fetchEvents();
    }, [props.fetchEvents]);
    return (
      <div>
        <div>calendar loaded</div>
        <button onClick={() => props.onEventCreate({ ...mockEvents[0], id: undefined })}>Create</button>
        <button onClick={() => props.onEventUpdate({ ...mockEvents[0] })}>Update</button>
        <button onClick={() => props.onEventDelete(mockEvents[0].id)}>Delete</button>
        <span>{mockEvents[0].title}</span>
      </div>
    );
  },
  CalendarEvent: {},
}));

describe("ContentCalendar page integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the calendar page and fetches events", async () => {
    render(<ContentCalendarPage />);
    expect(await screen.findByText("calendar loaded")).toBeInTheDocument();
    expect(fetchEvents).toHaveBeenCalled();
  });

  it("handles event creation", async () => {
    render(<ContentCalendarPage />);
    const createBtn = await screen.findByText("Create");
    fireEvent.click(createBtn);
    // You can extend: expect(createEvent).toHaveBeenCalledWith(...)
  });

  it("handles event update", async () => {
    render(<ContentCalendarPage />);
    const updateBtn = await screen.findByText("Update");
    fireEvent.click(updateBtn);
    // You can extend: expect(updateEvent).toHaveBeenCalledWith(...)
  });

  it("handles event delete", async () => {
    render(<ContentCalendarPage />);
    const deleteBtn = await screen.findByText("Delete");
    fireEvent.click(deleteBtn);
    // You can extend: expect(deleteEvent).toHaveBeenCalledWith(...)
  });

  it('shows error UI when fetchEvents fails', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({ ok: false })
    );
    render(<ContentCalendarPage />);
    expect(await screen.findByText(/failed to fetch events/i)).toBeInTheDocument();
  });
});