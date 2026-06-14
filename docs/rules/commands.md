# Comandos — NooviWoot-N8N

## Desenvolvimento

```bash
cd "$(git rev-parse --show-toplevel)"

# Instalar dependências
npm install

# Build (TypeScript → dist/)
npm run build

# Watch mode (recompila ao salvar)
npm run dev

# Lint
npm run lint

# Lint + autofix
npm run lintfix

# Formatar código
npm run format
```

## Testes

```bash
cd "$(git rev-parse --show-toplevel)"

# Rodar todos os testes
npm run test

# Com cobertura
npm run test -- --coverage
```

## Verificar output compilado

```bash
# Verificar se o build gerou os arquivos esperados
ls dist/nodes/NooviChat/
ls dist/credentials/

# Verificar tamanho
du -sh dist/
```

## Publicar no npm

```bash
cd "$(git rev-parse --show-toplevel)"

# Verificar versão atual
cat package.json | grep '"version"'

# Build + lint (obrigatório antes do publish)
npm run prepublishOnly

# Publicar (requer npm login)
npm publish --access public
```

## Testar node localmente no n8n

O node está instalado no n8n como pacote npm. Para testar uma nova versão:

```bash
# 1. Build
npm run build

# 2. Copiar dist/ para o n8n (se container local)
# ou publicar versão de teste no npm
npm version prerelease --preid=beta
npm publish --access public --tag beta

# 3. No n8n, instalar versão beta
# Settings → Community Nodes → @nooviai/n8n-nodes-noovichat@beta
```

## Git

```bash
cd "$(git rev-parse --show-toplevel)"
git status
git log --oneline -10
git add <arquivos>
git commit -m "feat(resource): add new operation"
git push
```

## Versioning

Usa **Conventional Commits + standard-version** (`.versionrc.json`):

```bash
# Patch (fix)
npm version patch
# Minor (new feature)
npm version minor
# Major (breaking change)
npm version major
```

## Estrutura esperada após build

```
dist/
  nodes/
    NooviChat/
      NooviChat.node.js
      NooviChat.node.js.map
      NooviChatTrigger.node.js
      NooviChatTrigger.node.js.map
      GenericFunctions.js
      noovichat.svg
      descriptions/
        *.js
  credentials/
    NooviChatApi.credentials.js
    NooviChatWebhookApi.credentials.js
  index.js
```
