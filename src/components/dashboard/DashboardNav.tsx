"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
}

export function DashboardNav() {
  const pathname = usePathname()
  
  const navItems: NavItem[] = [
    {
      title: "Overview",
      href: "/dashboard",
    },
    {
      title: "Analytics",
      href: "/analytics",
    },
    {
      title: "Calendar",
      href: "/content/calendar",
    },
    {
      title: "Clients",
      href: "/clients",
    },
  ]

  return (
    <nav className="flex border-b mb-6">
      <div className="flex -mb-px space-x-2">
        {navItems.map((item) => {
          // Check if the current path matches this nav item
          const isActive = 
            (item.href === "/dashboard" && pathname === "/dashboard") || 
            (item.href !== "/dashboard" && pathname?.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "py-2 px-4 text-sm font-medium transition-colors",
                isActive 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.title}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}