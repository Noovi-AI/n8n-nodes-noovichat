# Melhorias do node @nooviai/n8n-nodes-noovichat — Inspiradas em fazer-ai/n8n-nodes-chatwoot

> **Data:** 2026-05-07
> **Autor:** Time NooviChat (research + draft)
> **Versão node atual:** `0.8.0`
> **Versão fazer-ai analisada:** `2.3.0` (released 2026-04-19)
> **Status:** 🟡 NOTA HISTÓRICA/PROPOSTA — não é roadmap. Se aprovada, mover
> o planejamento para `/home/debian/projects/Noovichat/Roadmap/`.
> **Esforço total:** 5–7 dias dev (incremental, batched em 2-3 minor releases)

---

## Contexto

Em 2026-05-07 foi feita análise comparativa entre o nosso node
`@nooviai/n8n-nodes-noovichat` (23 resources, fork da NooviChat) e o
node concorrente da comunidade `fazer-ai/n8n-nodes-chatwoot` v2.3.0
(19 resources, espelha upstream Chatwoot + extensões internal-chat
e kanban próprias do fork deles).

A pesquisa completa está em `/tmp/mcp-research-n8n-fork.md` (snapshot
externo ao repo — não é fonte de verdade, apenas insumo desta proposta).

Esta proposta sintetiza os achados em **5 ações priorizadas**, todas
alinhadas às nossas regras vigentes:

- `docs/rules/api-sync.md` — toda nova operação atualiza o mapeamento
  Controller → Description
- `docs/rules/architecture.md` — node consome
  `Chatwoot/app/controllers/api/v1/accounts/*` via HTTP autenticado
- `docs/rules/patterns.md` — template canônico de Description, ops e
  fields
- `../../docs/rules/release-cadence.md` — patches batched 2x/semana,
  preferência por tags batched (Ter/Qui 19-22h)
- `../../docs/rules/deploy-safety.md` — `npm publish` exige working
  tree limpo, build local, lint, testes, janela permitida

---

## Resumo executivo

| Item | Valor |
|---|---|
| Resources nossos hoje | **23** (cobrimos 4 a mais que fazer-ai em verticais NooviChat-exclusivas — Pipeline, Lead Scoring, Appointments, WAHA, WhatsApp Templates) |
| Resources fazer-ai | **19** (mas com maior densidade de ops em Conversation/Contact/Inbox e em produtos próprios deles — Internal Chat e Kanban) |
| Gaps identificados (relevantes) | 5 propostas concretas + 5 padrões de UX/qualidade |
| Effort total estimado | **5–7 dias** (split em 2-3 minor releases) |
| Próximo bump | `0.8.0 → 0.9.0` (minor — novos resources/ops; sem breaking) |
| Sobreposição com `@nooviai/noovichat-mcp` | Sim, em parte (ver Próximos Passos) |

A pesquisa **invalidou** uma das prioridades originalmente listadas e
**ajustou o escopo** de outras — o que está aqui é a versão validada
contra o código real do fork NooviChat (não suposições baseadas só na
comparação).

---

## Pontos onde já estamos à frente (NÃO REGREDIR)

Antes de abrir mão de qualquer linha de código durante refactors, o
revisor precisa garantir que estes diferenciais **continuem**
funcionando. Foram explicitamente identificados na pesquisa como
forças nossas que fazer-ai não tem:

| Diferencial | Onde mora hoje | Risco se regredir |
|---|---|---|
| **Proteção SSRF** em `nooviChatApiRequest` (bloqueia IPs privados, `localhost`, variantes encoded `0x7f.0.0.1`, `017700000001`) | `nodes/NooviChat/GenericFunctions.ts` | Workflow malicioso atinge serviços internos do cliente |
| **429 retry com `Retry-After` + exponential backoff** | `GenericFunctions.ts` | Workflows quebram em rate-limit, alarmes de cliente |
| **Pagination safety cap** (`MAX_PAGES = 400`) | `nooviChatApiRequestAllItems` | Loop infinito sangra tempo de execução do n8n |
| **Dual credential separation** (`nooviChatApi` para CRUD, `nooviChatWebhookApi` para trigger) | `credentials/*.credentials.ts` | Rotação de webhook secret força re-auth de todos os workflows CRUD |
| **`parseJsonValue` helper** (parse defensivo de strings/objetos vindos do n8n UI) | `GenericFunctions.ts` | Workflows quebram quando users colam JSON cru |
| **Cobertura Jest** (`test/`) | `test/` | fazer-ai não tem testes; perder cobertura nos coloca no mesmo nível |

