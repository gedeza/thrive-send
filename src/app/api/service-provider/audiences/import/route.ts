import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const audienceName = formData.get('audienceName') as string;
    const organizationId = formData.get('organizationId') as string;
    const importMethod = formData.get('importMethod') as string;
    
    if (!audienceName || !organizationId || !importMethod) {
      return NextResponse.json({ 
        error: 'Missing required fields: audienceName, organizationId, importMethod' 
      }, { status: 400 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle organization ID mapping - check both database ID and Clerk organization ID
    let orgExists = await db.organization.findUnique({
      where: { id: organizationId }
    });

    if (!orgExists && organizationId.startsWith('org_')) {
      // Searching by clerkOrganizationId
      orgExists = await db.organization.findUnique({
        where: { clerkOrganizationId: organizationId }
      });
    }

    if (!orgExists) {
      // Organization not found, creating for development
      try {
        orgExists = await db.organization.create({
          data: {
            id: organizationId.startsWith('org_') ? `org-${Date.now()}` : organizationId,
            name: 'Auto-created Organization',
            clerkOrganizationId: organizationId.startsWith('org_') ? organizationId : null,
          }
        });
        
        // Also create organization membership for the user if needed
        await db.organizationMember.upsert({
          where: {
            userId_organizationId: {
              userId: user.id,
              organizationId: orgExists.id
            }
          },
          create: {
            userId: user.id,
            organizationId: orgExists.id,
            role: 'ADMIN'
          },
          update: {}
        });
      } catch (createError) {
        // Failed to create organization
        return NextResponse.json({ error: 'Organization access denied' }, { status: 403 });
      }
    }

    const dbOrganizationId = orgExists.id;

    // Check if user has access to the organization using the database organization ID
    const userMembership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: dbOrganizationId,
      },
    });

    if (!userMembership) {
      return NextResponse.json({ error: 'Access denied - not a member of this organization' }, { status: 403 });
    }

    let contacts: any[] = [];
    let contactCount = 0;

    // Process contacts based on import method
    if (importMethod === 'csv') {
      const csvFile = formData.get('csvFile') as File;
      
      if (!csvFile) {
        return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
      }

      const csvText = await csvFile.text();
      contacts = parseCSVContacts(csvText);
      contactCount = contacts.length;

    } else if (importMethod === 'manual') {
      const contactsText = formData.get('contacts') as string;
      
      if (!contactsText) {
        return NextResponse.json({ error: 'Contact information is required' }, { status: 400 });
      }

      contacts = parseManualContacts(contactsText);
      contactCount = contacts.length;
    }

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No valid contacts found to import' }, { status: 400 });
    }

    // Create audience and import contacts in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the audience
      const audience = await tx.audience.create({
        data: {
          name: audienceName,
          description: `Imported audience with ${contactCount} contacts`,
          type: 'IMPORTED',
          status: 'ACTIVE',
          organizationId: dbOrganizationId,
          createdById: user.id,
          size: contactCount,
          tags: ['imported'],
          rules: {
            importMethod,
            importedAt: new Date().toISOString(),
            originalCount: contactCount
          }
        }
      });

      // Create contacts for the audience
      const contactsData = contacts.map(contact => ({
        name: contact.name,
        email: contact.email,
        phone: contact.phone || null,
        audienceId: audience.id,
        organizationId: dbOrganizationId,
        status: 'ACTIVE' as const,
        source: 'IMPORTED' as const,
        metadata: {
          importedAt: new Date().toISOString(),
          importMethod
        }
      }));

      await tx.contact.createMany({
        data: contactsData,
        skipDuplicates: true // Skip any duplicate emails
      });

      // Get actual count of created contacts (in case some were duplicates)
      const actualCount = await tx.contact.count({
        where: { audienceId: audience.id }
      });

      // Update audience with actual contact count
      await tx.audience.update({
        where: { id: audience.id },
        data: { size: actualCount }
      });

      return {
        audience,
        contactCount: actualCount
      };
    });

    // Successfully imported contacts

    return NextResponse.json({
      success: true,
      audience: {
        id: result.audience.id,
        name: result.audience.name,
        size: result.contactCount
      },
      contactCount: result.contactCount,
      message: `Successfully imported ${result.contactCount} contacts into "${audienceName}" audience`
    }, { status: 201 });

  } catch (_error) {
    // Error importing contacts
    
    // Return more specific error messages
    if (_error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ 
          error: 'An audience with this name already exists' 
        }, { status: 409 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to import contacts. Please try again.' },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV contacts
function parseCSVContacts(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  const contacts: any[] = [];
  
  // Skip header row if it exists
  const startIndex = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('email') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map(part => part.trim().replace(/^["']|["']$/g, ''));
    
    if (parts.length >= 2) {
      const contact = {
        name: parts[0] || `Contact ${i}`,
        email: parts[1],
        phone: parts[2] || null
      };

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(contact.email)) {
        contacts.push(contact);
      }
    }
  }

  return contacts;
}

// Helper function to parse manual contacts
function parseManualContacts(contactsText: string): any[] {
  const lines = contactsText.trim().split('\n');
  const contacts: any[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map(part => part.trim());
    
    if (parts.length >= 2) {
      const contact = {
        name: parts[0] || `Contact ${i + 1}`,
        email: parts[1],
        phone: parts[2] || null
      };

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(contact.email)) {
        contacts.push(contact);
      }
    }
  }

  return contacts;
}