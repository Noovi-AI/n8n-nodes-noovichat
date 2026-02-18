# Como Publicar o Node no npm

Este documento descreve o processo completo para publicar o `@nooviai/n8n-nodes-noovichat` no registro público do npm, tornando-o instalável pela comunidade n8n.

---

## Pré-requisitos

- Conta no [npmjs.com](https://www.npmjs.com) — crie em `https://www.npmjs.com/signup`
- Organização `@nooviai` criada no npm (ou acesso a ela)
- Node.js >= 18 instalado localmente
- `npm` >= 8

---

## 1. Configurar a conta npm

### 1.1 Login no npm

```bash
npm login
```

O CLI vai pedir username, senha e código OTP (se 2FA estiver ativado).

Confirme que está logado:

```bash
npm whoami
# deve retornar: nooviai (ou o usuário da org)
```

### 1.2 Criar a organização (primeira vez apenas)

Se a org `@nooviai` ainda não existir no npm:

1. Acesse [npmjs.com/org/create](https://www.npmjs.com/org/create)
2. Crie a org com o nome `nooviai`
3. O plano **Free** é suficiente — pacotes com escopo (`@nooviai/`) podem ser publicados como **public**

---

## 2. Preparar o repositório no GitHub

O npm e a comunidade n8n usam o campo `repository` do `package.json` para exibir o link de origem. O repositório precisa existir antes da publicação.

```bash
# Crie o repositório em github.com/nooviai/n8n-nodes-noovichat
# e adicione o remote:
git -C /home/debian/projects/n8n-nodes-noovichat remote add origin \
  https://github.com/nooviai/n8n-nodes-noovichat.git

git -C /home/debian/projects/n8n-nodes-noovichat push -u origin master
```

---

## 3. Rodar os testes

Nunca publique sem antes garantir que todos os testes passam:

```bash
cd /home/debian/projects/n8n-nodes-noovichat

npm test
# Expected: 65 tests passing, 0 failing
```

---

## 4. Build de produção

O script `prepublishOnly` já executa o build e o lint automaticamente antes de cada `npm publish`, mas é útil rodar manualmente antes para verificar:

```bash
npm run build
# Compila TypeScript → dist/
# Copia ícones SVG com gulp

npm run lint
# Valida com eslint-plugin-n8n-nodes-base
```

Verifique que o diretório `dist/` foi gerado corretamente:

```bash
ls dist/nodes/NooviChat/
# NooviChat.node.js
# NooviChatTrigger.node.js
# noovichat.svg

ls dist/credentials/
# NooviChatApi.credentials.js
# NooviChatWebhookApi.credentials.js
```

---

## 5. Publicar no npm

### Primeira publicação (v0.1.0)

Pacotes com escopo (`@nooviai/`) são **privados por padrão** no npm. Use `--access public` para torná-lo público e gratuito:

```bash
npm publish --access public
```

Saída esperada:

```
npm notice Publishing to https://registry.npmjs.org/
+ @nooviai/n8n-nodes-noovichat@0.1.0
```

### Publicações futuras (novas versões)

1. Atualize a versão em `package.json` seguindo [Semantic Versioning](https://semver.org/):

   ```bash
   # Patch: correções de bug (0.1.0 → 0.1.1)
   npm version patch

   # Minor: nova feature sem breaking change (0.1.0 → 0.2.0)
   npm version minor

   # Major: breaking change (0.1.0 → 1.0.0)
   npm version major
   ```

   O comando `npm version` já cria um commit e uma tag git automaticamente.

2. Publique:

   ```bash
   npm publish --access public
   ```

3. Suba a tag para o GitHub:

   ```bash
   git push origin master --tags
   ```

---

## 6. Verificar a publicação

Após publicar, o pacote estará disponível em:

```
https://www.npmjs.com/package/@nooviai/n8n-nodes-noovichat
```

Confirme via CLI:

```bash
npm view @nooviai/n8n-nodes-noovichat
```

---

## 7. Instalar no n8n

### Via UI do n8n (método recomendado para usuários)

1. Acesse **Settings → Community Nodes**
2. Clique em **Install**
3. Digite: `@nooviai/n8n-nodes-noovichat`
4. Confirme e reinicie o n8n quando solicitado

### Via linha de comando (self-hosted)

```bash
# Dentro do container n8n ou no host com n8n instalado:
n8n-node-install @nooviai/n8n-nodes-noovichat

# Ou via npm no diretório de dados do n8n:
cd ~/.n8n
npm install @nooviai/n8n-nodes-noovichat
```

Reinicie o n8n após a instalação.

### Via Docker Compose / Swarm

Adicione a variável de ambiente na stack:

```yaml
environment:
  - N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
  - N8N_COMMUNITY_PACKAGES_ENABLED=true
```

E instale pelo UI após o container subir.

---

## 8. Submeter para o n8n Verified Community Nodes (opcional)

Para aparecer como "Verified" no marketplace oficial do n8n:

1. O repositório deve estar público no GitHub
2. O `package.json` deve ter `"n8nNodesApiVersion": 1` (já configurado)
3. O keyword `"n8n-community-node-package"` deve estar presente nos `keywords` (já configurado)
4. Abra uma issue em [n8n-io/n8n](https://github.com/n8n-io/n8n) solicitando verificação, seguindo o template oficial

Consulte: [docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/)

---

## 9. Checklist completo

Antes de publicar a primeira versão, confirme:

- [ ] Conta npm criada e logada (`npm whoami`)
- [ ] Organização `@nooviai` criada no npm
- [ ] Repositório GitHub criado e código enviado
- [ ] `npm test` — todos os 65 testes passando
- [ ] `npm run build` — sem erros de TypeScript
- [ ] `npm run lint` — sem violações de eslint
- [ ] `CHANGELOG.md` atualizado com as mudanças da versão
- [ ] `README.md` com instruções de instalação e uso
- [ ] Versão em `package.json` reflete a release corretamente
- [ ] `npm publish --access public` executado com sucesso
- [ ] URL do npm confirmada: `npmjs.com/package/@nooviai/n8n-nodes-noovichat`

---

## Referências

- [n8n — Creating community nodes](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n — Deploying community nodes](https://docs.n8n.io/integrations/creating-nodes/deploy/)
- [npm — Publishing scoped packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
- [Semantic Versioning](https://semver.org/)
