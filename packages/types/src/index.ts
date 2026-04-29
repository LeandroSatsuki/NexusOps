export const ticketStatuses = [
  "NOVO",
  "TRIAGEM",
  "EM_ANDAMENTO",
  "AGUARDANDO_USUARIO",
  "AGUARDANDO_TERCEIRO",
  "RESOLVIDO",
  "FECHADO",
  "CANCELADO"
] as const;

export const ticketPriorities = ["BAIXA", "MEDIA", "ALTA", "CRITICA"] as const;
export const userRoles = ["ADMIN", "TECNICO", "GESTOR", "SOLICITANTE"] as const;

export type TicketStatus = (typeof ticketStatuses)[number];
export type TicketPriority = (typeof ticketPriorities)[number];
export type UserRole = (typeof userRoles)[number];

export type AgentHeartbeatPayload = {
  machineId?: string;
  installId: string;
  hostname: string;
  loggedUser?: string;
  osName: string;
  osVersion: string;
  localIp?: string;
  macAddress?: string;
  cpuName?: string;
  totalRamMb?: number;
  totalStorageGb?: number;
  freeStorageGb?: number;
  uptimeSeconds?: number;
  agentVersion: string;
};

