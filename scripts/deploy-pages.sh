#!/usr/bin/env bash
# Checks everything, then publishes dist/ to the gh-pages branch of thingswithcode/thailand-vibes.
# Uses the thingswithcode token without switching the active gh account.
set -euo pipefail

npm run verify
node scripts/check-dist.mjs --strict

REPO="https://github.com/thingswithcode/thailand-vibes.git"
TOKEN="$(gh auth token -u thingswithcode)"
OUT="$(mktemp -d)"
cp -R dist/. "$OUT"
cd "$OUT"
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git -c credential.helper= -c "credential.helper=!f() { echo username=thingswithcode; echo password=$TOKEN; }; f" push -q -f "$REPO" gh-pages
echo "Published: https://thingswithcode.github.io/thailand-vibes/"
