import { NextRequest, NextResponse } from "next/server";

// Mock projects data
const mockProjects = [
  {
    id: "proj1",
    name: "Website Redesign",
    status: "ACTIVE",
    clientId: "2", // References Horizon Tech client
    createdAt: "2023-05-12T08:30:00Z"
  },
  {
    id: "proj2",
    name: "Summer Marketing Campaign",
    status: "PLANNING",
    clientId: "1", // References Starlight Municipality client
    createdAt: "2023-06-18T13:45:00Z"
  },
  {
    id: "proj3",
    name: "Product Launch",
    status: "ACTIVE",
    clientId: "2", // References Horizon Tech client
    createdAt: "2023-07-22T10:15:00Z"
  },
  {
    id: "proj4",
    name: "Annual Fundraiser",
    status: "COMPLETED",
    clientId: "3", // References GreenLeaf Nonprofit client
    createdAt: "2023-03-30T16:20:00Z"
  }
];

export async function GET(req: NextRequest) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(mockProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
