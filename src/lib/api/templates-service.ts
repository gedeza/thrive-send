import { prisma } from '@/lib/prisma';

// Template type definition
export type Template = {
  id: string;
  name: string;
  description?: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  lastUpdated: string;
  createdAt?: string;
  author: string;
  authorId: string;
  previewImage?: string;
  content?: string;
  organizationId?: string;
};

// Parameters for fetching templates
export type TemplateParams = {
  search?: string;
  category?: string;
  status?: string;
  organizationId?: string;
};

/**
 * Fetches templates from the API with optional filtering
 */
export async function fetchTemplates(params: TemplateParams = {}): Promise<Template[]> {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.status) queryParams.append('status', params.status);
    if (params.organizationId) queryParams.append('organizationId', params.organizationId);

    // Fetch templates from API
    const response = await fetch(`/api/templates?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch templates');
    }

    const templates: Template[] = await response.json();
    return templates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    return []; // Return empty array as fallback
  }
}

/**
 * Fetches a single template by ID
 */
export async function fetchTemplateById(id: string): Promise<Template | null> {
  try {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch template');
    }

    const template: Template = await response.json();
    return template;
  } catch (error) {
    console.error(`Error fetching template ${id}:`, error);
    return null;
  }
}

/**
 * Creates a new template
 */
export async function createTemplate(data: Omit<Template, 'id' | 'lastUpdated' | 'createdAt' | 'author' | 'authorId'> & { organizationId?: string }): Promise<Template | null> {
  try {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create template');
    }

    const template: Template = await response.json();
    return template;
  } catch (error) {
    console.error('Error creating template:', error);
    return null;
  }
}

/**
 * Updates an existing template
 */
export async function updateTemplate(id: string, data: Partial<Omit<Template, 'id' | 'lastUpdated' | 'createdAt' | 'author' | 'authorId'>>): Promise<Template | null> {
  try {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update template');
    }

    const template: Template = await response.json();
    return template;
  } catch (error) {
    console.error(`Error updating template ${id}:`, error);
    return null;
  }
}

/**
 * Deletes a template
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete template');
    }

    return true;
  } catch (error) {
    console.error(`Error deleting template ${id}:`, error);
    return false;
  }
}

/**
 * Duplicates a template
 */
export async function duplicateTemplate(id: string): Promise<Template | null> {
  try {
    // First fetch the template to duplicate
    const template = await fetchTemplateById(id);
    if (!template) {
      throw new Error('Template to duplicate not found');
    }

    // Create a new template with the same content but a new name
    const newTemplate = await createTemplate({
      name: `${template.name} (Copy)`,
      content: template.content,
      description: template.description,
      category: template.category,
      status: 'draft', // Always set the duplicate to draft
      previewImage: template.previewImage,
      organizationId: template.organizationId,
    });

    return newTemplate;
  } catch (error) {
    console.error(`Error duplicating template ${id}:`, error);
    return null;
  }
}
