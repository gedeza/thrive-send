import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await req.json();
    if (!status || !["PENDING", "ACCEPTED", "REVOKED"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const invitation = await db.invitation.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(invitation);
  } catch (_error) {
    console.error("", _error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 