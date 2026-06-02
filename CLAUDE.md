# NooviWoot-N8N — n8n Community Node para NooviChat

Node n8n da **Noovi AI** que integra o NooviChat (nosso fork do Chatwoot) com workflows de automação no n8n.

## ⛔ REGRAS DE OURO — npm Publish & Integridade

Este projeto vive dentro do monorepo NooviChat
(`/home/debian/projects/Noovichat/`). As **3 regras de ouro do monorepo**
aplicam aqui:

### 1. Proibido `npm publish` "adoidado"

Nunca execute `npm publish` como reflexo. Uma versão publicada no npm
**não pode ser removida** (só depreciada). Se você publica versão
quebrada, clientes que atualizam o node quebram seus workflows — e o
damage é público.

### 2. Bateria de testes local é OBRIGATÓRIA antes de publish

```bash
git diff --exit-code && git diff --cached --exit-code
npm run lint
npm run build
npm run test
# Validar que dist/ tem todos os arquivos esperados
ls dist/nodes/NooviChat/NooviChat.node.js
ls dist/nodes/NooviChat/NooviChatTrigger.node.js
ls dist/credentials/NooviChatApi.credentials.js
# Só então:
npm version patch  # cria commit + tag automaticamente
git push --follow-tags
npm publish --access public
# Validar no registry
npm view @nooviai/n8n-nodes-noovichat version
```

### 3. Janela de publish proibida: Seg-Sex 08:00-19:00 BRT e sexta noite

Publicação de node quebrado durante horário comercial afeta clientes
imediatamente quando eles dão "update" no painel n8n. Siga a janela
do monorepo. Ver `../docs/rules/deploy-safety.md`.

## LEITURA OBRIGATÓRIA — `api-sync.md`

Este node **espelha** a API REST do Chatwoot em
`../Chatwoot/app/controllers/api/v1/accounts/`. Qualquer mudança lá
pode exigir update aqui. **Sempre** leia `docs/rules/api-sync.md`
antes de começar a editar.

O Chatwoot tem um checklist reverso em
`../Chatwoot/docs/rules/n8n-sync.md` que lembra devs do Chatwoot
de avisar quando mudam a API.

## Rules aplicáveis do monorepo root

- `../docs/rules/deploy-safety.md` — gates universais (npm publish está coberto)
- `../docs/rules/git-discipline.md` — conventional commits, tag git antes do publish
- `../docs/rules/subproject-router.md` — roteamento por cwd

O root `.claude/settings.json` tem hook bloqueante que intercepta
`npm publish` em working tree sujo ou horário comercial.

---



## Pacote

```
@nooviai/n8n-nodes-noovichat
GitHub: Noovi-AI/n8n-nodes-noovichat
```

## Stack

- **TypeScript** + Node.js ≥ 18
- **n8n-workflow** SDK para tipagem e runtime do n8n
- **Jest** para testes
- **Gulp** para build de ícones SVG
- **ESLint** com `eslint-plugin-n8n-nodes-base`

## Estrutura

```
nodes/NooviChat/
  NooviChat.node.ts          ← node principal (ações CRUD)
  NooviChatTrigger.node.ts   ← node trigger (webhooks)
  GenericFunctions.ts        ← HTTP request helper + paginação
  noovichat.svg              ← ícone do node
  descriptions/              ← configurações de cada recurso (operações, parâmetros)
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
  NooviChatWebhookApi.credentials.ts    ← auth para triggers

dist/     ← gerado por npm run build (não commitar)
test/     ← testes Jest
workflows/ ← exemplos de workflows n8n
```

## Relação com NooviChat (Chatwoot)

Este node consome a API REST do NooviChat:

```
n8n workflow
    │
    │  HTTP (api_access_token)
    ▼
NooviChat API (Rails)
api/v1/accounts/:accountId/<recurso>
```

**CRÍTICO**: Quando a API do NooviChat é atualizada (novos endpoints, campos renomeados, recursos adicionados), este node pode precisar de atualização correspondente. Ver `docs/rules/api-sync.md`.

## Build e Publicação

```bash
npm run build     # compila TypeScript → dist/
npm run lint      # ESLint
npm run test      # Jest
npm publish       # publica no npm (requer auth)
```

## Configuração Claude Code detalhada

Ver `docs/rules/` para:
- `architecture.md` — estrutura do node, padrões n8n SDK
- `commands.md` — build, test, publish
- `api-sync.md` — como sincronizar com mudanças na API do NooviChat
