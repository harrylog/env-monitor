#!/bin/bash
# Git initialization script for Environment Monitor

echo "🔧 Git Repository Setup for Environment Monitor"
echo "================================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check if already initialized
if [ -d .git ]; then
    echo "⚠️  Git repository already exists!"
    echo ""
    git status
    exit 0
fi

echo "📋 Initializing Git repository..."
git init

echo ""
echo "📁 Current repository status:"
echo "=============================="
git status

echo ""
echo "✅ Git repository initialized!"
echo ""
echo "📝 Next steps:"
echo "1. Review the files that will be committed:"
echo "   git status"
echo ""
echo "2. Create initial commit:"
echo "   git add ."
echo "   git commit -m \"Initial commit: Environment Monitor microservices\""
echo ""
echo "3. Create GitHub repository at https://github.com/new"
echo ""
echo "4. Connect to GitHub:"
echo "   git remote add origin https://github.com/harrylog/env-monitor.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "See GIT_SETUP.md for detailed instructions!"
