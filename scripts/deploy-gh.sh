#!/usr/bin/env bash
# Deploy to GitHub Pages — clean build, no node_modules in branch
set -euo pipefail

VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  echo "Usage: bash scripts/deploy-gh.sh 1.7.7" >&2
  exit 1
fi

BRANCH="gh-pages-v${VERSION}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
DIST="$REPO_ROOT/dist"

echo "▶ Pulling latest main..."
git checkout main
git pull origin main

echo "▶ Installing dependencies..."
pnpm install

echo "▶ Building (VITE_BASE='./')..."
VITE_BASE="./" pnpm build

[[ -d "$DIST" ]] || { echo "ERROR: dist/ not found after build" >&2; exit 1; }

echo "▶ Pushing LFS objects..."
git lfs push --all origin 2>/dev/null || true

echo "▶ Creating orphan branch $BRANCH ..."
git checkout --orphan "$BRANCH"

# Remove all tracked files (this also removes .gitignore from working tree)
git rm -rf . --quiet

# Remove untracked leftovers (node_modules, etc.) before git add
# Use find to delete everything except the dist we're about to copy
find . -mindepth 1 -maxdepth 1 \
  ! -name 'dist' \
  ! -name '.git' \
  -exec rm -rf {} + 2>/dev/null || true

# Copy built files
cp -r "$DIST"/. .

# Restore a .gitignore so node_modules (if any) won't be added
printf 'node_modules/\n.cache/\n*.log\n' > .gitignore

git add -A
git commit -m "v${VERSION}: deploy to GitHub Pages"

echo "▶ Pushing $BRANCH to Figma remote..."
git push origin "$BRANCH" --force
git push origin "${BRANCH}:gh-pages" --force

echo "▶ Pushing to REAL GitHub (gh-pages)..."
GH_TOKEN="${GITHUB_TOKEN:-}"
if [[ -z "$GH_TOKEN" ]]; then
  echo "⚠️  GITHUB_TOKEN not set — skipping GitHub push. Set it with: export GITHUB_TOKEN=your_token" >&2
else
  GH_REMOTE="https://${GH_TOKEN}@github.com/uxteambehsazan-commits/team-arena.git"
  git push "$GH_REMOTE" "${BRANCH}:gh-pages" --force
fi

echo "▶ Returning to main..."
git checkout main

echo ""
echo "✅ v${VERSION} deployed to REAL GitHub Pages!"
echo "🔗 https://uxteambehsazan-commits.github.io/team-arena/"
