# n8n-nodes-noovichat — Plano de Desenvolvimento

> Node comunitario do NooviChat para n8n. Permite automacoes completas de customer engagement, pipeline de vendas, follow-ups e integracao WhatsApp diretamente nos workflows n8n.

---

## 1. Visao Geral do Projeto

### 1.1 O que e

Um **community node** para n8n que integra a API do NooviChat (fork avancado do Chatwoot) aos workflows de automacao. Publicado no npm como `@nooviai/n8n-nodes-noovichat` e listado no n8n Community Nodes.

### 1.2 Por que criar

| Problema | Solucao |
|----------|---------|
| Nodes Chatwoot existentes cobrem apenas a API padrao | Node NooviChat cobre Pipeline/CRM, Follow-ups, Lead Scoring, WAHA |
| Clientes NooviChat usam n8n mas integram via HTTP Request generico | Node dedicado com UI rica, autocomplete e documentacao inline |
| Nenhum node no mercado oferece Pipeline + WhatsApp + Lead Scoring juntos | Diferencial competitivo e valor agregado para clientes |

### 1.3 Nodes Chatwoot existentes (concorrencia)

| Package | Autor | Downloads/mes | Cobertura |
|---------|-------|---------------|-----------|
| `@devlikeapro/n8n-nodes-chatwoot` | devlikeapro | ~500 | Auto-gerado do OpenAPI, API padrao |
| `@pixelinfinito/n8n-nodes-chatwoot` | pixelinfinito | ~300 | Manual, API padrao |
| `@sufficit/n8n-nodes-chatwoot` | sufficit | ~100 | Manual, API padrao |
| `n8n-nodes-chatwoot` | RenatoAscencio | ~200 | Manual, API padrao |

**Nenhum cobre**: Pipeline, Follow-ups, Lead Scoring, Activities, WAHA, Campanhas, SLA.

### 1.4 Publico-alvo

- Clientes NooviChat que usam n8n (self-hosted ou cloud)
- Agencias e integradores que deployam NooviChat
- Comunidade n8n buscando solucoes de CRM + WhatsApp

---

## 2. Arquitetura

### 2.1 Estrutura do Projeto

```
n8n-nodes-noovichat/
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── gulpfile.js
├── LICENSE                            # MIT
├── README.md
├── CHANGELOG.md
│
├── credentials/
│   ├── NooviChatApi.credentials.ts           # Auth por api_access_token
│   └── NooviChatWebhookApi.credentials.ts    # Auth para trigger (webhook secret)
│
├── nodes/
│   └── NooviChat/
│       ├── NooviChat.node.ts                 # Node principal (execute)
│       ├── NooviChatTrigger.node.ts          # Trigger node (webhook receiver)
│       ├── noovichat.svg                     # Icone do node (cyan #06B6D4)
│       ├── GenericFunctions.ts               # Helpers: apiRequest, apiRequestAllItems
│       │
│       └── descriptions/
│           ├── ConversationDescription.ts     # Conversas
│           ├── MessageDescription.ts          # Mensagens
│           ├── ContactDescription.ts          # Contatos
│           ├── InboxDescription.ts            # Inboxes
│           ├── AgentDescription.ts            # Agentes
│           ├── TeamDescription.ts             # Equipes
│           ├── LabelDescription.ts            # Etiquetas
│           ├── WebhookDescription.ts          # Webhooks
│           ├── CannedResponseDescription.ts   # Respostas rapidas
│           ├── CustomAttributeDescription.ts  # Atributos personalizados
│           ├── PipelineDescription.ts         # Pipeline/CRM       ← EXCLUSIVO
│           ├── DealDescription.ts             # Cards/Deals        ← EXCLUSIVO
│           ├── FollowUpDescription.ts         # Follow-ups         ← EXCLUSIVO
│           ├── ActivityDescription.ts         # Atividades         ← EXCLUSIVO
│           ├── LeadScoringDescription.ts      # Lead Scoring       ← EXCLUSIVO
│           ├── CampaignDescription.ts         # Campanhas          ← EXCLUSIVO
│           ├── SlaDescription.ts              # SLA                ← EXCLUSIVO
│           └── WahaDescription.ts             # WAHA               ← EXCLUSIVO
│
└── test/
    ├── NooviChat.node.test.ts
    └── NooviChatTrigger.node.test.ts
```

