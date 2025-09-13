import { SidebarItem } from "./sidebar";
import { SidebarItemWithRoles, Role, filterSidebarItemsForRole } from "./sidebar-role-utils";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  BarChart3, 
  Users, 
  Mail, 
  FileCode, 
  Folder, 
  Palette,
  Plus,
  ShoppingCart,
  TrendingUp,
  CheckCircle,
  Target,
  Building2,
  Zap,
  Clock,
  Repeat,
  Share2,
  FileBarChart,
  PieChart,
  LineChart,
  UserPlus,
  Shield
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
    key: "clients",
    label: "Clients",
    icon: <Users size={18} />,
    href: "/clients",
    roles: ["admin", "manager"], // Only admins and managers
  },
  {
    key: "team",
    label: "Team",
    icon: <UserPlus size={18} />,
    href: "/team",
    roles: ["admin", "manager"], // Team management for service providers
    children: [
      {
        key: "team-invite",
        label: "Invite Members",
        icon: <UserPlus size={16} />,
        href: "/team/invite",
        roles: ["admin", "manager"],
      },
      {
        key: "team-permissions",
        label: "Permissions",
        icon: <Shield size={16} />,
        href: "/team#permissions",
        roles: ["admin"],
      }
    ]
  },
  {
    key: "audiences",
    label: "Audiences",
    icon: <Target size={18} />,
    href: "/audiences",
    roles: ["admin", "manager", "user"], // Content creators and marketers
    children: [
      {
        key: "audiences-overview",
        label: "Audience Overview",
        icon: <Target size={16} />,
        href: "/audiences",
        roles: ["admin", "manager", "user"],
      },
      {
        key: "audiences-create",
        label: "Create Audience",
        icon: <Plus size={16} />,
        href: "/audiences/create",
        roles: ["admin", "user"], // Only admins and users can create
      },
      {
        key: "audiences-cross-client",
        label: "Cross-Client Analytics",
        icon: <Users size={16} />,
        href: "/audiences/cross-client",
        roles: ["admin", "manager"], // Service provider cross-client audience insights
      },
      {
        key: "audiences-segments",
        label: "Shared Segments",
        icon: <Share2 size={16} />,
        href: "/audiences/segments",
        roles: ["admin", "manager"], // Manage reusable audience segments across clients
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
        key: "campaigns-overview",
        label: "Campaign Overview",
        icon: <Mail size={16} />,
        href: "/campaigns",
        roles: ["admin", "manager", "user"],
      },
      {
        key: "campaigns-new",
        label: "Create Campaign",
        icon: <Plus size={16} />,
        href: "/campaigns/new",
        roles: ["admin", "user"], // Only admins and users can create
      },
      {
        key: "campaigns-multi-client",
        label: "Multi-Client Campaigns",
        icon: <Users size={16} />,
        href: "/campaigns/multi-client",
        roles: ["admin", "manager"], // Service provider multi-client campaign management
      },
      {
        key: "campaigns-templates",
        label: "Campaign Templates",
        icon: <FileText size={16} />,
        href: "/campaigns/templates",
        roles: ["admin", "manager"], // Reusable campaign templates for multiple clients
      },
      {
        key: "campaigns-bulk",
        label: "Bulk Operations",
        icon: <Repeat size={16} />,
        href: "/campaigns/bulk",
        roles: ["admin", "manager"], // Bulk campaign operations across clients
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
      },
      {
        key: "content-seo",
        label: "SEO Optimizer",
        icon: <TrendingUp size={16} />,
        href: "/content/seo",
        roles: ["admin", "manager", "user"], // Content creators and SEO optimizers
      }
    ]
  },
  {
    key: "service-provider",
    label: "Service Provider",
    icon: <Building2 size={18} />,
    href: "/service-provider",
    roles: ["admin", "manager"], // B2B2G service provider features
    children: [
      {
        key: "service-provider-templates",
        label: "Template Library",
        icon: <FileText size={16} />,
        href: "/service-provider/templates",
        roles: ["admin", "manager"],
      },
      {
        key: "service-provider-analytics",
        label: "Client Analytics",
        icon: <BarChart3 size={16} />,
        href: "/service-provider/analytics",
        roles: ["admin", "manager"],
      },
      {
        key: "service-provider-approvals",
        label: "Approval Workflows",
        icon: <CheckCircle size={16} />,
        href: "/service-provider/approvals",
        roles: ["admin", "manager"],
      },
      {
        key: "service-provider-bulk-ops",
        label: "Bulk Operations",
        icon: <Zap size={16} />,
        href: "/service-provider/bulk-operations",
        roles: ["admin", "manager"],
      },
      {
        key: "service-provider-scheduling",
        label: "Content Scheduler",
        icon: <Clock size={16} />,
        href: "/service-provider/scheduling",
        roles: ["admin", "manager"],
      },
      {
        key: "service-provider-revenue",
        label: "Revenue Dashboard",
        icon: <TrendingUp size={16} />,
        href: "/service-provider/revenue",
        roles: ["admin", "manager"],
      }
    ]
  },
  {
    key: "reports",
    label: "Reports",
    icon: <FileBarChart size={18} />,
    href: "/reports",
    roles: ["admin", "manager"], // Advanced reporting for service providers
    children: [
      {
        key: "reports-analytics",
        label: "Cross-Client Analytics",
        icon: <BarChart3 size={16} />,
        href: "/reports#analytics",
        roles: ["admin", "manager"],
      },
      {
        key: "reports-automation",
        label: "Automated Reports",
        icon: <Clock size={16} />,
        href: "/reports#automation",
        roles: ["admin", "manager"],
      },
      {
        key: "reports-templates",
        label: "Report Templates",
        icon: <FileText size={16} />,
        href: "/reports#templates",
        roles: ["admin", "manager"],
      }
    ]
  },
  // REMOVED: Projects - Not part of B2B2G PRD specification
  // {
  //   key: "projects",
  //   label: "Projects",
  //   icon: <Folder size={18} />,
  //   href: "/projects",
  //   roles: ["admin", "manager"], // Only admins and managers
  // },
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
  // REMOVED: Demo - Not part of B2B2G PRD specification, dev/testing component only
  // {
  //   key: "demo",
  //   label: "Demo",
  //   icon: <Palette size={18} />,
  //   href: "/demo",
  //   roles: ["admin", "manager", "user", "viewer"], // Not for guests
  // },
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
  admin: ["dashboard", "service-provider-templates", "marketplace", "marketplace-moderation", "settings"],
  manager: ["dashboard", "service-provider-templates", "marketplace"],
  user: ["dashboard", "service-provider-templates", "marketplace"],
  viewer: ["dashboard", "service-provider-templates"],
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
  const criticalKeys = ["dashboard", "service-provider-templates", "settings"];
  
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
