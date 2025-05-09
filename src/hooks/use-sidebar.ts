import { useState, useEffect } from 'react';

interface UseSidebarOptions {
  defaultCollapsed?: boolean;
}

export function useSidebar({ defaultCollapsed = false }: UseSidebarOptions = {}) {
  // Initialize state from localStorage if available
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebar-collapsed");
      return savedState ? JSON.parse(savedState) : defaultCollapsed;
    }
    return defaultCollapsed;
  });

  // Persist collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
    }
  }, [isCollapsed]);

  // Toggle function
  const toggleCollapsed = () => setIsCollapsed(prev => !prev);

  return {
    isCollapsed,
    setIsCollapsed,
    toggleCollapsed
  };
}