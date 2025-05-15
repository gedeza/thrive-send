import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTemplateSchema() {
  console.log("Checking template schema...");

  try {
    // Check if templates table exists by attempting to count records
    const count = await prisma.template.count();
    console.log(`Template table exists with ${count} records`);

    // Fetch schema details
    const templateInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Template'
    `;
    
    console.log("Template schema details:");
    console.log(templateInfo);

    // Check for a template with specific fields
    const sampleTemplate = await prisma.template.findFirst({
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        status: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        organizationId: true,
        previewImage: true,
      }
    });

    if (sampleTemplate) {
      console.log("Successfully retrieved a sample template with all fields:");
      console.log(JSON.stringify(sampleTemplate, null, 2));
    } else {
      console.log("No templates found in the database.");
    }

    // Create a test template
    console.log("Creating a test template...");
    const testTemplate = await prisma.template.create({
      data: {
        name: "Test Template",
        description: "This is a test template created by the schema checker",
        category: "Email",
        status: "DRAFT",
        content: JSON.stringify([
          {
            id: "header-123",
            type: "header",
            content: "<h1>Test Header</h1>"
          },
          {
            id: "text-456",
            type: "text",
            content: "<p>This is test content</p>"
          }
        ]),
        // Note: You'll need to provide valid authorId and organizationId that exist in your database
        authorId: "PLACEHOLDER_AUTHOR_ID", // Replace with valid ID from your Users table
        organizationId: "PLACEHOLDER_ORG_ID", // Replace with valid ID from your Organization table
      }
    });
    
    console.log("Test template created successfully:");
    console.log(JSON.stringify(testTemplate, null, 2));

    // Clean up the test data
    await prisma.template.delete({
      where: { id: testTemplate.id }
    });
    console.log("Test template deleted successfully");

    console.log("Template schema check completed successfully!");
  } catch (error) {
    console.error("Error checking template schema:", error);
    
    // Check if it's a specific error related to missing table or fields
    if (error instanceof Error && error.message.includes("does not exist")) {
      console.error("The Template table doesn't exist in the database.");
      console.log("Make sure you've created the necessary Prisma schema and run migrations.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkTemplateSchema().catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
});