### 2.2 Autenticacao

O NooviChat usa `api_access_token` passado como header ou query parameter.

```typescript
// credentials/NooviChatApi.credentials.ts
import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class NooviChatApi implements ICredentialType {
  name = 'nooviChatApi';
  displayName = 'NooviChat API';
  documentationUrl = 'https://doc.nooviai.com/docs/guides/authentication/';
  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: '',
      placeholder: 'https://chat.seudominio.com',
      description: 'URL da sua instancia NooviChat (sem barra final)',
      required: true,
    },
    {
      displayName: 'API Access Token',
      name: 'apiAccessToken',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description: 'Token de acesso da API (obtido em Settings > Account Settings)',
      required: true,
    },
    {
      displayName: 'Account ID',
      name: 'accountId',
      type: 'number',
      default: 1,
      description: 'ID da conta NooviChat',
      required: true,
    },
  ];
}
```

### 2.3 Funcao de Request Base

```typescript
// nodes/NooviChat/GenericFunctions.ts
import { IExecuteFunctions, IHttpRequestMethods, IRequestOptions } from 'n8n-workflow';

export async function nooviChatApiRequest(
  this: IExecuteFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: object = {},
  qs: object = {},
): Promise<any> {
  const credentials = await this.getCredentials('nooviChatApi');
  const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
  const accountId = credentials.accountId as number;

  const options: IRequestOptions = {
    method,
    uri: `${baseUrl}/api/v1/accounts/${accountId}${endpoint}`,
    headers: {
      api_access_token: credentials.apiAccessToken as string,
      'Content-Type': 'application/json',
    },
    body,
    qs,
    json: true,
  };

  if (Object.keys(body).length === 0) delete options.body;
  if (Object.keys(qs).length === 0) delete options.qs;

  return this.helpers.request(options);
}

export async function nooviChatApiRequestAllItems(
  this: IExecuteFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: object = {},
  qs: Record<string, any> = {},
): Promise<any[]> {
  const returnData: any[] = [];
  let page = 1;

  do {
    qs.page = page;
    const response = await nooviChatApiRequest.call(this, method, endpoint, body, qs);
    const items = response.data?.payload || response.data || response.payload || response;

    if (!Array.isArray(items) || items.length === 0) break;

    returnData.push(...items);
    page++;

    // NooviChat pagina com 15-25 items por pagina
    if (items.length < 15) break;
  } while (true);

  return returnData;
}
```

---

## 3. Recursos e Operacoes

### 3.1 Recursos Base (Chatwoot padrao)

#### Conversation (Conversa)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/conversations` | Criar conversa |
| Get | GET | `/conversations/{id}` | Obter conversa |
| Get Many | GET | `/conversations` | Listar conversas |
| Update | PATCH | `/conversations/{id}` | Atualizar conversa |
| Delete | DELETE | `/conversations/{id}` | Remover conversa |
| Assign | POST | `/conversations/{id}/assignments` | Atribuir agente/equipe |
| Toggle Status | POST | `/conversations/{id}/toggle_status` | Abrir/resolver/pendente |
| Add Label | POST | `/conversations/{id}/labels` | Adicionar etiquetas |
| Filter | POST | `/conversations/filter` | Filtrar por criterios |

#### Message (Mensagem)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Send | POST | `/conversations/{id}/messages` | Enviar mensagem |
| Get Many | GET | `/conversations/{id}/messages` | Listar mensagens |
| Delete | DELETE | `/conversations/{id}/messages/{msg_id}` | Remover mensagem |

Tipos de mensagem suportados:
- `outgoing` — Mensagem do agente
- `incoming` — Simular mensagem do contato
- `activity` — Nota de atividade
- `template` — Template WhatsApp (com variaveis)

#### Contact (Contato)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/contacts` | Criar contato |
| Get | GET | `/contacts/{id}` | Obter contato |
| Get Many | GET | `/contacts` | Listar contatos |
| Update | PATCH | `/contacts/{id}` | Atualizar contato |
| Delete | DELETE | `/contacts/{id}` | Remover contato |
| Search | GET | `/contacts/search` | Buscar contato |
| Filter | POST | `/contacts/filter` | Filtrar contatos |
| Merge | POST | `/actions/contact_merge` | Mesclar duplicados |
| Get Conversations | GET | `/contacts/{id}/conversations` | Conversas do contato |

