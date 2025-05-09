#!/bin/bash

# This script searches the project for all usage of SidebarNavigation and Sidebar JSX tags.

echo "Searching for <SidebarNavigation ..."
grep -rn --exclude-dir={node_modules,__tests__,tmp} --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" "<SidebarNavigation" .
grep -rn --exclude-dir={node_modules,__tests__,tmp} --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" "<SidebarNavigation" . > /dev/null || \
  echo "No <SidebarNavigation found."

echo
echo "Searching for <Sidebar ..."
grep -rn --exclude-dir={node_modules,__tests__,tmp} --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" "<Sidebar" .
grep -rn --exclude-dir={node_modules,__tests__,tmp} --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" "<Sidebar" . > /dev/null || \
  echo "No <Sidebar found."

echo
echo "Done."