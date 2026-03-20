# Troubleshooting Guide — @nooviai/n8n-nodes-noovichat

## Índice

1. [Field mapping: snake_case vs camelCase](#1-field-mapping-snake_case-vs-camelcase)
2. [API Compatibility Matrix](#2-api-compatibility-matrix)
3. [Instalação em n8n self-hosted](#3-instalação-em-n8n-self-hosted)
4. [Erros comuns e soluções](#4-erros-comuns-e-soluções)

---

## 1. Field mapping: snake_case vs camelCase

### O problema

O n8n trabalha internamente com `camelCase` nos parâmetros da UI, mas a API NooviChat espera `snake_case`. O node converte automaticamente — mas às vezes o campo da UI tem um nome diferente do campo da API.

### Mapeamentos importantes (v0.5.5+)

| Resource | Campo na UI (n8n) | Campo enviado à API | Notas |
|----------|-------------------|---------------------|-------|
| `card` | `value` | `expected_revenue` | API não aceita `value` |
| `card` | `assigneeId` | `owner_id` | Diferente do padrão |
| `card` | `stageId` | `pipeline_stage` | String no formato `{pipeline_id}_{stage_slug}`, ex: `"1_lead"` |
| `contact` | `phoneNumber` | `phone_number` | |
| `activity` | `assigneeId` | `assigned_to_id` | |
| `conversation` | `assigneeId` | `assignee_id` | |
| `conversation` | `teamId` | `team_id` | |
| `sla` | `policyName` | `name` | |
| `leadScoring` | `ruleName` | `name` | |
| `leadScoring` | `points` | `points` | Antes era `score` (corrigido em v0.3.8) |

### Como debugar

Se um campo não está sendo salvo na API, ative o modo debug do n8n ou use o node `NooviChat → conversation → get` para verificar o estado atual do objeto. Compare com o que foi enviado.

---

## 2. API Compatibility Matrix

| Versão do node | Versão mínima NooviChat | Notas |
|----------------|-------------------------|-------|
| `0.5.5` | `v1.10+` | Recomendada. Todas as operações testadas |
| `0.5.x` | `v1.10+` | Fixes progressivos de field mapping |
| `0.4.x` | `v1.8+` | Stage operations compostas (updateStage/deleteStage) |
| `0.3.x` | `v1.6+` | Sem suporte a Pipeline/Card |

### Operações que requerem versões específicas do NooviChat

| Operação | NooviChat mín. | Motivo |
|----------|---------------|--------|
| `pipeline.*` | `v1.8+` | API de Pipeline adicionada |
| `card.*` | `v1.8+` | API de Cards adicionada |
| `leadScoring.*` | `v1.9+` | API de Lead Scoring adicionada |
| `activity.*` | `v1.9+` | API de Activities adicionada |
| `waha.*` | `v1.10+` | Integração WAHA/WhatsApp |
| `sla.*` | `v1.10+` | Políticas de SLA |

---

## 3. Instalação em n8n self-hosted

### Método 1 — npm (recomendado)

```bash
# No container/servidor onde n8n roda:
npm install @nooviai/n8n-nodes-noovichat

# Reiniciar n8n após instalar
```

Se n8n rodar em Docker, instale dentro do container:

```bash
docker exec -it <n8n_container> npm install @nooviai/n8n-nodes-noovichat
docker restart <n8n_container>
```

### Método 2 — Docker volume com custom node path

No `docker-compose.yml` ou stack file:

```yaml
environment:
  - N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom
volumes:
  - n8n_custom:/home/node/.n8n/custom
```

Depois copie os arquivos compilados de `dist/` para o volume.

### Método 3 — n8n Desktop (desenvolvimento)

```bash
# Clone o repositório
git clone https://github.com/nooviai/n8n-nodes-noovichat
cd n8n-nodes-noovichat

# Build
npm install
npm run build

# Link para o n8n local
npm link
cd ~/.n8n
npm link @nooviai/n8n-nodes-noovichat
```

### Verificando a instalação

Após instalar e reiniciar o n8n, procure por "NooviChat" no seletor de nodes. Se não aparecer:

1. Verifique os logs do n8n: `docker logs <container> | grep -i noovichat`
2. Confirme que a variável `N8N_CUSTOM_EXTENSIONS` aponta para o diretório correto
3. Certifique-se que o `package.json` do node tem `"n8n-community-node-package"` nos keywords

---

## 4. Erros comuns e soluções

### Erro: `NooviChat API Error (HTTP 401)`

**Causa:** Token de API inválido ou expirado.

**Solução:**
1. Acesse NooviChat → Configurações → Integrações → API Access
2. Gere um novo token
3. Atualize as credenciais no n8n: Configurações → Credentials → NooviChat API

---

### Erro: `NooviChat API Error (HTTP 404) GET /conversations/:id`

**Causa:** ID da conversa não existe ou pertence a uma conta diferente.

**Solução:**
- Confirme que `Account ID` nas credenciais corresponde à conta correta
- Verifique se o ID vem de uma expressão n8n que pode estar retornando valor incorreto

---

### Erro: `NooviChat API Error (HTTP 422) POST /pipeline_cards`

**Causa:** Body inválido — campo obrigatório ausente ou formato incorreto.

**Causas mais comuns:**
- `pipeline_stage` com formato errado (deve ser `"{pipeline_id}_{stage_slug}"`, ex: `"3_lead"`)
- `pipeline_id` enviado como número quando a API espera string (use expressão `{{ $json.pipelineId.toString() }}`)

**Verificação:**
```
# Confira os stages disponíveis do pipeline:
NooviChat → pipeline → get → {pipeline_id}
# O campo "stages" retorna o hash com os slugs disponíveis
```

---

### Erro: `Stage "X" not found in pipeline Y` (pipeline.updateStage / deleteStage)

**Causa:** O `stageId` fornecido não existe no pipeline.

**Solução:**
1. Use `pipeline.get` para listar todos os stages do pipeline
2. O `stageId` deve ser a chave do hash (slug), ex: `"lead"`, `"qualified"`, não um inteiro

---

### Erro: Webhook não dispara após criar com NooviChatTrigger

**Causa possível 1:** URL do webhook n8n não acessível pelo servidor NooviChat.
- Se n8n está em `localhost`, o NooviChat (em Docker) não consegue alcançar.
- Solução: use um domínio público ou tunnel (ngrok, cloudflare tunnel).

**Causa possível 2:** Webhook duplicado — n8n criou mas não deletou na última execução.
- Verifique em NooviChat → Configurações → Integrações → Webhooks
- Delete manualmente webhooks órfãos apontando para URLs antigas

**Causa possível 3:** Evento não corresponde.
- O trigger filtra pelo tipo de evento configurado.
- Verifique se o evento no NooviChat (ex: `message_created`) bate com o configurado no node.

---

### Campo `customAttributes` não salvo

**Causa:** Deve ser enviado como JSON válido.

**Solução:** Use o campo com expressão JSON:
```json
{{ { "tier": "enterprise", "source": "linkedin" } }}
```

Ou como string JSON:
```
{"tier": "enterprise", "source": "linkedin"}
```

---

### Workflow continua mesmo com erro na API

**Causa:** A opção "Continue on Fail" está ativada no node.

**Comportamento:** Quando habilitada, erros da API são capturados e retornados como `{ "error": "...", "resource": "...", "operation": "...", "statusCode": ... }` no output, sem parar o workflow.

**Para desabilitar:** Clique no node → Settings → desmarque "Continue on Fail".