#### Inbox (Caixa de Entrada)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/inboxes` | Criar inbox |
| Get | GET | `/inboxes/{id}` | Obter inbox |
| Get Many | GET | `/inboxes` | Listar inboxes |
| Update | PATCH | `/inboxes/{id}` | Atualizar inbox |
| Delete | DELETE | `/inboxes/{id}` | Remover inbox |
| Get Agents | GET | `/inbox_members/{id}` | Agentes da inbox |
| Update Agents | POST | `/inbox_members` | Atualizar agentes |

#### Agent (Agente)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/agents` | Criar agente |
| Get Many | GET | `/agents` | Listar agentes |
| Update | PATCH | `/agents/{id}` | Atualizar agente |
| Delete | DELETE | `/agents/{id}` | Remover agente |

#### Team (Equipe)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/teams` | Criar equipe |
| Get Many | GET | `/teams` | Listar equipes |
| Update | PATCH | `/teams/{id}` | Atualizar equipe |
| Delete | DELETE | `/teams/{id}` | Remover equipe |
| Get Members | GET | `/teams/{id}/team_members` | Membros da equipe |
| Add Members | POST | `/teams/{id}/team_members` | Adicionar membros |

#### Label (Etiqueta)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/labels` | Criar etiqueta |
| Get Many | GET | `/labels` | Listar etiquetas |
| Update | PATCH | `/labels/{id}` | Atualizar etiqueta |
| Delete | DELETE | `/labels/{id}` | Remover etiqueta |

#### Canned Response (Resposta Rapida)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/canned_responses` | Criar resposta |
| Get Many | GET | `/canned_responses` | Listar respostas |
| Delete | DELETE | `/canned_responses/{id}` | Remover resposta |

#### Custom Attribute (Atributo Personalizado)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/custom_attribute_definitions` | Criar atributo |
| Get Many | GET | `/custom_attribute_definitions` | Listar atributos |
| Update | PATCH | `/custom_attribute_definitions/{id}` | Atualizar atributo |
| Delete | DELETE | `/custom_attribute_definitions/{id}` | Remover atributo |

#### Webhook

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/webhooks` | Criar webhook |
| Get Many | GET | `/webhooks` | Listar webhooks |
| Update | PATCH | `/webhooks/{id}` | Atualizar webhook |
| Delete | DELETE | `/webhooks/{id}` | Remover webhook |

---

### 3.2 Recursos Exclusivos NooviChat

#### Pipeline (CRM)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/pipeline/pipelines` | Criar pipeline |
| Get | GET | `/pipeline/pipelines/{id}` | Obter pipeline |
| Get Many | GET | `/pipeline/pipelines` | Listar pipelines |
| Update | PATCH | `/pipeline/pipelines/{id}` | Atualizar pipeline |
| Delete | DELETE | `/pipeline/pipelines/{id}` | Remover pipeline |
| Get Stages | GET | `/pipeline/pipelines/{id}/stages` | Listar estagios |
| Create Stage | POST | `/pipeline/pipelines/{id}/stages` | Criar estagio |
| Update Stage | PATCH | `/pipeline/stages/{id}` | Atualizar estagio |
| Delete Stage | DELETE | `/pipeline/stages/{id}` | Remover estagio |
| Reorder Stages | PATCH | `/pipeline/pipelines/{id}/stages/reorder` | Reordenar estagios |

#### Deal (Card/Negocio)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/pipeline/cards` | Criar deal |
| Get | GET | `/pipeline/cards/{id}` | Obter deal |
| Get Many | GET | `/pipeline/cards` | Listar deals |
| Update | PATCH | `/pipeline/cards/{id}` | Atualizar deal |
| Delete | DELETE | `/pipeline/cards/{id}` | Remover deal |
| Move to Stage | PATCH | `/pipeline/cards/{id}/move_to_stage` | Mover deal de estagio |
| Mark Won | POST | `/pipeline/cards/{id}/mark_won` | Marcar como ganho |
| Mark Lost | POST | `/pipeline/cards/{id}/mark_lost` | Marcar como perdido |
| Reopen | POST | `/pipeline/cards/{id}/reopen` | Reabrir deal |
| Get Timeline | GET | `/pipeline/cards/{id}/timeline` | Timeline do deal |
| Bulk Update | PATCH | `/pipeline/cards/bulk_update` | Atualizar em massa |
| Bulk Move | POST | `/pipeline/cards/bulk_move` | Mover em massa |

