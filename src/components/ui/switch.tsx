"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <label 
        className={cn(
          "inline-flex h-[24px] w-[44px] cursor-pointer items-center rounded-full relative",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <span 
          className={cn(
            "absolute inset-0 rounded-full transition-colors",
            checked ? "bg-primary" : "bg-input border-2 border-transparent"
          )}
        />
        <span 
          className={cn(
            "block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
