"use client";

import { useEffect, useState } from "react";

export function SidebarDebugger() {
  const [debugInfo, setDebugInfo] = useState({
    sidebarElement: null as HTMLElement | null,
    sidebarCollapsible: false,
    sidebarCollapsed: false,
    buttonFound: false
  });
  
  useEffect(() => {
    const checkSidebar = () => {
      const sidebar = document.querySelector("[data-testid='sidebar']") as HTMLElement | null;
      const collapseButton = document.querySelector("[data-testid='sidebar-collapse-button']") as HTMLElement | null;
      
      setDebugInfo({
        sidebarElement: sidebar,
        sidebarCollapsible: sidebar?.dataset.collapsible === "true",
        sidebarCollapsed: sidebar?.dataset.collapsed === "true",
        buttonFound: !!collapseButton
      });
    };
    
    // Initial check
    checkSidebar();
    
    // Set up interval to keep checking
    const interval = setInterval(checkSidebar, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!debugInfo.sidebarElement) {
    return <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg z-50">
      Sidebar element not found
    </div>;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded shadow-lg z-50 font-mono text-sm">
      <h4 className="font-bold mb-2">Sidebar Debug Info</h4>
      <table>
        <tbody>
          <tr>
            <td className="pr-4">Collapsible:</td>
            <td>{debugInfo.sidebarCollapsible ? "✅ Yes" : "❌ No"}</td>
          </tr>
          <tr>
            <td className="pr-4">Collapsed:</td>
            <td>{debugInfo.sidebarCollapsed ? "✅ Yes" : "❌ No"}</td>
          </tr>
          <tr>
            <td className="pr-4">Button Found:</td>
            <td>{debugInfo.buttonFound ? "✅ Yes" : "❌ No"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}