#### Follow-up (Acompanhamento)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/conversations/{id}/follow_ups` | Criar follow-up em conversa |
| Get Many | GET | `/conversations/{id}/follow_ups` | Listar follow-ups da conversa |
| Update | PATCH | `/follow_ups/{id}` | Atualizar follow-up |
| Delete | DELETE | `/follow_ups/{id}` | Remover follow-up |
| Cancel | POST | `/follow_ups/{id}/cancel` | Cancelar follow-up |
| Get All (Account) | GET | `/follow_ups` | Listar todos os follow-ups |

#### Follow-up Template

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/follow_up_templates` | Criar template |
| Get Many | GET | `/follow_up_templates` | Listar templates |
| Update | PATCH | `/follow_up_templates/{id}` | Atualizar template |
| Delete | DELETE | `/follow_up_templates/{id}` | Remover template |
| Preview | POST | `/follow_up_templates/{id}/preview` | Pre-visualizar template |

#### Activity (Atividade)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/pipeline/activities` | Criar atividade |
| Get | GET | `/pipeline/activities/{id}` | Obter atividade |
| Get Many | GET | `/pipeline/activities` | Listar atividades |
| Update | PATCH | `/pipeline/activities/{id}` | Atualizar atividade |
| Delete | DELETE | `/pipeline/activities/{id}` | Remover atividade |
| Start | POST | `/pipeline/activities/{id}/start` | Iniciar atividade |
| Complete | POST | `/pipeline/activities/{id}/complete` | Concluir atividade |
| Cancel | POST | `/pipeline/activities/{id}/cancel` | Cancelar atividade |
| Get Analytics | GET | `/pipeline/activities/analytics` | Metricas de atividades |

#### Lead Scoring (Pontuacao de Lead)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create Rule | POST | `/pipeline/lead_score_rules` | Criar regra |
| Get Many Rules | GET | `/pipeline/lead_score_rules` | Listar regras |
| Update Rule | PATCH | `/pipeline/lead_score_rules/{id}` | Atualizar regra |
| Delete Rule | DELETE | `/pipeline/lead_score_rules/{id}` | Remover regra |
| Create Defaults | POST | `/pipeline/lead_score_rules/create_defaults` | Criar regras padrao |
| Get Card Score | GET | `/pipeline/cards/{id}/lead_score` | Score do deal |
| Recalculate | POST | `/pipeline/cards/{id}/lead_score/recalculate` | Recalcular score |
| Get Dashboard | GET | `/pipeline/lead_score/reports/dashboard` | Dashboard de scoring |

#### Campaign (Campanha)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create | POST | `/campaigns` | Criar campanha |
| Get | GET | `/campaigns/{id}` | Obter campanha |
| Get Many | GET | `/campaigns` | Listar campanhas |
| Update | PATCH | `/campaigns/{id}` | Atualizar campanha |
| Delete | DELETE | `/campaigns/{id}` | Remover campanha |

Tipos de campanha:
- `one_off` — Envio unico agendado
- `ongoing` — Continua, ativada por triggers

#### SLA (Service Level Agreement)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Create Policy | POST | `/sla_policies` | Criar politica SLA |
| Get Policy | GET | `/sla_policies/{id}` | Obter politica |
| Get Many Policies | GET | `/sla_policies` | Listar politicas |
| Update Policy | PATCH | `/sla_policies/{id}` | Atualizar politica |
| Delete Policy | DELETE | `/sla_policies/{id}` | Remover politica |
| Get Applied | GET | `/applied_slas` | Listar SLAs aplicados |
| Get Metrics | GET | `/applied_slas/metrics` | Metricas de cumprimento |
| Export CSV | GET | `/applied_slas/download` | Exportar relatorio |

