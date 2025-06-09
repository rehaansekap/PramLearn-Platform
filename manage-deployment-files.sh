#!/bin/bash

BRANCH=$(git branch --show-current)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔍 Current branch: $BRANCH"

# Define deployment files
DEPLOYMENT_FILES=(
    "frontendpramlearn/web.config"
    "frontendpramlearn/app-service-package.json" 
    "frontendpramlearn/package-appservice.json"
    "backendpramlearn/.env.production"
    "frontendpramlearn/.env.production"
)

# Define files to ignore in dev branch (additional to deployment files)
DEV_IGNORE_FILES=(
    "*.bak"
    "local_settings.py"
    "db.sqlite3"
    ".env"
    "start-pramlearn.sh"
    "stop-pramlearn.sh"
    "pramlearn-service.sh"
    "web.config"
    "deploy.cmd"
    "setup-git-aliases.sh"
    "switch-branch.sh"
    "manage-deployment-files.sh"
    "check-deployment-status.sh"
)

if [ "$BRANCH" = "production" ]; then
    echo "📦 Setting up deployment files for PRODUCTION branch..."
    
    # Create backup of current .gitignore
    cp .gitignore .gitignore.backup
    
    # Remove deployment files from .gitignore if they exist
    sed -i '/# Production deployment files (ignore in main branch)/,/^$/d' .gitignore
    sed -i '/# Development branch specific ignores/,/^$/d' .gitignore
    
    # Ensure deployment files exist and add them to git
    for file in "${DEPLOYMENT_FILES[@]}"; do
        if [ -f "$file" ]; then
            echo "  ✅ Adding $file to git tracking"
            git add "$file"
        else
            echo "  ⚠️  Warning: $file not found"
        fi
    done
    
    echo "✅ Production deployment files are now tracked"
    echo "💡 You can now commit and push to production branch"
    
elif [ "$BRANCH" = "main" ]; then
    echo "🚫 Setting up for MAIN branch (removing deployment files)..."
    
    # Remove dev-specific ignores if they exist
    sed -i '/# Development branch specific ignores/,/^$/d' .gitignore
    
    # Add deployment files to .gitignore if not already there
    if ! grep -q "# Production deployment files (ignore in main branch)" .gitignore; then
        echo "" >> .gitignore
        echo "# Production deployment files (ignore in main branch)" >> .gitignore
        for file in "${DEPLOYMENT_FILES[@]}"; do
            echo "$file" >> .gitignore
        done
        echo "" >> .gitignore
    fi
    
    # Remove deployment files from git tracking (but keep local files)
    for file in "${DEPLOYMENT_FILES[@]}"; do
        if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
            echo "  🗑️  Removing $file from git tracking"
            git rm --cached "$file" 2>/dev/null || true
        fi
    done
    
    echo "✅ Deployment files removed from main branch tracking"
    echo "💡 Local files preserved, but won't be committed to main"

elif [ "$BRANCH" = "dev" ]; then
    echo "🔧 Setting up for DEV branch (like .gitignore.bak configuration)..."
    
    # Create backup of current .gitignore
    cp .gitignore .gitignore.backup
    
    # Remove production and dev-specific sections if they exist
    sed -i '/# Production deployment files (ignore in main branch)/,/^$/d' .gitignore
    sed -i '/# Development branch specific ignores/,/^$/d' .gitignore
    
    # Add dev-specific ignores based on .gitignore.bak
    if ! grep -q "# Development branch specific ignores" .gitignore; then
        echo "" >> .gitignore
        echo "# Development branch specific ignores" >> .gitignore
        for file in "${DEV_IGNORE_FILES[@]}"; do
            echo "$file" >> .gitignore
        done
        echo "" >> .gitignore
    fi
    
    # Also add deployment files to ignore in dev
    if ! grep -q "# Production deployment files (ignore in dev branch)" .gitignore; then
        echo "# Production deployment files (ignore in dev branch)" >> .gitignore
        for file in "${DEPLOYMENT_FILES[@]}"; do
            echo "$file" >> .gitignore
        done
        echo "" >> .gitignore
    fi
    
    # Remove deployment files and dev-specific files from git tracking
    ALL_IGNORE_FILES=("${DEPLOYMENT_FILES[@]}" "${DEV_IGNORE_FILES[@]}")
    for file in "${ALL_IGNORE_FILES[@]}"; do
        # Handle wildcard patterns
        if [[ "$file" == *"*"* ]]; then
            # For wildcard patterns, find matching files
            find . -name "$file" -type f | while read -r found_file; do
                if git ls-files --error-unmatch "$found_file" >/dev/null 2>&1; then
                    echo "  🗑️  Removing $found_file from git tracking"
                    git rm --cached "$found_file" 2>/dev/null || true
                fi
            done
        else
            # For specific files
            if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
                echo "  🗑️  Removing $file from git tracking"
                git rm --cached "$file" 2>/dev/null || true
            fi
        fi
    done
    
    echo "✅ Dev branch configuration applied (similar to .gitignore.bak)"
    echo "💡 Development and deployment files will be ignored"
    
else
    echo "ℹ️  Branch '$BRANCH' detected"
    echo "This script manages deployment files for 'main', 'dev', and 'production' branches"
fi

echo ""
echo "📋 Deployment files status:"
for file in "${DEPLOYMENT_FILES[@]}"; do
    if [ -f "$file" ]; then
        if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
            echo "  📁 $file - TRACKED"
        else
            echo "  📄 $file - NOT TRACKED"
        fi
    else
        echo "  ❌ $file - NOT FOUND"
    fi
done