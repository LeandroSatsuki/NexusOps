# NexusOps

[![CI](https://github.com/LeandroSatsuki/NexusOps/actions/workflows/ci.yml/badge.svg)](https://github.com/LeandroSatsuki/NexusOps/actions/workflows/ci.yml)

NexusOps é uma base de produto interno para gestão de máquinas corporativas, alertas operacionais e chamados de suporte. O MVP é single-tenant, Windows-first e pensado para uma única empresa, sem módulos MSP, billing, multiempresa, acesso remoto ou patch management completo.

## Nomes Avaliados

- AtlasDesk
- NexusOps
- PulseDesk
- OrbitAssets
- CentralOps

Nome escolhido: **NexusOps**. É curto, profissional, funciona bem em português e em contexto técnico, e mantém espaço para evoluir além de chamados ou inventário.

## Stack

- Monorepo npm workspaces
- Frontend: Next.js App Router, TypeScript, Tailwind e componentes shadcn-like locais
- Backend: NestJS, TypeScript, Prisma, PostgreSQL
- Auth: JWT access token, refresh token rotativo persistido com hash em sessão auditável, bcrypt
- RBAC: `ADMIN`, `TECNICO`, `GESTOR`, `SOLICITANTE`
- Agente Windows: .NET 8 Worker Service
- Testes: Vitest/Supertest no backend, Playwright no frontend, xUnit no agente
- Observabilidade inicial: logs estruturáveis e trilha de auditoria em banco
- Uploads: storage local preparado por env para evoluir para S3/MinIO
- Redis: preparado no Docker Compose para filas/cache futuros

## Estrutura

```text
apps/
  api/             API NestJS + Prisma
  web/             Next.js App Router
  agent-windows/   Worker Service .NET
packages/
  types/           contratos compartilhados
  config/          constantes compartilhadas
  ui/              componentes base
  tsconfig/        configuração TS comum
  eslint-config/   base de lint
docs/              documentação técnica
```

## Execução Local

Pré-requisitos: Node.js 20+, npm 10+, Docker Desktop, .NET SDK 8.

1. Crie o `.env`:

```bash
cp .env.example .env
```

2. Suba PostgreSQL e Redis:

```bash
docker compose up -d postgres redis
```

3. Instale dependências e prepare o banco:

```bash
npm install
npm run db:migrate
npm run db:seed
```

4. Rode API e web:

```bash
npm run dev:api
npm run dev:web
```

URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:3333/api`

Login seed:

- `admin@nexusops.local`
- `NexusOps@123`

Também é possível usar Docker Compose para a stack completa:

```bash
docker compose up --build
```

## Scripts Principais

- `npm run dev:api`
- `npm run dev:web`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run lint`
- `npm run test`
- `npm run build`

Agente:

```bash
dotnet test apps/agent-windows/NexusOps.Agent.Tests
dotnet run --project apps/agent-windows/NexusOps.Agent
```

## CI

O projeto possui GitHub Actions em `.github/workflows/ci.yml`, executado em `push` e `pull_request` para `main`.

A pipeline valida:

- instalação das dependências do monorepo com npm workspaces;
- lint de API e Web com ESLint;
- build da API NestJS e da Web Next.js;
- testes da API com PostgreSQL de CI, migrations e seed;
- smoke test do frontend com Playwright.

O teste E2E completo do fluxo crítico fica separado em `npm run test:e2e -w @nexusops/web`, porque depende da API e de dados seedados em execução.

## Funcionalidades do MVP

- Login, refresh token rotativo, logout, alteração de senha e recuperação mockada.
- RBAC por papel e guards no backend.
- CRUD básico de usuários.
- Inventário de máquinas com filtros e heartbeat.
- Registro de máquina por agente usando `installId` persistido.
- Alertas básicos para pouco espaço em disco e estrutura para offline/agente antigo.
- Chamados com ID amigável, prioridade, categoria, vínculo com máquina, comentários, checklist e auditoria.
- Board Kanban com drag and drop, lista e calendário por prazo.
- Dashboard operacional inicial.
- SLA simples por prioridade.
- Audit log para ações críticas.

## Limitações Intencionais

- Não há multi-tenant.
- Não há acesso remoto gráfico, shell remoto ou execução de scripts remotos.
- Não há patch management completo.
- Não há billing, contratos ou módulos MSP.
- O envio real de e-mail de recuperação de senha está mockado.
- O storage de anexos está preparado, mas o upload visual completo fica para a próxima fase.
- O motor de alertas periódico ainda deve ser promovido para job/worker.

## Roadmap Técnico

1. Endurecer autenticação: MFA opcional, política de senha e bloqueio temporário por tentativas.
2. Finalizar upload de anexos com antivírus/limites e driver S3/MinIO.
3. Criar worker de alertas recorrentes para offline, agente antigo e SLA.
4. Melhorar filtros salvos por usuário e paginação server-side.
5. Adicionar notificações por e-mail/Teams.
6. Preparar integração LDAP/AD.
7. Empacotar instalador MSI do agente.
8. Adicionar observabilidade com OpenTelemetry.

## Licença

Projeto interno. O arquivo `LICENSE` usa um modelo proprietário simples; revise com jurídico antes de distribuir fora da empresa.
