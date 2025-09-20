import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTemplates() {
  console.log('🔍 Checking templates in database...');

  const templates = await prisma.template.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      organizationId: true,
      status: true
    }
  });

  console.log(`📋 Found ${templates.length} templates in database:`);

  templates.forEach((template, index) => {
    console.log(`  ${index + 1}. ✅ ${template.name}`);
    console.log(`     Category: ${template.category}`);
    console.log(`     Status: ${template.status}`);
    console.log(`     ID: ${template.id}`);
    console.log('');
  });

  if (templates.length > 0) {
    console.log('🎉 SUCCESS: Your crafted templates are now in the database!');
    console.log('🔗 The API will now load these instead of demo templates.');
  } else {
    console.log('❌ No templates found in database.');
  }

  await prisma.$disconnect();
}

verifyTemplates().catch(console.error);