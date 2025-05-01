// This file mocks the API functions for testing
const api = {
  // Content APIs
  fetchCalendarData: jest.fn().mockResolvedValue([
    "2023-01-01", "2023-01-02", "2023-01-03", 
    "2023-01-04", "2023-01-05", "2023-01-06", "2023-01-07"
  ]),
  
  saveContent: jest.fn().mockResolvedValue({ id: "content-123", success: true }),
  
  fetchContents: jest.fn().mockResolvedValue([
    { id: "content-1", title: "Sample Content 1", body: "This is sample content 1" },
    { id: "content-2", title: "Sample Content 2", body: "This is sample content 2" }
  ]),

  // User APIs
  fetchUserProfile: jest.fn().mockResolvedValue({
    id: "user-123",
    name: "John Doe",
    bio: "Test bio",
    avatarUrl: "https://example.com/avatar.jpg"
  }),
  
  updateUserProfile: jest.fn().mockResolvedValue({
    id: "user-123",
    name: "Updated Name",
    bio: "Updated bio",
    avatarUrl: "https://example.com/avatar.jpg"
  }),
  
  // Analytics APIs
  fetchAnalyticsData: jest.fn().mockResolvedValue([
    { key: "views", label: "Page Views", value: 1234 },
    { key: "engagement", label: "Engagement Rate", value: "45%" },
    { key: "conversion", label: "Conversion Rate", value: "3.2%" }
  ]),
};

export default api;