**Critério de revisão de qualquer PR de refactor:** se o diff tocar
`GenericFunctions.ts`, exigir antes do merge a confirmação de que os
6 itens acima continuam ativos (preferência: spec Jest novo, ou
inspeção manual documentada no PR).

---

## Proposta 1 — Granularizar operações de Conversation

> **Prioridade:** ALTA · **Effort:** 1 dia · **Risco:** baixo · **Bump:** minor

### Gap atual

Hoje o resource Conversation expõe **9 operações de alto nível**
(`create`, `get`, `getAll`, `update`, `assign`, etc.) com vários
behaviors escondidos em `additionalFields` ou no `update`. Para o
usuário do n8n isso significa:

- "Como atribuir uma conversa a um agent?" → precisa abrir `update` →
  achar `assigneeId` em `additionalFields` → entender que se preencher
  `teamId` lá também a operação ainda chama o mesmo endpoint
- "Como mudar prioridade?" → mesma trilha mental, sem `displayName`
  óbvio
- "Como adicionar um label sem remover os existentes?" → docs do node
  não esclarecem se `addLabel` substitui ou append

A fazer-ai expõe **25 ops first-class** no Conversation, eliminando
essa fricção.

### Solução proposta

Quebrar `update`/`assign`/`addLabel` em ops first-class. O endpoint
backend já existe em todos os casos abaixo (são todos mapeados em
`Chatwoot/app/controllers/api/v1/accounts/conversations_controller.rb`
ou em `assignments_controller.rb`):

| Nova op (proposta) | HTTP | Endpoint | Substitui |
|---|---|---|---|
| `assignAgent` | POST | `/conversations/:id/assignments` `{assignee_id}` | parte do `assign` |
| `assignTeam` | POST | `/conversations/:id/assignments` `{team_id}` | parte do `assign` |
| `setPriority` | POST | `/conversations/:id/toggle_priority` `{priority}` | escondido em `update.additionalFields` |
| `addLabels` | POST | `/conversations/:id/labels` (array merge) | `addLabel` (single) |
| `removeLabels` | DELETE | `/conversations/:id/labels` | NEW |
| `listLabels` | GET | `/conversations/:id/labels` | NEW |
| `markUnread` | POST | `/conversations/:id/unread` | NEW |
| `setCustomAttributes` | POST | `/conversations/:id/custom_attributes` (replace) | escondido em `update` |
| `addCustomAttributes` | POST | `/conversations/:id/custom_attributes` (merge) | escondido em `update` |
| `listAttachments` | GET | `/conversations/:id/attachments` | NEW |

Operações **mantidas como estão**: `create`, `get`, `getAll`, `delete`,
`update` (legacy umbrella, marcado deprecated), `toggleStatus`.

**Backward-compat:** manter `assign` e `addLabel` por **6 meses**
marcados como `@deprecated` no campo `description`. Workflows existentes
continuam funcionando; workflows novos usam ops granulares.

### Impacto cross-projeto

- Atualizar `docs/rules/api-sync.md` com novas linhas no mapeamento
  Controller → Description (seção Mapeamento atual)
- README do node ganha tabela de ops Conversation expandida
- Sobreposição com `@nooviai/noovichat-mcp`: **sim**, MCP também
  expõe Conversation. Garantir que a granularidade fique **alinhada**
  (mesma nomenclatura `assignAgent`/`setPriority`/...) — discutir com
  time MCP antes de mergear

### Test plan

