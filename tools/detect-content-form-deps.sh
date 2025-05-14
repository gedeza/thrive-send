#!/bin/bash
# Script: detect-content-form-deps.sh
# Purpose: Safely detect all references to content-form.tsx before deletion

set -e

TARGET="content-form.tsx"

echo "Searching for all direct, import, and require references to '$TARGET' in the project..."

grep -ri --color=always --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
    'content-form' . \
    | grep -E "import|require|$TARGET|ContentForm"

echo
echo "----"
echo "If the only matches are:"
echo "  - the component file itself ($TARGET)"
echo "  - its test files (usually in __tests__ or test folders)"
echo "  - tool scripts or verify-imports files for component discovery"
echo ""
echo "THEN:"
echo "  - You are safe to remove $TARGET after updating/removing from any helper/test/verify files."
echo ""
echo "If you see other matches (in real features, imports, or business logic) update those imports or components first."