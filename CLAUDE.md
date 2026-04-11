# NooviWoot-N8N — n8n Community Node para NooviChat

Node n8n da **Noovi AI** que integra o NooviChat (nosso fork do Chatwoot) com workflows de automação no n8n.

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

**CRÍTICO**: Quando a API do NooviChat é atualizada (novos endpoints, campos renomeados, recursos adicionados), este node pode precisar de atualização correspondente. Ver `.claude/rules/api-sync.md`.

## Build e Publicação

```bash
npm run build     # compila TypeScript → dist/
npm run lint      # ESLint
npm run test      # Jest
npm publish       # publica no npm (requer auth)
```

## Configuração Claude Code detalhada

Ver `.claude/rules/` para:
- `architecture.md` — estrutura do node, padrões n8n SDK
- `commands.md` — build, test, publish
- `api-sync.md` — como sincronizar com mudanças na API do NooviChat
