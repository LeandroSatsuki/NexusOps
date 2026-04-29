# Domínio

## Ativo/Máquina

Representa um computador corporativo acompanhado pelo NexusOps. O MVP prioriza Windows e guarda inventário básico: hostname, usuário, IP, SO, CPU, RAM, disco, unidade, departamento e versão do agente.

## Heartbeat

Evento periódico enviado pelo agente. Atualiza o estado atual da máquina e mantém histórico para diagnóstico. O `installId` evita duplicação de registros.

## Alerta

Sinal operacional associado a uma máquina. Estados: aberto, reconhecido e resolvido. O MVP inclui estrutura para máquina offline, pouco disco, agente desatualizado e ausência de heartbeat.

## Chamado

Unidade de atendimento. Possui ID amigável (`CH-000123`), solicitante, responsável, status, prioridade, categoria, máquina opcional, comentários, anexos, checklist e histórico.

## SLA

Política simples por prioridade com tempo de primeira resposta e resolução em horas corridas. O ticket pode indicar atraso ou risco a partir de `dueAt`.

## Auditoria

Registro de ações críticas: login/logout, criação/edição de usuários, alteração de role, alterações em máquinas, movimentação/fechamento de tickets, comentários e mudanças em alertas/configurações.

