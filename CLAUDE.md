@AGENTS.md

# NooviWoot-N8N — n8n Community Node for NooviChat

**Noovi** n8n node that integrates NooviChat (our Chatwoot fork) with automation workflows in n8n.

## ⛔ GOLDEN RULES — npm Publish & Integrity

This project lives inside the NooviChat monorepo. The **3 monorepo golden rules** apply here:

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

## ⛔ Loop Engineering — implementation cycle (MANDATORY for any non-trivial 3+ step task)

This subproject runs the monorepo **Loop Engineering** methodology — the canonical
description is `../docs/rules/loop-engineering.md` (read it for the *why*: deterministic
stages, evidence-gated, two-models-one-gate). In that methodology the n8n node is
**downstream surface #3** — a *consumer* of the Chatwoot REST API. So here the loop is
adapted: there is no DB/migration/browser stage; the contract flows **one way** (Chatwoot
API → node Description), and "feature done" means every operation maps to a real Chatwoot
route with a complete Description — no orphan/broken operation.

`recon → implement → review (build + lint + test) → operation↔route parity → real load test → contract sync → commit → close-the-cycle docs → repeat` until nothing is left to apply/adjust/polish. Single-shot answers to implementation requests are a bug.

**⚙️ Autonomy contract — the loop runs end-to-end WITHOUT a human in the loop.** Every step, **including the atomic commit (step 7) and the internal-docs close (step 8)**, is the agent's to perform autonomously — never pause to ask "can I commit?". The **ONLY** hard block is **release/publish**: `npm publish` (the package is versioned, opt-in — a published version cannot be unpublished, only deprecated) plus its `npm version` bump and `git push --follow-tags`. Those always need explicit human approval + the npm golden rules (clean tree, forbidden window, registry verify). Everything up to and including committing to the repo is autonomous. If a gate fails, fix it and re-loop — never hand back a half-done cycle.

**⚡ Fast path (trivial change — skip the heavy gates).** A change is *trivial* only when it is **≤2 files AND touches none of**: an operation/resource/field contract (`name`/`type`/`routing` of an `INodeProperties`), the request/pagination/auth logic in `GenericFunctions.ts`, the credential schema, or the trigger `events` array. Examples: a typo in a `description:` string, a comment, a lint/format tweak, a `displayName` copy fix. Trivial changes go straight to **review (`npm run lint` + `npm run build`) → commit**; steps 4–6 and 8 (load test, contract sync, docs) are N/A by definition — say so in one line and move on. **Anything that changes an operation/field contract, the HTTP helper, credentials, or trigger events runs the full loop** (and triggers the mandatory tests below). When unsure, run the full loop.

