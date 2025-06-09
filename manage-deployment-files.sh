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
    echo "🔧 Setting up for DEV branch (using .gitignore.bak configuration)..."
    
    # Create backup of current .gitignore
    cp .gitignore .gitignore.backup
    
    echo "📋 Replacing .gitignore with .gitignore.bak content..."
    
    # Copy .gitignore.bak to .gitignore
    if [ -f ".gitignore.bak" ]; then
        cp .gitignore.bak .gitignore
        echo "  ✅ .gitignore replaced with .gitignore.bak content"
    else
        echo "  ⚠️  .gitignore.bak not found, creating dev-specific .gitignore..."
        
        # Recreate .gitignore.bak content for dev branch
        cat > .gitignore << 'EOF'
# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg
venv~
venv~/
.venv/

# Django stuff:
*.log
media/
staticfiles/
# .env.*

# Unit test / coverage reports
htmlcov/
.tox/
.nox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
.hypothesis/
.pytest_cache/
.

# VSCode & IDE
.vscode/
.idea/
*.sublime-workspace
*.sublime-project

# Node.js / React / Vite
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
dist/
dist-ssr/
*.local

# MacOS & system files
.DS_Store
Thumbs.db

# Misc
*.swp
*.swo
*.tmp

# Ignore documentation and planning files
steps.txt
hehe
1.txt
2.txt
3.txt
frontendactionlog.txt
backendactionlog.txt
backendazurelog.txt
frontendazurelog.txt
.deployment
.gitignore.backup
.lala
EOF
    fi
    
    # Apply git changes - remove files that are NOW ignored but were previously tracked
    FILES_TO_UNTRACK=(
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
    
    # Also untrack deployment files in dev
    FILES_TO_UNTRACK+=("${DEPLOYMENT_FILES[@]}")
    
    for file in "${FILES_TO_UNTRACK[@]}"; do
        if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
            echo "  🗑️  Removing $file from git tracking"
            git rm --cached "$file" 2>/dev/null || true
        fi
    done
    
    # Handle .bak files (remove them from tracking but they're NOT in .gitignore.bak)
    find . -name "*.bak" -type f | while read -r bak_file; do
        if git ls-files --error-unmatch "$bak_file" >/dev/null 2>&1; then
            echo "  � Keeping $bak_file in tracking (not ignored in dev)"
        fi
    done
    
    echo "✅ Dev branch configuration applied (using .gitignore.bak)"
    echo "💡 Now using same ignore rules as .gitignore.bak"
    echo "� Key differences from main branch:"
    echo "    - *.bak files are NOT ignored (can be tracked)"
    echo "    - local_settings.py can be tracked"
    echo "    - db.sqlite3 can be tracked"
    echo "    - .env files can be tracked"
    echo "    - Script files are NOT ignored"
    
else
    echo "ℹ️  Branch '$BRANCH' detected"
    echo "This script manages deployment files for 'main', 'dev', and 'production' branches"
fi

echo ""
echo "📋 Current .gitignore status:"
echo "  📄 Lines in .gitignore: $(wc -l < .gitignore)"
if [ -f ".gitignore.bak" ]; then
    echo "  📄 Lines in .gitignore.bak: $(wc -l < .gitignore.bak)"
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