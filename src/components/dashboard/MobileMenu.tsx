import React from "react";

// You may want to customize these menu items later!
const menuItems = [
  { label: "Overview", href: "/dashboard", icon: "📊" },
  { label: "Analytics", href: "/dashboard#analytics", icon: "📈" },
  { label: "Campaigns", href: "/campaigns", icon: "📢" },
  { label: "Subscribers", href: "/subscribers", icon: "👥" },
  { label: "Calendar", href: "/calendar", icon: "📅" },
  { label: "Clients", href: "/clients", icon: "🤝" }
];

export function MobileMenu({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Prevent background scroll when open
  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop with improved touch area */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Enhanced slide-out panel */}
      <nav
        className={`
          fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-gray-900 z-50 shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
        aria-label="Mobile menu"
      >
        <div className="px-6 py-5 flex items-center justify-between border-b dark:border-gray-700">
          <span className="font-bold text-lg dark:text-white">Menu</span>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 
                     text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 
                     focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Close menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
              viewBox="0 0 24 24" className="w-6 h-6">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <ul className="flex-1 flex flex-col gap-1 p-4">
          {menuItems.map(item => (
            <li key={item.href}>
              <a
                href={item.href}
                className="flex items-center gap-3 py-3 px-4 rounded-lg 
                         hover:bg-gray-100 dark:hover:bg-gray-800 
                         text-gray-700 dark:text-gray-300 
                         font-medium transition-colors
                         focus:outline-none focus:ring-2 focus:ring-primary 
                         focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                onClick={onClose}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t dark:border-gray-700">
          <button
            className="w-full py-3 px-4 rounded-lg bg-primary text-white 
                     hover:bg-primary-dark transition-colors
                     focus:outline-none focus:ring-2 focus:ring-primary 
                     focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            onClick={onClose}
          >
            Close Menu
          </button>
        </div>
      </nav>
    </>
  );
}

export default MobileMenu;