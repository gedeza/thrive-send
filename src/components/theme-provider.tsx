"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { theme, cssVariables } from "@/lib/theme"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  themeValues: typeof theme
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  themeValues: theme,
  isDarkMode: false,
  toggleDarkMode: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => {
      if (typeof localStorage !== "undefined") {
        return (localStorage.getItem(storageKey) as Theme) || defaultTheme
      }
      return defaultTheme
    }
  )
  
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      setIsDarkMode(systemTheme === "dark")
      return
    }

    root.classList.add(theme)
    setIsDarkMode(theme === "dark")
  }, [theme])
  
  // Inject CSS variables
  useEffect(() => {
    const styleTag = document.createElement('style')
    styleTag.innerHTML = cssVariables()
    document.head.appendChild(styleTag)
    
    return () => {
      document.head.removeChild(styleTag)
    }
  }, [])

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? "light" : "dark"
    localStorage.setItem(storageKey, newTheme)
    setTheme(newTheme)
  }

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    themeValues: theme,
    isDarkMode,
    toggleDarkMode,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
