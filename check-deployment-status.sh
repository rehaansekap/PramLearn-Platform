#!/bin/bash

echo "🔍 PramLearn Branch & Deployment Status Check"
echo "============================================="

CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current Branch: $CURRENT_BRANCH"

echo ""
echo "🌳 Available Branches:"
git branch -a

echo ""
echo "📁 Deployment Files Status:"

DEPLOYMENT_FILES=(
    "frontendpramlearn/web.config"
    "frontendpramlearn/app-service-package.json"
    "frontendpramlearn/package-appservice.json" 
    "backendpramlearn/.env.production"
    "frontendpramlearn/.env.production"
)

for file in "${DEPLOYMENT_FILES[@]}"; do
    if [ -f "$file" ]; then
        if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
            echo "  ✅ $file - EXISTS & TRACKED"
        else
            echo "  📄 $file - EXISTS but NOT TRACKED"
        fi
    else
        echo "  ❌ $file - NOT FOUND"
    fi
done

echo ""
echo "� .gitignore Status:"
if grep -q "# Production deployment files" .gitignore; then
    echo "  📦 Production deployment files section: PRESENT"
fi
if grep -q "# Development branch specific ignores" .gitignore; then
    echo "  � Development branch specific ignores: PRESENT"
fi

echo ""
echo "🔧 Git Status:"
git status --porcelain

echo ""
echo "💡 Quick Actions:"
echo "  - Switch to main: git switch-main"
echo "  - Switch to prod: git switch-prod"
echo "  - Switch to dev:  git switch-dev"
echo "  - Manage files:   git manage-deploy"