- [ ] Jest unit para cada nova op (mock de `nooviChatApiRequest`)
- [ ] Sandbox n8n manual: criar workflow com `assignAgent` → conferir
      que conversa muda de agent na UI Chatwoot
- [ ] Smoke do `update` legacy (manter funcionando)
- [ ] Lint + build limpos

---

## Proposta 2 — Adotar `listSearch`/`loadOptions` para resource pickers

> **Prioridade:** ALTA · **Effort:** 1 dia (top-5 fields) · **Risco:** baixo · **Bump:** minor

### Gap atual

Hoje, todos os IDs no node são `type: 'string'` e o usuário precisa
**colar IDs raw** copiados do banco ou da URL Chatwoot. Isso causa:

- Erros de digitação (workflow falha em runtime, não em design-time)
- Necessidade de sair do n8n para descobrir o ID
- UX inferior a qualquer node maduro (Slack, Asana, Hubspot)

A fazer-ai usa o helper `methods.listSearch` + `methods.loadOptions`
do n8n SDK para popular dropdowns dinamicamente via API, com paginação.
Resultado: usuário escolhe inbox/agent/pipeline em uma combobox com
autocomplete.

### Solução proposta

Adicionar helpers em `nodes/NooviChat/methods/` (criar a pasta) e
converter os **5 fields mais usados** para `resourceLocator`:

| Field | API source | Cache TTL sugerido |
|---|---|---|
| `inboxId` | `GET /inboxes` | 5min |
| `pipelineId` | `GET /pipelines` | 5min |
| `agentId` | `GET /agents` | 5min |
| `teamId` | `GET /teams` | 10min |
| `labelId` | `GET /labels` | 10min |

Implementação:

```ts
// nodes/NooviChat/methods/listSearch.ts
export async function listInboxes(this: ILoadOptionsFunctions, filter?: string) {
  const items = await nooviChatApiRequest.call(this, 'GET', '/inboxes');
  const list = (items.payload || items).filter((i: any) =>
    !filter || i.name.toLowerCase().includes(filter.toLowerCase())
  );
  return {
    results: list.map((i: any) => ({
      name: i.name,
      value: i.id,
      url: `${this.getCredentials('nooviChatApi').baseUrl}/app/inboxes/${i.id}`,
    })),
  };
}
```

E em cada Description o field passa de `type: 'string'` para:

```ts
{
  displayName: 'Inbox',
  name: 'inboxId',
  type: 'resourceLocator',
  default: { mode: 'list', value: '' },
  modes: [
    { displayName: 'From list', name: 'list', type: 'list',
      typeOptions: { searchListMethod: 'listInboxes', searchable: true } },
    { displayName: 'By ID', name: 'id', type: 'string' },
  ],
}
```

### Impacto cross-projeto

- Não toca `Chatwoot/` (consome endpoints já existentes)
- README ganha screenshot do dropdown novo
- Não tem sobreposição com MCP (MCP não tem UI; este é puramente n8n)

### Test plan

- [ ] Jest mockando `nooviChatApiRequest` para `listInboxes`/etc.
- [ ] Sandbox n8n: abrir node, conferir dropdown popula
- [ ] Validar fallback `By ID` (modo manual) ainda funciona
- [ ] Validar comportamento com 0 resultados, 1 resultado, >100 (paginação)

### Riscos

- API com latência alta degrada UX. Mitigação: cache via `loadOptions`
  hash key + TTL no n8n SDK
- Filtros `q=` não existem em todos os endpoints; documentar quais
  fazem client-side filtering vs server-side

---

## Proposta 3 — Validar paridade com `Scheduled Message` (resource Follow-up já existe)

> **Prioridade:** MÉDIA · **Effort:** 2-3h (validação + alias + docs) · **Risco:** mínimo · **Bump:** patch

### Gap (REVISADO após inspeção do código)

A pesquisa original recomendou **portar Scheduled Message como resource
novo**, espelhando `fazer-ai`'s `getAll/create/update/delete`.

