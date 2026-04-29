# Arquitetura

NexusOps usa um monorepo simples para manter frontend, backend, agente e contratos próximos. A v1 favorece clareza operacional sobre abstrações complexas.

## Decisões

- **Single-tenant por design:** nenhuma tabela possui `tenantId`. Isso reduz complexidade de autorização, seed, consultas e auditoria no MVP.
- **NestJS + Prisma:** Nest organiza módulos e guards; Prisma acelera modelagem relacional e migrations.
- **Next.js App Router:** frontend direto, com shell autenticado e views essenciais sem landing page.
- **Agente .NET:** integração Windows-first, fácil evolução para serviço instalado, logs locais e coleta via APIs do sistema.
- **Redis preparado, não obrigatório:** filas serão úteis para alertas, notificações e jobs, mas não entram como dependência lógica inicial.

## Trade-offs

- O board usa drag and drop simples via navegador. É suficiente para o fluxo crítico e pode migrar para DnD Kit completo.
- O motor de SLA considera horas corridas. Calendário corporativo, feriados e horários úteis ficam para fase posterior.
- Anexos têm schema e documentação, mas a UI de upload completa fica fora da primeira entrega.
- RBAC é por papel fixo. Permissões granulares podem ser adicionadas sem multi-tenant.

## Por que não copiar NinjaOne/Atera na v1

Plataformas completas resolvem MSP, multiempresa, billing, automação remota, patch management, inventário profundo e acesso remoto. Para uma empresa interna, começar por esse escopo atrasaria valor e aumentaria risco. O MVP concentra o fluxo diário: saber quais máquinas existem, receber heartbeats, registrar alertas, abrir chamados e acompanhar atendimento.

