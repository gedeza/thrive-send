import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server"; // Clerk

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all organizations the user is part of
  const memberships = await db.organizationMember.findMany({
    where: { user: { clerkId: userId } },
    select: { organizationId: true },
  });

  // Then, all clients in those organizations
  const orgIds = memberships.map(m => m.organizationId);
  const clients = await db.client.findMany({
    where: { organizationId: { in: orgIds } },
    select: { id: true, name: true }
  });

  return NextResponse.json(clients);
}
