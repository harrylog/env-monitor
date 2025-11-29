# Git Setup Guide - Environment Monitor

## 📋 Recommended Approach: Single Monorepo

For your project, I recommend **one Git repository** containing both services.

### Why Monorepo?
- ✅ Services are tightly coupled (frontend needs backend)
- ✅ Shared docker-compose orchestration
- ✅ Unified documentation
- ✅ Simpler deployment
- ✅ Consistent versioning
- ✅ Easier to coordinate changes

---

## 🚀 Initial Git Setup

### Step 1: Initialize Repository

```bash
cd /home/harry/Downloads/microservices/env-monitor

# Initialize git
git init

# Check what will be committed
git status
```

### Step 2: Create Initial Commit

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Environment Monitor microservices

- Backend: Express.js + TypeScript + SQLite
- Frontend: Angular 19
- Docker Compose orchestration
- Documentation and testing scripts"
```

### Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `env-monitor` (or `environment-monitor`)
3. Description: "Microservices application for environment monitoring"
4. Choose public or private
5. **DON'T** initialize with README (you already have one)
6. Click "Create repository"

### Step 4: Connect to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/env-monitor.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## 📁 Repository Structure

Your repository will look like this on GitHub:

```
env-monitor/                    ← Single repository
├── README.md                   ← Main documentation
├── docker-compose.yaml         ← Orchestration
├── .gitignore                  ← Root gitignore
├── DOCKER_GUIDE.md
├── QUICKSTART.md
├── TESTING_GUIDE.md
├── GIT_SETUP.md
├── docker-start.sh
├── test-api.sh
│
├── env-monitor-backend/        ← Backend microservice
│   ├── .gitignore
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
└── env-monitor-frontend/       ← Frontend microservice
    ├── .gitignore
    ├── src/
    ├── Dockerfile
    └── package.json
```

---

## 🔒 What's Ignored (.gitignore)

### Backend
- `node_modules/` - Dependencies
- `dist/` - Build output
- `data/*.db*` - SQLite database files
- `.env` - Environment variables

### Frontend
- `node_modules/` - Dependencies
- `dist/` - Build output
- `.angular/cache` - Angular cache
- Coverage and logs

### Root
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Logs and temporary files

---

## 🌿 Recommended Branch Strategy

### Simple Strategy (for small teams/solo):
```
main (or master)  ← Production-ready code
├── develop       ← Development branch
└── feature/*     ← Feature branches
```

### Workflow:
```bash
# Create feature branch
git checkout -b feature/add-notifications

# Make changes
git add .
git commit -m "Add notification feature"

# Push feature branch
git push -u origin feature/add-notifications

# Create Pull Request on GitHub
# After review, merge to main
```

---

## 📝 Commit Message Convention

Use conventional commits for better changelog generation:

```bash
# Format
<type>(<scope>): <subject>

# Examples
git commit -m "feat(backend): add health check endpoint"
git commit -m "fix(frontend): resolve API connection issue"
git commit -m "docs: update Docker setup guide"
git commit -m "chore(deps): update Angular to v19.2"
```

### Types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Scopes:
- `backend` - Backend changes
- `frontend` - Frontend changes
- `docker` - Docker/deployment changes
- `deps` - Dependency updates

---

## 🚢 Deployment Workflow

### Option 1: Tag-based Releases
```bash
# Create a release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# List tags
git tag -l
```

### Option 2: GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build with Docker Compose
        run: docker-compose build
      - name: Run tests
        run: ./test-api.sh
```

---

## 🔄 Common Git Workflows

### Daily Development
```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat(backend): add new endpoint"

# Push to GitHub
git push -u origin feature/my-feature

# Create Pull Request on GitHub
```

### Update Dependencies
```bash
# Update backend
cd env-monitor-backend
npm update
git add package*.json
git commit -m "chore(deps): update backend dependencies"

# Update frontend
cd ../env-monitor-frontend
npm update
git add package*.json
git commit -m "chore(deps): update frontend dependencies"

git push
```

### Fix Production Bug
```bash
# Create hotfix branch from main
git checkout main
git pull
git checkout -b hotfix/critical-bug

# Fix and commit
git add .
git commit -m "fix(backend): resolve critical database issue"

# Push and create PR
git push -u origin hotfix/critical-bug
```

---

## 📊 Viewing History

```bash
# View commit log
git log --oneline --graph

# View changes in last commit
git show

# View changes for specific file
git log -p env-monitor-backend/src/index.ts

# View changes between branches
git diff main develop
```

---

## 🔧 Useful Git Commands

### Status and Info
```bash
git status                    # Show working tree status
git log --oneline            # Compact log
git remote -v                # Show remotes
git branch -a                # Show all branches
```

### Undo Changes
```bash
git checkout -- file.ts      # Discard changes to file
git reset HEAD file.ts       # Unstage file
git reset --hard HEAD        # Discard all changes
git revert <commit>          # Revert a commit
```

### Clean Up
```bash
git clean -fd                # Remove untracked files
git branch -d feature/old    # Delete local branch
git push origin --delete feature/old  # Delete remote branch
```

---

## 🎯 Alternative: Multi-Repo Approach

If you later decide to split into multiple repositories:

### Structure:
```
env-monitor-backend/         ← Separate repo
env-monitor-frontend/        ← Separate repo
env-monitor-deploy/          ← Deployment configs
```

### When to use:
- Different teams own services
- Independent release cycles
- Services deployed separately
- Large organization with service ownership

### How to split:
```bash
# Extract backend to separate repo
git filter-branch --subdirectory-filter env-monitor-backend

# Extract frontend to separate repo
git filter-branch --subdirectory-filter env-monitor-frontend
```

**Note:** For your current project size, **monorepo is recommended**.

---

## 📚 .gitignore Best Practices

### What to commit:
- ✅ Source code
- ✅ Documentation
- ✅ Docker files
- ✅ Package.json files
- ✅ Configuration templates

### What NOT to commit:
- ❌ node_modules/
- ❌ Build artifacts (dist/)
- ❌ Environment variables (.env)
- ❌ Database files (*.db)
- ❌ IDE settings
- ❌ OS files

### Optional: Commit initial database
If you want others to have starter data:
```bash
# In env-monitor-backend/.gitignore, remove this line:
# data/*.db

# Then commit a seed database
git add env-monitor-backend/data/seed.db
git commit -m "chore: add seed database"
```

---

## 🚀 Quick Start Commands

```bash
# Initialize repository
cd /home/harry/Downloads/microservices/env-monitor
git init
git add .
git commit -m "Initial commit: Environment Monitor"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/env-monitor.git
git branch -M main
git push -u origin main

# Daily workflow
git pull                           # Get latest
git checkout -b feature/my-work    # Create branch
# ... make changes ...
git add .
git commit -m "feat: add feature"
git push -u origin feature/my-work
# Create PR on GitHub
```

---

## 📖 Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Monorepo Tools](https://monorepo.tools/)

---

## ❓ Decision Matrix

| Factor | Monorepo | Multi-Repo |
|--------|----------|------------|
| Team size | 1-5 | 5+ |
| Service coupling | Tight | Loose |
| Release cycle | Synchronized | Independent |
| Your case | ✅ **Recommended** | Not needed yet |

**For your project: Use a single monorepo** 🎯