**Inspeção de código revelou que isso já existe no nosso fork — com
naming diferente e ops mais ricas:**

- A migration `20250308231340_create_scheduled_messages.rb` foi criada
  no fork
- A migration `20260117002023_rename_scheduled_messages_to_follow_ups.rb`
  **renomeou a tabela** para `follow_ups` (parte da Fase 1.x do
  Pipeline Pro / FollowUps)
- O controller `follow_ups_controller.rb` expõe a feature (rota
  `/follow-ups`)
- O node já tem `FollowUpDescription.ts` com **11 operações** (CRUD +
  Cancel + Templates CRUD + Preview Template)

Conclusão: **não há gap funcional**. Há gap de **descoberta** — usuários
migrando de outras forks do Chatwoot procuram "Scheduled Message" e
não encontram.

### Solução proposta

**Não criar novo resource.** Em vez disso:

1. Adicionar `keywords: ['scheduled-message', 'scheduled-messaging']`
   ao `package.json` para o pacote ser descoberto via npm search
2. No `README.md`, adicionar nota: "Scheduled messages → see Follow-up
   resource"
3. No `FollowUpDescription.ts`, no `description` da operação `create`,
   adicionar texto: "Equivalent to upstream Chatwoot's *Scheduled Message*"
4. Validar paridade de **campos aceitos** entre nosso `follow_ups`
   payload e o upstream `scheduled_messages` payload — se houver gap
   no Site backend (por exemplo, fazer-ai aceita `content_type`
   adicional), adicionar
5. Atualizar `docs/rules/api-sync.md` para documentar que
   `/scheduled_messages` foi renomeado para `/follow-ups` no fork
   (linha já existe, mas pode precisar de nota explícita sobre
   "alias semântico")

### Impacto cross-projeto

- README + keywords no `package.json`
- Atualização de doc em `api-sync.md`
- **Sobreposição com `@nooviai/noovichat-mcp`:** o MCP também precisa
  expor `follow_up` com a mesma semântica. Comunicar ao time MCP que a
  decisão é "follow_up é a primary key, scheduled_message é alias
  documental"

### Test plan

- [ ] Inspeção manual: rodar `create` follow-up via node → conferir que
      campo `scheduled_at` é aceito (renomear se necessário; hoje pode
      ser `due_at` ou outro)
- [ ] Comparar payload nosso vs payload fazer-ai docs e
      `Chatwoot/app/controllers/api/v1/accounts/follow_ups_controller.rb`
      strong params
- [ ] `npm run lint && npm run build && npm run test` limpos

### Notas

Esta é a proposta mais barata da lista, mas a mais provável de quebrar
silenciosamente se o usuário **acreditar** que está usando "Scheduled
Message" e o behavior do nosso `follow_ups` divergir do upstream em
algum edge case. Validar paridade de **campos aceitos no body** é
obrigatório antes de bater o martelo.

---

## Proposta 4 — Adicionar operação `inbox.checkPhoneOnWhatsApp`

> **Prioridade:** ALTA · **Effort:** 4-6h (n8n + backend coordination) · **Risco:** médio · **Bump:** minor + Chatwoot patch

### Gap atual (REVISADO após inspeção)

A pesquisa recomendou portar `inbox.onWhatsapp` (existente em fazer-ai
como wrapper do endpoint upstream Chatwoot). **Inspeção do nosso fork
mostrou que o endpoint não existe nativamente.** O `WahaController`
não tem método `check-exists`/`on_whatsapp`/`number_check`.

Mas a feature continua sendo **alto valor**: fluxos de WhatsApp em
massa precisam validar se o número está no WhatsApp **antes de gastar
1 envio** (que conta para rate limit do WAHA Plus / Cloud API).

### Solução proposta (2 fases)

**Fase 4a — Backend Chatwoot (precondição):**

Adicionar método `check_phone` em `WahaController` que faz proxy para
o endpoint nativo do WAHA daemon `/api/contacts/check-exists`:

