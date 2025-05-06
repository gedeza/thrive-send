/** @type {import('tailwindcss').Config} */

// Import our theme constants
const { theme } = require('./src/lib/theme');

module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: theme.typography.fontFamily.mono.split(', '),
      },
      colors: {
        // Use our theme colors
        border: theme.colors.border,
        input: theme.colors.border,
        ring: theme.colors.primary[400],
        background: theme.colors.background,
        foreground: theme.colors.foreground,
        
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        destructive: theme.colors.destructive,
        muted: theme.colors.muted,
        accent: theme.colors.accent,
        popover: theme.colors.popover,
        card: theme.colors.card,
        
        // Additional neutral colors
        neutral: theme.colors.neutral,
        
        // Gradient colors
        gradient: theme.colors.gradient,
        
        // Base colors
        black: theme.colors.black,
        white: theme.colors.white,
      },
      borderRadius: theme.borderRadius,
      boxShadow: theme.shadows,
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "collapsible-down": {
          from: { height: 0 },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        "collapsible-up": {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
