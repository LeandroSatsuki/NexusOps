CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TECNICO', 'GESTOR', 'SOLICITANTE');
CREATE TYPE "UserStatus" AS ENUM ('ATIVO', 'INATIVO');
CREATE TYPE "MachineStatus" AS ENUM ('ONLINE', 'OFFLINE', 'INATIVO');
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'BAIXA', 'MEDIA', 'ALTA', 'CRITICA');
CREATE TYPE "AlertStatus" AS ENUM ('ABERTO', 'RECONHECIDO', 'RESOLVIDO');
CREATE TYPE "AlertRuleType" AS ENUM ('MACHINE_OFFLINE', 'LOW_DISK', 'OUTDATED_AGENT', 'MISSING_HEARTBEAT');
CREATE TYPE "TicketStatus" AS ENUM ('NOVO', 'TRIAGEM', 'EM_ANDAMENTO', 'AGUARDANDO_USUARIO', 'AGUARDANDO_TERCEIRO', 'RESOLVIDO', 'FECHADO', 'CANCELADO');
CREATE TYPE "TicketPriority" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');
CREATE TYPE "TicketChannel" AS ENUM ('MANUAL', 'PORTAL', 'ALERTA');
CREATE TYPE "CommentVisibility" AS ENUM ('PUBLICO', 'INTERNO', 'SISTEMA');

CREATE TABLE "Department" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Team" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "jobTitle" TEXT,
  "departmentId" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'SOLICITANTE',
  "status" "UserStatus" NOT NULL DEFAULT 'ATIVO',
  "avatarUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "refreshHash" TEXT NOT NULL,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  "revokedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3),
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Machine" (
  "id" TEXT NOT NULL,
  "installId" TEXT,
  "hostname" TEXT NOT NULL,
  "friendlyName" TEXT,
  "assetTag" TEXT,
  "serialNumber" TEXT,
  "osName" TEXT NOT NULL,
  "osVersion" TEXT,
  "domainOrWorkgroup" TEXT,
  "primaryUserId" TEXT,
  "currentUser" TEXT,
  "localIp" TEXT,
  "macAddress" TEXT,
  "cpuName" TEXT,
  "totalRamMb" INTEGER,
  "totalStorageGb" INTEGER,
  "freeStorageGb" INTEGER,
  "status" "MachineStatus" NOT NULL DEFAULT 'OFFLINE',
  "lastHeartbeatAt" TIMESTAMP(3),
  "agentVersion" TEXT,
  "departmentId" TEXT,
  "branch" TEXT,
  "notes" TEXT,
  "inactiveAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MachineHeartbeat" (
  "id" TEXT NOT NULL,
  "machineId" TEXT NOT NULL,
  "hostname" TEXT NOT NULL,
  "loggedUser" TEXT,
  "osName" TEXT NOT NULL,
  "osVersion" TEXT,
  "localIp" TEXT,
  "cpuName" TEXT,
  "totalRamMb" INTEGER,
  "totalStorageGb" INTEGER,
  "freeStorageGb" INTEGER,
  "uptimeSeconds" INTEGER,
  "agentVersion" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MachineHeartbeat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Alert" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIA',
  "status" "AlertStatus" NOT NULL DEFAULT 'ABERTO',
  "machineId" TEXT NOT NULL,
  "assigneeId" TEXT,
  "note" TEXT,
  "acknowledgedAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AlertRule" (
  "id" TEXT NOT NULL,
  "type" "AlertRuleType" NOT NULL,
  "name" TEXT NOT NULL,
  "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIA',
  "isEnabled" BOOLEAN NOT NULL DEFAULT true,
  "thresholdMinutes" INTEGER,
  "thresholdPercent" INTEGER,
  "expectedAgentVersion" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SlaPolicy" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "priority" "TicketPriority" NOT NULL,
  "firstResponseMinutes" INTEGER NOT NULL,
  "resolutionMinutes" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SlaPolicy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Ticket" (
  "id" TEXT NOT NULL,
  "friendlyId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "TicketStatus" NOT NULL DEFAULT 'NOVO',
  "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIA',
  "category" TEXT NOT NULL,
  "requesterId" TEXT NOT NULL,
  "assigneeId" TEXT,
  "teamId" TEXT,
  "machineId" TEXT,
  "slaPolicyId" TEXT,
  "dueAt" TIMESTAMP(3),
  "firstResponseAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "channel" "TicketChannel" NOT NULL DEFAULT 'MANUAL',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketComment" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "authorId" TEXT,
  "body" TEXT NOT NULL,
  "visibility" "CommentVisibility" NOT NULL DEFAULT 'PUBLICO',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketAttachment" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "storageKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketAttachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketChecklistItem" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TicketChecklistItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketActivityLog" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "before" JSONB,
  "after" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "before" JSONB,
  "after" JSONB,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tag" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MachineTag" (
  "machineId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "MachineTag_pkey" PRIMARY KEY ("machineId", "tagId")
);

CREATE TABLE "TicketTag" (
  "ticketId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "TicketTag_pkey" PRIMARY KEY ("ticketId", "tagId")
);

CREATE TABLE "NotificationPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "settings" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Machine_installId_key" ON "Machine"("installId");
CREATE UNIQUE INDEX "AlertRule_type_key" ON "AlertRule"("type");
CREATE UNIQUE INDEX "SlaPolicy_priority_key" ON "SlaPolicy"("priority");
CREATE UNIQUE INDEX "Ticket_friendlyId_key" ON "Ticket"("friendlyId");
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_primaryUserId_fkey" FOREIGN KEY ("primaryUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MachineHeartbeat" ADD CONSTRAINT "MachineHeartbeat_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_slaPolicyId_fkey" FOREIGN KEY ("slaPolicyId") REFERENCES "SlaPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TicketAttachment" ADD CONSTRAINT "TicketAttachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketChecklistItem" ADD CONSTRAINT "TicketChecklistItem_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketActivityLog" ADD CONSTRAINT "TicketActivityLog_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MachineTag" ADD CONSTRAINT "MachineTag_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MachineTag" ADD CONSTRAINT "MachineTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketTag" ADD CONSTRAINT "TicketTag_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketTag" ADD CONSTRAINT "TicketTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