```ruby
# Chatwoot/app/controllers/api/v1/accounts/waha_controller.rb
def check_phone
  inbox = @current_account.inboxes.find(params[:inbox_id])
  return render_404 unless inbox.channel_type == 'Channel::Waha'

  phone = params[:phone].to_s.gsub(/\D/, '')
  return render json: { error: 'phone required' }, status: 422 if phone.blank?

  result = Waha::CheckPhoneService.new(inbox: inbox, phone: phone).perform
  render json: { phone: phone, exists: result[:exists], jid: result[:jid] }
rescue Waha::Error => e
  render json: { error: e.message }, status: :bad_gateway
end
```

Rota:
```ruby
# Chatwoot/config/routes.rb (dentro do scope inbox)
post 'waha/check-phone', to: 'waha#check_phone'
```

Authorization: `check_inbox_access`. Multi-tenant via
`@current_account.inboxes.find` (invariante C4 de
`../../../docs/rules/multi-tenant.md`).

**Fase 4b — Node n8n (consome o endpoint novo):**

Em `InboxDescription.ts` adicionar operação `checkPhoneOnWhatsApp`:

```ts
{
  name: 'Check Phone on WhatsApp',
  value: 'checkPhoneOnWhatsApp',
  action: 'Check if phone number is on WhatsApp',
  description: 'Validates WhatsApp presence via WAHA before sending. Returns { exists, jid }',
}
```

Field `phone` (E.164 ou local — backend normaliza via `gsub(/\D/, '')`).

Rota chamada: `POST /api/v1/accounts/:account_id/inboxes/:inbox_id/waha/check-phone`.

### Impacto cross-projeto

- **Chatwoot**: novo controller method + rota + service +
  spec multi-tenant + entrada na seção "Pipeline automations" do
  `docs/rules/upstream-sync-checklist.md` (preservar fix em sync futuro)
- **N8N node**: nova op + Description update + test
- **api-sync.md**: nova linha `/inboxes/:id/waha/check-phone → InboxDescription.ts`
- **Sobreposição com `@nooviai/noovichat-mcp`:** **sim** — útil para o
  agent MCP validar números antes de orientar ações de envio. Coordenar

### Test plan

- [ ] **Chatwoot**: RSpec controller spec (200, 404 inbox errado, 422
      phone vazio, multi-tenant cross-account block)
- [ ] **Chatwoot**: `Waha::CheckPhoneService` spec (mock WAHA HTTP)
- [ ] **N8N**: Jest unit
- [ ] **Sandbox**: workflow real com 3 números (1 válido, 1 inexistente,
      1 mal formatado) → conferir output

### Riscos

- Endpoint `/api/contacts/check-exists` do WAHA tem rate limit
  diferente entre Plus/Community. Documentar
- Resposta do WAHA varia entre versões. Padronizar `{ exists: bool,
  jid: string|null }` independente da versão upstream
- Testes em fork: adicionar a `docs/rules/upstream-sync-checklist.md`
  item 4 (pipeline_automations) ou criar item novo (4c) para preservação

---

## Proposta 5 — Refatorar para layout per-resource folder

> **Prioridade:** MÉDIA · **Effort:** 2 dias incremental (não bloqueia outras propostas) · **Risco:** médio · **Bump:** minor (sem mudança de comportamento)

### Gap atual

Hoje cada resource é **um único arquivo** em
`nodes/NooviChat/descriptions/XDescription.ts` com `XOperations` +
`XFields` exportados. O routing de operações vive em um **switch
gigante** dentro de `NooviChat.node.ts` (~600+ LOC entre todas as ops
dos 23 resources).

Sintomas:

- PR review difícil (diffs em arquivos enormes)
- Adicionar uma op nova exige tocar 2 arquivos (Description + node.ts
  switch) que costumam crescer juntos
- TypeScript fica lento em arquivos enormes

A fazer-ai usa **layout per-resource**:

```
actions/
  contact/
    index.ts        ← export { description, executeOperation }
    operations.ts   ← XOperations + XFields
    types.d.ts      ← typings
    create.operation.ts   ← uma op por arquivo
    update.operation.ts
    ...
```

