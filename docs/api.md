# API REST

Base URL local: `http://localhost:3333/api`

## Auth

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/change-password`
- `POST /auth/forgot-password`

## Usuários

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`

## Máquinas e heartbeats

- `GET /machines`
- `GET /machines/:id`
- `PATCH /machines/:id`
- `POST /machines/:id/deactivate`
- `POST /machine-heartbeats`

Heartbeat usa `Authorization: Bearer <AGENT_SHARED_TOKEN>`.

## Alertas

- `GET /alerts`
- `PATCH /alerts/:id`
- `GET /alerts/rules`
- `PATCH /alerts/rules`

## Chamados

- `GET /tickets`
- `GET /tickets/:id`
- `POST /tickets`
- `PATCH /tickets/:id`
- `POST /tickets/:id/comments`

## Comentários e anexos

- `GET /comments?ticketId=:id`
- `POST /comments/:ticketId`
- `GET /attachments?ticketId=:id`
- `POST /attachments`

## Dashboard, SLA e auditoria

- `GET /dashboard`
- `GET /sla/policies`
- `POST /sla/policies`
- `GET /audit`
