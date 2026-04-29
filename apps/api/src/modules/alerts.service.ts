import { Injectable } from "@nestjs/common";
import { AlertStatus } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { AuditService } from "../common/audit.service";
import { UpdateAlertDto, UpsertAlertRuleDto } from "./dtos";

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  list(query: { status?: AlertStatus; machineId?: string }) {
    return this.prisma.alert.findMany({
      where: { status: query.status, machineId: query.machineId },
      include: { machine: true, assignee: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  async update(id: string, dto: UpdateAlertDto, actorId: string) {
    const before = await this.prisma.alert.findUniqueOrThrow({ where: { id } });
    const alert = await this.prisma.alert.update({
      where: { id },
      data: {
        ...dto,
        acknowledgedAt: dto.status === "RECONHECIDO" ? new Date() : undefined,
        resolvedAt: dto.status === "RESOLVIDO" ? new Date() : undefined
      }
    });
    await this.audit.log({ actorId, action: `alert.${dto.status?.toLowerCase() ?? "updated"}`, entity: "Alert", entityId: id, before, after: alert });
    return alert;
  }

  rules() {
    return this.prisma.alertRule.findMany({ orderBy: { type: "asc" } });
  }

  async upsertRule(dto: UpsertAlertRuleDto, actorId: string) {
    const rule = await this.prisma.alertRule.upsert({
      where: { type: dto.type },
      create: dto,
      update: dto
    });
    await this.audit.log({ actorId, action: "alert.rule_upserted", entity: "AlertRule", entityId: rule.id, after: rule });
    return rule;
  }
}
