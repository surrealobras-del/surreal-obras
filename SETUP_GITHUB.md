# Configuração da Nova Conta GitHub

Para conectar sua nova conta do GitHub, siga estes passos:

## 1. Configurar Nome e Email do Git

Execute os comandos abaixo substituindo pelos seus dados:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

## 2. Criar/Conectar ao Repositório no GitHub

### Opção A: Criar um novo repositório no GitHub
1. Acesse https://github.com e faça login
2. Clique em "New repository"
3. Dê um nome ao repositório (ex: `surreal-obras-crm`)
4. **NÃO** inicialize com README, .gitignore ou license
5. Copie a URL do repositório

### Opção B: Conectar a um repositório existente
1. Obtenha a URL do repositório (ex: `https://github.com/seu-usuario/surreal-obras-crm.git`)

## 3. Adicionar Remote e Fazer Push

```bash
# Adicionar o remote
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git

# Adicionar arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit"

# Fazer push
git push -u origin main
```

Quando fizer o push, o Windows Credential Manager solicitará suas credenciais do GitHub.

## 4. Autenticação

Você pode usar:
- **Personal Access Token (PAT)** - Recomendado
  - Vá em GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Gere um novo token com permissões `repo`
  - Use o token como senha quando solicitado

- **GitHub CLI** (Alternativa)
  ```bash
  # Instalar GitHub CLI (se não tiver)
  winget install --id GitHub.cli
  
  # Fazer login
  gh auth login
  ```

## Verificar Configuração

```bash
# Ver configurações
git config --global --list

# Ver remote configurado
git remote -v
```
