/**
 * Hook for accessing team internationalization strings
 * 
 * This provides a consistent interface for accessing translated strings
 * and can be easily extended to support multiple languages in the future.
 */

import { teamStrings } from './team-strings';

/**
 * Hook to get team-related translated strings
 * 
 * @example
 * const t = useTeamStrings();
 * console.log(t.pageTitle); // "Team Management"
 * console.log(t.roles.admin); // "Administrator"
 * console.log(t.success.memberAdded); // "Team member added successfully"
 */
export function useTeamStrings() {
  // In the future, this can be extended to:
  // 1. Accept a locale parameter
  // 2. Load strings dynamically based on user preference
  // 3. Support interpolation for dynamic values
  // 4. Integrate with i18n libraries like react-i18next
  
  return teamStrings;
}

/**
 * Utility function to get a specific string by path
 * 
 * @example
 * const title = getTeamString('pageTitle');
 * const adminRole = getTeamString('roles.admin');
 * const successMsg = getTeamString('success.memberAdded');
 */
export function getTeamString(path: string): string {
  const keys = path.split('.');
  let current: any = teamStrings;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      console.warn(`Translation key not found: ${path}`);
      return path; // Return the key as fallback
    }
  }
  
  return typeof current === 'string' ? current : path;
}

/**
 * Type-safe string accessor for nested paths
 */
export type TeamStringPath = 
  | 'pageTitle'
  | 'pageDescription'
  | 'inviteTeamMember'
  | 'teamMembers'
  | 'roles.admin'
  | 'roles.manager'
  | 'roles.contentCreator'
  | 'success.memberAdded'
  | 'errors.memberNotFound'
  | 'states.noMembers'
  // Add more paths as needed
  ;

/**
 * String interpolation function with parameter replacement
 * 
 * @example
 * const message = formatTeamString('confirmations.removeMemberDescription', { 
 *   memberName: 'John Doe' 
 * });
 * // Result: "Are you sure you want to remove John Doe from the team? This action cannot be undone."
 */
export function formatTeamString(path: string, params?: Record<string, string | number>): string {
  let text = getTeamString(path);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      // Support both {key} and {{key}} interpolation patterns
      text = text.replace(new RegExp(`\{${key}\}`, 'g'), String(value));
      text = text.replace(new RegExp(`\{\{${key}\}\}`, 'g'), String(value));
    });
  }
  
  return text;
}

/**
 * Helper function for role-specific translations
 */
export function getRoleString(role: string): string {
  const normalizedRole = role.toLowerCase().replace('_', '');
  const roleMap: Record<string, string> = {
    'owner': getTeamString('roles.owner'),
    'admin': getTeamString('roles.admin'),
    'manager': getTeamString('roles.manager'),
    'clientmanager': getTeamString('roles.clientManager'),
    'approver': getTeamString('roles.approver'),
    'publisher': getTeamString('roles.publisher'),
    'reviewer': getTeamString('roles.reviewer'),
    'analyst': getTeamString('roles.analyst'),
    'contentcreator': getTeamString('roles.contentCreator'),
  };
  
  return roleMap[normalizedRole] || role;
}

/**
 * Helper function for status-specific translations
 */
export function getStatusString(status: string): string {
  const normalizedStatus = status.toLowerCase();
  const statusMap: Record<string, string> = {
    'active': getTeamString('statuses.active'),
    'pending': getTeamString('statuses.pending'),
    'inactive': getTeamString('statuses.inactive'),
  };
  
  return statusMap[normalizedStatus] || status;
}

/**
 * Helper function for permission-specific translations
 */
export function getPermissionString(permission: string): string {
  const normalizedPermission = permission.toLowerCase().replace('_', '');
  const permissionMap: Record<string, string> = {
    'read': getTeamString('permissions.viewContent'),
    'write': getTeamString('permissions.createEditContent'),
    'review': getTeamString('permissions.reviewContent'),
    'approve': getTeamString('permissions.approveContent'),
    'publish': getTeamString('permissions.publishContent'),
    'manageteam': getTeamString('permissions.manageTeam'),
    'manageclients': getTeamString('permissions.manageClients'),
    'analytics': getTeamString('permissions.analytics'),
  };
  
  return permissionMap[normalizedPermission] || permission;
}