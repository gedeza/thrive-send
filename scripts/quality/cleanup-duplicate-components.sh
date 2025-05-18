#!/bin/bash
# Script to identify and help clean up duplicate components

echo "ThriveSend Component Duplication Cleanup"
echo "========================================"
echo

# Check for CreateCampaign duplicates
echo "Checking CreateCampaign components..."
echo

if [ -f "./src/components/Campaign/CreateCampaign.tsx" ] && [ -f "./src/components/CreateCampaign.tsx" ]; then
  echo "DUPLICATE FOUND: CreateCampaign exists in two locations:"
  echo "  1. /src/components/Campaign/CreateCampaign.tsx (canonical version)"
  echo "  2. /src/components/CreateCampaign.tsx (likely duplicate)"
  echo
  echo "Recommended action:"
  echo "  1. Review both files to ensure the Campaign/CreateCampaign.tsx has all needed functionality"
  echo "  2. Update any imports in your codebase to use @/components/Campaign/CreateCampaign"
  echo "  3. Remove the duplicate with: git rm ./src/components/CreateCampaign.tsx"
  echo
else
  echo "No duplication found for CreateCampaign."
  echo
fi

# Check for ContentForm duplicates
echo "Checking ContentForm components..."
echo

if [ -f "./src/components/content/ContentForm.tsx" ] && [ -f "./src/components/ContentForm.tsx" ]; then
  echo "DUPLICATE FOUND: ContentForm exists in two locations:"
  echo "  1. /src/components/content/ContentForm.tsx (canonical version)"
  echo "  2. /src/components/ContentForm.tsx (likely duplicate)"
  echo
  echo "Recommended action:"
  echo "  1. Review both files to ensure the content/ContentForm.tsx has all needed functionality"
  echo "  2. Update any imports in your codebase to use @/components/content/ContentForm"
  echo "  3. Remove the duplicate with: git rm ./src/components/ContentForm.tsx"
  echo
else
  echo "No duplication found for ContentForm."
  echo
fi

# Check for demo page imports
echo "Checking demo page component imports..."
echo

grep -n "import CreateCampaign from" ./src/app/\(dashboard\)/demo/page.tsx
grep -n "import ContentForm from" ./src/app/\(dashboard\)/demo/page.tsx

echo
echo "If these imports reference duplicated components, update them to use the canonical paths:"
echo "  import CreateCampaign from '@/components/Campaign/CreateCampaign';"
echo "  import ContentForm from '@/components/content/ContentForm';"
echo

echo "Cleanup check complete. Review the results and take recommended actions."