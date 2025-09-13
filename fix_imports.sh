#!/bin/bash
echo "Starting comprehensive import fix..."

# Find all files with wrong imports and fix them
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "import { prisma } from.*@/lib/db" "$file"; then
    echo "Fixing: $file"
    # Fix the import line
    sed -i '' 's/import { prisma } from '\''@\/lib\/db'\'';/import { db } from '\''@\/lib\/db'\'';/g' "$file"
    # Fix the usage
    sed -i '' 's/prisma\./db\./g' "$file"
  fi
done

echo "Import fix complete!"
