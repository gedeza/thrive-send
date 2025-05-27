import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const event = await db.calendarEvent.findUnique({
      where: {
        id: params.eventId,
        organizationId: user.organizationId,
      },
    });

    if (!event) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("[CALENDAR_EVENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { eventId: string } }
) {
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

    const event = await db.calendarEvent.update({
      where: {
        id: params.eventId,
        organizationId: user.organizationId,
      },
      data: {
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
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[CALENDAR_EVENT_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.calendarEvent.delete({
      where: {
        id: params.eventId,
        organizationId: user.organizationId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CALENDAR_EVENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 