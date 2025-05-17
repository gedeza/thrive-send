interface SidebarItem {
  key: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

// Define the Projects item that should always be present
const projectsItem: SidebarItem = {
  key: 'projects',
  label: 'Projects',
  href: '/projects',
  // icon: <ProjectsIcon />,
};

// Define the Templates item that should always be present
const templatesItem: SidebarItem = {
  key: 'templates',
  label: 'Templates',
  href: '/templates',
  // icon: <TemplatesIcon />,
};

// Define the base sidebar items, always include Projects and Templates
export const defaultSidebarItems: SidebarItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/',
    // icon: <DashboardIcon />,
  },
  projectsItem,
  templatesItem,
  // ...other sidebar items
];

// Helper function to ensure Projects and Templates are always in the sidebar items
export const ensureSidebarItems = (items: SidebarItem[] = defaultSidebarItems) => {
  const addIfMissing = (arr: SidebarItem[], item: SidebarItem) =>
    arr.some((i: SidebarItem) => i.key === item.key) ? arr : [...arr, item];
  let result = addIfMissing(items, projectsItem);
  result = addIfMissing(result, templatesItem);
  return result;
};
