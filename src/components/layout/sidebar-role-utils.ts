import type { SidebarItem } from "./sidebar";

/**
 * Extends SidebarItem type to include optional roles.
 * Each SidebarItem (and its children, recursively) can specify an array of allowed roles.
 */
export type Role = "admin" | "manager" | "user" | "viewer" | "guest";
export interface SidebarItemWithRoles extends SidebarItem {
  roles?: Role[]; // Optional: if omitted, visible to all
  children?: SidebarItemWithRoles[];
}

/**
 * Utility to filter sidebar items (and their children) based on user's role.
 * - Items without a `roles` attribute are shown to all roles.
 * - Items with a `roles` attribute are shown only if userRole is included.
 */
export function filterSidebarItemsForRole(
  items: SidebarItemWithRoles[],
  userRole: Role
): SidebarItemWithRoles[] {
  return items
    .filter(item => !item.roles || item.roles.includes(userRole))
    .map(item => ({
      ...item,
      children: item.children ? filterSidebarItemsForRole(item.children, userRole) : undefined
    }));
}