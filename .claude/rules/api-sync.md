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
ls "/home/debian/projects/Noovichat/NooviWoot-N8N/nodes/NooviChat/descriptions/"

# Buscar uso do endpoint no node
grep -r "endpoint_path" "/home/debian/projects/Noovichat/NooviWoot-N8N/nodes/"
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
cd "/home/debian/projects/Noovichat/NooviWoot-N8N"

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
