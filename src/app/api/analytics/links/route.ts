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

    // Mock link analytics data for development
    // In production, this would query actual link tracking data from your database
    const linkAnalytics = {
      links: [
        {
          url: "https://example.com/landing-page",
          clicks: 890,
          uniqueClicks: 742,
          clickRate: 12.4,
          position: "CTA Button"
        },
        {
          url: "https://example.com/product-1",
          clicks: 345,
          uniqueClicks: 298,
          clickRate: 8.2,
          position: "Product Link"
        },
        {
          url: "https://example.com/learn-more",
          clicks: 156,
          uniqueClicks: 134,
          clickRate: 4.1,
          position: "Footer Link"
        }
      ],
      totalClicks: 1391,
      totalUniqueClicks: 1174,
      avgClickRate: 8.2,
      topPerformer: {
        url: "https://example.com/landing-page",
        clicks: 890
      },
      period: {
        start: start || "2023-11-01",
        end: end || "2023-11-30"
      },
      campaignId
    };

    return NextResponse.json(linkAnalytics);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch link analytics" },
      { status: 500 }
    );
  }
}