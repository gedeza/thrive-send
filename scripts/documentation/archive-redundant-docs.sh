#!/bin/bash

# Create archive directory if it doesn't exist
mkdir -p DOCS/archive/2024-06

# List of files to archive
FILES=(
    "DOCS/project-progress.md"
    "DOCS/project-progress-update.md"
    "DOCS/implementation-plan-update.md"
    "DOCS/remaining-implementation-tasks.md"
    "DOCS/project-reset-plan.md"
    "DOCS/demo-page-consolidation-plan.md"
)

# Archive each file
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        # Get the filename without path
        filename=$(basename "$file")
        # Move to archive with timestamp
        mv "$file" "DOCS/archive/2024-06/${filename%.*}_$(date +%Y%m%d).${filename##*.}"
        echo "Archived: $file"
    else
        echo "File not found: $file"
    fi
done

# Update README.md to reflect changes
echo "Documentation has been consolidated. Redundant files have been archived to DOCS/archive/2024-06/"
echo "Please refer to:"
echo "- DOCS/progress/progress-snapshot.md for project progress"
echo "- DOCS/planning/implementation-plan.md for implementation details" 