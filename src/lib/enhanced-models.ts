/**
 * Enhanced Models with Display IDs
 * 
 * Extended Prisma models that include user-friendly display IDs
 * These interfaces can be used alongside existing models during migration
 */

import { User, Organization, Client, Campaign, CampaignTemplate, Project } from '@prisma/client';

// Enhanced models with display IDs
export interface UserWithDisplayId extends User {
  displayId?: string | null;
}

export interface OrganizationWithDisplayId extends Organization {
  displayId?: string | null;
}

export interface ClientWithDisplayId extends Client {
  displayId?: string | null;
  // Include related data for the client view
  organization?: OrganizationWithDisplayId;
  projects?: ProjectWithDisplayId[];
  campaigns?: CampaignWithDisplayId[];
}

export interface CampaignWithDisplayId extends Campaign {
  displayId?: string | null;
  organization?: OrganizationWithDisplayId;
  client?: ClientWithDisplayId;
  template?: CampaignTemplateWithDisplayId;
}

export interface CampaignTemplateWithDisplayId extends CampaignTemplate {
  displayId?: string | null;
  organization?: OrganizationWithDisplayId;
  user?: UserWithDisplayId;
}

export interface ProjectWithDisplayId extends Project {
  displayId?: string | null;
  organization?: OrganizationWithDisplayId;
  client?: ClientWithDisplayId;
}

/**
 * Type guards to check if entities have display IDs
 */
export function hasDisplayId<T extends { displayId?: string | null }>(
  entity: T
): entity is T & { displayId: string } {
  return entity.displayId !== null && entity.displayId !== undefined;
}

/**
 * Helper function to get the best ID for display
 */
export function getBestId<T extends { id: string; displayId?: string | null }>(
  entity: T
): string {
  return entity.displayId || entity.id;
}

/**
 * Helper function to get user-friendly ID with fallback
 */
export function getDisplayableId<T extends { id: string; displayId?: string | null }>(
  entity: T
): string {
  if (entity.displayId) {
    return entity.displayId;
  }
  
  // For long CUIDs, show abbreviated version
  if (entity.id.length > 15) {
    return `${entity.id.slice(0, 8)}...`;
  }
  
  return entity.id;
}

/**
 * Helper to format ID for copy/paste operations
 */
export function getCopyableId<T extends { id: string; displayId?: string | null }>(
  entity: T,
  preferDisplayId: boolean = true
): string {
  if (preferDisplayId && entity.displayId) {
    return entity.displayId;
  }
  return entity.id;
}

/**
 * Helper to resolve either display ID or CUID to database ID
 */
export function resolveToDbId(
  id: string,
  entities: Array<{ id: string; displayId?: string | null }>
): string | null {
  // First try direct ID match
  const directMatch = entities.find(e => e.id === id);
  if (directMatch) return directMatch.id;
  
  // Then try display ID match
  const displayMatch = entities.find(e => e.displayId === id);
  if (displayMatch) return displayMatch.id;
  
  return null;
}

/**
 * Enhanced query helpers
 */
export const enhancedQueries = {
  /**
   * Find entity by either ID or display ID
   */
  findByAnyId: {
    user: (id: string) => ({
      where: {
        OR: [
          { id },
          { displayId: id }
        ]
      }
    }),
    
    organization: (id: string) => ({
      where: {
        OR: [
          { id },
          { displayId: id }
        ]
      }
    }),
    
    client: (id: string) => ({
      where: {
        OR: [
          { id },
          { displayId: id }
        ]
      }
    }),
    
    campaign: (id: string) => ({
      where: {
        OR: [
          { id },
          { displayId: id }
        ]
      }
    }),
    
    template: (id: string) => ({
      where: {
        OR: [
          { id },
          { displayId: id }
        ]
      }
    }),
    
    project: (id: string) => ({
      where: {
        OR: [
          { id },
          { displayId: id }
        ]
      }
    })
  }
};

/**
 * Migration utilities for working with enhanced models
 */
export const migrationUtils = {
  /**
   * Add display ID to existing entity if missing
   */
  ensureDisplayId<T extends { id: string; displayId?: string | null }>(
    entity: T,
    generator: () => string
  ): T & { displayId: string } {
    if (entity.displayId) {
      return entity as T & { displayId: string };
    }
    
    return {
      ...entity,
      displayId: generator()
    };
  },
  
  /**
   * Batch process entities to ensure they have display IDs
   */
  ensureDisplayIds<T extends { id: string; displayId?: string | null }>(
    entities: T[],
    generator: () => string
  ): Array<T & { displayId: string }> {
    return entities.map(entity => 
      this.ensureDisplayId(entity, generator)
    );
  }
};

export default {
  hasDisplayId,
  getBestId,
  getDisplayableId,
  getCopyableId,
  resolveToDbId,
  enhancedQueries,
  migrationUtils
};