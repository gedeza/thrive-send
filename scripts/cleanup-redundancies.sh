#!/bin/bash

echo "ThriveSend Project Cleanup Script"
echo "================================="
echo "This script will clean up identified redundant files."
echo "Backup copies will be created in a 'redundant-backups' folder."
echo

# Create backup directory
mkdir -p redundant-backups/$(date +%Y-%m-%d)
BACKUP_DIR="redundant-backups/$(date +%Y-%m-%d)"

echo "Backing up files before removal..."

# Backup and remove the redundant content-library file (wrong location/name)
if [ -f "src/app/(dashboard)/content/content-library/pages.tsx" ]; then
  mkdir -p "$BACKUP_DIR/src/app/(dashboard)/content/content-library"
  cp "src/app/(dashboard)/content/content-library/pages.tsx" "$BACKUP_DIR/src/app/(dashboard)/content/content-library/"
  echo "✓ Backed up misplaced content-library file"
  echo "- Removing src/app/(dashboard)/content/content-library/pages.tsx"
  rm "src/app/(dashboard)/content/content-library/pages.tsx"
else
  echo "× Misplaced content-library file not found, skipping"
fi

# List of potentially redundant files to check
declare -a redundant_files=(
  "components/ContentForm.tsx"
  "src/components/content/ContentForm.tsx"
  "src/components/CreateCampaign.tsx"
)

# Check and back up each potentially redundant file
for file in "${redundant_files[@]}"; do
  if [ -f "$file" ]; then
    # Create directory structure in backup
    backup_path="$BACKUP_DIR/${file%/*}"
    mkdir -p "$backup_path"
    
    # Copy file to backup
    cp "$file" "$backup_path/"
    echo "✓ Backed up $file"
    
    echo "⚠️ Potentially redundant file detected: $file"
    echo "   If you're sure you want to remove this file, run:"
    echo "   rm $file"
  else
    echo "× File not found: $file, skipping"
  fi
done

echo
echo "Cleanup complete! Backups stored in $BACKUP_DIR"
echo "Review the backups and manually remove redundant files if needed"
echo
echo "Next steps:"
echo "1. Update navigation: src/components/ui/sidebar-navigation.tsx"
echo "2. Test all routes to ensure they work as expected"
echo "3. Commit changes with descriptive message"