import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

async function setupOrganization() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      console.error("No user ID found");
      return;
    }

    // Get the user from the database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      console.error("User not found in database");
      return;
    }

    // Create an organization
    const organization = await db.organization.create({
      data: {
        name: "My Organization",
        slug: "my-organization",
      },
    });

    // Add the user as a member of the organization
    await db.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "ADMIN",
      },
    });

    console.log("Organization setup completed successfully");
  } catch (_error) {
    console.error("", _error);
  }
}

setupOrganization(); 