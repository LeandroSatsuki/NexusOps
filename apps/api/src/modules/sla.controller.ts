import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../common/prisma.service";
import { AuditService } from "../common/audit.service";
import { UpsertSlaPolicyDto } from "./dtos";

@Controller("sla")
export class SlaController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  @Get("policies")
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO)
  policies() {
    return this.prisma.slaPolicy.findMany({ orderBy: { priority: "asc" } });
  }

  @Post("policies")
  @Roles(UserRole.ADMIN)
  async upsert(@Body() dto: UpsertSlaPolicyDto, @CurrentUser() user: RequestUser) {
    const policy = await this.prisma.slaPolicy.upsert({
      where: { priority: dto.priority },
      create: dto,
      update: { name: dto.name, firstResponseMinutes: dto.firstResponseMinutes, resolutionMinutes: dto.resolutionMinutes }
    });
    await this.audit.log({ actorId: user.sub, action: "sla.policy_upserted", entity: "SlaPolicy", entityId: policy.id, after: policy });
    return policy;
  }
}

