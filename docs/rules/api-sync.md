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
/appointments                → AppointmentDescription.ts
/professionals               → ProfessionalDescription.ts
/services                    → ServiceDescription.ts
```

## Mudanças na API (histórico de incidents)

### 2026-08-10 — Cards: transição de negócio fechada e resposta do recálculo

Auditoria 2026-08 do backend (itens D1 e R6). Nada no node quebrou; o que muda
é o que a API recusa e o que ela devolve.

- **D1 — fechar/reabrir não passa mais pelo write genérico.** `POST` e `PATCH`
  em `/pipeline_cards` respondem `422` quando `pipeline_stage` **entra** numa
  etapa de ganho/perda (`pipeline_stage: requires_deal_transition`, inclusive
  ao criar o card já numa etapa terminal) ou quando **sai** de uma etapa
  terminal com o negócio ainda fechado (`requires_reopen`). O atalho gravava o
  card como fechado sem valor de fechamento e sem a oportunidade no ledger.
  - Operações do node afetadas apenas na documentação: **Create** (descrição do
    campo *Pipeline Stage*) e **Bulk Update** (hint de *Update Fields*, porque
    o JSON livre pode carregar `pipeline_stage`).
  - **Move to Stage** e **Bulk Move** **não** foram afetados: eles postam em
    `/pipeline_cards/:id/move_to_stage`, rota que identifica a etapa de destino
    e executa o fechamento completo por conta própria. Continua sendo o caminho
    recomendado para mover cards, inclusive para etapas terminais.
  - **Mark Won**, **Mark Lost** e **Reopen** seguem sendo as transições
    suportadas e não mudaram.
  - O node não tenta adivinhar quais etapas são terminais: isso vive na
    configuração de cada funil, e descobrir exigiria uma chamada extra. O guard
    local do Bulk Update continua cobrindo só `status`; `pipeline_stage` é
    recusado pelo backend.
- **R6 — resposta do recálculo de lead score.** `POST
  /pipeline_cards/:id/recalculate_score` (usada pela operação **Recalculate
  Lead Score**) passou a devolver também `id`, `lead_score_category`,
  `updated_at` e `card_updated_at`. É aditivo: `lead_score`,
  `qualification_score`, `lead_score_factors` e `lead_score_updated_at`
  mantêm nome e significado, então nenhuma expression existente quebra.
  - Cuidado com `updated_at`: nesta rota ele é o timestamp do **card**, mas na
    rota canônica `POST /pipeline/cards/:id/lead_scores/recalculate` (que o node
    não expõe) ele carrega o timestamp do **cálculo**, valor legado preservado
    de propósito. `card_updated_at` e `lead_score_updated_at` são os únicos
    campos com o mesmo significado nas duas rotas.
  - O recálculo persiste via `update_columns` nas colunas de score, então **não**
    bomba o `updated_at` do card. Depois de recalcular, `card_updated_at` (e o
    `updated_at` desta rota) vêm mais **antigos** que `lead_score_updated_at`.
    Um workflow que detecta "mudou o score" precisa comparar
    `lead_score_updated_at` ou o próprio `lead_score`, nunca o timestamp do card.
- **D3 — automação sem `flow` responde 422**: não se aplica a este node. Não
  existe resource de automação de pipeline aqui (só `SequenceDescription`
  menciona automações, e apenas em comentário). Nada a documentar no node.

### 2026-07-21 — Envio idempotente de mensagens

`POST /conversations/:id/messages` agora aceita o header opcional
`Idempotency-Key`. O resource **Message**, operação **Send**, expõe o campo
opcional `idempotencyKey` em **Additional Fields** e o encaminha exatamente
nesse header; o digest interno `client_idempotency_key_digest` nunca faz parte
do contrato do cliente.

- A chave deve ser uma string de 1 a 128 caracteres ASCII visíveis (`!` a `~`),
  sem espaços. Uma chave inválida recebe HTTP 422 do backend.
- Repetir a mesma chave na mesma conta e conversa retorna a mensagem original,
  sem disparar outra entrega. Um retry deve, portanto, reutilizar a chave da
  primeira tentativa.
- Durante ativação/rollback do rollout, ou quando o backend não consegue
  confirmar o gate, uma chave válida recebe HTTP 503 e nenhuma mensagem é
  criada. O workflow deve aguardar a ativação pelo administrador antes de
  tentar novamente; uma chave malformada continua recebendo HTTP 422.
- Omitir o campo mantém o comportamento anterior, sem enviar o header.
- `nooviChatApiRequest` aceita headers adicionais por chamada e preserva os
  headers compartilhados de autenticação e JSON. Nenhuma outra operação passa
  headers extras automaticamente.

### 2026-07-18 — Pipeline cards: busca, cursor, moeda e transições de status

O contrato público de cards foi alinhado ao comportamento do dashboard:

- `GET /pipeline_cards` aceita os filtros `pipeline_id`, `pipeline_stage`,
  `conversation_display_id`, `contact_id`, `exclude_id`, `labels[]`,
  `priority[]`, `value_min`, `value_max`, `agent_id`, `date_start`, `date_end`,
  `status`, `sla_exceeded`, `stages[]` e `search` (o backend usa no máximo 200
  caracteres da busca). `agent_id=-1` ou `agent_id=unassigned` seleciona cards
  sem responsável; `status=closed` reúne ganhos e perdidos. As datas são
  interpretadas no `account.reporting_timezone`.
- A rota pagina por `limit` (1–500), `cursor` e `offset`; `page`/`per_page` não
  fazem parte desse contrato legacy. A opção **Return All** do node segue
  `meta.next_cursor` até `meta.has_more=false` e elimina IDs repetidos
  defensivamente.
- O export CSV em `GET /pipeline/cards/export` usa os mesmos filtros funcionais
  listados acima, mas não os parâmetros de paginação. Filtros múltiplos são
  enviados como parâmetros Rails repetidos
  (`labels[]=vip&labels[]=urgent`, por exemplo), nunca como índices ou uma
  string única separada por vírgulas.
- `POST/PATCH /pipeline_cards` aceitam `currency` junto de
  `expected_revenue`; o node normaliza o código de três letras para maiúsculas,
  preserva `expected_revenue=0` e converte `assigneeId=0` em `owner_id=null`
  para criar sem responsável ou limpar o responsável atual.
- O PATCH genérico não aceita transição por `status`. O Bulk Update rejeita
  esse campo antes da chamada e orienta o uso de **Mark Won**, **Mark Lost** ou
  **Reopen**, que acionam o fluxo completo de domínio.

Testes de contrato cobrem paginação por cursor sem repetição, todos os filtros
de lista/export (inclusive mínimo zero e arrays Rails repetidos), moeda e valor
zero no create/update, limpeza de responsável e rejeição explícita de status no
Bulk Update.

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

## Contratos de appointments e services

- Somente create/update de appointment enviam o envelope
  `{ "appointment": { ... } }`; operações GET/DELETE/actions não enviam esse
  body. Os IDs bigint de entrada são exibidos como texto no editor n8n para
  preservar a string decimal; o Rails aceita esse formato e valida o intervalo
  de 1 a 9223372036854775807. O wire contract de resposta permanece OpenAPI
  `integer/int64` por compatibilidade: JavaScript/n8n arredonda números acima de
  `Number.MAX_SAFE_INTEGER` (9007199254740991), então um ID de resposta nessa
  faixa não deve ser reutilizado em outra operação sem uma fonte decimal textual
  confiável. O `conversation_display_id` é int32 (máximo 2147483647).
- `POST /appointments` expõe exatamente os campos aceitos pelo controller:
  `contact_id`, `professional_id`, `service_id`, `scheduled_at`, `ends_at`,
  `notes`, `partner_id`, `conversation_display_id`, `pipeline_card_id` e
  `custom_attributes`. `ends_at`, `notes` e os IDs opcionais nullable preservam
  `null`; `custom_attributes`, quando informado, deve ser um objeto. O node não
  inventa defaults de vínculo.
- `PATCH /appointments/:id` envia somente `scheduled_at`, `notes`,
  `partner_id` e `custom_attributes`. `ends_at` é recalculado pelo backend com
  base na duração efetiva do serviço. Uma string vazia/null em `notes` e um
  `partner_id` vazio/zero permitem limpar esses valores; o objeto de
  `custom_attributes` enviado substitui o valor persistido.
- `GET /appointments` aceita no node os filtros `from`, `to`,
  `professional_id`, `service_id`, `partner_id`, `status`, `contact_id`,
  `pipeline_card_id`, `conversation_display_id` e `page`. O status multi-select
  vira a string CSV exata esperada pelo Rails. A página contém 50 registros e a
  resposta é repassada sem alteração como `{ data, meta }`.
- `GET /appointments/availability` exige `professional_id` e `date` como string
  estrita `YYYY-MM-DD`. `service_id` e `duration_minutes` são opcionais; a
  duração deve estar entre 1 e 2147483647, usa 60 quando omitida e a duração
  efetiva do serviço prevalece quando ele é informado. Mesmo com serviço, um
  `duration_minutes` enviado continua sendo validado pelo backend.
- `GET /appointments/availability_range` exige `professional_id`, `from` e `to`
  como strings estritas `YYYY-MM-DD`; `service_id` e `duration_minutes` se
  comportam exatamente como na disponibilidade de um dia. `to` não pode ser
  anterior a `from` e o intervalo tem no máximo 42 dias — fora disso o backend
  responde 422. A resposta traz um item por dia do intervalo, em ordem
  crescente, e dias sem expediente vêm com `slots` vazio em vez de ausentes:
  omitir o dia tornaria uma agenda fechada indistinguível de uma resposta
  truncada. Os campos `from`/`to` só aparecem na operação de intervalo e `date`
  só na de um dia — misturá-los manda parâmetro que o endpoint não aceita.
- `DELETE /appointments/:id` envia a razão opcional em `?reason=`. A resposta
  `204 No Content` é normalizada pelo node para `{ "success": true }`.
- `GET /appointments` repassa a projeção summary allowlisted do backend: ela não
  contém `notes`, `custom_attributes`, `account_id`, IDs de auditoria nem dados
  do Google Calendar. Get, create, update, confirm, complete e no-show repassam
  a projeção detail allowlisted, que acrescenta `public_id`, `notes`,
  `custom_attributes`, `cancelled_at`, `created_at` e `updated_at`. Em ambas,
  `contact` sempre contém `id`, `name` e `avatar_url`; `email` e `phone_number`
  aparecem apenas para admin ou custom role com `appointment_manage`. O node
  repassa o envelope recebido sem fabricar campos ausentes. As projeções de
  associações soft-deleted, como um serviço arquivado em um appointment
  histórico, podem chegar como `null` e são preservadas assim.
- **Get Contact History** encaminha `page` e recebe 50 registros por página. O
  envelope inclui `meta.total`, `meta.current_page`, `meta.total_pages` e
  `meta.per_page`; a visibilidade segue o mesmo `policy_scope` de appointments.
- Esta sincronização corrige somente as operações que o resource Appointment já
  oferecia. As rotas `available_professionals`, `metrics`, `bulk_action`, export
  CSV e `sync_to_google` continuam fora do node; adicioná-las é expansão de
  produto para um próximo minor, não correção deste contrato.
- Reminder templates de serviços são exclusivos de WhatsApp. O node expõe e
  envia somente `send_via: "whatsapp"` e rejeita valores legados de outros
  canais antes do HTTP. Informar a coleção no update — inclusive uma lista
  vazia — substitui a lista existente; omiti-la preserva os templates atuais.

## Contrato de professionals

- `POST/PATCH /professionals` recebem `agent_id` e `service_ids` dentro do
  envelope `professional`. IDs bigint também usam campos de texto/strings JSON
  nos inputs para preservar precisão. Respostas continuam usando JSON
  `integer/int64` e estão sujeitas ao mesmo limite seguro do JavaScript descrito
  acima. O node envia a lista completa para a validação
  tenant-scoped do backend, que responde 422 quando um agente ou serviço é
  inválido ou não pertence à conta autenticada. No update, `agent_id: null`
  limpa o agente, `service_ids: []` limpa todos os serviços e
  um input `service_ids: null` é convertido pelo node em omissão para preservar
  os vínculos (o backend strict aceita a chave explícita somente como Array).
- Create/update também encaminham `active`, `custom_attributes`, avatar por
  signed blob ID, `buffer_minutes` (int32), e os campos textuais nullable. Uma
  string vazia e `null` são preservados como valores distintos nos campos
  textuais; `false`, `0`, `{}` e listas vazias também nunca são descartados por
  truthiness. `service_ids` é validado pelo node antes da chamada: `[null]`,
  `[""]`, IDs inseguros como number ou fora do bigint são rejeitados, enquanto
  `[]` continua sendo a limpeza explícita.
- `working_hours` é um objeto com chaves `mon`, `tue`, `wed`, `thu`, `fri`,
  `sat` ou `sun`; cada valor é um array de janelas
  `{ "start": "HH:MM", "end": "HH:MM" }`, com horários zero-padded e início
  anterior ao fim. `{}` permanece aceito por compatibilidade: conflito trata
  como irrestrito, mas a listagem de disponibilidade não gera slots até haver
  janelas configuradas.
- `GET /professionals/:id/availability` aceita `date` opcional como string
  estrita `YYYY-MM-DD`. Omitir `date` faz o backend usar a data atual no fuso de
  agendamento da conta (`reporting_timezone`, depois timezone do onboarding e,
  por fim, o padrão NooviChat). `service_id` deve ser oferecido pelo profissional
  nesta conta e retorna 404 caso contrário. `duration_minutes` aceita inteiros
  de 1 a 2147483647; a duração efetiva do vínculo professional-service (override
  quando configurado, senão a duração base) prevalece quando ambos são enviados.
- List/show retornam sempre a projeção segura de agendamento (`id`, `account_id`,
  `name`, `specialty`, `color`, `buffer_minutes`, `working_hours`, `active`,
  `service_ids`, `avatar_url`). `agent_id`, registry/email/phone e demais campos
  de gestão aparecem somente para admin ou custom role com
  `appointment_manage`. O node repassa a projeção recebida e não fabrica campos
  ausentes.

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
