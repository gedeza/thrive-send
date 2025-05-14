#!/bin/bash

set -e

echo ""
echo "Cleaning up all known references to content-form.tsx..."

# Remove test file (if it exists)
TEST_FILE="__tests__/components/content/content-form.test.tsx"
if [ -f "$TEST_FILE" ]; then
  rm "$TEST_FILE"
  echo "Removed test file: $TEST_FILE"
else
  echo "No test file found at $TEST_FILE (skipped)"
fi

# Remove import and usage in verify-imports.ts
VERIFY_FILE="src/lib/verify-imports.ts"
if [ -f "$VERIFY_FILE" ]; then
  sed -i '' '/content-form/d' "$VERIFY_FILE"
  # Remove from export object as well if present and trailing comma
  sed -i '' '/ContentForm,/d' "$VERIFY_FILE"
  sed -i '' '/ContentForm/d' "$VERIFY_FILE"
  echo "Cleaned references from: $VERIFY_FILE"
else
  echo "No verify-imports.ts found (skipped)"
fi

# Remove from create-component-folders.sh
SETUP_FILE="create-component-folders.sh"
if [ -f "$SETUP_FILE" ]; then
  sed -i '' '/content-form\.tsx/d' "$SETUP_FILE"
  echo "Cleaned references from: $SETUP_FILE"
else
  echo "No create-component-folders.sh found (skipped)"
fi

echo "Cleanup complete! Codebase is now free of content-form legacy references."