#### WAHA (WhatsApp Integration)

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Get Status | GET | `/waha/{inbox_id}/status` | Status da sessao |
| Refresh QR | POST | `/waha/{inbox_id}/refresh_qr` | Gerar novo QR code |
| Start | POST | `/waha/{inbox_id}/start` | Iniciar sessao |
| Stop | POST | `/waha/{inbox_id}/stop` | Parar sessao |
| Reconnect | POST | `/waha/{inbox_id}/reconnect` | Reconectar sessao |
| Disconnect | POST | `/waha/{inbox_id}/disconnect` | Desconectar sessao |
| Update Config | PATCH | `/waha/{inbox_id}/config` | Atualizar configuracao |
| Get Settings | GET | `/waha/{inbox_id}/settings` | Obter configuracoes |
| Update Meta Tracking | PATCH | `/waha/{inbox_id}/settings/meta_tracking` | Config tracking Meta |

#### Pipeline Analytics

| Operacao | Metodo | Endpoint | Descricao |
|----------|--------|----------|-----------|
| Get Dashboard | GET | `/pipeline/analytics/dashboard` | Dashboard completo |
| Get Win Rate | GET | `/pipeline/analytics/win_rate` | Taxa de conversao |
| Get Conversion | GET | `/pipeline/analytics/conversion_metrics` | Metricas de conversao |
| Get Velocity | GET | `/pipeline/analytics/sales_velocity` | Velocidade de vendas |
| Get Team Performance | GET | `/pipeline/analytics/team_pipeline` | Performance da equipe |
| Get Lost Reasons | GET | `/pipeline/deal_status/common_reasons` | Motivos de perda |

---

### 3.3 Trigger Node (NooviChat Trigger)

O trigger node recebe webhooks do NooviChat e inicia workflows automaticamente.

#### Eventos suportados

| Evento | Descricao |
|--------|-----------|
| `conversation_created` | Nova conversa criada |
| `conversation_status_changed` | Status alterado (open/resolved/pending) |
| `conversation_updated` | Conversa atualizada |
| `message_created` | Nova mensagem recebida |
| `message_updated` | Mensagem atualizada |
| `contact_created` | Novo contato criado |
| `contact_updated` | Contato atualizado |
| `webwidget_triggered` | Widget do site ativado |
| `conversation_typing_on` | Contato digitando |
| `conversation_typing_off` | Contato parou de digitar |

#### Eventos exclusivos NooviChat

| Evento | Descricao |
|--------|-----------|
| `pipeline_card_created` | Novo deal criado |
| `pipeline_card_updated` | Deal atualizado |
| `pipeline_card_stage_changed` | Deal mudou de estagio |
| `pipeline_card_won` | Deal ganho |
| `pipeline_card_lost` | Deal perdido |
| `follow_up_due` | Follow-up vencendo |
| `follow_up_overdue` | Follow-up atrasado |
| `activity_due` | Atividade vencendo |
| `sla_breach` | SLA violado |
| `waha_status_changed` | Status WAHA alterado |
| `campaign_completed` | Campanha finalizada |

---

## 4. Fases de Desenvolvimento

### Fase 1: Setup e Infraestrutura

**Objetivo**: Projeto scaffoldado, credenciais funcionando, primeiro endpoint operacional.

**Tarefas**:

1. Criar repositorio `n8n-nodes-noovichat` a partir do [n8n-nodes-starter](https://github.com/n8n-io/n8n-nodes-starter)
2. Configurar `package.json`:
   ```json
   {
     "name": "@nooviai/n8n-nodes-noovichat",
     "version": "0.1.0",
     "description": "n8n community node for NooviChat — customer engagement, pipeline CRM, lead scoring and WhatsApp integration",
     "keywords": [
       "n8n-community-node-package",
       "noovichat",
       "chatwoot",
       "whatsapp",
       "crm",
       "pipeline",
       "customer-engagement"
     ],
     "n8n": {
       "n8nNodesApiVersion": 1,
       "credentials": [
         "dist/credentials/NooviChatApi.credentials.js"
       ],
       "nodes": [
         "dist/nodes/NooviChat/NooviChat.node.js",
         "dist/nodes/NooviChat/NooviChatTrigger.node.js"
       ]
     }
   }
   ```
3. Implementar `NooviChatApi.credentials.ts`
4. Implementar `GenericFunctions.ts` (apiRequest, apiRequestAllItems)
5. Criar icone `noovichat.svg` (cyan #06B6D4)
6. Criar node shell `NooviChat.node.ts` com recurso Conversation (Get Many)
7. Testar localmente com `npm link`

**Entregavel**: Node aparece no n8n, conecta com credenciais e lista conversas.

---

### Fase 2: Recursos Base

**Objetivo**: Paridade funcional com nodes Chatwoot existentes.

**Tarefas**:

1. `ConversationDescription.ts` — 9 operacoes (CRUD + assign + toggle + labels + filter)
2. `MessageDescription.ts` — 3 operacoes (send + list + delete)
3. `ContactDescription.ts` — 9 operacoes (CRUD + search + filter + merge + conversations)
4. `InboxDescription.ts` — 6 operacoes (CRUD + agents)
5. `AgentDescription.ts` — 4 operacoes
6. `TeamDescription.ts` — 6 operacoes
7. `LabelDescription.ts` — 4 operacoes
8. `CannedResponseDescription.ts` — 3 operacoes
9. `CustomAttributeDescription.ts` — 4 operacoes
10. `WebhookDescription.ts` — 4 operacoes

**Total**: ~52 operacoes

**Entregavel**: Node funcional com todos os recursos Chatwoot padrao.

---

### Fase 3: Recursos Exclusivos NooviChat

**Objetivo**: Diferencial competitivo — features que nenhum node Chatwoot tem.

**Tarefas**:

1. `PipelineDescription.ts` — 10 operacoes (pipelines + stages)
2. `DealDescription.ts` — 12 operacoes (cards + move + status + timeline + bulk)
3. `FollowUpDescription.ts` — 11 operacoes (follow-ups + templates)
4. `ActivityDescription.ts` — 9 operacoes (CRUD + start/complete/cancel + analytics)
5. `LeadScoringDescription.ts` — 8 operacoes (rules + score + dashboard)
6. `CampaignDescription.ts` — 5 operacoes
7. `SlaDescription.ts` — 8 operacoes (policies + applied + metrics + export)
8. `WahaDescription.ts` — 9 operacoes (status + QR + connection + config + settings)

**Total**: ~72 operacoes

**Subtarefas adicionais**:
- Pipeline Analytics como sub-recurso do Pipeline (6 operacoes)
- Follow-up Templates como sub-recurso do Follow-up
- Activity Sequences como sub-recurso de Activity

**Entregavel**: Node com cobertura completa das features exclusivas NooviChat.

---

### Fase 4: Trigger Node

**Objetivo**: Webhook receiver para iniciar workflows automaticamente.

**Tarefas**:

1. Implementar `NooviChatTrigger.node.ts`:
   - Registrar webhook via API (`POST /webhooks`) ao ativar workflow
   - Remover webhook via API (`DELETE /webhooks/{id}`) ao desativar
   - Parsear payload dos eventos
   - Filtrar por tipo de evento selecionado
2. Suportar todos os eventos listados na secao 3.3
3. Output formatado com dados relevantes (conversa, mensagem, contato, deal)
4. Opcao de filtrar por inbox, equipe ou pipeline especifico

**Entregavel**: Trigger node que inicia workflows em qualquer evento NooviChat.

---

### Fase 5: Polish e Publicacao

**Objetivo**: Qualidade de producao, documentacao, publicacao no npm.

**Tarefas**:

1. **Documentacao**:
   - README.md com badges, screenshots, tabela de recursos, exemplos de uso
   - Descricoes inline em cada campo do node (hints, placeholders)
   - Link para documentacao NooviChat em cada recurso

2. **Qualidade**:
   - Testes unitarios para GenericFunctions
   - Testes de integracao para cada recurso (mock server)
   - Lint sem erros (`npm run lint`)
   - Build sem warnings (`npm run build`)

3. **Publicacao**:
   - Publicar no npm: `npm publish --access public`
   - Submeter ao [n8n Creator Portal](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/)
   - Adicionar ao README do NooviChat
   - Adicionar link na documentacao do site (doc.nooviai.com)

4. **Marketing**:
   - Secao no site nooviai.com sobre integracao n8n
   - Templates de workflow prontos para clientes
   - Post no forum n8n community

**Entregavel**: Package publicado, verificado e disponivel para instalacao no n8n.

---

## 5. Exemplos de Workflow

### 5.1 Lead Qualification Automatica

```
Trigger: NooviChat → Novo contato criado
  → NooviChat → Criar deal no pipeline "Vendas"
  → NooviChat → Adicionar follow-up (3 dias)
  → NooviChat → Calcular lead score
  → IF score >= 70
    → NooviChat → Mover deal para "Qualificado"
    → NooviChat → Atribuir conversa ao time "Vendas"
  → ELSE
    → NooviChat → Adicionar label "nurturing"
```

### 5.2 Follow-up Automatico

```
Trigger: NooviChat → Follow-up vencendo
  → NooviChat → Obter conversa
  → IF ultima mensagem > 24h
    → NooviChat → Enviar mensagem template "follow_up_24h"
    → NooviChat → Criar novo follow-up (48h)
  → ELSE
    → NooviChat → Cancelar follow-up
```

### 5.3 Pipeline + WhatsApp

```
Trigger: NooviChat → Deal marcado como ganho
  → NooviChat → Obter contato do deal
  → NooviChat → Enviar mensagem WhatsApp "Parabens! Seu pedido foi confirmado."
  → NooviChat → Adicionar label "cliente-ativo"
  → NooviChat → Resolver conversa
```

### 5.4 Monitoramento WAHA

```
Schedule Trigger: A cada 5 minutos
  → NooviChat → Obter status WAHA (inbox WhatsApp)
  → IF status != "WORKING"
    → NooviChat → Reconectar sessao WAHA
    → Wait 30s
    → NooviChat → Obter status novamente
    → IF ainda != "WORKING"
      → Slack → Notificar canal #alertas "WAHA desconectado na inbox X"
```

### 5.5 Relatorio SLA Semanal

```
Schedule Trigger: Toda segunda 9h
  → NooviChat → Obter metricas SLA (semana anterior)
  → IF hit_rate < 80%
    → Email → Enviar relatorio para gerente
    → NooviChat → Criar atividade "Revisar SLA" no pipeline
```

---

## 6. Requisitos Tecnicos

### 6.1 Dependencias

```json
{
  "dependencies": {
    "n8n-workflow": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "gulp": "^4.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "n8n-node-dev": "^1.0.0"
  }
}
```

### 6.2 Compatibilidade

| Requisito | Versao |
|-----------|--------|
| n8n | >= 1.0.0 |
| Node.js | >= 18.0.0 |
| TypeScript | >= 5.0.0 |
| NooviChat API | >= v4.10.0 |

### 6.3 Convencoes de Codigo

- TypeScript strict mode
- ESLint + Prettier (config do n8n-nodes-starter)
- Nomes de operacoes em ingles (padrao n8n): `Create`, `Get`, `Get Many`, `Update`, `Delete`
- Descricoes de campos em portugues (publico brasileiro)
- Documentacao README em ingles (publicacao global no npm)
- Changelog seguindo [Keep a Changelog](https://keepachangelog.com/)

---

## 7. Metricas de Sucesso

| Metrica | Meta (3 meses) | Meta (6 meses) |
|---------|----------------|----------------|
| Downloads npm / mes | 100 | 500 |
| Stars GitHub | 20 | 50 |
| Clientes NooviChat usando | 30% | 60% |
| Issues abertos | < 5 | < 10 |
| Verificacao n8n | Submetido | Aprovado |

---

## 8. Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| API NooviChat muda sem aviso | Media | Alto | Versionamento semantico, testes CI contra API real |
| n8n muda API de nodes | Baixa | Alto | Acompanhar releases n8n, manter n8n-workflow atualizado |
| Baixa adocao | Media | Medio | Templates de workflow prontos, documentacao rica, marketing |
| Bugs em endpoints exclusivos | Media | Medio | Testes de integracao, beta testing com clientes selecionados |

---

## 9. Referencias

- [n8n Community Nodes — Build Guide](https://docs.n8n.io/integrations/community-nodes/build-community-nodes/)
- [n8n-nodes-starter (Template)](https://github.com/n8n-io/n8n-nodes-starter)
- [n8n Creator Portal](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/)
- [Documentacao NooviChat API](https://doc.nooviai.com/docs/noovichat/reference/)
- [NooviChat OpenAPI Spec](https://doc.nooviai.com/api/specs/noovichat.json)
- [devlikeapro/n8n-nodes-chatwoot (Referencia)](https://github.com/devlikeapro/n8n-nodes-chatwoot)
- [devlikeapro/n8n-openapi-node (Gerador)](https://github.com/devlikeapro/n8n-openapi-node)
