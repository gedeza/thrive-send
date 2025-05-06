// Define the Projects item that should always be present
const projectsItem = {
  key: 'projects',
  label: 'Projects',
  href: '/projects',
  // icon: <ProjectsIcon />,
};

// Define the Templates item that should always be present
const templatesItem = {
  key: 'templates',
  label: 'Templates',
  href: '/templates',
  // icon: <TemplatesIcon />,
};

// Define the base sidebar items, always include Projects and Templates
export const defaultSidebarItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    // icon: <DashboardIcon />,
  },
  projectsItem,
  templatesItem,
  // ...other sidebar items
];

// Helper function to ensure Projects and Templates are always in the sidebar items
export const ensureSidebarItems = (items = defaultSidebarItems) => {
  const addIfMissing = (arr, item) =>
    arr.some(i => i.key === item.key) ? arr : [...arr, item];
  let result = addIfMissing(items, projectsItem);
  result = addIfMissing(result, templatesItem);
  return result;
};
