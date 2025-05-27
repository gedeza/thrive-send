import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { CalendarEvent } from "@/types/calendar";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const events = await db.calendarEvent.findMany({
      where: {
        organizationId: user.organizationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("[CALENDAR_EVENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const body = await req.json();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      title,
      description,
      startTime,
      endTime,
      type,
      status,
      socialMediaContent,
      blogPost,
      emailCampaign,
      customContent,
    } = body;

    if (!title || !startTime || !endTime || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const event = await db.calendarEvent.create({
      data: {
        title,
        description,
        startTime,
        endTime,
        type,
        status: status || "draft",
        socialMediaContent,
        blogPost,
        emailCampaign,
        customContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.id,
        organizationId: user.organizationId,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[CALENDAR_EVENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 