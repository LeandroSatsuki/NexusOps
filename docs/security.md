# Segurança

## Aplicado no MVP

- Senhas com bcrypt e custo configurável.
- Access token JWT curto.
- Refresh token persistido com hash em `Session`.
- Logout revoga sessão.
- Guards de autenticação e RBAC.
- Rate limit global via Nest Throttler.
- Helmet e CORS configurados.
- DTOs com validação e whitelist.
- `.env.example` completo, sem segredos reais.
- Auditoria para eventos críticos.
- Separação entre rotas públicas e privadas.

## Limitações

- Refresh token ainda não faz rotação a cada uso.
- MFA não implementado.
- Upload de anexos ainda precisa validação profunda de conteúdo.
- LDAP/AD planejado, não implementado.
- Retenção de dados e consentimento devem ser definidos pela empresa.

## Próximos passos

- Rotacionar refresh token.
- Adicionar política de senha e bloqueio temporário por tentativas.
- Implementar permissões granulares caso os papéis fixos fiquem insuficientes.
- Adicionar OpenTelemetry e correlação de request.
- Formalizar política de retenção para audit logs e dados pessoais mínimos.

