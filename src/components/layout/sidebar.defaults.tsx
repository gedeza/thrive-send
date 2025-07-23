import { SidebarItem } from "./sidebar";
import { SidebarItemWithRoles, Role, filterSidebarItemsForRole } from "./sidebar-role-utils";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  BarChart3, 
  Calendar, 
  Users, 
  Mail, 
  FileCode, 
  Folder, 
  Palette,
  Plus,
  ShoppingCart,
  TrendingUp,
  CheckCircle,
  Target
} from "lucide-react";

/**
 * Default sidebar items that should appear in most application contexts
 * Items with roles property will only be shown to users with those roles
 * Items without roles property will be shown to all users
 */
export const defaultSidebarItems: SidebarItemWithRoles[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    href: "/dashboard",
    // No roles specified = available to everyone
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: <BarChart3 size={18} />,
    href: "/analytics",
    roles: ["admin", "manager"], // Only admins and managers
  },
  {
    key: "calendar",
    label: "Calendar",
    icon: <Calendar size={18} />,
    href: "/content/calendar",
    roles: ["admin", "manager", "user"], // Not for viewers or guests
  },
  {
    key: "clients",
    label: "Clients",
    icon: <Users size={18} />,
    href: "/clients",
    roles: ["admin", "manager"], // Only admins and managers
  },
  {
    key: "audiences",
    label: "Audiences",
    icon: <Target size={18} />,
    href: "/audiences",
    roles: ["admin", "manager", "user"], // Content creators and marketers
    children: [
      {
        key: "audiences-create",
        label: "Create Audience",
        icon: <Plus size={16} />,
        href: "/audiences/create",
        roles: ["admin", "user"], // Only admins and users can create
      }
    ]
  },
  {
    key: "campaigns",
    label: "Campaigns",
    icon: <Mail size={18} />,
    href: "/campaigns",
    roles: ["admin", "manager", "user"],
    children: [
      {
        key: "campaigns-new",
        label: "Create Campaign",
        icon: <Plus size={16} />,
        href: "/campaigns/new",
        roles: ["admin", "user"], // Only admins and users can create
      }
    ]
  },
  {
    key: "content",
    label: "Content",
    icon: <FileCode size={18} />,
    href: "/content",
    roles: ["admin", "manager", "user", "viewer"], // Not for guests
    children: [
      {
        key: "content-new",
        label: "Create Content",
        icon: <Plus size={16} />,
        href: "/content/new",
        roles: ["admin", "user"], // Only admins and users can create
      },
      {
        key: "content-approvals",
        label: "Approvals",
        icon: <CheckCircle size={16} />,
        href: "/content/approvals",
        roles: ["admin", "manager", "user"], // Content creators and reviewers
      }
    ]
  },
  {
    key: "templates",
    label: "Templates",
    icon: <FileText size={18} />,
    href: "/templates",
    // No roles specified = available to everyone
  },
  {
    key: "projects",
    label: "Projects",
    icon: <Folder size={18} />,
    href: "/projects",
    roles: ["admin", "manager"], // Only admins and managers
  },
  {
    key: "marketplace",
    label: "Marketplace",
    icon: <ShoppingCart size={18} />,
    href: "/marketplace",
    roles: ["admin", "manager", "user"], // Not for viewers or guests
    children: [
      {
        key: "marketplace-create",
        label: "Create Listing",
        icon: <Plus size={16} />,
        href: "/marketplace/create",
        roles: ["admin", "user"], // Only admins and users can create
      },
      {
        key: "marketplace-boosts",
        label: "Boost Listings",
        icon: <TrendingUp size={16} />,
        href: "/marketplace/boosts",
        roles: ["admin", "user"], // Only admins and users can boost
      },
      {
        key: "marketplace-moderation",
        label: "Review Moderation",
        icon: <CheckCircle size={16} />,
        href: "/marketplace/moderation",
        roles: ["admin"], // Only admins can moderate
      }
    ]
  },
  {
    key: "demo",
    label: "Demo",
    icon: <Palette size={18} />,
    href: "/demo",
    roles: ["admin", "manager", "user", "viewer"], // Not for guests
  },
  {
    key: "settings",
    label: "Settings",
    icon: <Settings size={18} />,
    href: "/settings",
    roles: ["admin"], // Only admins
  },
];

/**
 * Critical navigation items that should always be present in the sidebar
 * based on user role
 */
export const CRITICAL_ITEMS_BY_ROLE: Record<Role, string[]> = {
  admin: ["dashboard", "templates", "projects", "marketplace", "marketplace-moderation", "settings"],
  manager: ["dashboard", "templates", "projects", "marketplace"],
  user: ["dashboard", "templates", "marketplace"],
  viewer: ["dashboard", "templates"],
  guest: ["dashboard"]
};

/**
 * Ensures that critical sidebar items are always present
 * @param items Current sidebar items array
 * @returns Array with critical items ensured
 */
export function ensureSidebarItems(items: SidebarItem[]): SidebarItem[] {
  // Start with the items we were given
  const resultItems = [...items];
  
  // Map of keys that are already present
  const existingKeys = new Set(items.map(item => item.key));
  
  // Default to admin critical items if no role-specific logic is provided
  const criticalKeys = ["dashboard", "templates", "projects", "settings"];
  
  // Add any missing critical items from defaults
  for (const criticalKey of criticalKeys) {
    if (!existingKeys.has(criticalKey)) {
      // Find this item in the defaults
      const defaultItem = defaultSidebarItems.find(item => item.key === criticalKey);
      if (defaultItem) {
        // Remove roles property before adding
        const { roles, ...itemWithoutRoles } = defaultItem;
        resultItems.push(itemWithoutRoles);
      }
    }
  }
  
  return resultItems;
}

/**
 * Gets sidebar items filtered by the user's role
 * @param userRole The current user's role
 * @returns Array of sidebar items the user can access
 */
export function getSidebarItemsForRole(userRole: Role): SidebarItem[] {
  // Filter items based on role
  const filteredItems = filterSidebarItemsForRole(defaultSidebarItems, userRole);
  
  // Ensure critical items for this role are present
  return ensureSidebarItems(filteredItems);
}

/**
 * Example usage:
 * 
 * // In your layout component:
 * import { getSidebarItemsForRole } from "./sidebar.defaults";
 * 
 * // Get the current user's role from your auth system
 * const userRole = getCurrentUserRole(); // e.g., "admin", "user", etc.
 * 
 * // Get sidebar items for this role
 * const sidebarItems = getSidebarItemsForRole(userRole as Role);
 */