E `node.ts` apenas roteia: `case 'contact': return contactExecute(this, i);`

### Solução proposta

Migração **incremental** (não big-bang). Toda vez que uma das outras
propostas tocar um resource, esse resource já vai pra novo layout no
mesmo PR. Cronograma sugerido:

| Sprint | Resource(s) migrado(s) | Acoplado com |
|---|---|---|
| 1 | Conversation | Proposta 1 |
| 2 | Inbox | Proposta 4 |
| 3 | Contact, Agent, Team, Pipeline | Proposta 2 (resource pickers) |
| 4 (futuro) | Card, Message, Campaign | Padrão estabelecido, batch |
| 5 (futuro) | Restantes (16 resources) | Como tocar |

Para o resource convertido, a estrutura fica:

```
nodes/NooviChat/actions/conversation/
  index.ts                  ← description (operations + fields) + executeConversationOperation()
  operations/
    create.ts               ← create logic (1 op = 1 arquivo)
    assignAgent.ts
    setPriority.ts
    ...
  types.d.ts                ← interfaces
```

`NooviChat.node.ts` fica:

```ts
case 'conversation':
  return executeConversationOperation.call(this, i, items);
```

### Impacto cross-projeto

- **Apenas reestruturação interna** — zero mudança de comportamento
  observável pelo usuário n8n
- Preservar **todas** as defesas do `GenericFunctions.ts` (SSRF,
  pagination cap, 429 retry) — esse arquivo NÃO se reestrutura
- Atualizar `architecture.md` e `patterns.md` com novo layout
  (mas marcando que layout antigo segue válido durante migração)
- README: nada visível para o usuário

### Test plan (CRÍTICO)

Para cada resource migrado, executar **antes** e **depois**:

- [ ] `npm run test` (todos os specs Jest passam)
- [ ] `npm run build && npm run lint` (limpos)
- [ ] **Smoke test em sandbox n8n**: rodar 1 workflow real com 3-5
      operações desse resource e conferir que retornos são byte-a-byte
      idênticos
- [ ] Conferir que credenciais (`nooviChatApi` + `nooviChatWebhookApi`)
      continuam funcionando
- [ ] Versão semver: minor bump por ser refactor estrutural
      observável, mesmo que comportamento seja idêntico

### Riscos

- **Risco principal:** quebrar dynamicamente uma op que dependia de
  estado compartilhado no switch de `node.ts`. Mitigação: cada PR de
  migration leva 1 resource só, com smoke test em sandbox
- TypeScript path resolution: configurar `tsconfig.json` corretamente
  para o novo layout antes do primeiro merge

---

## Padrões UX adicionais (não-feature)

Estes não são propostas independentes — são **práticas** que devem ser
adotadas durante a execução das 5 propostas acima. Ficam aqui para
referência.

### A. AI tool / `createNodeAsTool` mode handling

Quando o node é usado como **tool** dentro de um n8n AI Agent, o método
`this.getMode() === 'tool'` retorna `true`. Hoje, erros viram exception
e quebram o agent loop. fazer-ai retorna **error message como output
do node** nesses casos. Adotar:

```ts
if (this.getMode() === 'tool') {
  return { error: humanReadableMessage };
}
throw new NodeApiError(...);
```

Adicionar como helper no `GenericFunctions.ts` para uso uniforme.

### B. Error normalization

fazer-ai extrai `err.context.data.errors` (array) ou
`err.context.data.error` (string), junta com `; ` e expõe no `message`
(preservando o original em `description`). Nosso template
`NooviChat API Error (HTTP X) [METHOD endpoint]: msg` é mais técnico
mas menos user-friendly. Adotar parsing similar:

```ts
function extractApiErrorMessage(err: any): { message: string; description: string } {
  const data = err?.response?.body || err?.context?.data || {};
  const list = Array.isArray(data.errors) ? data.errors.join('; ')
              : typeof data.error === 'string' ? data.error
              : null;
  return {
    message: list || err.message,
    description: `HTTP ${err.statusCode} ${err.config?.method?.toUpperCase()} ${err.config?.url}`,
  };
}
```

