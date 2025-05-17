import React from "react";

// You may want to customize these menu items later!
const menuItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Analytics", href: "/dashboard#analytics" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Subscribers", href: "/subscribers" },
  { label: "Calendar", href: "/calendar" },
  { label: "Clients", href: "/clients" }
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
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/50 transition-opacity duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <nav
        className={`
          fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-lg
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
        aria-label="Mobile menu"
      >
        <div className="px-6 py-5 flex items-center justify-between border-b">
          <span className="font-bold text-lg">Menu</span>
          {/* Close button (X) */}
          <button onClick={onClose}
            className="text-gray-700 hover:text-primary focus:outline-none"
            aria-label="Close menu"
          >
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2"
              viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <ul className="flex-1 flex flex-col gap-2 p-6">
          {menuItems.map(item => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block py-2 px-4 rounded hover:bg-primary/10 text-base font-medium transition-colors"
                onClick={onClose}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export default MobileMenu;