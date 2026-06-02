# Padrões de Código — NooviWoot-N8N

## Adicionar novo recurso

1. Criar `nodes/NooviChat/descriptions/NomeDescription.ts`
2. Exportar `nomeOperations` + `nomeFields`
3. Importar e registrar em `NooviChat.node.ts`

### Template de Description

```typescript
import { INodeProperties } from 'n8n-workflow';

export const minhaResourceOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['minhaResource'],
            },
        },
        options: [
            {
                name: 'Create',
                value: 'create',
                action: 'Create a minha resource',
                description: 'Create a new minha resource',
            },
            {
                name: 'Get',
                value: 'get',
                action: 'Get a minha resource',
                description: 'Retrieve a minha resource by ID',
            },
            {
                name: 'Get Many',
                value: 'getAll',
                action: 'Get many minha resources',
                description: 'Retrieve multiple minha resources',
            },
        ],
        default: 'create',
    },
];

export const minhaResourceFields: INodeProperties[] = [
    // Parâmetros de CREATE
    {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['minhaResource'],
                operation: ['create'],
            },
        },
        default: '',
        description: 'Name of the resource',
    },

    // ID para GET/UPDATE/DELETE
    {
        displayName: 'Resource ID',
        name: 'resourceId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['minhaResource'],
                operation: ['get', 'update', 'delete'],
            },
        },
        default: '',
    },

    // Paginação para GET MANY
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        default: false,
        displayOptions: {
            show: {
                resource: ['minhaResource'],
                operation: ['getAll'],
            },
        },
        description: 'Whether to return all results or limit',
    },
    {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        typeOptions: { minValue: 1 },
        displayOptions: {
            show: {
                resource: ['minhaResource'],
                operation: ['getAll'],
                returnAll: [false],
            },
        },
    },
];
```

## Registrar no node principal (NooviChat.node.ts)

```typescript
import { minhaResourceOperations, minhaResourceFields } from './descriptions/MinhaResourceDescription';

// Em description.properties:
[
    // ... outros recursos ...
    ...minhaResourceOperations,
    ...minhaResourceFields,
]

// Em execute():
case 'minhaResource':
    if (operation === 'create') {
        const name = this.getNodeParameter('name', i) as string;
        const body: IDataObject = { name };
        responseData = await nooviChatApiRequest.call(this, 'POST', '/minha-resource', body);
    } else if (operation === 'get') {
        const id = this.getNodeParameter('resourceId', i) as string;
        responseData = await nooviChatApiRequest.call(this, 'GET', `/minha-resource/${id}`);
    } else if (operation === 'getAll') {
        const returnAll = this.getNodeParameter('returnAll', i) as boolean;
        if (returnAll) {
            responseData = await nooviChatApiRequestAllItems.call(this, 'GET', '/minha-resource');
        } else {
            const limit = this.getNodeParameter('limit', i) as number;
            responseData = await nooviChatApiRequest.call(this, 'GET', '/minha-resource', {}, { per_page: limit });
        }
    }
    break;
```

## Mapear endpoint NooviChat → descrição do node

| Rails Controller | Endpoint | Description file |
|-----------------|----------|-----------------|
| `ConversationsController` | `/conversations` | `ConversationDescription.ts` |
| `ContactsController` | `/contacts` | `ContactDescription.ts` |
| `Messages::CreateService` | `/conversations/:id/messages` | `MessageDescription.ts` |
| `PipelineItemsController` | `/pipeline_items` | `CardDescription.ts` |
| `Campaigns::*` | `/campaigns` | `CampaignDescription.ts` |
| novos controllers... | `/<novo-recurso>` | `NovoRecursoDescription.ts` |

## Tratamento de erros

```typescript
// GenericFunctions.ts já lança erro descritivo com status HTTP
// No node, apenas deixar propagar — n8n exibe automaticamente

// Para erros de lógica de negócio:
throw new NodeApiError(this.getNode(), error, {
    message: 'Failed to create contact: email already exists',
    description: 'Try using a different email address',
});
```

## Paginação — quando usar cada helper

```typescript
// Para endpoint que retorna { data: { payload: [...] } }
await nooviChatApiRequestAllItems.call(this, 'GET', '/contacts')

// Para endpoint que retorna array direto ou outro formato
const response = await nooviChatApiRequest.call(this, 'GET', '/endpoint', {}, { page: 1 });
// Extrair manualmente: response.data || response.payload || response
```

## Adicionar novo evento ao trigger

Em `NooviChatTrigger.node.ts`, na lista de `events` (displayName):

```typescript
{
    name: 'Conversation Assigned',
    value: 'conversation_assigned',
    description: 'Triggered when a conversation is assigned to an agent',
},
```

O NooviChat já suporta esses eventos no webhook — verificar em:
`Chatwoot/app/models/concerns/webhookable.rb` ou similar.
