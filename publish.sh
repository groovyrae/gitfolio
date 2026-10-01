# Stop on errors
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_REPO="$SCRIPT_DIR/../groovyrae-portfolio"

# Sync with GitHub
cd "$SITE_REPO"
git pull --rebase origin main

# Build
cd "$SCRIPT_DIR"
gitfolio update
rsync -a dist/ "$SITE_REPO/"

# Commit and push if something changed
cd "$SITE_REPO"
git add .
if git diff --cached --quiet; then
  echo "No changes to deploy."
else
  git commit -m "update site"
fi
git push origin main