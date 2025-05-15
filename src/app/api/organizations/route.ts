import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server"; // Clerk

// Mock organizations data
const mockOrganizations = [
  {
    id: "org1",
    name: "Acme Corporation",
    type: "ENTERPRISE",
    industry: "Technology",
    createdAt: "2023-01-15T10:30:00Z"
  },
  {
    id: "org2",
    name: "Sunshine Media",
    type: "AGENCY",
    industry: "Marketing",
    createdAt: "2023-02-20T14:15:00Z"
  },
  {
    id: "org3",
    name: "Global Initiatives",
    type: "NONPROFIT",
    industry: "Environmental",
    createdAt: "2023-03-10T09:45:00Z"
  },
  {
    id: "org4",
    name: "Local Business Association",
    type: "SMALL_BUSINESS",
    industry: "Retail",
    createdAt: "2023-04-05T11:20:00Z"
  }
];

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(mockOrganizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}
