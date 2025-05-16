import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Query all projects with required fields
    const projects = await db.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        clientId: true,
        createdAt: true
      }
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}
