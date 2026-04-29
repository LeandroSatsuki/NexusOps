# Agente Windows

O agente é um Worker Service .NET 8 localizado em `apps/agent-windows/NexusOps.Agent`.

## Responsabilidades

- Criar e persistir `installId` no primeiro uso.
- Coletar hostname, usuário logado, SO, versão, IP, MAC, CPU, RAM, disco e uptime.
- Enviar heartbeat periódico para a API.
- Autenticar com token compartilhado do agente.
- Fazer retry em falhas transitórias.
- Registrar logs locais via infraestrutura padrão do .NET Worker.

## Configuração

Arquivo `appsettings.json` ou variáveis:

- `NEXUSOPS_AGENT_API_URL`
- `NEXUSOPS_AGENT_TOKEN`
- `NEXUSOPS_AGENT_INTERVAL_SECONDS`

## Endpoint

`POST /api/machine-heartbeats`

```json
{
  "installId": "c1a9...",
  "hostname": "NB-CORP-001",
  "loggedUser": "usuario",
  "osName": "Microsoft Windows 11 Pro",
  "osVersion": "10.0.26100",
  "localIp": "192.168.10.31",
  "macAddress": "00-11-22-33-44-55",
  "cpuName": "Intel Core i5",
  "totalRamMb": 16384,
  "totalStorageGb": 512,
  "freeStorageGb": 180,
  "uptimeSeconds": 3600,
  "agentVersion": "0.1.0"
}
```

## Fora do MVP

O agente não executa scripts remotos, não abre shell remoto e não inclui acesso remoto gráfico.

