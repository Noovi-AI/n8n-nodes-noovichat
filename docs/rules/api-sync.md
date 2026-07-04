# Sincronização com a API do NooviChat

## Contexto

Este node n8n espelha a API REST do NooviChat (Chatwoot fork).
Quando a API muda, o node pode precisar de atualização.

**Caminho da API no Chatwoot:**
```
Noovichat/Chatwoot/app/controllers/api/v1/accounts/
```

## Quando o node precisa ser atualizado

| Mudança no NooviChat | Ação no node |
|---------------------|-------------|
| Novo endpoint / controller | Criar novo `XDescription.ts` + registrar no node |
| Novo campo em response | Atualizar description com novo campo nas `Additional Fields` |
| Campo renomeado na API | Atualizar `name` no `INodeProperties` correspondente |
| Endpoint removido/depreciado | Marcar operação como depreciada ou remover |
| Novo recurso (ex: novo módulo) | Nova `Description.ts` completa |
| Webhook event adicionado | Adicionar ao array `events` no `NooviChatTrigger.node.ts` |

## Como verificar impacto

Ao modificar um controller em `Chatwoot/app/controllers/api/v1/accounts/`:

```bash
# Verificar se o endpoint afetado tem uma Description correspondente
ls "$(git rev-parse --show-toplevel)/nodes/NooviChat/descriptions/"

# Buscar uso do endpoint no node
grep -r "endpoint_path" "$(git rev-parse --show-toplevel)/nodes/"
```

## Checklist ao alterar API do NooviChat

- [ ] O endpoint alterado é consumido pelo node? (verificar `descriptions/` e `GenericFunctions.ts`)
- [ ] Campos adicionados/removidos do response precisam de atualização na description?
- [ ] O nome do endpoint mudou? Atualizar `nooviChatApiRequest.call(...)` correspondente
- [ ] Novo recurso que merece integração n8n? Criar `NovoRecursoDescription.ts`
- [ ] Novo evento de webhook? Adicionar ao `NooviChatTrigger.node.ts`

## Mapeamento atual (API → Description)

```
/contacts                    → ContactDescription.ts
/conversations               → ConversationDescription.ts
/conversations/:id/messages  → MessageDescription.ts
/pipelines                   → PipelineDescription.ts
/pipeline_items              → CardDescription.ts
/campaigns                   → CampaignDescription.ts
/canned_responses            → CannedResponseDescription.ts
/custom_attribute_definitions → CustomAttributeDescription.ts
/follow_ups                  → FollowUpDescription.ts
/inboxes                     → InboxDescription.ts
/labels                      → LabelDescription.ts
/lead_scoring_rules          → LeadScoringDescription.ts
/agents                      → AgentDescription.ts
/teams                       → TeamDescription.ts
/sla_policies                → SlaDescription.ts
/activities                  → ActivityDescription.ts
/waha/*                      → WahaDescription.ts
/webhooks                    → WebhookDescription.ts (trigger)
/whatsapp_templates          → WhatsappTemplateDescription.ts (NooviChat custom — Meta Cloud CRUD)
```

## Mudanças na API (histórico de incidents)

### 2026-07-03 — Pipeline card: contatos/conversas adicionais + custom fields (v0.19.0)

**Feature backend (Chatwoot v4.15.1.12, FR1 + FR2)**:

- **FR2 — múltiplos contatos/conversas por card.** Novos endpoints aditivos sob
  o namespace `pipeline`:
  - `POST   /api/v1/accounts/{id}/pipeline/cards/{card_id}/contacts` — body
    `{ contact_id, role? }` → 201 `{ data: { id, contact_id, name, email, phone_number, avatar_url, role } }`
  - `DELETE /api/v1/accounts/{id}/pipeline/cards/{card_id}/contacts/{id}` → 204
  - `POST   /api/v1/accounts/{id}/pipeline/cards/{card_id}/conversations` — body
    `{ conversation_display_id }` → 201 `{ data: { id, conversation_display_id } }`
  - `DELETE /api/v1/accounts/{id}/pipeline/cards/{card_id}/conversations/{id}` → 204
  - O `:id` do DELETE é o **id do registro de vínculo** (join record), NÃO o
    contact/conversation id. Erros: duplicado/primário/inválido → 422; não
    encontrado → 404 (nunca 500).
  - Campos ADITIVOS no resource `pipeline_card` (via `as_json`):
    `additional_contacts[]` e `additional_conversations[]`. O contato/conversa
    **primário** (`contact_id` / `conversation_display_id`) permanece inalterado
    e é de-duplicado FORA desses arrays.
- **FR1 — custom fields no card.** `POST/GET /custom_attribute_definitions`
  agora aceita/retorna o `attribute_model` `pipeline_card_attribute` (enum id 3),
  junto de conversation(0)/contact(1)/company(2). Valores persistem no
  `custom_attributes` (JSONB) do card.

**Mudança no n8n node (v0.19.0)**:

- Resource `Card` ganhou 4 operações novas — **Add Contact**, **Remove Contact**,
  **Add Conversation**, **Remove Conversation** — mapeando exatamente para os 4
  endpoints acima (`descriptions/CardDescription.ts` + `handleCardOperation` em
  `NooviChat.node.ts`). O DELETE recebe o **Link ID** (id do join record vindo de
  `additional_contacts[].id` / `additional_conversations[].id`).
