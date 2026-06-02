---
description: N8N node pre-publish battery — deploy window, git gate, lint, build, test, dist verification. Blocking before any npm publish.
---

# /pre-publish-audit (NooviWoot-N8N)

Mandatory validation before `npm publish`. A published npm version **cannot be
removed** (only deprecated) — a broken publish breaks every client's n8n workflow
on update, publicly. Any failure ABORTS. Codifies the node golden rules (`CLAUDE.md`).

## When to use

- **ALWAYS** before `npm publish` / `npm version`
- After any change to `nodes/`, `credentials/`, or `descriptions/`
- After a Chatwoot API change that touched a mirrored resource (see `docs/rules/api-sync.md`)

## Workflow

```bash
set -e
cd "/home/debian/projects/Noovichat/NooviWoot-N8N"
FAIL=0

# Deploy window (BRT) — forbidden Mon-Fri 08-19h and Fri night
HOUR_BR=$(TZ=America/Sao_Paulo date +%H); DOW=$(TZ=America/Sao_Paulo date +%u)
if { [ "$DOW" -ge 1 ] && [ "$DOW" -le 5 ] && [ "$HOUR_BR" -ge 8 ] && [ "$HOUR_BR" -lt 19 ]; } \
   || { [ "$DOW" = "5" ] && [ "$HOUR_BR" -ge 19 ]; }; then
  echo "❌ ABORT: outside deploy window (Mon-Fri 08-19h BRT / Fri night). Emergency: NOOVI_FORCE_DEPLOY=1."
  [ "${NOOVI_FORCE_DEPLOY:-0}" = "1" ] || exit 1
fi
echo "✓ Deploy window OK"

# Git integrity
git diff --exit-code --quiet || { echo "❌ ABORT: unstaged changes"; exit 1; }
git diff --cached --exit-code --quiet || { echo "❌ ABORT: staged but uncommitted"; exit 1; }
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git fetch origin "$BRANCH" --quiet 2>/dev/null || true
[ "$(git log "origin/$BRANCH..HEAD" --oneline 2>/dev/null | wc -l)" = "0" ] \
  || { echo "❌ ABORT: unpushed commits — git push first"; exit 1; }
echo "✓ Git clean + HEAD pushed"

# Quality gate
npm run lint  || { echo "❌ lint failed"; FAIL=1; }
npm run build || { echo "❌ build failed"; FAIL=1; }
npm run test  || { echo "❌ test failed"; FAIL=1; }

# dist/ artifact verification (the files npm will ship)
for f in dist/nodes/NooviChat/NooviChat.node.js \
         dist/nodes/NooviChat/NooviChatTrigger.node.js \
         dist/credentials/NooviChatApi.credentials.js; do
  [ -f "$f" ] || { echo "❌ missing build artifact: $f"; FAIL=1; }
done
echo "✓ dist/ artifacts present"

# API-sync reminder
if git diff HEAD~5 --name-only 2>/dev/null | grep -qE 'descriptions/|GenericFunctions'; then
  echo "⚠ descriptions/HTTP changed — cross-check docs/rules/api-sync.md and ../Chatwoot/docs/rules/n8n-sync.md"
fi

if [ "$FAIL" = "0" ]; then
  echo ""
  echo "✅ PRE-PUBLISH AUDIT PASSED — ready for: npm version <patch|minor|major> && git push --follow-tags && npm publish --access public"
else
  echo ""
  echo "❌ PRE-PUBLISH AUDIT FAILED — fix the items above before publishing."
  exit 1
fi
```

## Notes

- `npm publish` itself is gated by the root `pre-deploy-gate.sh` hook (dirty tree / window).
- Publish is a conscious human decision; this audit prepares and validates, it does not publish.
- A breaking API change → bump `minor`/`major` AND update the customer docs tutorial + the MCP server the same day.
