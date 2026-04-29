import { Injectable, UnauthorizedException } from "@nestjs/common";
import { MachineStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { AuditService } from "../common/audit.service";
import { RegisterHeartbeatDto, UpdateMachineDto } from "./dtos";

@Injectable()
export class MachinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  list(query: { search?: string; status?: MachineStatus; os?: string; departmentId?: string; branch?: string }) {
    return this.prisma.machine.findMany({
      where: {
        status: query.status,
        osName: query.os ? { contains: query.os, mode: "insensitive" } : undefined,
        departmentId: query.departmentId,
        branch: query.branch,
        OR: query.search
          ? [
              { hostname: { contains: query.search, mode: "insensitive" } },
              { currentUser: { contains: query.search, mode: "insensitive" } },
              { localIp: { contains: query.search, mode: "insensitive" } },
              { assetTag: { contains: query.search, mode: "insensitive" } }
            ]
          : undefined
      },
      include: { department: true, primaryUser: { select: { id: true, name: true, email: true } }, tags: { include: { tag: true } } },
      orderBy: [{ status: "asc" }, { hostname: "asc" }]
    });
  }

  get(id: string) {
    return this.prisma.machine.findUniqueOrThrow({
      where: { id },
      include: {
        department: true,
        primaryUser: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } },
        heartbeats: { orderBy: { receivedAt: "desc" }, take: 30 },
        tickets: { orderBy: { createdAt: "desc" }, take: 20, include: { requester: true, assignee: true } }
      }
    });
  }

  async update(id: string, dto: UpdateMachineDto, actorId: string) {
    const before = await this.prisma.machine.findUniqueOrThrow({ where: { id } });
    const machine = await this.prisma.machine.update({ where: { id }, data: dto });
    await this.audit.log({ actorId, action: "machine.updated", entity: "Machine", entityId: id, before, after: machine });
    return machine;
  }

  async deactivate(id: string, actorId: string) {
    const before = await this.prisma.machine.findUniqueOrThrow({ where: { id } });
    const machine = await this.prisma.machine.update({ where: { id }, data: { status: MachineStatus.INATIVO, inactiveAt: new Date() } });
    await this.audit.log({ actorId, action: "machine.deactivated", entity: "Machine", entityId: id, before, after: machine });
    return machine;
  }

  async heartbeat(dto: RegisterHeartbeatDto, token?: string) {
    if (!process.env.AGENT_SHARED_TOKEN || token !== `Bearer ${process.env.AGENT_SHARED_TOKEN}`) {
      throw new UnauthorizedException("Token do agente inválido.");
    }

    const machine = await this.prisma.machine.upsert({
      where: { installId: dto.installId },
      create: {
        installId: dto.installId,
        hostname: dto.hostname,
        osName: dto.osName,
        osVersion: dto.osVersion,
        currentUser: dto.loggedUser,
        localIp: dto.localIp,
        macAddress: dto.macAddress,
        cpuName: dto.cpuName,
        totalRamMb: dto.totalRamMb,
        totalStorageGb: dto.totalStorageGb,
        freeStorageGb: dto.freeStorageGb,
        agentVersion: dto.agentVersion,
        status: MachineStatus.ONLINE,
        lastHeartbeatAt: new Date()
      },
      update: {
        hostname: dto.hostname,
        osName: dto.osName,
        osVersion: dto.osVersion,
        currentUser: dto.loggedUser,
        localIp: dto.localIp,
        macAddress: dto.macAddress,
        cpuName: dto.cpuName,
        totalRamMb: dto.totalRamMb,
        totalStorageGb: dto.totalStorageGb,
        freeStorageGb: dto.freeStorageGb,
        agentVersion: dto.agentVersion,
        status: MachineStatus.ONLINE,
        lastHeartbeatAt: new Date()
      }
    });

    await this.prisma.machineHeartbeat.create({
      data: {
        machineId: machine.id,
        hostname: dto.hostname,
        loggedUser: dto.loggedUser,
        osName: dto.osName,
        osVersion: dto.osVersion,
        localIp: dto.localIp,
        cpuName: dto.cpuName,
        totalRamMb: dto.totalRamMb,
        totalStorageGb: dto.totalStorageGb,
        freeStorageGb: dto.freeStorageGb,
        uptimeSeconds: dto.uptimeSeconds,
        agentVersion: dto.agentVersion
      }
    });

    const [lowDiskRule, outdatedAgentRule] = await Promise.all([
      this.prisma.alertRule.findUnique({ where: { type: "LOW_DISK" } }),
      this.prisma.alertRule.findUnique({ where: { type: "OUTDATED_AGENT" } })
    ]);

    const freePercent = dto.totalStorageGb && dto.freeStorageGb !== undefined ? Math.round((dto.freeStorageGb / dto.totalStorageGb) * 100) : null;
    const diskThreshold = lowDiskRule?.thresholdPercent ?? 15;
    if (lowDiskRule?.isEnabled !== false && freePercent !== null && freePercent < diskThreshold) {
      await this.prisma.alert.create({
        data: {
          machineId: machine.id,
          title: "Disco com pouco espaço livre",
          description: `Espaço livre atual: ${freePercent}%.`,
          severity: freePercent < 5 ? "CRITICA" : lowDiskRule?.severity ?? "ALTA"
        }
      });
    }

    if (
      outdatedAgentRule?.isEnabled &&
      outdatedAgentRule.expectedAgentVersion &&
      dto.agentVersion !== outdatedAgentRule.expectedAgentVersion
    ) {
      await this.prisma.alert.create({
        data: {
          machineId: machine.id,
          title: "Agente desatualizado",
          description: `Versão atual ${dto.agentVersion}; esperada ${outdatedAgentRule.expectedAgentVersion}.`,
          severity: outdatedAgentRule.severity
        }
      });
    }

    return { machineId: machine.id, registered: true };
  }

  canSeeMachines(role: string) {
    const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO];
    return allowedRoles.includes(role as UserRole);
  }
}
