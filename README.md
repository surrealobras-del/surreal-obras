# Surreal Construções e Reformas - CRM

Sistema CRM para cadastrar obras.

## Stack Tecnológica

### Frontend
- **TypeScript** - Lógica e tipagem
- **Tailwind CSS** - Estilização
- **Next.js** - React melhorado com SSR (otimização no carregamento melhorando o SEO)
- **Shadcn/ui** - Componentes prontos
- **React Query/TanStack Query** - Gerenciar cache e chamadas de API
- **Zod** - Validação de dados backend e frontend

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework para criar API REST

### Banco de Dados
- **Supabase** - Banco de dados e autenticação

## Instalação

### Frontend
```bash
npm install
```

### Backend
```bash
cd server
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais do Supabase:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente:
- `NEXT_PUBLIC_SUPABASE_URL` - URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `NEXT_PUBLIC_API_URL` - URL da API backend (padrão: http://localhost:3001)

## Execução

### Frontend (desenvolvimento)
```bash
npm run dev
```

### Backend (desenvolvimento)
```bash
npm run server
```

## Estrutura do Projeto

```
surreal-obras-crm/
├── app/                 # Next.js App Router
├── components/          # Componentes React
├── lib/                 # Utilitários e configurações
├── providers/           # Providers React (Query, etc)
├── server/              # Backend Express
│   └── src/
└── public/              # Arquivos estáticos
```

## Cores do Projeto

- **Cor Principal**: #FFCC00 (Amarelo)
- **Cor Secundária**: Black (Preto)
