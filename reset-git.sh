#!/bin/bash

cd /Users/nhla/Desktop/PROJECTS/2025/thrive-send

echo "=== Git Repository Reset Script ==="
echo "Working directory: $(pwd)"

echo "1. Checking current branch and status..."
git branch --show-current
git status --porcelain

echo "2. Showing recent commits..."
git log --oneline -10

echo "3. Resetting to commit b4fe90f..."
git reset --hard b4fe90f

echo "4. Verifying reset was successful..."
git log --oneline -3
echo "Current commit: $(git rev-parse HEAD)"
echo "Reset completed successfully!"