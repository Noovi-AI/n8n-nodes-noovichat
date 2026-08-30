# NooviWoot-N8N Codex Instructions

Codex is autonomous here and does not depend on Claude Code. Use the monorepo
root `AGENTS.md` plus this file as the source of truth (there is no
`.codex/prompts/project-context.md` in this repo).

Role: n8n community node (`@nooviai/n8n-nodes-noovichat`) that mirrors the
NooviChat (Chatwoot fork) REST API for n8n workflows. Stack: TypeScript,
n8n-workflow SDK, Jest, Gulp (SVG icons), ESLint (`eslint-plugin-n8n-nodes-base`).

Codex may edit `nodes/`, `credentials/`, `test/`, `docs/`, and supporting
scripts. When a Chatwoot API change updates this node, **bump `package.json`
in the same commit** and push `master` — GitHub Actions publishes if that
version is not on npm. Do not `npm publish` from a dirty local tree. A
published version cannot be removed, only deprecated.

Cycle: `recon -> implement (reuse-first, extend GenericFunctions.ts/Description
files, never hand-roll pagination/auth) -> review (npm run lint, npm run
build, npm run test) -> operation<->route parity (every operation hits a real
Chatwoot route, cross-check docs/rules/api-sync.md) -> real load test (built
node loaded in an n8n sandbox against a real NooviChat instance) -> contract
sync (Chatwoot API changed? update the matching Description) -> docs -> commit
-> stop`.

Expected checks: `npm run lint` (0 errors), `npm run build` (tsc + icon
gulp), `npm run test` (Jest), and confirm `dist/` has the expected files
before considering a change done. Any diff that changes an operation/field
contract, `GenericFunctions.ts`, a credential schema, or the trigger `events`
array needs a mandatory test (see `CLAUDE.md` "Mandatory tests").

This node is downstream surface #3 of the Chatwoot API contract (of 4 defined
in the root `docs/rules/loop-engineering.md`) — a change on the Chatwoot side
(`app/controllers/api/v1/accounts/*.rb`, `config/routes.rb`) may require a
matching update here. Read `docs/rules/api-sync.md` before editing.

## Codex + Claude Code Shared Usage

- Este arquivo e a fonte comum de instrucoes para agentes de codigo neste repositorio.
- Claude Code deve consumir estas instrucoes via `CLAUDE.md`.
- Procedimentos longos e reutilizaveis devem ficar em skills sob `.ai/skills`, `.agents/skills` ou `.claude/skills`, nao neste arquivo.
- Configuracoes especificas de Codex permanecem em `.codex/`; configuracoes especificas de Claude Code permanecem em `.claude/`.
