# Arquitetura — NooviWoot-N8N

## Visão Geral

```
n8n (runtime)
    │
    │  carrega via n8n.nodes e n8n.credentials no package.json
    ▼
@nooviai/n8n-nodes-noovichat
    │
    ├── NooviChat.node.ts        ← actions (GET/POST/PATCH/DELETE)
    ├── NooviChatTrigger.node.ts ← webhook trigger (subscribe/unsubscribe)
    └── GenericFunctions.ts      ← HTTP helper, paginação automática
            │
            │  api_access_token + baseUrl (da credential)
            ▼
    NooviChat API
    https://<instancia>/api/v1/accounts/:accountId/<recurso>
```

## Nodes

### NooviChat.node.ts — Ações

Recurso → Operação seguindo o padrão n8n:

| Recurso | Operações chave |
|---------|----------------|
| Contact | create, get, getAll, update, delete, search |
| Conversation | create, get, getAll, update, assignAgent, assignTeam |
| Message | create, get, getAll, delete |
| Pipeline | create, get, getAll, update, delete |
| Card (PipelineItem) | create, get, getAll, update, move, delete |
| Agent | get, getAll |
| Team | get, getAll |
| Inbox | get, getAll |
| Label | get, getAll |
| Campaign | create, get, getAll, update, delete |
| CannedResponse | create, get, getAll, update, delete |
| CustomAttribute | get, getAll |
| FollowUp | create, get, getAll, update, delete |
| LeadScoring | get, update, getHistory |
| SLA | get, getAll |
| Activity | getAll |
| WAHA | getSession, listSessions, sendMessage |

### NooviChatTrigger.node.ts — Webhook

Cria/remove webhooks na API NooviChat automaticamente:
- `subscribe()` — `POST /api/v1/accounts/:id/webhooks`
- `unsubscribe()` — `DELETE /api/v1/accounts/:id/webhooks/:webhookId`

Eventos: conversation_created, conversation_updated, message_created, contact_created, conversation_resolved, etc.

## GenericFunctions.ts — Padrões

```typescript
// Request simples
nooviChatApiRequest.call(this, 'GET', '/contacts', {}, { q: 'john' })

// Paginação automática (retorna TODOS os itens)
nooviChatApiRequestAllItems.call(this, 'GET', '/contacts')
// Para quando response.length < PAGE_SIZE (25)

// Formato de resposta esperado pelo helper:
// response.data?.payload  → preferido
// response.data           → fallback
// response.payload        → fallback
// response                → fallback (array direto)
```

## Descriptions — Padrão de Arquivo

Cada `descriptions/*.ts` exporta arrays `INodeProperties[]`:

```typescript
// descriptions/ContactDescription.ts
export const contactOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: { show: { resource: ['contact'] } },
        options: [
            { name: 'Create', value: 'create', action: 'Create a contact' },
            { name: 'Get', value: 'get', action: 'Get a contact' },
            // ...
        ],
        default: 'create',
    },
];

export const contactFields: INodeProperties[] = [
    {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
        // ...
    },
];
```

## Credenciais

```typescript
// NooviChatApi.credentials.ts
{
    name: 'nooviChatApi',
    displayName: 'NooviChat API',
    properties: [
        { name: 'baseUrl', type: 'string' },   // ex: https://chat.suaempresa.com
        { name: 'apiAccessToken', type: 'string' },
    ],
}
```

## Endpoint Base

```
{baseUrl}/api/v1/accounts/{accountId}{endpoint}
```

`accountId` é um parâmetro do node, não da credential — cada node instance pode apontar para uma account diferente na mesma instância NooviChat.

## Relação com NooviChat API

Todos os endpoints implementados aqui espelham os controllers Rails em:
```
Noovichat/Chatwoot/app/controllers/api/v1/accounts/
```

Quando um novo controller/endpoint é adicionado no Chatwoot, uma nova `Description.ts` pode ser necessária aqui.