### C. Webhook signature: avaliar `x-chatwoot-signature` + timestamp

fazer-ai usa `x-chatwoot-signature` + `x-chatwoot-timestamp` com janela
de tolerância de 300s (replay protection). Nosso `NooviChatTrigger`
usa `x-hub-signature` (esquema antigo Chatwoot) sem timestamp.

**Não portar agora.** Antes, validar com o Chatwoot fork **o que ele
realmente emite hoje** em `Chatwoot/app/listeners/webhook_listener.rb`
ou similar. Se o backend já suporta o novo header, fazer port com
fallback para o antigo durante 6 meses (compat com instalações legacy).

Coordenar com a equipe Chatwoot — esta proposta não pode subir só pelo
node.

### D. Folder layout fazer-ai (referência)

Bom design observado no fork deles, vale para a Proposta 5:

- Cada operação é arquivo separado com `description` (option label,
  field set) + `execute` (lógica)
- `index.ts` agrega operações em uma única export sem lógica
- `types.d.ts` separa typing de runtime — facilita TypeScript build

### E. Resource locators (`resourceLocator`)

Já coberto pela Proposta 2 — vale destacar que esse padrão eleva o
node de "intermediário" (digitar IDs) para "produto" (escolher de
lista). É o investimento UX de maior ROI por hora-dev.

---

## Code patterns observados em fazer-ai (worth porting)

| Padrão | Onde usar | Custo |
|---|---|---|
| Helper `extractApiErrorMessage` | `GenericFunctions.ts` | 1h |
| Modo tool-friendly (graceful degrade) | `GenericFunctions.ts` + cada execute | 2h |
| Per-resource folder (Proposta 5) | `nodes/NooviChat/actions/` | 2 dias incr. |
| `methods/listSearch.ts` (Proposta 2) | `nodes/NooviChat/methods/` | 1 dia |
| `types.d.ts` por resource | Junto da Proposta 5 | embed |

**Padrões a NÃO copiar:** transport simples sem SSRF guard, ausência
de testes, single credential type.

---

## Próximos passos

- [ ] **Aprovação humana** desta lista de prioridades
      (revisão obrigatória por responsável técnico Noovi)
- [ ] Criar issues no repo `Noovi-AI/n8n-nodes-noovichat` para cada
      proposta aprovada (1 issue = 1 PR)
- [ ] Bump `0.8.0 → 0.9.0` ao mergear primeira proposta (minor — Proposta 1)
- [ ] Coordenar com time **`@nooviai/noovichat-mcp`** para garantir
      paridade semântica nos pontos de sobreposição:
  - **Conversation granular ops** (Proposta 1) — mesma nomenclatura
    `assignAgent`/`setPriority`/etc. nos dois projetos
  - **Follow-up alias** (Proposta 3) — MCP também precisa documentar
    "scheduled_message → follow_up"
  - **`checkPhoneOnWhatsApp`** (Proposta 4) — útil para o agent MCP
    validar números antes de orientar envio
- [ ] Atualizar `docs/rules/api-sync.md` à medida que cada proposta
      mergear (linhas novas no mapeamento Controller → Description)
- [ ] Atualizar `README.md` do node com novos resources/ops + screenshot
      dos `resourceLocator` dropdowns
- [ ] Garantir que `docs/rules/upstream-sync-checklist.md` do
      Chatwoot ganhe entry novo se a Proposta 4 mergear (preservar
      `WahaController#check_phone` em sync upstream futuro)
- [ ] Pós-merge da Proposta 1: comunicar deprecation de `assign`/
      `addLabel` em release notes + manter por 6 meses

---

## Cronograma sugerido (cabendo na release-cadence do monorepo)

> Patches batched 2x/semana (Ter/Qui 19-22h BRT). Não saímos fora dessa
> janela exceto hotfix com incident doc + force-deploy log.

