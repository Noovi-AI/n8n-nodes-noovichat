# NooviWoot-N8N — n8n Community Node for NooviChat

**Noovi AI** n8n node that integrates NooviChat (our Chatwoot fork) with automation workflows in n8n.

## ⛔ GOLDEN RULES — npm Publish & Integrity

This project lives inside the NooviChat monorepo (`/home/debian/projects/Noovichat/`). The **3 monorepo golden rules** apply here:

### 1. No reflexive `npm publish`

Never run `npm publish` as a reflex. A version published to npm **cannot be removed** (only deprecated). If you publish a broken version, clients who update the node break their workflows — and the damage is public.

### 2. Local test battery is MANDATORY before publish

```bash
git diff --exit-code && git diff --cached --exit-code
npm run lint
npm run build
npm run test
# Validate that dist/ has all expected files
ls dist/nodes/NooviChat/NooviChat.node.js
ls dist/nodes/NooviChat/NooviChatTrigger.node.js
ls dist/credentials/NooviChatApi.credentials.js
# Only then:
npm version patch  # creates commit + tag automatically
git push --follow-tags
npm publish --access public
# Validate in the registry
npm view @nooviai/n8n-nodes-noovichat version
```

### 3. Forbidden publish window: Mon-Fri 08:00-19:00 BRT and Friday night

Publishing a broken node during business hours affects clients immediately when they hit "update" in the n8n panel. Follow the monorepo window. See `../docs/rules/deploy-safety.md`.

## MANDATORY READING — `api-sync.md`

This node **mirrors** the Chatwoot REST API at `../Chatwoot/app/controllers/api/v1/accounts/`. Any change there may require an update here. **Always** read `docs/rules/api-sync.md` before you start editing.

Chatwoot has a reverse checklist in `../Chatwoot/docs/rules/n8n-sync.md` that reminds Chatwoot devs to flag when they change the API.

## Applicable monorepo root rules

- `../docs/rules/deploy-safety.md` — universal gates (npm publish is covered)
- `../docs/rules/git-discipline.md` — conventional commits, git tag before publish
- `../docs/rules/subproject-router.md` — routing by cwd

The root `.claude/settings.json` has a blocking hook that intercepts `npm publish` on a dirty working tree or during business hours.

---

## ⛔ Implementation loop (MANDATORY — run via `/loop` for any non-trivial 3+ step task)

`plan/recon → implement → review → test → upstream-API sync → (commit) → repeat` until nothing left to apply/adjust/polish — then **close the cycle by updating the Obsidian docs**. Single-shot answers to implementation requests are a bug.

1. **Recon** — map before editing; read `docs/rules/api-sync.md` first (this node mirrors the Chatwoot API). Synthesize a root-cause diagnosis.
2. **Implement** — match surrounding style: n8n SDK `INodeProperties` Description patterns, `nooviChatApiRequest` helper, pagination, `displayOptions`. Minimal cohesive change per iteration.
3. **Review (fail-closed gate)** before commit: `npm run lint` (0 errors), `npm run build`, `npm run test`. Validate `dist/` has the expected files (`NooviChat.node.js`, `NooviChatTrigger.node.js`, `NooviChatApi.credentials.js`).
4. **Test** — load the built node in an n8n sandbox (`npm pack` + install, or `npm link`); exercise the changed operation/trigger against a real Chatwoot instance.
5. **Upstream-API sync analysis (MANDATORY for every fix AND feature)** — this node consumes the Chatwoot REST API. Did the Chatwoot API change (or did you change a Description that must match it)? Cross-check `docs/rules/api-sync.md` and the Chatwoot side `../Chatwoot/docs/rules/n8n-sync.md`. Customer-facing n8n tutorial lives at `../Site/frontend/src/app/(docs)/docs/noovichat/tutorials/n8n-node/`. If nothing API-facing changed, say so explicitly. Never skip the question.
6. **Atomic commit** — Conventional Commits, one logical unit. `npm version` bump when releasing.
7. **⛔ Close the cycle — update Obsidian docs (`/doc-obsidian`) — MANDATORY, NEVER skip.** Update the canonical technical docs in the Obsidian vault for anything that changed (node operations, resources, API mirroring). Obsidian is the single source of truth (see `../docs/rules/obsidian.md`). Vault: `/home/debian/projects/Obsidian/NooviAI/NooviChat/NooviWoot-N8N/`; commit/push from the external repo `/home/debian/projects/Obsidian` (`git add` explicit, never `-A`; `git push origin main`). If nothing documentable changed, state that and skip — but always ask.

**`npm publish` is NOT part of the loop** — it needs human approval + golden rules (gated by the root pre-deploy-gate hook). The Obsidian doc update (step 7) IS part of the loop and closes it.

---

## Package

```
@nooviai/n8n-nodes-noovichat
GitHub: Noovi-AI/n8n-nodes-noovichat
```

## Stack

- **TypeScript** + Node.js ≥ 18
- **n8n-workflow** SDK for n8n typing and runtime
- **Jest** for tests
- **Gulp** for SVG icon builds
- **ESLint** with `eslint-plugin-n8n-nodes-base`

## Structure

```
nodes/NooviChat/
  NooviChat.node.ts          ← main node (CRUD actions)
  NooviChatTrigger.node.ts   ← trigger node (webhooks)
  GenericFunctions.ts        ← HTTP request helper + pagination
  noovichat.svg              ← node icon
  descriptions/              ← per-resource config (operations, parameters)
    ActivityDescription.ts
    AgentDescription.ts
    CampaignDescription.ts
    CannedResponseDescription.ts
    CardDescription.ts          ← Pipeline cards
    ContactDescription.ts
    ConversationDescription.ts
    CustomAttributeDescription.ts
    FollowUpDescription.ts
    InboxDescription.ts
    LabelDescription.ts
    LeadScoringDescription.ts
    MessageDescription.ts
    PipelineDescription.ts
    SlaDescription.ts
    TeamDescription.ts
    WahaDescription.ts          ← WhatsApp (WAHA)
    WebhookDescription.ts

credentials/
  NooviChatApi.credentials.ts           ← baseUrl + apiAccessToken
  NooviChatWebhookApi.credentials.ts    ← auth for triggers

dist/     ← generated by npm run build (do not commit)
test/     ← Jest tests
workflows/ ← example n8n workflows
```

## Relationship with NooviChat (Chatwoot)

This node consumes the NooviChat REST API:

```
n8n workflow
    │
    │  HTTP (api_access_token)
    ▼
NooviChat API (Rails)
api/v1/accounts/:accountId/<resource>
```

**CRITICAL**: When the NooviChat API changes (new endpoints, renamed fields, added resources), this node may need a matching update. See `docs/rules/api-sync.md`.

## Build and Publish

```bash
npm run build     # compile TypeScript → dist/
npm run lint      # ESLint
npm run test      # Jest
npm publish       # publish to npm (requires auth)
```

## Detailed Claude Code configuration

See `docs/rules/` for:
- `architecture.md` — node structure, n8n SDK patterns
- `commands.md` — build, test, publish
- `api-sync.md` — how to sync with NooviChat API changes
