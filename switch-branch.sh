#!/bin/bash

TARGET_BRANCH=$1

if [ -z "$TARGET_BRANCH" ]; then
    echo "Usage: ./switch-branch.sh <branch-name>"
    echo "Example: ./switch-branch.sh production"
    echo "Example: ./switch-branch.sh main"
    echo "Example: ./switch-branch.sh dev"
    exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)

echo "🔄 Switching from '$CURRENT_BRANCH' to '$TARGET_BRANCH'"

# Stash any uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "💾 Stashing uncommitted changes..."
    git stash push -m "Auto-stash before branch switch $(date)"
fi

# Switch branch (create if doesn't exist for dev)
if [ "$TARGET_BRANCH" = "dev" ] && ! git show-ref --verify --quiet refs/heads/dev; then
    echo "🆕 Creating new 'dev' branch..."
    git checkout -b dev
else
    git checkout "$TARGET_BRANCH"
fi

if [ $? -ne 0 ]; then
    echo "❌ Failed to switch to branch '$TARGET_BRANCH'"
    exit 1
fi

# Run deployment file management
echo "🔧 Managing deployment files for branch '$TARGET_BRANCH'..."
./manage-deployment-files.sh

echo ""
echo "✅ Successfully switched to '$TARGET_BRANCH' branch"
echo "🎯 Current branch: $(git branch --show-current)"

# Show git status
echo ""
echo "📊 Git status:"
git status --short