#!/bin/bash

echo "🔧 Setting up Git aliases for branch management..."

# Add git aliases
git config alias.switch-main '!bash switch-branch.sh main'
git config alias.switch-prod '!bash switch-branch.sh production'
git config alias.switch-dev '!bash switch-branch.sh dev'
git config alias.manage-deploy '!bash manage-deployment-files.sh'

# Add bash aliases to .bashrc (optional)
if ! grep -q "# PramLearn Git Aliases" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# PramLearn Git Aliases" >> ~/.bashrc
    echo "alias git-main='git switch-main'" >> ~/.bashrc
    echo "alias git-prod='git switch-prod'" >> ~/.bashrc
    echo "alias git-dev='git switch-dev'" >> ~/.bashrc
    echo "alias git-deploy='git manage-deploy'" >> ~/.bashrc
fi

echo "✅ Git aliases setup complete!"
echo ""
echo "📋 Available commands:"
echo "  git switch-main    - Switch to main branch and manage files"
echo "  git switch-prod    - Switch to production branch and manage files"
echo "  git switch-dev     - Switch to dev branch and manage files"
echo "  git manage-deploy  - Manage deployment files for current branch"
echo ""
echo "🔄 Reload terminal or run: source ~/.bashrc"