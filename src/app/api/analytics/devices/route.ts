import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    // Mock device analytics data for development
    // In production, this would query actual analytics data from your database
    const deviceAnalytics = {
      devices: [
        {
          device: "Desktop",
          visitors: 1250,
          percentage: 45.2,
          bounceRate: 32.1,
          avgSessionDuration: "00:03:45"
        },
        {
          device: "Mobile",
          visitors: 1100,
          percentage: 39.8,
          bounceRate: 28.5,
          avgSessionDuration: "00:02:30"
        },
        {
          device: "Tablet",
          visitors: 415,
          percentage: 15.0,
          bounceRate: 35.7,
          avgSessionDuration: "00:04:12"
        }
      ],
      totalVisitors: 2765,
      period: {
        start: start || "2023-11-01",
        end: end || "2023-11-30"
      },
      campaignId
    };

    return NextResponse.json(deviceAnalytics);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch device analytics" },
      { status: 500 }
    );
  }
}