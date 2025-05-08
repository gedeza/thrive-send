# Git Workflow for the Marketing Platform Project

This document outlines the recommended git workflow for the Marketing Platform project, including staging, committing, and pushing changes.

## Overview

Our git workflow follows a feature branch model where development happens in feature branches and is merged back to the main branch after review.

## Workflow Steps

### 1. Before Starting Work

Ensure your local repository is up to date:

```bash
git checkout main
git pull origin main
```

### 2. Create a Feature Branch

Create a new branch for your feature:

```bash
git checkout -b feature/tabs-implementation
```

Use a descriptive name that reflects the feature you're working on.

### 3. Make Changes and Commit Regularly

As you work on your feature, make regular commits with descriptive messages:

```bash
git add src/components/Tabs/Tabs.tsx
git commit -m "Implement responsive behavior for tabs component"
```

### 4. Staging and Committing the Current Changes

For the current tabs functionality implementation and styling:

```bash
# Add specific files
git add src/components/Tabs/Tabs.tsx
git add src/components/CreateCampaign.tsx
git add src/components/ContentForm.tsx
git add src/pages/DemoPage.tsx

# Or add all changes
git add .

# Commit with a descriptive message
git commit -m "Complete tabs implementation with styling and add missing functionality components"
```

### 5. Push Your Changes

Push your changes to the remote repository:

```bash
git push origin feature/tabs-implementation
```

### 6. Create a Pull Request

1. Go to the repository on GitHub
2. Click "Compare & pull request" for your branch
3. Add a description of your changes
4. Request reviews from team members
5. Submit the pull request

### 7. Address Review Feedback

If reviewers request changes:

1. Make the requested changes locally
2. Commit and push the changes
3. The pull request will update automatically

### 8. Merge the Pull Request

Once approved, merge the pull request through GitHub's interface.

## Best Practices

### Commit Messages

Follow these guidelines for commit messages:

1. Use the imperative mood ("Add feature" not "Added feature")
2. Keep the first line under 50 characters
3. Provide more detailed explanation in the commit body if needed
4. Reference issue numbers when applicable

Example:
```
Implement responsive tabs with styling enhancements

- Add mobile breakpoint handling
- Improve tab indicator styling
- Fix vertical orientation layout
- Add accessibility attributes

Resolves #123
```

### Commit Frequency

- Commit often to capture logical chunks of work
- Each commit should leave the codebase in a working state
- Group related changes into a single commit

### Branch Management

- Delete feature branches after merging
- Keep feature branches short-lived and focused
- Rebase from main if your branch becomes outdated

## Handling Merge Conflicts

If you encounter merge conflicts:

1. Fetch the latest changes from main:
   ```bash
   git fetch origin main
   ```

2. Merge main into your branch:
   ```bash
   git merge origin/main
   ```

3. Resolve conflicts in your code editor

4. After resolving, stage the resolved files:
   ```bash
   git add .
   ```

5. Complete the merge:
   ```bash
   git commit
   ```

## Current Implementation Next Steps

After pushing your current changes:

1. Create a new branch for the next feature:
   ```bash
   git checkout -b feature/analytics-implementation
   ```

2. Follow the workflow steps above for the new feature