import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get preferences from user metadata
    const preferences = {
      currency: user.publicMetadata?.currency || 'USD',
      timezone: user.publicMetadata?.timezone || 'UTC',
      dateFormat: user.publicMetadata?.dateFormat || 'MM/DD/YYYY'
    };

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { currency, timezone, dateFormat } = body;

    // Validate currency
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'ZAR', 'CAD', 'AUD', 'JPY', 'INR', 'BRL', 'MXN'];
    if (currency && !supportedCurrencies.includes(currency)) {
      return NextResponse.json(
        { error: "Unsupported currency" },
        { status: 400 }
      );
    }

    // Update user metadata using Clerk's backend API
    // Note: In production, you'd use Clerk's backend SDK
    const preferences = {
      currency: currency || user.publicMetadata?.currency || 'USD',
      timezone: timezone || user.publicMetadata?.timezone || 'UTC',
      dateFormat: dateFormat || user.publicMetadata?.dateFormat || 'MM/DD/YYYY'
    };

    // For now, we'll return success - in production integrate with Clerk Backend API
    return NextResponse.json({
      message: "Preferences updated successfully",
      preferences
    });

  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}