#!/bin/bash

cd /Users/nhla/Desktop/PROJECTS/2025/thrive-send

echo "=== Git Repository Recovery and Reset Script ==="
echo "Working directory: $(pwd)"

# Check if git is properly initialized
if [ ! -d ".git" ] || [ ! -f ".git/config" ]; then
    echo "ERROR: Git repository is not properly initialized!"
    echo "The .git directory appears to be empty or corrupted."
    echo "This script would need to re-initialize the repository and add remote origin."
    echo "Please manually run:"
    echo "git init"
    echo "git remote add origin <your-repository-url>"
    echo "git fetch"
    echo "git reset --hard b4fe90f"
    exit 1
fi

echo "1. Checking current branch and status..."
git branch --show-current 2>/dev/null || echo "Could not determine current branch"
git status --porcelain 2>/dev/null || echo "Could not get git status"

echo "2. Showing recent commits..."
git log --oneline -10 2>/dev/null || echo "Could not get commit history"

echo "3. Checking if commit b4fe90f exists..."
if git rev-parse --verify b4fe90f >/dev/null 2>&1; then
    echo "Commit b4fe90f found. Proceeding with reset..."
    git reset --hard b4fe90f
    echo "4. Verifying reset was successful..."
    git log --oneline -3
    echo "Current commit: $(git rev-parse HEAD)"
    echo "Reset completed successfully!"
else
    echo "ERROR: Commit b4fe90f not found in repository!"
    echo "Available recent commits:"
    git log --oneline -20 2>/dev/null || echo "Could not retrieve commits"
fi