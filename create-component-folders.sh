#!/bin/bash

# Create component directory structure
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/analytics
mkdir -p src/components/content
mkdir -p src/components/user

# Ensure basic components exist in the right places by creating empty files 
# (we'll replace them with actual content later)

# UI Components
touch src/components/ui/button.tsx
touch src/components/ui/card.tsx
touch src/components/ui/dropdown-menu.tsx
touch src/components/ui/form.tsx
touch src/components/ui/input.tsx
touch src/components/ui/label.tsx
touch src/components/ui/tabs.tsx
touch src/components/ui/textarea.tsx

# Layout Components
touch src/components/layout/header.tsx
touch src/components/layout/sidebar.tsx
touch src/components/layout/main-layout.tsx

# Analytics Components
touch src/components/analytics/analytics-dashboard.tsx
touch src/components/analytics/analytics-card.tsx

# Content Components
touch src/components/content/content-calendar.tsx
touch src/components/content/content-form.tsx

# User Components
touch src/components/user/profile-card.tsx

echo "Component structure created successfully!"