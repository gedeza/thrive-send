/**
 * Utility for consistent primary blue icon styling across the app.
 * 
 * Usage (with className - works with Lucide, Heroicons, etc):
 *   <Icon className={iconBlue()} />
 *   <Icon className={iconBlue("w-5 h-5 mr-2")} />
 * 
 * Usage (with sx prop - for MUI or styled components):
 *   <Icon sx={iconBlueSx} />
 */

import { cn } from "./utils";

// For icons using Tailwind className - uses "text-primary" to ensure it's always your brand blue
export function iconBlue(extraClass = ""): string {
  return cn("text-primary", extraClass);
}

// For MUI or other components using style={}/sx={} props
export const iconBlueSx = {
  color: "#4F46E5", // Indigo 600 - matches Tailwind's primary color
};
