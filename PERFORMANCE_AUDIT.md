# Performance Audit — @nooviai/n8n-nodes-noovichat v0.5.5

Data: 2026-03-20

## 1. Paginação (PAGE_SIZE = 25)

**Localização:** `nodes/NooviChat/GenericFunctions.ts:15`

```ts
const PAGE_SIZE = 25;
```

**Análise:**
- Valor conservador, adequado para manter respostas pequenas e baixa latência por request.
- Para contas com volume alto (>1000 itens), o modo `returnAll: true` fará muitas requests sequenciais.
- APIs do tipo Chatwoot geralmente suportam `per_page` até 100.

**Recomendação (baixa prioridade):**
Aumentar para 50 reduz pela metade o número de páginas em `returnAll`. Testar com a API real antes de mudar.

---

## 2. Bulk Operations — Loops Sequenciais

**Localização:** `nodes/NooviChat/NooviChat.node.ts` — `handleCardOperation`

```ts
// bulkUpdate, bulkMove, bulkDelete — todos usam loop sequencial
for (const card of cardIdValues) {
    const result = await nooviChatApiRequest.call(this, ...);
    results.push(result);
}
```

**Análise:**
- Operações sequenciais são necessárias quando há rate limiting, mas adicionam latência linear.
- Para `bulkDelete` com 50 cards: ~50 requests × ~200ms = ~10s de espera.
- Não há controle de concorrência nem backoff em caso de 429.

**Recomendação (média prioridade):**
- Implementar `Promise.all()` com limite de concorrência (ex: lotes de 5) para reduzir tempo.
- Adicionar retry com exponential backoff para erros 429.

---

## 3. Rate Limiting — Sem tratamento atual

**Localização:** `nodes/NooviChat/GenericFunctions.ts` — `nooviChatApiRequest`

**Análise:**
- Erros HTTP 429 são capturados pelo `catch` genérico e propagados sem retry.
- Em workflows com alto volume (ex: processar 500 contatos), pode causar falhas em cascata.

**Recomendação (média prioridade):**
```ts
// Pseudo-código: retry com backoff
if (error.statusCode === 429) {
    const retryAfter = parseInt(error.response?.headers?.['retry-after'] || '5', 10);
    await sleep(retryAfter * 1000);
    return nooviChatApiRequest.call(this, method, endpoint, body, qs);
}
```

---

## 4. `nooviChatApiRequestAllItems` — Paginação

**Localização:** `nodes/NooviChat/GenericFunctions.ts:71`

**Análise:**
- Loop infinito com break condicional — correto.
- Adiciona todos os resultados em memória antes de retornar — potencial problema com conjuntos muito grandes.
- Para >10.000 itens, pode causar `Out of Memory` em instâncias n8n com pouca RAM.

**Recomendação (baixa prioridade):**
- Documentar limite prático de ~5.000 itens por execução.
- Para datasets maiores, recomendar uso com filtros (`per_page` + processamento em lotes).

---

## 5. Resumo de Prioridades

| Item | Prioridade | Impacto | Complexidade |
|------|------------|---------|--------------|
| Rate limiting (retry 429) | Média | Alto | Média |
| Bulk ops com concorrência limitada | Média | Médio | Média |
| PAGE_SIZE aumentar para 50 | Baixa | Baixo | Baixa |
| Limite de memória no returnAll | Baixa | Baixo | Alta |

---

## 6. Próximos passos sugeridos

1. Criar issue `[NooviWoot-N8N] Add retry with backoff for HTTP 429 in GenericFunctions`
2. Criar issue `[NooviWoot-N8N] Optimize bulk operations with controlled concurrency`
