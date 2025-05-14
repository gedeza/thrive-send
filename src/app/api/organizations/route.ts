import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server"; // Clerk

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Find all organizations where this user is a member
  const memberships = await db.organizationMember.findMany({
    where: { user: { clerkId: userId } },  // Adjust field name if needed!
    select: { organization: { select: { id: true, name: true } } },
  });
  // Extract organizations
  const orgs = memberships.map(m => m.organization);
  return NextResponse.json(orgs);
}
