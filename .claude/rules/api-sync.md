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
