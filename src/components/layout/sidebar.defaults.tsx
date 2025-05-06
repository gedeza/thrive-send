import { SidebarItem } from "./sidebar";
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
  Plus
} from "lucide-react";

/**
 * Default sidebar items that should appear in most application contexts
 */
export const defaultSidebarItems: SidebarItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    href: "/dashboard",
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: <BarChart3 size={18} />,
    href: "/analytics",
  },
  {
    key: "calendar",
    label: "Calendar",
    icon: <Calendar size={18} />,
    href: "/calendar",
  },
  {
    key: "clients",
    label: "Clients",
    icon: <Users size={18} />,
    href: "/clients",
  },
  {
    key: "campaigns",
    label: "Campaigns",
    icon: <Mail size={18} />,
    href: "/campaigns",
    children: [
      {
        key: "campaigns-new",
        label: "Create Campaign",
        icon: <Plus size={16} />,
        href: "/campaigns/new",
      }
    ]
  },
  {
    key: "content",
    label: "Content",
    icon: <FileCode size={18} />,
    href: "/content",
    children: [
      {
        key: "content-new",
        label: "Create Content",
        icon: <Plus size={16} />,
        href: "/content/new",
      }
    ]
  },
  {
    key: "templates",
    label: "Templates",
    icon: <FileText size={18} />,
    href: "/templates",
  },
  {
    key: "projects",
    label: "Projects",
    icon: <Folder size={18} />,
    href: "/projects",
  },
  {
    key: "demo-ui",
    label: "Demo UI",
    icon: <Palette size={18} />,
    href: "/demo-ui",
  },
  {
    key: "settings",
    label: "Settings",
    icon: <Settings size={18} />,
    href: "/settings",
  },
];

/**
 * Critical navigation items that should always be present in the sidebar
 */
const CRITICAL_KEYS = ["dashboard", "templates", "projects", "settings"];

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
  
  // Add any missing critical items from defaults
  for (const criticalKey of CRITICAL_KEYS) {
    if (!existingKeys.has(criticalKey)) {
      // Find this item in the defaults
      const defaultItem = defaultSidebarItems.find(item => item.key === criticalKey);
      if (defaultItem) {
        resultItems.push(defaultItem);
      }
    }
  }
  
  return resultItems;
}