- Os campos de response `additional_contacts` / `additional_conversations` fluem
  automaticamente nas operações `Get` / `Get Many` do card (o node repassa o JSON
  cru da API; não há schema de output declarado a atualizar).
- Resource `Custom Attribute`: opção **Pipeline Card** (`pipeline_card_attribute`)
  adicionada ao campo `Model` (`descriptions/CustomAttributeDescription.ts`).
- Testes de regressão de rota/params adicionados em `test/NooviChat.node.test.ts`.

**NÃO faz parte do contrato de API** (não propagado ao node): o fix de disparo de
follow-up/sequence do cliente, o hardening de idempotência da migração e o fix de
ordering de deploy — são notas de engenharia, não mudanças de API para o cliente.

### 2026-06-01 — Follow-up send window (`send_window`)

**Feature backend**: follow-up automations e pipeline follow-up rules ganharam
um campo opcional `send_window` (jsonb) que restringe o horário de envio
(ex.: 08:00–18:00, Seg–Sex). Follow-ups que cairiam fora — inclusive itens de
sequências multi-item — são adiados para a próxima abertura, no fuso da conta.

Endpoints afetados no backend:
- `POST/PATCH /api/v1/accounts/{id}/follow-up-automations`
- `POST/PATCH /api/v1/accounts/{id}/pipelines/{pid}/follow-up-rules`

Formato: `{ "enabled": true, "days": [1,2,3,4,5], "start": "08:00", "end": "18:00" }`
(`days`: 0=domingo..6=sábado; `end` > `start`). Default `{}` = sem restrição
(backward-compatible — clientes antigos não quebram).

**Status do n8n node**: ✅ NENHUMA mudança necessária. O node **não expõe**
`follow-up-automations` nem `follow-up-rules` como resources — o resource
`Follow-up` cobre apenas follow-ups manuais (`/conversations/:id/follow-ups`)
e templates; o resource `Pipeline` cobre pipelines e stages. Como nenhum
endpoint consumido pelo node aceita `send_window`, não há contrato a propagar.
A mudança é puramente aditiva e opcional no backend.

**Oportunidade (próximo minor, opcional)**: se for desejável permitir
configurar a janela de envio via n8n, é preciso **adicionar resources novos**
ao node — "Follow-up Automation" e "Pipeline Follow-up Rule" — com CRUD
completo (incluindo `send_window`, `trigger_type`, `delay_minutes`, etc).
Isso é expansão de escopo, não sync de contrato; tratar como feature própria.
O mesmo vale para o NooviChat-MCP (ver `Chatwoot/docs/rules/mcp-sync.md`).

### 2026-05-07 — Pipeline stages format (incident `array-coalesce`)

**Sintoma observado**: cliente edita descrição de stage via API → 191 cards
movidos silenciosamente para "Entrada de Lead".

**Causa**: `pipelines_controller.rb#pipeline_params` aceitava `stages` como
ARRAY e usava o índice posicional como key do hash interno, descartando
os IDs reais. A detecção de "stages removidas" então marcava todas como
removidas e disparava `handle_orphan_cards`.

**Fix backend (v4.13.0.34)**:
1. Array com `id` em cada item → keys preservadas, OK
2. Array sem `id` → 422 "payload appears malformed"
3. Hash keyed by id → sempre OK (formato canônico)

**Status do n8n node**: ✅ NÃO vulnerável. Todos os 4 caminhos
(`addStage`, `updateStage`, `deleteStage`, `reorderStages`) já mandam
stages como `Record<string, ...>` (hash). Veja `NooviChat.node.ts:752-844`.

**Cuidado em PRs futuros**: ao tocar em qualquer operation que manipula
`pipeline.stages`, garantir que o payload PATCH continue sendo
`{ stages: Record<string, StageObject> }`, NUNCA array. Considerar test
unit verificando esse contrato.

### 2026-05-07 — Pipeline Sequences feature flag

A feature `pipeline_sequences` agora pode ser desligada per-account via
SuperAdmin. **Atualmente o n8n node NÃO expõe Sequences como resource**
(oportunidade para próximo minor). Quando expor, todos os endpoints
`/pipeline/cards/:id/sequences` e `/pipeline/activity_sequences`
retornam 403 quando feature off — o node deve surface o erro do backend
sem retry automático.

### 2026-05-07 — Webhook URL SSRF protection

`PipelineWebhook.url` agora é validado contra IPs privados (10.x,
192.168.x, 127.x, ::1, 169.254.x AWS metadata). Cliente que tentar
criar webhook apontando para endereço interno → HTTP 422 com erro claro
em `errors.url`. Sem mudança no código do node — apenas surface o erro.

## Publicar atualização após sync

```bash
cd "$(git rev-parse --show-toplevel)"

# 1. Atualizar versão
npm version patch   # para fixes de compatibilidade
npm version minor   # para novas operações/recursos

# 2. Build + lint
npm run prepublishOnly

# 3. Publicar
npm publish --access public

# 4. Clients n8n precisam atualizar o pacote em:
# Settings → Community Nodes → Update
```