1. **Recon** — map before editing; read `docs/rules/api-sync.md` first (this node mirrors the Chatwoot API; it carries the API→Description map and the incident history). **Answer up front:** (a) *what already exists to reuse/extend?* (reuse-first — see below), and (b) *does this change the contract with the Chatwoot API?* Synthesize a root-cause diagnosis. For wide scope, spawn a parallel Opus/Sonnet agent team (`Explore`/`analyzer`) — never Haiku.
2. **Implement (reuse-first — extend, don't duplicate)** — match the surrounding style and **reuse the existing building blocks before adding new ones**: the HTTP helpers in `GenericFunctions.ts` (`nooviChatApiRequest`, `nooviChatApiRequestRaw`, `nooviChatApiRequestAllItems` for pagination, `parseJsonValue`, `formatExecutionData`), the `INodeProperties[]` Description pattern (`resource`/`operation`/`displayOptions` + Additional Fields collections), and the registered credentials. A new operation extends the matching `descriptions/<Name>Description.ts`; a new resource gets its own `Description.ts` registered in `NooviChat.node.ts`; a new webhook event is added to the `events` array in `NooviChatTrigger.node.ts`. **Cite what you reused** in the cycle summary, or state it is a genuinely new building block. Never fork a near-identical helper or hand-roll pagination/auth.
3. **Review (self-enforced gate)** before commit: `npm run lint` (0 errors), `npm run build` (`tsc` + icon gulp), `npm run test` (jest — and add the mandatory tests below). Confirm `dist/` has the expected files (`dist/nodes/NooviChat/NooviChat.node.js`, `dist/nodes/NooviChat/NooviChatTrigger.node.js`, `dist/credentials/NooviChatApi.credentials.js`). **Model-diversity cross-review:** for any diff that **changes an operation/field contract, the HTTP helper, credentials, or trigger events**, run a Codex `read-only` review of the diff before commit (catches a Description that lies about the route, a wrong param name, a broken `displayOptions` gate). Pure copy/comment/lint/format diffs are exempt.
4. **Operation↔route parity (fail-closed gate)** — the n8n analog of FE↔BE parity. A feature is NOT done when it compiles; it is done when **every new/changed operation actually hits a real Chatwoot route end-to-end** and every field it sends/reads matches the API. Check, for each touched operation: (a) the request `method`/`endpoint` resolves to a live `api/v1/accounts/:accountId/<resource>` route (cross-check `docs/rules/api-sync.md` and `../Chatwoot/app/controllers/api/v1/accounts/`); (b) every parameter the Description sends is accepted by that endpoint; (c) every response field the node surfaces actually exists; (d) `displayOptions` correctly gate the field to its `resource`+`operation`. No orphan operation, no Description that references a route/param that does not exist.
5. **Real load test** — `npm run build` clean, then load the *built* node in an n8n sandbox (`npm pack` + install into a local n8n, or `npm link`) and exercise the changed operation/trigger against a **real Chatwoot instance** (dev). A green `tsc` and green jest do not prove the node loads in n8n and the operation calls the right route — prove it.
6. **Contract sync analysis (MANDATORY for every fix AND feature)** — this node is a **consumer** of the Chatwoot REST API, so the contract flows one way: **a Chatwoot API change → update the node Description + bump minor + republish.** Ask explicitly: did the Chatwoot API change (new/renamed/removed endpoint, param, response field, status, **webhook event**), or did I change a Description that must keep mirroring it? If yes → update the matching `descriptions/*Description.ts` (a new webhook event → add it to the `NooviChatTrigger.node.ts` `events` array) and plan a `npm version minor` for release. Cross-check `docs/rules/api-sync.md` (the API→Description map + history) and the Chatwoot reverse checklist `../Chatwoot/docs/rules/n8n-sync.md`. The customer-facing n8n tutorial lives at `../Site/frontend/src/app/(docs)/docs/noovichat/tutorials/n8n-node/` — flag it if behavior visible to users changed. If nothing API-facing changed, say so explicitly. **Never leave the node drifting behind the API; never skip the question.**
7. **Atomic commit (autonomous)** — Conventional Commits, one logical unit, deployable/revertable alone. This is NOT a human gate. The `npm version` bump belongs to the release step, not here.
8. **⛔ Close the cycle — update internal docs — MANDATORY, NEVER skip.** Update the appropriate internal technical documentation for anything that changed (node operations, resources, API mirroring) — at minimum the API→Description map / incident history in `docs/rules/api-sync.md`, plus the Obsidian vault for anything architectural. If nothing documentable changed (pure lint/format/trivial fast-path edit), state that and skip — but always ask.

**Gate honesty — fail-closed vs advisory.** The fail-closed gates are **step 3** (lint/build/test must pass — `prepublishOnly` re-runs build+lint, but do not rely on it: run them yourself and read the output) and **step 4** (operation↔route parity). Step 5 (real load test) and the model-diversity cross-review are strong gates you self-run, not hook-blocked. The root `.claude/settings.json` hook only hard-blocks at **publish time** (dirty tree / forbidden window) — it does NOT catch a lint/test/parity failure, so those are yours to enforce.

**Release/publish is the only thing outside this autonomous loop** — `npm version` + `git push --follow-tags` + `npm publish --access public` — needs human approval + the npm golden rules above (run `/pre-publish-audit` first, gated by the root pre-deploy-gate hook). The internal-docs update (step 8) IS part of the loop and closes it.

### Mandatory tests (even in MVP)

MVP philosophy allows skipping tests for speed — but tests are REQUIRED, no exception, for:
1. **HTTP/pagination logic** — any change to `GenericFunctions.ts` (request building, pagination, auth header) → Jest test for the request shape.
2. **New/renamed operation or field** — any `descriptions/*Description.ts` change that must mirror the Chatwoot API → test that the operation maps to the correct route/params (api-sync).
3. **Credential schema** — any change to `credentials/*.credentials.ts` → test the auth wiring.
4. **Trigger/webhook events** — any change to the trigger node's events array → test.
5. **Bug-report fixes** — any fix from a client-reported broken workflow → regression test in the same commit.

When in doubt, add the test. A published broken version cannot be removed and breaks clients' workflows publicly.

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
    AppointmentDescription.ts   ← Appointments
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
    PartnerDescription.ts       ← Whitelabel partners
    PipelineDescription.ts
    ProfessionalDescription.ts  ← Appointments professionals
    ServiceDescription.ts       ← Appointments services
    SlaDescription.ts
    TeamDescription.ts
    WahaDescription.ts          ← WhatsApp (WAHA)
    WhatsappTemplateDescription.ts ← WhatsApp templates
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
