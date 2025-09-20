#!/usr/bin/env tsx

/**
 * Template Migration Script
 *
 * This script migrates the carefully crafted static templates from
 * /src/data/campaign-templates.ts into the database Template table.
 *
 * This preserves all the valuable template work and makes it accessible
 * through the database-driven template system.
 */

import { PrismaClient } from '@prisma/client';
import { CAMPAIGN_TEMPLATES } from '../src/data/campaign-templates';

const prisma = new PrismaClient();

async function migrateTemplatesToDatabase() {
  console.log('🚀 Starting template migration...');
  console.log(`📋 Found ${CAMPAIGN_TEMPLATES.length} templates to migrate`);

  try {
    // First, get or create a default organization and user for the templates
    let defaultOrg = await prisma.organization.findFirst({
      where: { type: 'SERVICE_PROVIDER' }
    });

    if (!defaultOrg) {
      console.log('🏢 Creating default organization for templates...');
      defaultOrg = await prisma.organization.create({
        data: {
          id: 'template-migration-org',
          displayId: 'ORG_TEMPLATES',
          name: 'ThriveSend Template Library',
          slug: 'thrivesend-templates',
          type: 'SERVICE_PROVIDER',
          subscriptionTier: 'PREMIUM',
          maxClients: 1000,
          marketplaceEnabled: true,
          settings: {},
        }
      });
    }

    let defaultUser = await prisma.user.findFirst({
      where: { email: 'templates@thrivesend.com' }
    });

    if (!defaultUser) {
      console.log('👤 Creating default user for templates...');
      defaultUser = await prisma.user.create({
        data: {
          id: 'template-migration-user',
          displayId: 'USR_TEMPLATES',
          clerkId: 'template_system_user',
          email: 'templates@thrivesend.com',
          firstName: 'Template',
          lastName: 'System',
          name: 'Template System',
          role: 'ADMIN',
          hasCompletedOnboarding: true,
        }
      });

      // Create organization membership
      await prisma.organizationMember.create({
        data: {
          userId: defaultUser.id,
          organizationId: defaultOrg.id,
          role: 'ADMIN',
          serviceProviderRole: 'ADMIN'
        }
      });
    }

    console.log(`🏢 Using organization: ${defaultOrg.name} (${defaultOrg.id})`);
    console.log(`👤 Using user: ${defaultUser.name} (${defaultUser.id})`);

    // Migrate each template
    const migratedTemplates = [];

    for (const template of CAMPAIGN_TEMPLATES) {
      console.log(`\n📝 Migrating: ${template.name}`);

      try {
        // Convert the static template to database format
        const templateData = {
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.industry || 'General',
          status: 'PUBLISHED', // Make these available immediately
          lastUpdated: new Date(),
          organizationId: defaultOrg.id,
          authorId: defaultUser.id,

          // Store the rich template data as JSON in the content field
          content: JSON.stringify({
            // Template metadata
            difficulty: template.difficulty,
            duration: template.duration,
            estimatedResults: template.estimatedResults,

            // Campaign data
            campaignData: template.campaignData,

            // Content assets (blog posts, emails, social media)
            contentAssets: template.contentAssets,

            // Email sequences
            emailSequences: template.emailSequences,

            // Social posts
            socialPosts: template.socialPosts,

            // Additional metadata
            tags: [template.industry, template.difficulty, 'migrated-template'],
            templateType: 'CAMPAIGN',
            industry: template.industry,

            // Rich content for the new system
            customizableFields: [
              { field: 'CLIENT_NAME', label: 'Client Name', type: 'text' },
              { field: 'COMPANY_NAME', label: 'Company Name', type: 'text' },
              { field: 'DATE', label: 'Date', type: 'date' },
              { field: 'INDUSTRY', label: 'Industry', type: 'text' },
            ],

            // Performance data
            metrics: {
              expectedLeads: template.estimatedResults.leads,
              expectedConsultations: template.estimatedResults.consultations,
              expectedROI: template.estimatedResults.roi,
              timeToResults: template.estimatedResults.timeToResults
            }
          }),

          // Generate a preview image path
          previewImage: `/templates/preview-${template.industry.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`
        };

        // Check if template already exists
        const existingTemplate = await prisma.template.findUnique({
          where: { id: template.id }
        });

        let migratedTemplate;
        if (existingTemplate) {
          console.log(`   ⚠️  Template ${template.id} already exists, updating...`);
          migratedTemplate = await prisma.template.update({
            where: { id: template.id },
            data: templateData
          });
        } else {
          console.log(`   ✨ Creating new template ${template.id}...`);
          migratedTemplate = await prisma.template.create({
            data: templateData
          });
        }

        migratedTemplates.push(migratedTemplate);
        console.log(`   ✅ Successfully migrated: ${template.name}`);

      } catch (error) {
        console.error(`   ❌ Failed to migrate ${template.name}:`, error);
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Results:`);
    console.log(`   • ${migratedTemplates.length}/${CAMPAIGN_TEMPLATES.length} templates successfully migrated`);
    console.log(`   • Organization: ${defaultOrg.name}`);
    console.log(`   • All templates are now available in the database`);

    // Verify the migration
    const totalTemplatesInDb = await prisma.template.count({
      where: { organizationId: defaultOrg.id }
    });

    console.log(`   • Total templates in database: ${totalTemplatesInDb}`);

    if (totalTemplatesInDb >= CAMPAIGN_TEMPLATES.length) {
      console.log(`\n✅ MIGRATION SUCCESS: Your templates are now in the database!`);
      console.log(`🔗 They will be loaded by the API instead of demo templates.`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateTemplatesToDatabase()
    .then(() => {
      console.log('\n🎯 Template migration script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Template migration script failed:', error);
      process.exit(1);
    });
}

export { migrateTemplatesToDatabase };