| Semana | Ação | Janela | Bump |
|---|---|---|---|
| W1 | Proposta 1 (Conversation granular) — implementação + Jest + sandbox | merge → tag → publish próxima Ter | `0.8.0 → 0.9.0` |
| W2 | Proposta 2 (resourceLocator top-5) | Qui | `0.9.0 → 0.10.0` |
| W3 | Proposta 3 (alias docs Follow-up) + Proposta 4a (Chatwoot endpoint) | batched Ter | node `0.10.0 → 0.10.1` (patch); Chatwoot patch coordenado |
| W4 | Proposta 4b (n8n op `checkPhoneOnWhatsApp`) | Qui | `0.10.1 → 0.11.0` |
| W5+ | Proposta 5 (per-resource folder) — incremental, oportunístico | conforme outras propostas tocam resources | minor por release |

Estimativa de **5–7 dias dev úteis** distribuídos em **4-5 semanas** de
release cadence. Cada bump passa por:

1. Working tree limpo + push (regra GD1/GD2 do
   `../../docs/rules/git-discipline.md`)
2. `npm run lint && npm run build && npm run test` ⊆ `prepublishOnly`
3. Validar `dist/` tem todos `.js` esperados
4. Janela permitida + `npm version <bump>` + `git push --follow-tags`
5. `npm publish --access public`
6. `npm view @nooviai/n8n-nodes-noovichat version` para validar
7. CHANGELOG.md atualizado com referência a esta proposta + PR

---

## Critérios de aceite (definição de pronto por proposta)

Cada proposta só é considerada "merged & released" quando:

1. Código merged na main
2. Jest tests passam
3. ESLint limpo
4. Smoke test em sandbox n8n (1 workflow real por op nova)
5. README atualizado
6. `docs/rules/api-sync.md` atualizado quando aplicável
7. CHANGELOG.md com entry detalhada
8. Versão publicada no npm e visível em `npm view`
9. Release notes em GitHub release marcam breaking/non-breaking
10. Cliente piloto (interno) confirma que workflow legacy não quebrou

---

## Anexo — Tabela de gaps detalhada (referência)

| Gap | Proposta | Impacto | Effort |
|---|---|---|---|
| Conversation ops escondidos em additionalFields | 1 | UX | 1d |
| IDs digitados raw (sem dropdowns) | 2 | UX | 1d |
| `Scheduled Message` aparenta faltar (nome ≠ Follow-up) | 3 | descoberta | 2-3h |
| Sem `onWhatsApp` number check | 4 | feature | 4-6h |
| Switch gigante em node.ts | 5 | manutenibilidade | 2d incr |
| `tool mode` quebra agent loop | UX-A | AI workflows | 2h |
| Erros API pouco amigáveis | UX-B | DX | 1h |
| Webhook signature replay-resistant | UX-C | segurança | 4h + coord |
| Internal Chat resources (4 recursos fazer-ai) | — | **NÃO PORTAR** — produto deles | 0 |
| Kanban resources (5 fazer-ai) | — | **NÃO PORTAR** — schema diferente do nosso Pipeline | 0 |
| Provider Event Received trigger | — | avaliar futuro (WAHA passthrough) | TBD |
| Account/Profile resources | — | trivial port (~30 LOC cada), incluir como bonus na Proposta 1 PR se houver tempo | 1h |

---

## Referências

- Pesquisa-fonte: `/tmp/mcp-research-n8n-fork.md` (snapshot 2026-05-07)
- Convenções: `../../CLAUDE.md`, `../../docs/rules/{api-sync,architecture,patterns}.md`
- Cadence: `../../../docs/rules/release-cadence.md`,
  `../../../docs/rules/deploy-safety.md`,
  `../../../docs/rules/git-discipline.md`
- Doc style: `../../../Roadmap/internal/chatwoot/fase-1.6-whatsapp-templates-api.md`
- Sobreposição MCP: a coordenar com time `@nooviai/noovichat-mcp` —
  pontos detalhados em cada proposta
